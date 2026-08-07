import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getQuotaInfo } from "@/lib/quota";
import { resolveSlotPlanId } from "@/lib/plans";
import { stripe } from "@/lib/stripe";

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  let forfait = null;
  let forfaits: unknown[] = [];
  let abonnements: unknown[] = [];
  let projets_ce_mois = 0;
  let projets_restants: number | null = null;

  if (profile.abonnement_actif) {
    // Quota = cumul des nb_projets_mois des abonnements actifs (multi-abonnements),
    // chaque abonnement démarre son quota à sa date d'activation.
    const q = await getQuotaInfo(supabase, user.id);
    projets_ce_mois = q.used;
    projets_restants = q.remaining;

    // Abonnements actifs (table `abonnements`) avec état Stripe pour l'UI
    // (résiliation, prochaine facturation, périodicité).
    const { data: abos } = await supabase
      .from("abonnements")
      .select("id, forfait_id, plan_id, stripe_subscription_id, calepinage, created_at")
      .eq("user_id", user.id)
      .eq("statut", "actif")
      .order("created_at", { ascending: true });
    if ((abos || []).length > 0) {
      const abosArray = abos as {
        id: string;
        forfait_id: string;
        plan_id?: string | null;
        stripe_subscription_id?: string | null;
        calepinage?: boolean;
        created_at: string;
      }[];
      const subsStatus = new Map<string, { cancel_at_period_end: boolean; current_period_end: string | null; interval: string | null }>();
      await Promise.all(
        abosArray.map(async (a) => {
          if (!a.stripe_subscription_id) return;
          try {
            const sub = await stripe.subscriptions.retrieve(a.stripe_subscription_id, {
              expand: ["items.data.price"],
            });
            const item = sub.items?.data?.[0];
            const price = item?.price;
            const interval =
              price && typeof price === "object" && "recurring" in price
                ? price.recurring?.interval ?? null
                : null;
            subsStatus.set(a.id, {
              cancel_at_period_end: !!sub.cancel_at_period_end,
              current_period_end: item?.current_period_end
                ? new Date(item.current_period_end * 1000).toISOString()
                : null,
              interval,
            });
          } catch {}
        })
      );
      abonnements = abosArray.map((a) => {
        const st = subsStatus.get(a.id);
        return {
          id: a.id,
          forfait_id: a.forfait_id,
          plan_id: resolveSlotPlanId(a.plan_id ?? null, !!a.calepinage),
          calepinage: !!a.calepinage,
          stripe_subscription_id: a.stripe_subscription_id,
          created_at: a.created_at,
          cancel_at_period_end: st?.cancel_at_period_end ?? false,
          current_period_end: st?.current_period_end ?? null,
          interval: st?.interval ?? null,
        };
      });
    }

    if (q.slots.length > 0) {
      const ids = [...new Set(q.slots.map((s) => s.forfaitId))];
      const { data: fs } = await supabase
        .from("forfaits")
        .select("*")
        .in("id", ids);
      const fmap = new Map((fs || []).map((f) => [String((f as { id: string }).id), f]));
      // Regroupement par abonnement « distinct » : deux abonnements Starter
      // Mesures restent ensemble (quota cumulé), mais un Starter Mesures+ (avec
      // l'option Calepinage 3D) forme un bloc séparé (planId résolu différent).
      const groups = new Map<
        string,
        {
          forfait: Record<string, unknown> | null;
          planId: string | null;
          quota: number;
          used: number;
          remaining: number;
          count: number;
          anchor: string;
        }
      >();
      for (const s of q.slots) {
        const key = s.planId ?? s.forfaitId;
        const g = groups.get(key) ?? {
          forfait: (fmap.get(s.forfaitId) as Record<string, unknown>) ?? null,
          planId: s.planId,
          quota: 0,
          used: 0,
          remaining: 0,
          count: 0,
          anchor: s.anchor,
        };
        g.quota += s.quota;
        g.used += s.used;
        g.remaining += s.remaining;
        g.count += 1;
        groups.set(key, g);
      }
      const arr = [...groups.values()];
      forfait = arr[0]?.forfait ?? null;
      forfaits = arr;
    }
  } else if (profile.forfait_id) {
    const { data: f } = await supabase
      .from("forfaits")
      .select("*")
      .eq("id", profile.forfait_id)
      .maybeSingle();
    forfait = f ?? null;
  }

  return NextResponse.json({
    ...profile,
    email: user.email,
    forfait,
    forfaits,
    abonnements,
    projets_ce_mois,
    projets_restants,
  });
}
