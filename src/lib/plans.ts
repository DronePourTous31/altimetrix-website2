import type { TypeAnalyse } from "@/lib/types";

// Correspondance slug forfait (table forfaits) → id de forfait (pricing.ts)
export const FORFAIT_SLUG_TO_PLAN_ID: Record<string, string> = {
  mesure: "starter-mesures",
  pro: "starter-pro",
  solaire: "solar-pro",
  "solaire-plus": "solar-pro-plus",
};

// Types de projets autorisés par forfait (page Tarifs / création de projet)
export const PLAN_ALLOWED_PROJECT_TYPES: Record<string, TypeAnalyse[]> = {
  "starter-mesures": ["mesure", "calepinage"],
  // Starter Mesures+ = Starter Mesures + option Calepinage 3D mensuelle (+10€) :
  // le calepinage est donc inclus dans l'abonnement, pas facturé à la carte.
  "starter-mesures-plus": ["mesure", "calepinage"],
  "starter-pro": ["mesure", "calepinage"],
  "solar-pro": ["mesure", "calepinage", "solaire"],
  "solar-pro-plus": ["mesure", "calepinage", "solaire"],
  "particulier-standard": ["mesure"],
  "particulier-premium": ["mesure", "calepinage", "solaire"],
};

// Forfaits où le calepinage est payant à la commande du projet (+10€).
// Starter Mesures+ n'en fait PAS partie : le calepinage y est inclus.
export const CALEPINAGE_PAYANT_PLAN_IDS: string[] = ["starter-mesures"];

// Prix des projets supplémentaires à la carte (en centimes), par plan d'abonnement.
// Un projet supp. est facturé quand le quota mensuel du client est épuisé
// (nb de projets créés ce mois-ci > somme des nb_projets_mois des forfaits actifs).
export const EXTRA_PROJET_PRICES_CENTS: Record<string, number> = {
  "starter-mesures": 1900,
  "starter-mesures-plus": 1900,
  "starter-pro": 1500,
  "solar-pro": 2900,
  "solar-pro-plus": 2200,
};

export interface PlanContext {
  plan_id?: string | null;
  forfait_slug?: string | null;
}

export function resolvePlanId(ctx: PlanContext): string | null {
  if (ctx.plan_id) return ctx.plan_id;
  if (ctx.forfait_slug && FORFAIT_SLUG_TO_PLAN_ID[ctx.forfait_slug]) {
    return FORFAIT_SLUG_TO_PLAN_ID[ctx.forfait_slug];
  }
  return null;
}

// Un abonnement « Starter Mesures » avec l'option Calepinage 3D mensuelle est
// un « Starter Mesures+ » (planId distinct, calepinage inclus). Sans l'option,
// on reste sur « starter-mesures ».
export function resolveSlotPlanId(planId: string | null, calepinage: boolean): string | null {
  if (planId === "starter-mesures" && calepinage) return "starter-mesures-plus";
  return planId;
}

export function typeAllowedForPlan(type: TypeAnalyse, planId: string): boolean {
  return (PLAN_ALLOWED_PROJECT_TYPES[planId] ?? []).includes(type);
}

// Le calepinage est payant (+10€/projet) uniquement si TOUS les forfaits
// actifs sont des forfaits Starter Mesures (sans l'add-on mensuel). Dès
// qu'un forfait couvrant le calepinage sans supplément est actif (Solar Pro,
// Starter Pro…), le calepinage est inclus.
export function calepinagePayantForPlans(activePlanIds: string[], calepinageActif: boolean): boolean {
  if (calepinageActif) return false;
  if (activePlanIds.length === 0) return false;
  return activePlanIds.every((pid) => CALEPINAGE_PAYANT_PLAN_IDS.includes(pid));
}
