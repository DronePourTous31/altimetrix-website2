// Calcul du quota mensuel de projets par client.
//
// Multi-abonnements : si la table `abonnements` existe et contient des
// entrées actives, CHAQUE abonnement possède son propre quota mensuel
// (nb_projets_mois) qui démarre à sa date d'activation. Un projet créé
// consomme le premier abonnement actif à ce moment-là, qui couvre son type
// d'analyse, et ayant un créneau restant (attribution ancien → récent).
//
// Ex. Starter Mesures (3/mois, actif depuis juin) + Solar Pro (3/mois,
// acheté le 5 août) + 5 projets en août dont un « solaire » : les 3 premiers
// projets vont à Starter Mesures (épuisé), les projets non couverts par un
// abonnement actif ce jour-là sont hors quota (payés à la carte), et le
// projet « solaire » consomme Solar Pro.
//
// Sans la table `abonnements` (schéma non migré), on retombe sur le forfait
// principal (profiles.forfait_id) avec le comptage mensuel simple.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { TypeAnalyse } from "@/lib/types";
import { typeAllowedForPlan, resolveSlotPlanId } from "@/lib/plans";

export interface QuotaSlot {
  forfaitId: string;
  planId: string | null;
  quota: number; // nb de projets inclus dans CET abonnement
  used: number; // nb consommés par cet abonnement ce mois
  remaining: number; // quota - used
  anchor: string; // date d'activation (ISO) — le quota démarre à cette date
}

export interface QuotaInfo {
  quota: number; // somme des quotas des abonnements actifs
  used: number; // nb de projets créés ce mois-ci (tous)
  remaining: number; // nb de projets restants ce mois-ci (cumul des abonnements)
  forfaitIds: string[];
  slots: QuotaSlot[];
  extraProject: boolean; // le dernier projet créé n'est couvert par aucun abonnement
}

// Abonnements actifs avec leur option Calepinage 3D mensuelle (colonne
// `calepinage`, ajoutée après la table initiale). Si la colonne n'existe pas
// encore (migration pas appliquée), on retombe sur false.
export async function fetchActiveAbos(sb: SupabaseClient, userId: string) {
  const { data, error } = await sb
    .from("abonnements")
    .select("forfait_id, plan_id, created_at, calepinage")
    .eq("user_id", userId)
    .eq("statut", "actif")
    .order("created_at", { ascending: true });

  if (error && error.code === "42703") {
    const { data: data2, error: error2 } = await sb
      .from("abonnements")
      .select("forfait_id, plan_id, created_at")
      .eq("user_id", userId)
      .eq("statut", "actif")
      .order("created_at", { ascending: true });
    if (error2) return { data: null, error: error2 };
    return { data: data2, error: null };
  }
  if (error) return { data: null, error };
  return { data, error: null };
}

export async function getQuotaInfo(sb: SupabaseClient, userId: string): Promise<QuotaInfo> {
  const moisStart = new Date();
  moisStart.setUTCDate(1);
  moisStart.setUTCHours(0, 0, 0, 0);

  const { data: projs } = await sb
    .from("projets")
    .select("created_at, type_analyse")
    .eq("user_id", userId)
    .gte("created_at", moisStart.toISOString());

  const projects = (projs || [])
    .map((p) => ({
      t: new Date(p.created_at).getTime(),
      type: (p.type_analyse ?? null) as TypeAnalyse | null,
    }))
    .sort((a, b) => a.t - b.t);

  // 1) Multi-abonnements : la table existe et contient des abonnements actifs
  const { data: abos, error: abosError } = await fetchActiveAbos(sb, userId);

  if (abosError || !abos || abos.length === 0) {
    // 2) Schéma sans table `abonnements` (ou aucun abonnement enregistré)
    // → forfait principal (profiles.forfait_id), comptage mensuel simple
    const { data: p } = await sb
      .from("profiles")
      .select("forfait_id")
      .eq("id", userId)
      .single();
    if (p?.forfait_id) {
      const { data: f } = await sb
        .from("forfaits")
        .select("nb_projets_mois")
        .eq("id", p.forfait_id)
        .maybeSingle();
      const quota = f?.nb_projets_mois || 0;
      const used = projects.length;
      const remaining = quota > 0 ? Math.max(0, quota - used) : 0;
      const extraProject = quota > 0 && used > quota;
      return {
        quota,
        used,
        remaining,
        forfaitIds: [String(p.forfait_id)],
        slots: quota > 0
          ? [{ forfaitId: String(p.forfait_id), planId: null, quota, used: Math.min(used, quota), remaining, anchor: "" }]
          : [],
        extraProject,
      };
    }
    return { quota: 0, used: projects.length, remaining: 0, forfaitIds: [], slots: [], extraProject: false };
  }

  const forfaitIds = [...new Set(abos.map((a) => String(a.forfait_id)))];
  const { data: forfaits } = await sb
    .from("forfaits")
    .select("id, nb_projets_mois")
    .in("id", forfaitIds);
  const quotaById = new Map((forfaits || []).map((f) => [String(f.id), f.nb_projets_mois || 0]));

  // Un créneau = un abonnement. Deux abonnements du même forfait restent
  // distincts : le plus récent démarre son quota à sa propre activation.
  // L'option Calepinage 3D mensuelle transforme un Starter Mesures en
  // Starter Mesures+ (planId distinct, calepinage inclus).
  const slots: QuotaSlot[] = (abos as unknown[]).map((a) => {
    const row = a as { forfait_id: string; plan_id?: string | null; calepinage?: boolean; created_at: string };
    return {
      forfaitId: String(row.forfait_id),
      planId: resolveSlotPlanId(row.plan_id ? String(row.plan_id) : null, !!row.calepinage),
      quota: quotaById.get(String(row.forfait_id)) || 0,
      used: 0,
      remaining: 0,
      anchor: row.created_at,
    };
  });

  const covers = (s: QuotaSlot, type: TypeAnalyse | null) => {
    if (type == null) return true;
    if (!s.planId) return true;
    return typeAllowedForPlan(type, s.planId);
  };

  // Attribution ancien → récent : un projet consomme le 1er abonnement actif
  // à sa création, couvrant son type, avec un créneau restant.
  let lastCovered = false;
  for (const pr of projects) {
    let covered = false;
    for (const s of slots) {
      if (new Date(s.anchor).getTime() <= pr.t && s.used < s.quota && covers(s, pr.type)) {
        s.used++;
        covered = true;
        break;
      }
    }
    lastCovered = covered;
  }
  for (const s of slots) s.remaining = Math.max(0, s.quota - s.used);

  const quota = slots.reduce((sum, s) => sum + s.quota, 0);
  const remaining = slots.reduce((sum, s) => sum + s.remaining, 0);
  const extraProject = projects.length > 0 ? !lastCovered : false;

  return { quota, used: projects.length, remaining, forfaitIds, slots, extraProject };
}

// Types de projets autorisés côté client (matrice) : la création d'un projet
// est possible si l'essai est disponible ou si AU MOINS un abonnement actif
// couvre le type demandé.
export function typeAllowedBySlots(type: TypeAnalyse, slots: QuotaSlot[]): boolean {
  return slots.some((s) => {
    if (!s.planId) return true;
    return typeAllowedForPlan(type, s.planId);
  });
}

// Plan IDs distincts des abonnements actifs (pour la vérification de type à
// la création et le surlignage de la matrice). Retourne [] si la table est
// absente ou sans abonnement actif.
export async function getActivePlanIds(sb: SupabaseClient, userId: string): Promise<string[]> {
  const { data: abos, error } = await fetchActiveAbos(sb, userId);
  if (error || !abos) return [];
  return [
    ...new Set(
      (abos as unknown[])
        .map((a) => {
          const row = a as { plan_id?: string | null; calepinage?: boolean };
          return row.plan_id
            ? resolveSlotPlanId(String(row.plan_id), !!row.calepinage)
            : null;
        })
        .filter((v): v is string => !!v)
    ),
  ];
}

// Un projet est "supplémentaire à la carte" si le dernier projet créé ce mois
// n'est couvert par aucun abonnement actif (quota déjà épuisé).
export function isExtraProject(q: QuotaInfo): boolean {
  return q.extraProject;
}
