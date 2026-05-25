"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  center: [number, number];
  basemap: "osm" | "satellite";
  polygon: [number, number][];
  flightLines: [number, number][][] | null;
  onAddPoint: (latlng: [number, number]) => void;
  onUpdatePoint: (index: number, latlng: [number, number]) => void;
  flyTo: [number, number] | null;
  onFlyDone: () => void;
}

export default function MapComponent({
  center,
  basemap,
  polygon,
  flightLines,
  onAddPoint,
  onUpdatePoint,
  flyTo,
  onFlyDone,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const flightLinesRef = useRef<L.Polyline[]>([]);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Init map
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom: 16,
      zoomControl: true,
    });

    const tile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = tile;

    map.on("click", (e: L.LeafletMouseEvent) => {
      onAddPoint([e.latlng.lat, e.latlng.lng]);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fly to
  useEffect(() => {
    if (mapRef.current && flyTo) {
      mapRef.current.flyTo(flyTo, 18, { duration: 1.5 });
      onFlyDone();
    }
  }, [flyTo, onFlyDone]);

  // Basemap toggle
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }
    const url =
      basemap === "osm"
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    const attr =
      basemap === "osm"
        ? "&copy; OpenStreetMap contributors"
        : "&copy; Esri, Maxar";

    const tile = L.tileLayer(url, { attribution: attr, maxZoom: 19 }).addTo(mapRef.current);
    tileLayerRef.current = tile;
  }, [basemap]);

  // Center change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center);
    }
  }, [center]);

  // Polygon + markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (polygon.length < 2) return;

    // Draw polygon
    const poly = L.polygon(polygon as [number, number][], {
      color: "#00BCD4",
      weight: 2,
      fillColor: "#00BCD4",
      fillOpacity: 0.15,
    }).addTo(map);
    polygonLayerRef.current = poly;

    // Draw markers for each point
    polygon.forEach((latlng, i) => {
      const marker = L.marker(latlng as [number, number], {
        draggable: true,
        icon: L.divIcon({
          className: "",
          html: `<div style="width:24px;height:24px;border-radius:50%;background:#00BCD4;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onUpdatePoint(i, [pos.lat, pos.lng]);
      });

      markersRef.current.push(marker);
    });
  }, [polygon, onUpdatePoint]);

  // Flight lines
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    flightLinesRef.current.forEach((l) => map.removeLayer(l));
    flightLinesRef.current = [];

    if (!flightLines) return;

    const colors = ["#00BCD4", "#FF6B35", "#7C3AED", "#10B981", "#F59E0B"];
    flightLines.forEach((line, idx) => {
      const polyline = L.polyline(line as [number, number][], {
        color: colors[idx % colors.length],
        weight: 3,
        dashArray: "8 4",
      }).addTo(map);
      flightLinesRef.current.push(polyline);

      // Arrow markers at midpoint of each line
      if (line.length > 1) {
        const mid = Math.floor(line.length / 2);
        const [lat, lng] = line[mid];
        const nextIdx = Math.min(mid + 1, line.length - 1);
        const angle =
          (Math.atan2(
            line[nextIdx][0] - line[mid][0],
            line[nextIdx][1] - line[mid][1]
          ) *
            180) /
          Math.PI;

        L.marker([lat, lng] as [number, number], {
          icon: L.divIcon({
            className: "",
            html: `<div style="transform:rotate(${angle}deg);font-size:18px;color:${colors[idx % colors.length]}">➤</div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
        }).addTo(map);
      }

      // Numbered waypoints: only first, last, and every 5th
      line.forEach((pt, j) => {
        if (j === 0 || j === line.length - 1 || j % 5 === 0) {
          L.marker(pt as [number, number], {
            icon: L.divIcon({
              className: "",
              html: `<div style="width:18px;height:18px;border-radius:50%;background:#1A202C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;border:1px solid white">${idx * 100 + j + 1}</div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            }),
          }).addTo(map);
        }
      });
    });
  }, [flightLines]);

  return <div ref={containerRef} className="w-full h-full" />;
}
