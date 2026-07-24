"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Move3d, Ruler, Sun, FileText, CheckCircle2, Shield, Clock, TrendingUp,
  ArrowRight, Camera, Maximize2,
} from "lucide-react";


const R2 = "https://pub-0459c8bf6e9348e592f4decd8b6bab91.r2.dev/altimetrix";
const R2V = `${R2}/shared/videos`;
const R2R = `${R2}/shared/reports`;
const R2D = R2.replace("/altimetrix", "");

const services = [
  { id: "photogrammetrie", icon: Move3d, title: "Photogrammétrie 3D", subtitle: "Transformez vos photos en modèles 3D précis", description: "Notre pipeline automatisé traite vos photos aériennes pour générer un modèle 3D texturé haute résolution, un DSM (Digital Surface Model) et une orthophoto géoréférencée. Le tout avec une précision centimétrique.", targets: ["Couvreurs", "Installateurs solaire", "Paysagistes", "Particuliers"], benefits: ["Modèle 3D texturé consultable en ligne", "DSM pour analyses topographiques", "Orthophoto haute résolution géoréférencée", "Nuage de points dense", "Précision centimétrique"] },
  { id: "mesures", icon: Ruler, title: "Mesures & Calepinage 3D", subtitle: "Toutes vos mesures depuis votre bureau", description: "Plus besoin de retourner sur le chantier. Mesurez distances, surfaces et volumes directement sur le modèle 3D. Implantez des objets 3D (panneaux solaires, piscines, abris de jardin) pour visualiser votre projet en situation réelle.", targets: ["Couvreurs", "Installateurs solaire", "Pisciniers", "Paysagistes", "Particuliers"], benefits: ["Mesures de distances, surfaces, volumes", "Calepinage précis de panneaux solaires", "Implantation d'objets 3D (piscines, abris)", "Export des mesures en PDF pour vos devis", "Visualisation réaliste du projet fini"] },
  { id: "solaire", icon: Sun, title: "Analyse Solaire", subtitle: "Irradiation et ombrage pour vos projets photovoltaïques", description: "Réalisez des analyses d'irradiation solaire et d'ombrage poussées sous GrassGIS. Optimisez le placement des panneaux et fournissez des rapports de production détaillés qui rassurent vos clients et accélèrent leur décision.", targets: ["Installateurs solaire", "Bureaux d'études"], benefits: ["Carte d'irradiation solaire annuelle", "Analyse d'ombrage dynamique heure par heure", "Calepinage optimal des panneaux", "Estimation de production (kWh/an)", "Rapport client personnalisé avec ROI"] },
  { id: "devis", icon: FileText, title: "Rapports & Devis", subtitle: "Des rapports professionnels pour convaincre", description: "Générez des rapports détaillés et personnalisés à intégrer dans vos devis. Mesures, calepinage, production solaire, implantation piscine… Tous les éléments pour justifier votre proposition et augmenter votre taux de conversion.", targets: ["Tous les artisans", "Particuliers", "Agences immobilières"], benefits: ["Rapport de mesures détaillé avec photos", "Rapport d'inspection de toiture", "Rapport de production solaire", "Rapport d'implantation 3D", "Export PDF personnalisé avec votre logo"] },
  { id: "inspection", icon: Shield, title: "Inspection de Toiture", subtitle: "Diagnostic complet sans monter sur le toit", description: "Service complémentaire d'inspection de toiture par drone. Rapport détaillé avec détection de défauts, zones d'usure, et recommandations. Idéal pour les couvreurs et les particuliers souhaitant vérifier l'état de leur toiture.", targets: ["Couvreurs", "Particuliers", "Assureurs", "Agences immobilières"], benefits: ["Rapport d'inspection détaillé", "Détection de défauts et zones d'usure", "Photos haute résolution annotées", "Recommandations et priorités", "Idéal pour devis de rénovation"] },
];

const steps = [
  { step: 1, title: "Vous capturez les photos", desc: "Suivez nos tutoriels ou utilisez le Mission Planner pour un vol parfait." },
  { step: 2, title: "Vous chargez sur la plateforme", desc: "Déposez vos photos dans votre espace client. Notre pipeline s'occupe du reste." },
  { step: 3, title: "Nous traitons automatiquement", desc: "Nos algorithmes génèrent les modèles 3D et réalisent les analyses en moins de 48h." },
  { step: 4, title: "Vous exploitez les résultats", desc: "Accédez à vos modèles, outils et rapports depuis votre dashboard. Intégrez-les dans vos devis." },
];

const MODELS = [
  { id: "modele3d", label: "Modèle 3D", url: `${R2}/shared/mesh_yup.glb`, type: "glb" as const },
  { id: "ortho", label: "Orthophoto", url: `${R2}/shared/orthophoto_demo2.jpg`, type: "image" as const },
  { id: "dsm", label: "Modèle Digital de Surface", url: `${R2}/shared/dsm_demo3.jpg?v=3`, type: "dsm" as const, dataUrl: `${R2}/shared/dsm_demo3_data.png?v=3`, metaUrl: `${R2}/shared/dsm_demo3_meta.json?v=3` },
];

const COLORMAPS: Record<string, { name: string; stops: [number, number, number][] }> = {
  orange: { name: "Orange Élévation", stops: [[13, 8, 135], [94, 1, 168], [177, 43, 144], [225, 100, 98], [252, 166, 54], [240, 249, 33]] },
  viridis: { name: "Viridis", stops: [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]] },
  jet: { name: "Jet", stops: [[0, 0, 128], [0, 0, 255], [0, 128, 255], [0, 255, 255], [128, 255, 0], [255, 255, 0], [255, 128, 0], [128, 0, 0]] },
  terrain: { name: "Terrain", stops: [[40, 120, 40], [100, 180, 80], [160, 210, 120], [200, 190, 130], [220, 200, 160], [250, 240, 220]] },
  earth: { name: "Earth", stops: [[80, 50, 20], [130, 90, 40], [170, 140, 70], [200, 180, 120], [220, 210, 170], [240, 235, 215]] },
  pastel: { name: "Pastel", stops: [[200, 180, 255], [180, 220, 255], [180, 245, 200], [220, 245, 180], [255, 220, 180], [255, 200, 210]] },
};

const VEG_ALGO = [
  { id: "vari", name: "VARI", full: "Visible Atmospherically Resistant Index", color: "#a855f7", formula: "(Green − Red) / (Green + Red − Blue)", desc: "Insensible aux variations atmosphériques, idéal pour les images à haute résolution. Met en évidence la végétation chlorophyllienne même en conditions de luminosité variable.", tag: "Vigueur de la végétation" },
  { id: "gli", name: "GLI", full: "Green Leaf Index", color: "#22c55e", formula: "(2·Green − Red − Blue) / (2·Green + Red + Blue)", desc: "Index normalisé qui amplifie le signal de la chlorophylle. Excellent pour discriminer la végétation verte du sol et des résidus de culture.", tag: "Taux de chlorophylle" },
  { id: "exg", name: "ExG", full: "Excess Green", color: "#16a34a", formula: "2·Green − Red − Blue", desc: "Index non normalisé simple et rapide à calculer. Largement utilisé en agriculture de précision pour séparer les plantes vertes du fond du sol.", tag: "Agriculture de précision" },
  { id: "grvi", name: "GRVI", full: "Green‑Red Vegetation Index", color: "#f59e0b", formula: "(Green − Red) / (Green + Red)", desc: "Anciennement NGRDI. Rapport normalisé entre les réflexions verte et rouge. Sensible à la phénologie des cultures et au stress hydrique.", tag: "Surveillance des cultures" },
  { id: "mpri", name: "MPRI", full: "Modified Photochemical Reflectance Index", color: "#ef4444", formula: "(Green − Red) / (Green + Red)", desc: "Variante du GRVI améliorée pour la photographie numérique grand public. Détecte les variations fines de la réflectance foliaire liées au stress.", tag: "Stress végétal" },
];

const SHADING = [{ id: "none", label: "Aucun" }, { id: "normal", label: "Normal" }, { id: "extruded", label: "Extrudé" }];

const VEG_MODELS = [
  { id: "exg", label: "Excès de Vert (ExG)", url: `${R2D}/DEMOS/DEMO3/vegetal_health/vegetal_health_EXG.png`, type: "image" as const },
  { id: "gli", label: "Indice Feuillage Vert (GLI)", url: `${R2D}/DEMOS/DEMO3/vegetal_health/vegetal_health_GLI.png`, type: "image" as const },
  { id: "grvi", label: "Indice Vert-Rouge (GRVI)", url: `${R2D}/DEMOS/DEMO3/vegetal_health/vegetal_health_GRVI.png`, type: "image" as const },
  { id: "mpri", label: "Indice Réflectance (MPRI)", url: `${R2D}/DEMOS/DEMO3/vegetal_health/vegetal_health_MPRI.png`, type: "image" as const },
  { id: "vari", label: "Indice Atmosphérique (VARI)", url: `${R2D}/DEMOS/DEMO3/vegetal_health/vegetal_health_VARI.png`, type: "image" as const },
];

const SOLAR_TABS = [
  { id: "mensuel", label: "Irradiation Mensuelle", type: "video", file: "Animation_Mensuel_Irradiation_Solaire.mp4" },
  { id: "bilan", label: "Bilan Irradiation/Production Annuelle", type: "image", file: "Bilan_Annuel_Irradiation_Production.jpg" },
  { id: "printemps", label: "Ombrages Équinoxe Printemps", type: "video", file: "Animation_Ombrages_Equinoxe_Printemps_21Mars.mp4" },
  { id: "ete", label: "Ombrages Solstice Été", type: "video", file: "Animation_Ombrages_Solstice_Ete_21Juin.mp4" },
  { id: "automne", label: "Ombrages Équinoxe Automne", type: "video", file: "Animation_Ombrages_Equinoxe_Automne_21Septembre.mp4" },
  { id: "hiver", label: "Ombrages Solstice Hiver", type: "video", file: "Animation_Ombrages_Solstice_Hiver_21Décembre.mp4" },
];

const REPORTS = [{ id: "pv", label: "Rapport Analyse Photovoltaïque", file: "Rapport_Final_Projet_Maison_Occitanie.pdf" }];

const MES_TABS = [{ id: "mesures3d", label: "Mesures 3D" }, { id: "mesures2d", label: "Mesures 2D" }, { id: "calepinage", label: "Calepinage 3D" }, { id: "objets", label: "Objets 3D" }];

const MES_3D = [
  { id: "solaire", label: "Solaire / Toiture", icon: "☀️" }, { id: "distance", label: "Distance / Longueur", icon: "📏" },
  { id: "angle", label: "Angle", icon: "◺" }, { id: "pente", label: "Pente / Inclinaison", icon: "📉" },
  { id: "hauteur", label: "Hauteur", icon: "↕️" }, { id: "pointRef", label: "Point de Référence", icon: "🎯" },
  { id: "hauteurRef", label: "Hauteur / Réf", icon: "🏗️" }, { id: "surface", label: "Surface / Aire", icon: "⬜" },
  { id: "azimuth", label: "Azimuth", icon: "🧭" }, { id: "cercle", label: "Cercle", icon: "⭕" },
  { id: "coordonnees", label: "Coordonnées Point", icon: "📍" }, { id: "annotation", label: "Annotation", icon: "📝" },
];

const MES_2D = [
  { id: "point", label: "Point", icon: "📍" }, { id: "ligne", label: "Ligne", icon: "↔️" },
  { id: "polygone", label: "Polygone", icon: "⬡" }, { id: "rectangle", label: "Rectangle", icon: "⬛" },
  { id: "cercle2d", label: "Cercle", icon: "⭕" }, { id: "volume2d", label: "Volume", icon: "📦" },
  { id: "profil2d", label: "Profil", icon: "📈" }, { id: "niveaux", label: "Niveaux", icon: "🏗️" },
  { id: "inspecter", label: "Inspecter", icon: "🔍" }, { id: "pantoiture", label: "Pan Toiture", icon: "🏠" },
];

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400 w-16 shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-20 h-1 accent-cyan-500 cursor-pointer" />
      <input type="number" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} className="w-14 bg-anthracite-800 border border-anthracite-700 rounded px-1 py-0.5 text-white text-xs text-center" />
      {unit && <span className="text-gray-500 w-4">{unit}</span>}
    </div>
  );
}

function makeHandlers(zoom: number, setZoom: (v: number) => void, panX: number, setPanX: (v: number) => void, panY: number, setPanY: (v: number) => void, elRef: React.RefObject<HTMLDivElement | null>) {
  const down = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  return {
    onWheel: (e: React.WheelEvent) => { e.preventDefault(); setZoom(Math.max(1, Math.min(20, zoom * (1 + (-0.001 * e.deltaY))))); },
    onMouseDown: (e: React.MouseEvent) => { if (e.button === 0) { e.preventDefault(); down.current = true; last.current = { x: e.clientX, y: e.clientY }; } },
    onMouseMove: (e: React.MouseEvent) => {
      if (!down.current) return;
      const el = elRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - last.current.x) / r.width * 100;
      const dy = (e.clientY - last.current.y) / r.height * 100;
      last.current = { x: e.clientX, y: e.clientY };
      setPanX(Math.max(-50, Math.min(50, panX + dx)));
      setPanY(Math.max(-50, Math.min(50, panY + dy)));
    },
    onMouseUp: () => { down.current = false; },
  };
}

function showImageOverlay(src: string, zoom: number, panX: number, panY: number) {
  if (document.getElementById("image-fs-overlay")) return;
  const o = document.createElement("div"); o.id = "image-fs-overlay";
  o.className = "fixed inset-0 z-[9999] bg-[#1a1a2e] flex flex-col";
  const bar = document.createElement("div"); bar.className = "flex justify-end p-3";
  const btn = document.createElement("button"); btn.textContent = "✕ Fermer";
  btn.className = "px-4 py-2 bg-black/60 hover:bg-black/80 rounded-lg text-white text-sm";
  btn.onclick = () => { document.body.removeChild(o); document.body.style.overflow = ""; };
  const wrap = document.createElement("div"); wrap.className = "flex-1 flex items-center justify-center overflow-hidden";
  const inner = document.createElement("div"); inner.className = "w-full h-full flex items-center justify-center";
  inner.style.transform = `translate(${panX}%, ${panY}%) scale(${zoom})`;
  const img = document.createElement("img"); img.src = src;
  img.className = "max-w-full max-h-full pointer-events-none select-none"; img.draggable = false;
  inner.appendChild(img); wrap.appendChild(inner); bar.appendChild(btn);
  o.appendChild(bar); o.appendChild(wrap);
  document.body.appendChild(o); document.body.style.overflow = "hidden";
}

function showGlobalOverlay(src: string) {
  if (document.getElementById("fs-overlay-global")) return;
  const o = document.createElement("div"); o.id = "fs-overlay-global";
  o.className = "fixed inset-0 z-[9999] bg-[#1a1a2e] flex flex-col";
  const bar = document.createElement("div"); bar.className = "flex justify-end p-3";
  const btn = document.createElement("button"); btn.textContent = "✕ Fermer";
  btn.className = "px-4 py-2 bg-black/60 hover:bg-black/80 rounded-lg text-white text-sm";
  btn.onclick = () => { document.body.removeChild(o); document.body.style.overflow = ""; };
  const wrap = document.createElement("div"); wrap.className = "flex-1 flex items-center justify-center";
  const img = document.createElement("img"); img.src = src; img.className = "max-w-full max-h-full";
  wrap.appendChild(img); bar.appendChild(btn);
  o.appendChild(bar); o.appendChild(wrap);
  document.body.appendChild(o); document.body.style.overflow = "hidden";
}

function Model3DViewer() {
  const outerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const mvRef = useRef<any>(null);
  const srcCvsRef = useRef<HTMLCanvasElement>(null);
  const outCvsRef = useRef<HTMLCanvasElement>(null);
  const dsmContRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<any>(null);
  const srcCtxRef = useRef<any>(null);

  const [tab, setTab] = useState(MODELS[0].id);
  const [dcm, setDcm] = useState("orange");
  const [shd, setShd] = useState("normal");
  const [cTheta, setCTheta] = useState(30);
  const [cPhi, setCPhi] = useState(30);
  const [cRad, setCRad] = useState(80);
  const [cSpeed, setCSpeed] = useState(5);
  const [cFov, setCFov] = useState(20);
  const [cOffX, setCOffX] = useState(0);
  const [cOffY, setCOffY] = useState(0);
  const [cOffZ, setCOffZ] = useState(-20);
  const targetRef = useRef({ x: 0, y: 0, z: 0 });
  const loadedRef = useRef(false);

  const [showSettings, setShowSettings] = useState<string | false>(false);
  const [showVeg, setShowVeg] = useState(false);
  const [showVegInfo, setShowVegInfo] = useState(false);

  const [orZoom, setOrZoom] = useState(3.5);
  const [orPanX, setOrPanX] = useState(5);
  const [orPanY, setOrPanY] = useState(-45);

  const [dsZoom, setDsZoom] = useState(1.5);
  const [dsPanX, setDsPanX] = useState(0);
  const [dsPanY, setDsPanY] = useState(0);

  const [veZoom, setVeZoom] = useState(1.5);
  const [vePanX, setVePanX] = useState(0);
  const [vePanY, setVePanY] = useState(0);

  const [dcmLoading, setDcmLoading] = useState(false);
  const [el, setEl] = useState<number | null>(null);
  const [elPos, setElPos] = useState<{ x: number; y: number } | null>(null);

  const cur = MODELS.find(m => m.id === tab) ?? VEG_MODELS.find(v => v.id === tab)!;
  const isVeg = VEG_MODELS.some(v => v.id === tab);

  const orH = makeHandlers(orZoom, setOrZoom, orPanX, setOrPanX, orPanY, setOrPanY, imgRef);
  const veH = makeHandlers(veZoom, setVeZoom, vePanX, setVePanX, vePanY, setVePanY, imgRef);
  const dsH = makeHandlers(dsZoom, setDsZoom, dsPanX, setDsPanX, dsPanY, setDsPanY, dsmContRef);
  const imgH = isVeg ? veH : orH;

  const resetOrtho = () => { setOrZoom(3.5); setOrPanX(5); setOrPanY(-45); };
  const resetVeg = () => { setVeZoom(1.5); setVePanX(0); setVePanY(0); };
  const resetDsm = () => { setDsZoom(1.5); setDsPanX(0); setDsPanY(0); };

  useEffect(() => {
    if (!customElements.get("model-viewer")) {
      import("@google/model-viewer").catch(() => {
        if (!document.querySelector('script[src*="model-viewer.min.js"]')) {
          const s = document.createElement("script");
          s.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.3.1/model-viewer.min.js";
          document.head.appendChild(s);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (cur?.type !== "glb") { mvRef.current = null; return; }
    const el = outerRef.current; if (!el) return;
    const isMobile = window.innerWidth < 768;
    loadedRef.current = false;
    const mv = document.createElement("model-viewer") as any;
    mv.setAttribute("src", cur.url);
    mv.setAttribute("camera-controls", "");
    mv.setAttribute("auto-rotate", "");
    mv.setAttribute("exposure", "0.8");
    mv.setAttribute("interaction-prompt", "none");
    mv.setAttribute("min-camera-orbit", "auto auto 0.5m");
    mv.setAttribute("shadow-intensity", isMobile ? "0" : "0.2");
    mv.style.width = "100%"; mv.style.height = "100%"; mv.style.background = "#1a1a2e";
    el.appendChild(mv);
    mvRef.current = mv;
    mv.addEventListener("load", () => {
      const t = mv.getCameraTarget();
      if (t) targetRef.current = { x: t.x ?? 0, y: t.y ?? 0, z: t.z ?? 0 };
      loadedRef.current = true;
      mv.cameraOrbit = `${cTheta}deg ${90 - cPhi}deg ${cRad}m`;
      mv.cameraTarget = `${(t?.x ?? 0) + cOffX}m ${(t?.y ?? 0) + cOffY}m ${(t?.z ?? 0) + cOffZ}m`;
      mv.setAttribute("rotation-per-second", `${cSpeed}deg`);
      queueMicrotask(() => mv.jumpCameraToGoal?.());
    }, { once: true });
    return () => { mv.remove(); if (mvRef.current === mv) mvRef.current = null; };
  }, [tab]);

  useEffect(() => { const mv = mvRef.current; if (mv) mv.cameraOrbit = `${cTheta}deg ${90 - cPhi}deg ${cRad}m`; }, [cTheta, cPhi, cRad]);
  useEffect(() => { const mv = mvRef.current; if (mv) mv.setAttribute("rotation-per-second", `${cSpeed}deg`); }, [cSpeed]);
  useEffect(() => { const mv = mvRef.current; if (mv) mv.setAttribute("field-of-view", `${cFov}deg`); }, [cFov]);
  useEffect(() => {
    const mv = mvRef.current; if (!mv || !loadedRef.current) return;
    const t = targetRef.current;
    mv.cameraTarget = `${t.x + cOffX}m ${t.y + cOffY}m ${t.z + cOffZ}m`;
    queueMicrotask(() => mv.jumpCameraToGoal?.());
  }, [cOffX, cOffY, cOffZ]);

  useEffect(() => {
    if (cur?.type !== "dsm") return;
    setDcmLoading(true);
    if (!("metaUrl" in cur) || !("dataUrl" in cur)) { setDcmLoading(false); return; }
    let cancelled = false;
    Promise.all([
      fetch((cur as any).metaUrl).then(r => { if (!r.ok) throw Error(`meta fetch ${r.status}`); return r.json(); }),
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image(); img.crossOrigin = "anonymous";
        img.onload = () => resolve(img); img.onerror = reject;
        img.src = (cur as any).dataUrl;
      }),
    ]).then(([m, img]) => {
      if (cancelled) return;
      metaRef.current = m;
      const src = srcCvsRef.current, out = outCvsRef.current;
      if (!src || !out) return;
      let w = m.width, h = m.height;
      const sc = window.innerWidth < 768 ? 0.5 : 1;
      if (sc < 1) { w = Math.round(w * sc); h = Math.round(h * sc); m.width = w; m.height = h; }
      src.width = w; src.height = h;
      const ctx = src.getContext("2d", { willReadFrequently: true });
      if (ctx) { ctx.drawImage(img, 0, 0, w, h); srcCtxRef.current = ctx; }
      try { renderDsm(m, src, out); } catch (e) { console.error("DSM render error:", e); }
    }).catch(e => { console.error("DSM load error:", e); })
      .finally(() => { if (!cancelled) setDcmLoading(false); });
    return () => { cancelled = true; setDcmLoading(false); };
  }, [tab]);

  useEffect(() => {
    const m = metaRef.current, src = srcCvsRef.current, out = outCvsRef.current;
    if (m && src && out) try { renderDsm(m, src, out); } catch (e) { console.error("renderDsm:", e); }
  }, [dcm, shd]);

  function renderDsm(m: any, src: HTMLCanvasElement, out: HTMLCanvasElement) {
    const w = m.width, h = m.height;
    const ctx = src.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, w, h).data;
    out.width = w; out.height = h;
    const octx = out.getContext("2d"); if (!octx) return;
    const imgData = octx.createImageData(w, h);
    const px = imgData.data;
    const minEl = m.minElevation, maxEl = m.maxElevation, range = maxEl - minEl || 1;

    const elev: number[][] = [];
    for (let y = 0; y < h; y++) { elev[y] = []; for (let x = 0; x < w; x++) elev[y][x] = minEl + (data[(y * w + x) * 4] / 255) * range; }

    function hillshade(elev: number[][], factor: number): number[][] {
      const cs = (2048 / w) * 0.05, result: number[][] = [];
      for (let y = 0; y < h; y++) {
        result[y] = [];
        for (let x = 0; x < w; x++) {
          if (x === 0 || y === 0 || x === w - 1 || y === h - 1) { result[y][x] = 1; continue; }
          let dzdx = ((elev[y - 1][x + 1] + 2 * elev[y][x + 1] + elev[y + 1][x + 1]) - (elev[y - 1][x - 1] + 2 * elev[y][x - 1] + elev[y + 1][x - 1])) / (8 * cs);
          let dzdy = ((elev[y + 1][x - 1] + 2 * elev[y + 1][x] + elev[y + 1][x + 1]) - (elev[y - 1][x - 1] + 2 * elev[y - 1][x] + elev[y - 1][x + 1])) / (8 * cs);
          dzdx *= factor; dzdy *= factor;
          const slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));
          const aspect = Math.atan2(dzdy, -dzdx);
          const zr = 45 * Math.PI / 180, ar = 315 * Math.PI / 180;
          const val = Math.cos(zr) * Math.cos(slope) + Math.sin(zr) * Math.sin(slope) * Math.cos(ar - aspect);
          result[y][x] = Math.max(0, Math.min(1, val));
        }
      }
      return result;
    }

    let hill: number[][] | null = null;
    if (shd === "normal") hill = hillshade(elev, 1);
    else if (shd === "extruded") hill = hillshade(elev, 2.5);

    const stops = (COLORMAPS[dcm] || COLORMAPS.orange).stops;

    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = minEl + (data[i] / 255) * range;
      const t = Math.max(0, Math.min(1, (v - minEl) / range)) * (stops.length - 1);
      const idx = Math.min(Math.floor(t), stops.length - 2), frac = t - idx;
      const c1 = stops[idx], c2 = stops[Math.min(idx + 1, stops.length - 1)];
      let r = Math.round(c1[0] + (c2[0] - c1[0]) * frac);
      let g = Math.round(c1[1] + (c2[1] - c1[1]) * frac);
      let b = Math.round(c1[2] + (c2[2] - c1[2]) * frac);
      if (hill) { const hs = hill[y][x]; r = Math.round(r * hs); g = Math.round(g * hs); b = Math.round(b * hs); }
      px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255;
    }
    octx.putImageData(imgData, 0, 0);
  }

  const handleDSMMove = (e: React.MouseEvent) => {
    const c = dsmContRef.current, m = metaRef.current, src = srcCvsRef.current;
    if (!c || !m || !src) return;
    const r = c.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
    const ar = src.width / src.height;
    let dw: number, dh: number;
    if (r.width / r.height > ar) { dh = r.height; dw = dh * ar; }
    else { dw = r.width; dh = dw / ar; }
    const ox = (r.width - dw) / 2, oy = (r.height - dh) / 2;
    const sw = dw * dsZoom, sh = dh * dsZoom;
    const sx = (r.width - sw) / 2 + dsPanX / 100 * r.width;
    const sy = (r.height - sh) / 2 + dsPanY / 100 * r.height;
    const pixX = Math.max(0, Math.min(m.width - 1, Math.round(((cx - sx) / sw) * m.width)));
    const pixY = Math.max(0, Math.min(m.height - 1, Math.round(((cy - sy) / sh) * m.height)));
    const ctx = src.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const val = ctx.getImageData(pixX, pixY, 1, 1).data[0];
    setEl(m.minElevation + (val / 255) * (m.maxElevation - m.minElevation));
    setElPos({ x: cx, y: cy });
  };

  const showModelOverlay = (mv: any) => {
    if (document.getElementById("model-fs-overlay")) return;
    const o = document.createElement("div"); o.id = "model-fs-overlay";
    o.className = "fixed inset-0 z-[9999] bg-[#1a1a2e] flex flex-col";
    const bar = document.createElement("div"); bar.className = "flex justify-end p-3";
    const btn = document.createElement("button"); btn.textContent = "✕ Fermer";
    btn.className = "px-4 py-2 bg-black/60 hover:bg-black/80 rounded-lg text-white text-sm";
    const content = document.createElement("div"); content.className = "flex-1";
    btn.onclick = () => {
      const c = outerRef.current;
      if (c) c.appendChild(mv);
      document.body.removeChild(o);
      document.body.style.overflow = "";
    };
    bar.appendChild(btn); o.appendChild(bar); o.appendChild(content);
    content.appendChild(mv);
    document.body.appendChild(o); document.body.style.overflow = "hidden";
  };

  const handleFS = () => {
    if (cur?.type === "glb") {
      const mv = mvRef.current as any;
      if (!mv) return;
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) { document.exitFullscreen?.(); (document as any).webkitExitFullscreen?.(); return; }
      if (mv.requestFullscreen) mv.requestFullscreen().catch(() => showModelOverlay(mv));
      else if ((mv as any).webkitRequestFullscreen) (mv as any).webkitRequestFullscreen();
      else showModelOverlay(mv);
      return;
    }
    if (cur?.type === "image") {
      if (window.innerWidth < 768) { showImageOverlay(cur.url, isVeg ? veZoom : orZoom, isVeg ? vePanX : orPanX, isVeg ? vePanY : orPanY); return; }
      const el = outerRef.current; if (!el) return;
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) { document.exitFullscreen?.(); (document as any).webkitExitFullscreen?.(); return; }
      if (el.requestFullscreen) el.requestFullscreen().catch(() => showImageOverlay(cur.url, isVeg ? veZoom : orZoom, isVeg ? vePanX : orPanX, isVeg ? vePanY : orPanY));
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
      else showImageOverlay(cur.url, isVeg ? veZoom : orZoom, isVeg ? vePanX : orPanX, isVeg ? vePanY : orPanY);
      return;
    }
    if (cur?.type === "dsm") {
      const canvas = outCvsRef.current;
      if (canvas && window.innerWidth < 768) { canvas.toBlob(b => { if (b) showGlobalOverlay(URL.createObjectURL(b)); }); return; }
      const el = outerRef.current; if (!el) return;
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) { document.exitFullscreen?.(); (document as any).webkitExitFullscreen?.(); return; }
      if (el.requestFullscreen) el.requestFullscreen().catch(() => { const c = outCvsRef.current; c?.toBlob(b => { if (b) showGlobalOverlay(URL.createObjectURL(b)); }); });
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
      else { const c = outCvsRef.current; c?.toBlob(b => { if (b) showGlobalOverlay(URL.createObjectURL(b)); }); }
      return;
    }
    const el = outerRef.current; if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
  };

  return (
    <div className="space-y-3 bg-[#1a1a2e] rounded-2xl">
      <div ref={outerRef} className="relative aspect-video bg-[#1a1a2e] rounded-2xl border border-anthracite-700 overflow-hidden group">
        {cur?.type === "dsm" ? (
          <div ref={dsmContRef} className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none" onWheel={dsH.onWheel} onMouseDown={dsH.onMouseDown} onMouseMove={e => { dsH.onMouseMove(e); handleDSMMove(e); }} onMouseUp={dsH.onMouseUp} onMouseLeave={e => { dsH.onMouseUp(); setEl(null); setElPos(null); }}>
            <div className="w-full h-full flex items-center justify-center" style={{ transform: `translate(${dsPanX}%, ${dsPanY}%) scale(${dsZoom})` }}>
              <canvas ref={outCvsRef} className="max-w-full max-h-full pointer-events-none" />
            </div>
            <canvas ref={srcCvsRef} className="hidden" />
            {dcmLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-[#1a1a2e]/80">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-400">Chargement du MNS...</span>
                </div>
              </div>
            )}
            {el !== null && elPos && (
              <div className="absolute px-2 py-1 bg-black/80 text-white text-xs rounded pointer-events-none z-20 whitespace-nowrap" style={{ left: elPos.x + 12, top: elPos.y - 20 }}>{el.toFixed(2)} m</div>
            )}
            {metaRef.current && (
              <div className="absolute right-2 top-2 bottom-12 flex flex-col items-center z-10 pointer-events-none">
                <span className="text-white text-xs font-medium mb-0.5">{metaRef.current.maxElevation.toFixed(1)} m</span>
                <div className="w-2.5 flex-1 rounded-full border border-white/20" style={{ background: `linear-gradient(to top, ${(COLORMAPS[dcm] || COLORMAPS.orange).stops.map(s => `rgb(${s[0]},${s[1]},${s[2]})`).join(",")})` }} />
                <span className="text-white text-xs font-medium mt-0.5">{metaRef.current.minElevation.toFixed(1)} m</span>
              </div>
            )}
            {dsZoom > 1 && <button onClick={e => { e.stopPropagation(); resetDsm(); }} className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 hover:bg-black/80 rounded text-xs text-white z-10">↺ Réinitialiser</button>}
          </div>
        ) : cur?.type === "image" ? (
          <div ref={imgRef} className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none" onWheel={imgH.onWheel} onMouseDown={imgH.onMouseDown} onMouseMove={imgH.onMouseMove} onMouseUp={imgH.onMouseUp} onMouseLeave={imgH.onMouseUp}>
            <div className="w-full h-full flex items-center justify-center" style={{ transform: `translate(${isVeg ? vePanX : orPanX}%, ${isVeg ? vePanY : orPanY}%) scale(${isVeg ? veZoom : orZoom})` }}>
              <img src={cur.url} alt={cur?.label ?? ""} className="max-w-full max-h-full pointer-events-none" draggable={false} />
            </div>
            {isVeg ? (veZoom > 1 ? <button onClick={e => { e.stopPropagation(); resetVeg(); }} className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 hover:bg-black/80 rounded text-xs text-white z-10">↺ Réinitialiser</button> : null) : (orZoom > 1 ? <button onClick={e => { e.stopPropagation(); resetOrtho(); }} className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 hover:bg-black/80 rounded text-xs text-white z-10">↺ Réinitialiser</button> : null)}
          </div>
        ) : null}
        <button onClick={handleFS} className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-lg flex items-center justify-center z-10" title="Plein écran">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /></svg>
        </button>
        <button onClick={() => setShowSettings(showSettings !== cur.type && cur.type)} className="absolute top-2 left-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-lg flex items-center justify-center z-10" title="Paramètres">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        </button>
      </div>
      {showSettings === "glb" && (
        <div className="bg-anthracite-800/80 border border-anthracite-700 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-cyan-400 font-semibold text-xs">Réglages Caméra</span>
              <button onClick={() => { setCTheta(30); setCPhi(30); setCRad(80); setCSpeed(5); setCFov(20); setCOffX(0); setCOffY(0); setCOffZ(-20); const mv = mvRef.current; if (mv) { mv.cameraOrbit = "30deg 60deg 80m"; mv.setAttribute("rotation-per-second", "5deg"); } }} className="text-cyan-500 hover:text-white text-xs">↺ Réinitialiser</button>
            </div>
            <Slider label="Angle" value={cPhi} min={0} max={90} step={1} unit="°" onChange={setCPhi} />
            <Slider label="Rayon" value={cRad} min={0.5} max={100} step={0.5} unit="m" onChange={setCRad} />
            <div className="border-t border-anthracite-700/50 pt-1.5 mt-1.5">
              <span className="text-gray-500 text-xs">Centre d'orbite</span>
              <Slider label="X" value={cOffX} min={-20} max={20} step={0.5} unit="m" onChange={setCOffX} />
              <Slider label="Z" value={cOffZ} min={-20} max={20} step={0.5} unit="m" onChange={setCOffZ} />
              <Slider label="Hauteur" value={cOffY} min={-10} max={30} step={0.5} unit="m" onChange={setCOffY} />
            </div>
            <Slider label="Zoom" value={cFov} min={5} max={180} step={1} unit="°" onChange={setCFov} />
            <Slider label="Vitesse" value={cSpeed} min={0} max={60} step={1} unit="°/s" onChange={setCSpeed} />
          </div>
        )}
        {showSettings === "dsm" && (
          <div className="bg-anthracite-800/80 border border-anthracite-700 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-cyan-400 font-semibold text-xs">Modèle Digital de Surface</span>
              <button onClick={resetDsm} className="text-cyan-500 hover:text-white text-xs">↺ Réinitialiser</button>
            </div>
            <Slider label="Zoom" value={dsZoom} min={1} max={20} step={0.5} unit="×" onChange={setDsZoom} />
            <Slider label="X" value={dsPanX} min={-50} max={50} step={1} unit="%" onChange={setDsPanX} />
            <Slider label="Y" value={dsPanY} min={-50} max={50} step={1} unit="%" onChange={setDsPanY} />
            <div className="border-t border-anthracite-700/50 pt-2">
              <span className="text-gray-400 text-xs block mb-1.5">Palette de couleurs</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(COLORMAPS).map(([k, v]) => (
                  <button key={k} onClick={() => setDcm(k)} className={`px-2 py-1 rounded text-xs font-medium transition-all ${dcm === k ? "bg-cyan-500 text-white" : "bg-anthracite-700 text-gray-300 hover:bg-anthracite-600"}`}>{v.name}</button>
                ))}
              </div>
            </div>
            <div className="border-t border-anthracite-700/50 pt-2">
              <span className="text-gray-400 text-xs block mb-1.5">Ombrage</span>
              <div className="flex gap-1.5">
                {SHADING.map(s => (
                  <button key={s.id} onClick={() => setShd(s.id)} className={`px-2 py-1 rounded text-xs font-medium transition-all ${shd === s.id ? "bg-amber-500 text-white" : "bg-anthracite-700 text-gray-300 hover:bg-anthracite-600"}`}>{s.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {showSettings === "image" && (
          <div className="bg-anthracite-800/80 border border-anthracite-700 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-cyan-400 font-semibold text-xs">{isVeg ? "Vivacité Végétale" : "Orthophoto"}</span>
              <button onClick={() => { isVeg ? resetVeg() : resetOrtho(); }} className="text-cyan-500 hover:text-white text-xs">↺ Réinitialiser</button>
            </div>
            <Slider label="Zoom" value={isVeg ? veZoom : orZoom} min={1} max={20} step={0.5} unit="×" onChange={isVeg ? setVeZoom : setOrZoom} />
            <Slider label="X" value={isVeg ? vePanX : orPanX} min={-50} max={50} step={1} unit="%" onChange={isVeg ? setVePanX : setOrPanX} />
            <Slider label="Y" value={isVeg ? vePanY : orPanY} min={-50} max={50} step={1} unit="%" onChange={isVeg ? setVePanY : setOrPanY} />
          </div>
        )}

      <div className="flex flex-wrap gap-2">
        {MODELS.map(m => (
          <button key={m.id} onClick={() => { setTab(m.id); setShowVeg(false); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === m.id && !isVeg ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25" : "bg-anthracite-800 border border-anthracite-700 text-gray-300 hover:bg-anthracite-700"}`}>{m.label}</button>
        ))}
      </div>

      <div className="border-t border-anthracite-700/50 pt-2">
        <button onClick={() => setShowVeg(!showVeg)} className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${showVeg ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-anthracite-800 border border-anthracite-700 text-gray-300 hover:bg-anthracite-700"}`}>
          <svg className={`w-3.5 h-3.5 transition-transform ${showVeg ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          Vivacité Végétale
        </button>
      </div>

      {showVeg && (
        <div className="flex flex-wrap gap-1.5 mt-2 pl-2">
          {VEG_MODELS.map(v => (
            <button key={v.id} onClick={() => setTab(v.id)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === v.id ? "bg-green-500 text-white shadow-lg shadow-green-500/25" : "bg-anthracite-800/50 border border-anthracite-700 text-gray-400 hover:bg-anthracite-700"}`}>{v.label}</button>
          ))}
          <button onClick={e => { e.stopPropagation(); setShowVegInfo(true); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all bg-anthracite-800/50 border border-anthracite-700 text-gray-400 hover:bg-anthracite-700 hover:text-white" title="En savoir plus sur les algorithmes">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          </button>
        </div>
      )}

      {showVegInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm" style={{ animation: "vegFadeIn .2s ease-out" }} onClick={() => setShowVegInfo(false)}>
          <div className="bg-anthracite-800 border border-anthracite-700 rounded-xl w-full max-w-[540px] mx-4 max-h-[82vh] overflow-y-auto p-7 relative shadow-2xl" style={{ animation: "vegSlideIn .25s ease-out" }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowVegInfo(false)} className="absolute top-3.5 right-4 w-7 h-7 flex items-center justify-center bg-transparent border-none rounded-md cursor-pointer text-gray-500 hover:bg-anthracite-700 hover:text-white text-lg transition-all">×</button>
            <h2 className="text-base font-bold text-white m-0 mb-1.5 tracking-tight">Indices de Végétation</h2>
            <p className="text-xs text-gray-500 m-0 mb-5">Formules et description des algorithmes de vivacité végétale</p>
            {VEG_ALGO.map(a => (
              <div key={a.id} className="bg-anthracite-900/60 rounded-lg p-3.5 mb-2.5 border border-transparent hover:border-anthracite-600 transition-colors">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-extrabold text-white shrink-0" style={{ background: a.color }}>{a.name}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{a.full}</div>
                    <div className="text-[10px] text-gray-500">{a.name}</div>
                  </div>
                </div>
                <div className="font-mono text-xs text-cyan-400 bg-black/25 px-2.5 py-1.5 rounded-md mb-2 inline-block">{a.formula}</div>
                <div className="text-xs text-gray-300 leading-relaxed my-1">{a.desc}</div>
                <div className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-gray-500 mt-1 tracking-wide">{a.tag}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SolarVideoViewer() {
  const [active, setActive] = useState(SOLAR_TABS[0].id);
  const ref = useRef<HTMLDivElement>(null);
  const cur = SOLAR_TABS.find(t => t.id === active);

  const toggleFS = () => {
    const el = ref.current; if (!el) return;
    const video = el.querySelector("video");
    if (video && (video as any).webkitEnterFullscreen) { (video as any).webkitEnterFullscreen(); return; }
    if (cur?.type === "image") {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) { document.exitFullscreen?.(); (document as any).webkitExitFullscreen?.(); return; }
      if (el.requestFullscreen) el.requestFullscreen().catch(() => showGlobalOverlay(`${R2V}/${cur.file}`));
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
      else showGlobalOverlay(`${R2V}/${cur.file}`);
      return;
    }
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
  };

  return (
    <div className="space-y-3">
      <div ref={ref} className="relative aspect-video bg-anthracite-900 rounded-2xl border border-anthracite-700 overflow-hidden group">
        {cur?.type === "video" ? (
          <video key={active} className="w-full h-full object-contain" autoPlay muted loop playsInline controls>
            <source src={`${R2V}/${cur.file}`} type="video/mp4" />
          </video>
        ) : (
          <img key={active} src={`${R2V}/${cur?.file}`} alt={cur?.label} className="w-full h-full object-contain" />
        )}
        <button onClick={toggleFS} className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-lg flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10" title="Plein écran">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /></svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {SOLAR_TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active === t.id ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25" : "bg-anthracite-800 border border-anthracite-700 text-gray-300 hover:bg-anthracite-700"}`}>{t.label}</button>
        ))}
      </div>
    </div>
  );
}

function PdfViewer() {
  const [active, setActive] = useState(REPORTS[0].id);
  const outerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cur = REPORTS.find(r => r.id === active);

  return (
    <div className="space-y-3">
      <div ref={outerRef} className="relative bg-anthracite-900 rounded-2xl border border-anthracite-700 overflow-hidden group sm:h-[500px] h-[300px]">
        <object data={`${R2R}/${cur?.file}`} type="application/pdf" className="w-full h-full">
          <iframe key={active} ref={iframeRef} src={`https://docs.google.com/viewer?url=${encodeURIComponent(`${R2R}/${cur?.file}`)}&embedded=true`} className="w-full h-full" title={cur?.label} />
        </object>
        <a href={`${R2R}/${cur?.file}`} target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-medium rounded-lg transition-colors z-10 sm:hidden">Télécharger le PDF</a>
        <button onClick={() => { if (cur) window.open(`${R2R}/${cur.file}`, "_blank"); }} className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-lg flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10" title="Plein écran">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /></svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {REPORTS.map(r => (
          <button key={r.id} onClick={() => setActive(r.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active === r.id ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25" : "bg-anthracite-800 border border-anthracite-700 text-gray-300 hover:bg-anthracite-700"}`}>{r.label}</button>
        ))}
      </div>
    </div>
  );
}

function MesuresViewer() {
  const [mode, setMode] = useState("mesures3d");
  const [sel, setSel] = useState<string | null>(null);

  return (
    <div className="space-y-3 bg-anthracite-900 rounded-2xl border border-anthracite-700 p-3">
      <div className="flex flex-wrap gap-2">
        {MES_TABS.map(t => (
          <button key={t.id} onClick={() => { setMode(mode === t.id ? "" : t.id); setSel(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === t.id ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25" : "bg-anthracite-800 border border-anthracite-700 text-gray-300 hover:bg-anthracite-700"}`}>{t.label}</button>
        ))}
      </div>
      {mode === "mesures3d" && (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {MES_3D.map(it => (
              <button key={it.id} onClick={() => setSel(sel === it.id ? null : it.id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${sel === it.id ? "bg-cyan-500/20 border border-cyan-500/50" : "bg-anthracite-800 border border-anthracite-700 hover:bg-anthracite-700"}`}>
                <span className="text-lg">{it.icon}</span>
                <span className="text-[10px] text-gray-400 leading-tight text-center">{it.label}</span>
              </button>
            ))}
          </div>
          {sel && (
            <div className="bg-anthracite-800/80 border border-anthracite-700 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Micro-vidéo à venir pour <span className="text-cyan-400 font-medium">{MES_3D.find(it => it.id === sel)?.label}</span></p>
            </div>
          )}
        </>
      )}
      {mode === "mesures2d" && (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {MES_2D.map(it => (
              <button key={it.id} onClick={() => setSel(sel === it.id ? null : it.id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${sel === it.id ? "bg-cyan-500/20 border border-cyan-500/50" : "bg-anthracite-800 border border-anthracite-700 hover:bg-anthracite-700"}`}>
                <span className="text-lg">{it.icon}</span>
                <span className="text-[10px] text-gray-400 leading-tight text-center">{it.label}</span>
              </button>
            ))}
          </div>
          {sel && (
            <div className="bg-anthracite-800/80 border border-anthracite-700 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Micro-vidéo à venir pour <span className="text-cyan-400 font-medium">{MES_2D.find(it => it.id === sel)?.label}</span></p>
            </div>
          )}
        </>
      )}
      {mode === "calepinage" && (
        <div className="aspect-video bg-gradient-to-br from-anthracite-800 to-anthracite-900 rounded-xl border border-anthracite-700 flex items-center justify-center">
          <p className="text-sm text-gray-500">Calepinage 3D — à venir</p>
        </div>
      )}
      {mode === "objets" && (
        <div className="aspect-video bg-gradient-to-br from-anthracite-800 to-anthracite-900 rounded-xl border border-anthracite-700 flex items-center justify-center">
          <p className="text-sm text-gray-500">Objets 3D — à venir</p>
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <>
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Nos <span className="text-gradient">Services</span></h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Une gamme complète d'outils de photogrammétrie pour les artisans, professionnels et particuliers</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {services.map((svc, i) => (
            <div key={svc.id} id={svc.id} className="scroll-mt-24 grid lg:grid-cols-2 gap-12 items-center">
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                <div className="w-14 h-14 gradient-cyan rounded-2xl flex items-center justify-center mb-6"><svc.icon className="w-7 h-7 text-white" /></div>
                <h2 className="text-3xl font-bold mb-2">{svc.title}</h2>
                <p className="text-cyan-400 mb-4">{svc.subtitle}</p>
                <p className="text-gray-400 leading-relaxed mb-6">{svc.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">{svc.targets.map(t => <span key={t} className="px-3 py-1.5 bg-anthracite-800 border border-anthracite-700 rounded-lg text-xs text-gray-300">{t}</span>)}</div>
                <ul className="space-y-3">{svc.benefits.map(b => <li key={b} className="flex items-start gap-3 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />{b}</li>)}</ul>
              </div>
              <div className={`relative ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                {svc.id === "photogrammetrie" && <Model3DViewer />}
                {svc.id === "solaire" && <SolarVideoViewer />}
                {svc.id === "devis" && <PdfViewer />}
                {svc.id === "mesures" && <MesuresViewer />}
                {svc.id === "inspection" && (
                  <div className="aspect-video bg-gradient-to-br from-anthracite-800 to-anthracite-900 rounded-2xl border border-anthracite-700 flex items-center justify-center p-8">
                    <div className="text-center"><Shield className="w-16 h-16 text-cyan-400/40 mx-auto mb-4" /><p className="text-sm text-gray-500">Visualisation interactive disponible dans la démo</p></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-anthracite-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Comment ça <span className="text-gradient">marche</span></h2>
            <p className="text-gray-400">Un processus simple et automatisé</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map(s => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 gradient-cyan rounded-2xl flex items-center justify-center text-2xl font-bold text-white">{s.step}</div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à <span className="text-gradient">essayer</span> ?</h2>
          <p className="text-gray-400 mb-8">Créez votre compte et accédez à tous nos tutoriels gratuitement</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-4 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25">
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
