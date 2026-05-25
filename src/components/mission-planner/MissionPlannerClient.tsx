"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { computeFlight, computeAreaDisplay, computeGSD, type FlightParams, type FlightResult } from "@/lib/mission-planner/calculations";
import { exportKML } from "@/lib/mission-planner/export-kml";
import { exportCSV } from "@/lib/mission-planner/export-csv";
import { Search, Mountain, RefreshCw, Undo2, Download, FileText, MapIcon, Satellite, AlertTriangle, Ruler, Camera, Clock, Maximize2 } from "lucide-react";

const MapComponent = dynamic(() => import("@/components/mission-planner/MapComponent"), { ssr: false });

const defaultParams: FlightParams = {
  altitude: 60,
  overlapFrontal: 80,
  overlapLateral: 75,
  angleCamera: "nadir",
  lineDirection: "auto",
};

export default function MissionPlannerClient() {
  const [polygon, setPolygon] = useState<[number, number][]>([]);
  const [params, setParams] = useState<FlightParams>(defaultParams);
  const [basemap, setBasemap] = useState<"osm" | "satellite">("osm");
  const [result, setResult] = useState<FlightResult | null>(null);
  const [center, setCenter] = useState<[number, number]>([43.6047, 1.4442]);
  const [geocodeQuery, setGeocodeQuery] = useState("");
  const [geocodeResults, setGeocodeResults] = useState<{ lat: string; lon: string; display_name: string }[]>([]);
  const [showGeocode, setShowGeocode] = useState(false);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout>>();

  // Fly to address
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

  // Importer zone depuis URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const lat = params.get("lat");
    const lng = params.get("lng");
    if (lat && lng) {
      setCenter([parseFloat(lat), parseFloat(lng)]);
      setFlyTo([parseFloat(lat), parseFloat(lng)]);
    }
  }, []);

  // Geocoding Nominatim (rate-limited)
  const handleGeocode = useCallback((query: string) => {
    setGeocodeQuery(query);
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    if (query.length < 3) { setGeocodeResults([]); setShowGeocode(false); return; }

    geocodeTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=fr`
        );
        const data = await res.json();
        setGeocodeResults(data);
        setShowGeocode(true);
      } catch {
        setGeocodeResults([]);
      }
    }, 600);
  }, []);

  const selectResult = (r: { lat: string; lon: string; display_name: string }) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setCenter([lat, lng]);
    setFlyTo([lat, lng]);
    setGeocodeQuery(r.display_name);
    setShowGeocode(false);
  };

  // Compute flight
  const handleCompute = () => {
    if (polygon.length < 3) return;
    const res = computeFlight({ latlngs: polygon }, params);
    setResult(res);
  };

  // Add point from map click
  const addPoint = useCallback((latlng: [number, number]) => {
    setPolygon((prev) => [...prev, latlng]);
  }, []);

  const removeLastPoint = () => {
    setPolygon((prev) => prev.slice(0, -1));
    setResult(null);
  };

  const resetPolygon = () => {
    setPolygon([]);
    setResult(null);
  };

  // Drag point
  const updatePoint = useCallback((index: number, newLatLng: [number, number]) => {
    setPolygon((prev) => {
      const copy = [...prev];
      copy[index] = newLatLng;
      return copy;
    });
  }, []);

  const area = computeAreaDisplay(polygon);
  const gsd = computeGSD(params.altitude);

  // Generate PDF mission briefing
  const generatePDF = useCallback(() => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Briefing mission AltiMetrix</title>
<style>
  body { font-family: Inter, Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1A202C; }
  h1 { font-family: Syne, sans-serif; font-size: 24px; border-bottom: 3px solid #00BCD4; padding-bottom: 10px; }
  h2 { font-family: Syne, sans-serif; font-size: 18px; margin-top: 30px; color: #2D3748; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
  .card { background: #f7fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
  .card label { font-size: 11px; text-transform: uppercase; color: #718096; letter-spacing: 0.5px; }
  .card .val { font-size: 20px; font-weight: 700; margin-top: 4px; }
  .checklist { list-style: none; padding: 0; }
  .checklist li { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
  .checklist li:before { content: "☐ "; font-size: 18px; }
  .warning { background: #fffaf0; border-left: 4px solid #ed8936; padding: 12px; margin: 16px 0; border-radius: 4px; }
  @media print { body { margin: 0; } }
</style></head><body>
<h1>Briefing mission drone</h1>
<p style="color:#718096;">AltiMetrix — ${new Date().toLocaleDateString("fr-FR")}</p>
<div class="grid">
  <div class="card"><label>Altitude</label><div class="val">${params.altitude} m</div></div>
  <div class="card"><label>GSD</label><div class="val">${gsd} cm/px</div></div>
  <div class="card"><label>Recouvrement frontal</label><div class="val">${params.overlapFrontal}%</div></div>
  <div class="card"><label>Recouvrement latéral</label><div class="val">${params.overlapLateral}%</div></div>
  <div class="card"><label>Angle</label><div class="val">${params.angleCamera === "nadir" ? "Nadir (90°)" : "Oblique (45°)"}</div></div>
  <div class="card"><label>Direction lignes</label><div class="val">${{ auto: "Auto", ns: "N-S", eo: "E-O" }[params.lineDirection]}</div></div>
  ${result ? `
  <div class="card"><label>Photos estimées</label><div class="val">${result.photoCount}</div></div>
  <div class="card"><label>Durée estimée</label><div class="val">${result.flightDuration} min</div></div>
  <div class="card"><label>Surface zone</label><div class="val">${area.toLocaleString("fr-FR")} m²</div></div>
  ` : ""}
</div>
${result?.warnings?.length ? result.warnings.map((w) => `<div class="warning">⚠ ${w}</div>`).join("") : ""}
${polygon.length > 2 ? `
<h2>Coordonnées zone</h2>
<ul>` + polygon.map((p, i) => `<li>Point ${i + 1}: ${p[0].toFixed(6)}, ${p[1].toFixed(6)}</li>`).join("") + `</ul>
` : ""}
<h2>Liste de contrôle pré-vol</h2>
<ul class="checklist">
  <li>Batteries drones chargées (×${Math.ceil((result?.flightDuration || 30) / 25)})</li>
  <li>Carte SD insérée et formatée</li>
  <li>Vérification météo (vent &lt; 20 km/h, pas de pluie)</li>
  <li>Espace aérien libre (pas de zone interdite)</li>
  <li>Calibration boussole effectuée</li>
  <li>Points de décollage/atterrissage dégagés</li>
  <li>Plan de vol chargé dans l&apos;application drone</li>
  <li>Paramètres caméra : ISO 100, vitesse 1/1000s, mise au point ∞</li>
</ul>
</body></html>`);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
  }, [params, result, gsd, area, polygon]);

  const isBypass = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1";

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      {isBypass && (
        <div className="absolute top-0 left-0 z-50 bg-amber-500 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-br-lg uppercase tracking-wider">
          Mode dév
        </div>
      )}
      {/* MAP */}
      <div className="flex-1 min-h-[500px] lg:min-h-[80vh]">
        {/* BASEMAP TOGGLE + INFO BAR */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBasemap("osm")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                basemap === "osm" ? "bg-dark-800 text-white" : "bg-dark-100 text-dark-600 hover:bg-dark-200"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Carte
            </button>
            <button
              onClick={() => setBasemap("satellite")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                basemap === "satellite" ? "bg-dark-800 text-white" : "bg-dark-100 text-dark-600 hover:bg-dark-200"
              }`}
            >
              <Satellite className="w-3.5 h-3.5" /> Satellite
            </button>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://altimetrix-557690596795-eu-north-1-an.s3.eu-north-1.amazonaws.com/MISSION_PLANNER/altimetrix_planner_v3d.html"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-semibold transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Plein écran
            </a>
          </div>
        </div>

        {/* GÉOCODAGE */}
        <div className="relative mb-3">
          <div className="flex items-center gap-2 bg-white rounded-xl border border-dark-100 p-1.5">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-4 h-4 text-dark-400" />
              <input
                value={geocodeQuery}
                onChange={(e) => handleGeocode(e.target.value)}
                placeholder="Rechercher une adresse..."
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>
            <button
              onClick={resetPolygon}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-100 text-dark-600 hover:bg-dark-200 text-xs font-semibold transition-colors"
              title="Réinitialiser la zone"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
          {showGeocode && geocodeResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-dark-100 shadow-lg max-h-60 overflow-y-auto">
              {geocodeResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectResult(r)}
                  className="w-full text-left px-4 py-2.5 text-sm text-dark-700 hover:bg-primary-50 border-b border-dark-50 last:border-0"
                >
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CARTE */}
        <div className="rounded-xl overflow-hidden border border-dark-100 h-[50vh] lg:h-[65vh]">
          <MapComponent
            center={center}
            basemap={basemap}
            polygon={polygon}
            flightLines={result?.flightLines || null}
            onAddPoint={addPoint}
            onUpdatePoint={updatePoint}
            flyTo={flyTo}
            onFlyDone={() => setFlyTo(null)}
          />
        </div>

        {/* ZONE CONTROLS */}
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-dark-500">
            <Ruler className="w-4 h-4" />
            <span className="font-medium text-dark-700">{area.toLocaleString("fr-FR")} m²</span>
            <span className="text-dark-300">·</span>
            <span className="text-dark-400">{polygon.length} point{polygon.length > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={removeLastPoint}
              disabled={polygon.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-200 text-dark-600 hover:bg-dark-50 disabled:opacity-30 text-xs font-semibold transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" /> Annuler point
            </button>
            <button
              onClick={handleCompute}
              disabled={polygon.length < 3}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:bg-dark-300 text-white text-xs font-semibold transition-colors"
            >
              <Camera className="w-3.5 h-3.5" /> Calculer plan de vol
            </button>
          </div>
        </div>
      </div>

      {/* PANEL PARAMÈTRES */}
      <div className="w-full lg:w-80 shrink-0 space-y-5">
        {/* GSD AFFICHAGE */}
        <div className="bg-white rounded-xl border border-dark-100 p-5 text-center">
          <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">GSD estimé</p>
          <p className="text-3xl font-bold text-primary-600">{gsd} <span className="text-sm font-normal">cm/px</span></p>
          <p className="text-xs text-dark-400 mt-1">à {params.altitude} m d&apos;altitude</p>
        </div>

        {/* ALTITUDE */}
        <div className="bg-white rounded-xl border border-dark-100 p-4">
          <label className="flex items-center justify-between text-sm font-medium text-dark-700 mb-2">
            <span>Altitude de vol</span>
            <span className="text-primary-600 font-bold">{params.altitude} m</span>
          </label>
          <input
            type="range"
            min={30}
            max={120}
            step={5}
            value={params.altitude}
            onChange={(e) => setParams({ ...params, altitude: parseInt(e.target.value) })}
            className="w-full accent-primary-600"
          />
          <div className="flex justify-between text-xs text-dark-400 mt-1">
            <span>30 m</span>
            <span>120 m</span>
          </div>
        </div>

        {/* RECOUVREMENTS */}
        <div className="bg-white rounded-xl border border-dark-100 p-4 space-y-4">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-dark-700 mb-2">
              <span>Frontal</span>
              <span className="text-primary-600 font-bold">{params.overlapFrontal}%</span>
            </label>
            <input
              type="range"
              min={70}
              max={90}
              value={params.overlapFrontal}
              onChange={(e) => setParams({ ...params, overlapFrontal: parseInt(e.target.value) })}
              className="w-full accent-primary-600"
            />
          </div>
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-dark-700 mb-2">
              <span>Latéral</span>
              <span className="text-primary-600 font-bold">{params.overlapLateral}%</span>
            </label>
            <input
              type="range"
              min={60}
              max={85}
              value={params.overlapLateral}
              onChange={(e) => setParams({ ...params, overlapLateral: parseInt(e.target.value) })}
              className="w-full accent-primary-600"
            />
          </div>
        </div>

        {/* ANGLE CAMERA */}
        <div className="bg-white rounded-xl border border-dark-100 p-4">
          <label className="text-sm font-medium text-dark-700 mb-3 block">Angle caméra</label>
          <div className="flex gap-2">
            {["nadir", "oblique"].map((a) => (
              <button
                key={a}
                onClick={() => setParams({ ...params, angleCamera: a as "nadir" | "oblique" })}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  params.angleCamera === a
                    ? "bg-primary-600 text-white"
                    : "bg-dark-100 text-dark-600 hover:bg-dark-200"
                }`}
              >
                {a === "nadir" ? "Nadir (90°)" : "Oblique (45°)"}
              </button>
            ))}
          </div>
        </div>

        {/* DIRECTION LIGNES */}
        <div className="bg-white rounded-xl border border-dark-100 p-4">
          <label className="text-sm font-medium text-dark-700 mb-3 block">Sens des lignes</label>
          <div className="flex gap-2">
            {(["auto", "ns", "eo"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setParams({ ...params, lineDirection: d })}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  params.lineDirection === d
                    ? "bg-primary-600 text-white"
                    : "bg-dark-100 text-dark-600 hover:bg-dark-200"
                }`}
              >
                {{ auto: "Auto", ns: "N-S", eo: "E-O" }[d]}
              </button>
            ))}
          </div>
        </div>

        {/* RÉSULTATS */}
        {result && (
          <div className="bg-white rounded-xl border border-dark-100 p-4 space-y-4">
            <h3 className="font-semibold text-dark-800 text-sm">Résultats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary-50">
                <Camera className="w-4 h-4 text-primary-600 mb-1" />
                <p className="text-lg font-bold text-dark-800">{result.photoCount}</p>
                <p className="text-xs text-dark-400">Photos</p>
              </div>
              <div className="p-3 rounded-lg bg-primary-50">
                <Clock className="w-4 h-4 text-primary-600 mb-1" />
                <p className="text-lg font-bold text-dark-800">{result.flightDuration} min</p>
                <p className="text-xs text-dark-400">Vol estimé</p>
              </div>
            </div>

            {result.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {w}
                  </p>
                ))}
              </div>
            )}

            {/* EXPORT */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => exportKML(result.flightLines, polygon, params.altitude)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-green-500 text-green-700 hover:bg-green-50 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Exporter KML (DJI / Litchi)
              </button>
              <button
                onClick={() => exportCSV(result.flightLines)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary-500 text-primary-700 hover:bg-primary-50 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Exporter CSV waypoints
              </button>
              <button
                onClick={generatePDF}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-white text-xs font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Générer briefing PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
