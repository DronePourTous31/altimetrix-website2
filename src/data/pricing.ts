import { PricingPlan } from "@/lib/types";

export const pricingPlans: PricingPlan[] = [
  {
    id: "decouverte",
    name: "Découverte",
    description: "Testez AltiMetrix sur un seul chantier. Idéal pour découvrir la puissance du modèle 3D sans engagement.",
    price: 149,
    period: "once",
    category: "one-shot",
    segment: "couvreurs",
    badge: "One shot",
    features: [
      "Modèle 3D photoréaliste",
      "Orthophoto 2D + MNS",
      "Mesures (surfaces, distances, pentes)",
      "Rapport PDF professionnel",
      "Mission planner Leaflet inclus",
    ],
    notIncluded: ["Calepinage solaire", "Implantation 3D d'objets"],
  },
  {
    id: "starter-mesures",
    name: "Starter Mesures",
    description: "L'abonnement idéal pour professionnaliser vos devis et gagner du temps sur chaque chantier.",
    price: 49,
    annualPrice: 41,
    badge: "⭐ Populaire · Lancement",
    highlighted: true,
    features: [
      "Modèle 3D + Ortho 2D + MNS",
      "Mesures complètes (surfaces, pentes, linéaires)",
      "Rapport PDF automatisé par projet",
      "Mission planner Leaflet",
      "Archivage modèles 6 mois",
      "Vérification qualité photos incluse",
      "Support email",
    ],
    notIncluded: ["Calepinage solaire"],
    nbProjets: 3,
    period: "month",
    category: "measurement",
    segment: "couvreurs",
    costPerProject: 16,
  },
  {
    id: "starter-pro",
    name: "Starter Pro",
    description: "Pour les artisans actifs avec plusieurs chantiers par semaine. Traitement prioritaire et export CAO.",
    price: 119,
    annualPrice: 99,
    badge: "Volume",
    highlighted: false,
    features: [
      "Tout le Starter Mesures ×10",
      "Projets supp. à 15€/projet",
      "Archivage 12 mois",
      "Traitement prioritaire <12h",
      "Support téléphonique weekend",
      "Export CAO (DXF/DWG)",
      "Tableau de bord multi-projets",
    ],
    notIncluded: ["Calepinage solaire"],
    nbProjets: 10,
    period: "month",
    category: "measurement",
    segment: "couvreurs",
    costPerProject: 12,
  },
  {
    id: "solar-pro",
    name: "Solar Pro",
    description: "Du modèle 3D de la toiture jusqu'au rapport de production solaire — en une seule commande.",
    price: 79,
    annualPrice: 66,
    badge: "☀️ Exclusif · Aucun concurrent",
    highlighted: true,
    features: [
      "Tout le Starter Mesures inclus",
      "Calepinage panneaux PV en 3D",
      "Analyse irradiation solaire (GRASS GIS)",
      "Analyse ombrage dynamique (saisons)",
      "Calcul production estimée dans le rapport",
      "Vue 2D DSM pour analyse d'exposition",
      "Mission planner Leaflet inclus",
      "Rapport client complet",
    ],
    nbProjets: 3,
    period: "month",
    category: "solar",
    segment: "solaire",
    costPerProject: 26,
  },
  {
    id: "solar-pro-plus",
    name: "Solar Pro+",
    description: "Pour les installateurs avec un flux régulier. Traitement prioritaire et exports avancés.",
    price: 189,
    annualPrice: 157,
    badge: "☀️ Volume",
    highlighted: false,
    features: [
      "Tout Solar Pro ×10",
      "Projets supp. à 22€/projet",
      "Traitement prioritaire <12h",
      "Export données solaires CSV/JSON",
      "Archivage 12 mois",
      "Support téléphonique weekend",
      "Tableau de bord multi-projets",
    ],
    nbProjets: 10,
    period: "month",
    category: "solar",
    segment: "solaire",
    costPerProject: 19,
  },
  {
    id: "particulier-standard",
    name: "Rapport Standard",
    description: "Vérifiez un devis de toiture ou de rénovation. Obtenez les vrais métrés de votre bien.",
    price: 99,
    period: "once",
    category: "one-shot",
    segment: "particuliers",
    badge: "Vérification",
    features: [
      "Modèle 3D de votre toiture / terrain",
      "Métrés précis : surface, pentes, linéaires",
      "Comparatif devis vs métrés réels",
      "Rapport PDF professionnel",
      "Tutoriel photos inclus",
    ],
    notIncluded: [
      "Analyse solaire / calepinage PV",
      "Implantation 3D piscine ou abris",
    ],
  },
  {
    id: "particulier-premium",
    name: "Rapport Premium",
    description: "Vérification du devis + visualisation de votre projet solaire ou piscine en 3D sur votre terrain réel.",
    price: 179,
    period: "once",
    category: "one-shot",
    segment: "particuliers",
    badge: "Recommandé",
    highlighted: true,
    features: [
      "Tout le Rapport Standard",
      "Calepinage PV 3D sur votre toiture réelle",
      "OU implantation 3D piscine / abri / terrasse",
      "Analyse irradiation et ombrage (option solaire)",
      "Estimation production solaire annuelle",
      "Rapport enrichi avec visualisations 3D",
      "Accès modèle 3D interactif 3 mois",
    ],
  },
];

export const segments = [
  { id: "couvreurs", label: "Couvreurs & Paysagistes", icon: "🏠" },
  { id: "solaire", label: "Installateurs solaire", icon: "☀️" },
  { id: "particuliers", label: "Particuliers", icon: "👤" },
  { id: "compare", label: "Comparatif", icon: "⚖️" },
];

export const roiData: Record<string, { title: string; body: string; stats: { val: string; lab: string }[] }> = {
  couvreurs: {
    title: "Le calcul est simple",
    body: "Un devis toiture moyen = 8 000–15 000€. Un rapport AltiMetrix professionnel augmente votre taux de conversion. 1 devis supplémentaire signé = abonnement remboursé 100× à 300×.",
    stats: [
      { val: "0", lab: "montée sur toit" },
      { val: "<24h", lab: "livraison modèle" },
      { val: "±2%", lab: "précision métrés" },
    ],
  },
  particuliers: {
    title: "Ce que ça représente réellement",
    body: "",
    stats: [
      { val: "12 000€", lab: "Devis toiture moyen · 0,8%" },
      { val: "18 000€", lab: "Devis solaire moyen · 1%" },
      { val: "+12%", lab: "Écart moyen sur surfaces" },
    ],
  },
};

export const concurData = {
  title: "Pourquoi Solar Pro est introuvable ailleurs",
  items: [
    {
      name: "AiroCollect / AirTeam",
      desc: "Mesures et modèles 3D uniquement. Aucune analyse solaire, aucun calepinage PV.",
    },
    {
      name: "Reonic",
      desc: "Calepinage PV mais ne génère pas les modèles depuis vos photos drones. Pas de modèle 3D réel.",
    },
    {
      name: "AltiMetrix Solar Pro ★",
      desc: "La seule plateforme qui part de vos photos pour livrer calepinage + irradiation + ombrage + production sur le même modèle 3D réel.",
      hero: true,
    },
  ],
};

export const addons = [
  { id: "captation", icon: "🚁", name: "Captation terrain AltiMetrix", desc: "Je me déplace et réalise moi-même le vol drone. Idéal si vous n'avez pas de drone.", price: "+150€", priceNote: "/ intervention (weekend, local)" },
  { id: "inspection", icon: "📋", name: "Inspection toiture + rapport", desc: "Identification zones dégradées, mousses, fissures — idéal assureurs ou syndics.", price: "+49€", priceNote: "/ projet (sur forfait existant)" },
  { id: "volume", icon: "📦", name: "Calcul de volume (stockpile)", desc: "Volumes de matériaux (gravières, remblais) à partir du MNS.", price: "+39€", priceNote: "/ projet" },
  { id: "ndvi", icon: "🌿", name: "Santé végétale (NDVI)", desc: "Analyse sanitaire espaces verts, golfs ou cultures.", price: "Sur devis", priceNote: "/ selon surface" },
  { id: "niveaux", icon: "📐", name: "Étude de niveaux", desc: "Courbes de niveau, profils en long, calcul de pente pour aménagements.", price: "+39€", priceNote: "/ projet" },
  { id: "photo-video", icon: "🏡", name: "Photos & vidéo immobilière", desc: "Prises de vues aériennes pour particuliers ou agences immobilières.", price: "Sur devis", priceNote: "" },
];

export const guarantees = [
  { icon: "⚡", title: "Livraison sous 24–48h", desc: "Modèles et rapports disponibles sous 24h après validation des photos." },
  { icon: "🔍", title: "Contrôle qualité photos", desc: "Chaque jeu de photos est vérifié avant traitement. Si insuffisant, vous êtes recontacté sans frais." },
  { icon: "🔓", title: "Sans engagement an 1", desc: "Résiliez à tout moment. Aucuns frais cachés. L'annuel est une option." },
  { icon: "🎁", title: "1er mois offert", desc: "Pour tout abonnement pendant la période de lancement. Testez, approuvez, puis décidez." },
];

export const faqItems = [
  {
    q: "Quel drone faut-il pour utiliser AltiMetrix ?",
    a: "La grande majorité des drones grand public conviennent : DJI Mini 2/3/4, DJI Air 2S, DJI Mavic 3, Autel EVO… L'important est de réaliser un plan de vol en grille avec un recouvrement de 75–80%. Nos tutoriels vidéo et le mission planner Leaflet vous guident pas à pas. Pas de drone ? Nous proposons une option captation terrain (+150€).",
  },
  {
    q: "Quelle est la précision des modèles générés ?",
    a: "Avec un drone standard (sans RTK), la précision relative est de 1 à 3 cm — suffisant pour des métrés de toiture, calepinages PV et implantations piscine. Pour une précision centimétrique absolue (cadastre, géomètre), contactez-nous pour un devis avec drone RTK.",
  },
  {
    q: "Que se passe-t-il si mes photos ne sont pas exploitables ?",
    a: "Chaque projet passe par un contrôle qualité avant traitement. Si vos photos sont insuffisantes, vous êtes prévenu sous 4h avec un rapport et des conseils pour refaire la captation — sans frais. Le projet n'est débité que lorsque le modèle est validé.",
  },
  {
    q: "La réglementation DGAC s'applique-t-elle à mes vols ?",
    a: "Oui. En tant que pilote, vous devez être enregistré sur alphaTango et respecter les zones de vol. Pour des vols résidentiels en zone dégagée (S1/S2), c'est simple et gratuit. Nos tutoriels incluent un guide réglementaire et le mission planner indique les zones réglementées en temps réel.",
  },
  {
    q: "Les projets non utilisés dans le mois sont-ils reportés ?",
    a: "Non, les projets inclus sont renouvelés chaque mois et ne s'accumulent pas. En revanche, vous pouvez commander des projets supplémentaires à la carte (19€ Starter, 22€ Solar Pro) sans changer de forfait.",
  },
];

export const compareColumns = [
  { key: "decouverte", name: "Découverte\n149€" },
  { key: "starter-mesures", name: "Starter\n49€/mois", highlight: true },
  { key: "starter-pro", name: "Starter Pro\n119€/mois" },
  { key: "solar-pro", name: "Solar Pro\n79€/mois", highlight: true },
  { key: "solar-pro-plus", name: "Solar Pro+\n189€/mois" },
  { key: "particulier", name: "Particulier\n99–179€" },
];

export const compareRows: { label: string; values: Record<string, string> }[] = [
  { label: "Projets inclus", values: { decouverte: "1", "starter-mesures": "3/mois", "starter-pro": "10/mois", "solar-pro": "3/mois", "solar-pro-plus": "10/mois", particulier: "1" } },
  { label: "Modèle 3D photoréaliste", values: { decouverte: "✓", "starter-mesures": "✓", "starter-pro": "✓", "solar-pro": "✓", "solar-pro-plus": "✓", particulier: "✓" } },
  { label: "Ortho 2D + MNS", values: { decouverte: "✓", "starter-mesures": "✓", "starter-pro": "✓", "solar-pro": "✓", "solar-pro-plus": "✓", particulier: "✓" } },
  { label: "Mesures complètes", values: { decouverte: "✓", "starter-mesures": "✓", "starter-pro": "✓", "solar-pro": "✓", "solar-pro-plus": "✓", particulier: "✓" } },
  { label: "Rapport PDF automatisé", values: { decouverte: "✓", "starter-mesures": "✓", "starter-pro": "✓", "solar-pro": "✓", "solar-pro-plus": "✓", particulier: "✓" } },
  { label: "Mission planner Leaflet", values: { decouverte: "✓", "starter-mesures": "✓", "starter-pro": "✓", "solar-pro": "✓", "solar-pro-plus": "✓", particulier: "—" } },
  { label: "Calepinage panneaux PV 3D", values: { decouverte: "—", "starter-mesures": "—", "starter-pro": "—", "solar-pro": "★", "solar-pro-plus": "★", particulier: "Premium" } },
  { label: "Analyse irradiation GRASS GIS", values: { decouverte: "—", "starter-mesures": "—", "starter-pro": "—", "solar-pro": "★", "solar-pro-plus": "★", particulier: "Premium" } },
  { label: "Analyse ombrage dynamique", values: { decouverte: "—", "starter-mesures": "—", "starter-pro": "—", "solar-pro": "★", "solar-pro-plus": "★", particulier: "Premium" } },
  { label: "Implantation 3D objets", values: { decouverte: "—", "starter-mesures": "—", "starter-pro": "—", "solar-pro": "—", "solar-pro-plus": "—", particulier: "Premium" } },
  { label: "Export CAO DXF/DWG", values: { decouverte: "—", "starter-mesures": "—", "starter-pro": "✓", "solar-pro": "—", "solar-pro-plus": "✓", particulier: "—" } },
  { label: "Traitement prioritaire <12h", values: { decouverte: "—", "starter-mesures": "—", "starter-pro": "✓", "solar-pro": "—", "solar-pro-plus": "✓", particulier: "—" } },
  { label: "Archivage modèles", values: { decouverte: "3 mois", "starter-mesures": "6 mois", "starter-pro": "12 mois", "solar-pro": "6 mois", "solar-pro-plus": "12 mois", particulier: "3 mois" } },
  { label: "Réduction annuel", values: { decouverte: "—", "starter-mesures": "−17%", "starter-pro": "−17%", "solar-pro": "−17%", "solar-pro-plus": "−17%", particulier: "—" } },
];
