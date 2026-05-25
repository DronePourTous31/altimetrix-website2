import { Service } from "@/lib/types";

export const services: Service[] = [
  {
    id: "photogrammetrie",
    title: "Photogrammétrie par Drone",
    description: "Transformez vos photos aériennes en modèles 3D précis, orthophotos et DSM. Idéal pour les couvreurs, installateurs solaire et paysagistes souhaitant proposer des devis précis et professionnels.",
    icon: "drone",
    target: ["Couvreurs", "Installateurs solaire", "Paysagistes", "Particuliers"],
    features: [
      "Modèle 3D texturé haute résolution",
      "DSM (Digital Surface Model)",
      "Orthophoto géoréférencée",
      "Nuage de points dense",
      "Précision centimétrique",
    ],
  },
  {
    id: "mesures",
    title: "Mesures & Calepinage",
    description: "Prenez des mesures précises depuis votre bureau. Plus besoin de retourner sur le chantier pour vérifier une cote ! Implantez des objets 3D pour visualiser votre projet.",
    icon: "ruler",
    target: ["Couvreurs", "Installateurs solaire", "Pisciniers", "Paysagistes"],
    features: [
      "Mesures de distances, surfaces, volumes",
      "Calepinage de panneaux solaires",
      "Implantation d'objets 3D (piscines, abris, etc.)",
      "Export des mesures en PDF",
      "Visualisation en réalité augmentée",
    ],
  },
  {
    id: "solaire",
    title: "Analyse Solaire Avancée",
    description: "Étude d'irradiation solaire et d'ombrage réalisée sous GrassGIS. Optimisez le placement des panneaux et fournissez des rapports de production détaillés à vos clients.",
    icon: "sun",
    target: ["Installateurs solaire", "Bureaux d'études"],
    features: [
      "Carte d'irradiation solaire annuelle",
      "Analyse d'ombrage dynamique",
      "Calepinage optimal des panneaux",
      "Estimation de production (kWh/an)",
      "Rapport client personnalisé",
      "Simulation financière du projet",
    ],
  },
  {
    id: "devis",
    title: "Devis & Rapports",
    description: "Générez des rapports professionnels à intégrer dans vos devis. Argumentez vos propositions avec des données précises et des visuels percutants.",
    icon: "file-text",
    target: ["Artisans", "Particuliers", "Agences immobilières"],
    features: [
      "Rapport de mesures détaillé",
      "Rapport d'inspection de toiture",
      "Rapport de production solaire",
      "Rapport d'implantation 3D",
      "Export PDF personnalisé",
    ],
  },
  {
    id: "mission-planner",
    title: "Mission Planner",
    description: "Planifiez vos vols de captation directement sur notre outil cartographique. Optimisez vos trajectoires pour une reconstruction 3D parfaite.",
    icon: "map",
    target: ["Tous les clients"],
    features: [
      "Planification de mission intuitive",
      "Couverture optimale garantie",
      "Paramètres de vol personnalisables",
      "Export du plan de vol",
      "Tutoriel vidéo inclus",
    ],
  },
  {
    id: "tutoriels",
    title: "Formation & Tutoriels",
    description: "Des vidéos tutorielles complètes pour apprendre à capter les photos parfaites, utiliser le Mission Planner et exploiter tous les outils AltiMetrix.",
    icon: "video",
    target: ["Tous les utilisateurs"],
    features: [
      "Tutoriels de captation photo",
      "Guide d'utilisation du Mission Planner",
      "Bonnes pratiques photogrammétrie",
      "Astuces pour modèles 3D parfaits",
      "Support technique inclus",
    ],
  },
];

export const benefits = [
  {
    title: "Sécurité avant tout",
    description: "Ne montez plus sur les toits. Réalisez toutes vos mesures depuis le sol avec votre drone.",
    icon: "shield",
    color: "cyan",
  },
  {
    title: "Gain de temps & d'argent",
    description: "Plus besoin de revenir sur un chantier pour une mesure oubliée. Tout est disponible en ligne, 24/7.",
    icon: "clock",
    color: "cyan",
  },
  {
    title: "Effet Waow client",
    description: "Impressionnez vos clients avec des visuals 3D interactifs. Transformez vos devis en commandes.",
    icon: "sparkles",
    color: "cyan",
  },
  {
    title: "Expérience drone",
    description: "Passez un bon moment avec votre client lors de la captation. Le drone crée du lien et de la confiance.",
    icon: "drone",
    color: "cyan",
  },
  {
    title: "Devis garantis",
    description: "Un client qui visualise sa maison en 3D avec vos équipements signe plus facilement. Conversion assurée.",
    icon: "trending-up",
    color: "cyan",
  },
  {
    title: "Scalabilité nationale",
    description: "Vos clients captent leurs photos, nos algorithmes traitent. Travaillez partout en France sans vous déplacer.",
    icon: "globe",
    color: "cyan",
  },
];

export const stats = [
  { value: "10cm", label: "Précision des mesures" },
  { value: "48h", label: "Livraison des modèles" },
  { value: "-70%", label: "Temps passé sur les devis" },
  { value: "+35%", label: "Taux de conversion devis → commande" },
  { value: "100%", label: "Satisfaction client" },
];
