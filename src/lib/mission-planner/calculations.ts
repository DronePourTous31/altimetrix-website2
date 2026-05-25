export interface ZonePolygon {
  latlngs: [number, number][];
}

export interface FlightParams {
  altitude: number;
  overlapFrontal: number;
  overlapLateral: number;
  angleCamera: "nadir" | "oblique";
  lineDirection: "auto" | "ns" | "eo";
}

export interface FlightResult {
  gsd: number;
  photoCount: number;
  flightDuration: number;
  flightLines: [number, number][][];
  warnings: string[];
}

// DJI Phantom 4 Pro specs
const SENSOR_WIDTH_MM = 13.2;
const FOCAL_LENGTH_MM = 24;
const IMG_WIDTH_PX = 5472;
const IMG_HEIGHT_PX = 3648;
const SPEED_MS = 8;
const TURN_TIME_S = 10;

export function computeGSD(altitude: number): number {
  return parseFloat(((SENSOR_WIDTH_MM * altitude * 100) / (FOCAL_LENGTH_MM * IMG_WIDTH_PX)).toFixed(2));
}

export function computeFlight(
  polygon: ZonePolygon,
  params: FlightParams
): FlightResult {
  const warnings: string[] = [];
  const gsd = computeGSD(params.altitude);

  if (params.altitude < 50 && polygon.latlngs.length > 0) {
    warnings.push("Altitude basse : risque pour les bâtiments élevés (>10m).");
  }

  // Compute bounding box & area orientation
  const lats = polygon.latlngs.map((p) => p[0]);
  const lngs = polygon.latlngs.map((p) => p[1]);
  const latMin = Math.min(...lats);
  const latMax = Math.max(...lats);
  const lngMin = Math.min(...lngs);
  const lngMax = Math.max(...lngs);

  // Area in m² (approximate using lat/lng)
  const area = computeArea(polygon.latlngs);
  const widthM = distanceMeters([latMin, lngMin], [latMin, lngMax]);
  const heightM = distanceMeters([latMin, lngMin], [latMax, lngMin]);

  // Ground footprint per photo
  const fwM = (IMG_WIDTH_PX * gsd) / 100;
  const fhM = (IMG_HEIGHT_PX * gsd) / 100;

  // Spacing between photos
  const spacingX = fwM * (1 - params.overlapFrontal / 100);
  const spacingY = fhM * (1 - params.overlapLateral / 100);

  // Choose line direction based on zone
  let dir: "ns" | "eo";
  if (params.lineDirection === "auto") {
    dir = widthM > heightM ? "eo" : "ns";
  } else {
    dir = params.lineDirection;
  }

  let lines: [number, number][][] = [];
  let photoCount = 0;

  if (dir === "ns") {
    // Lines run north-south, spaced east-west
    const xSteps = Math.max(1, Math.ceil(widthM / spacingX));
    for (let i = 0; i <= xSteps; i++) {
      const frac = i / xSteps;
      const lng = lngMin + frac * (lngMax - lngMin);
      const ySteps = Math.max(1, Math.ceil(heightM / spacingY));
      const line: [number, number][] = [];
      const reversed = i % 2 === 1;
      for (let j = 0; j <= ySteps; j++) {
        const jj = reversed ? ySteps - j : j;
        const yFrac = jj / ySteps;
        const lat = latMin + yFrac * (latMax - latMin);
        line.push([lat, lng]);
      }
      lines.push(line);
      photoCount += ySteps + 1;
    }
  } else {
    // Lines run east-west, spaced north-south
    const ySteps = Math.max(1, Math.ceil(heightM / spacingY));
    for (let i = 0; i <= ySteps; i++) {
      const frac = i / ySteps;
      const lat = latMin + frac * (latMax - latMin);
      const xSteps = Math.max(1, Math.ceil(widthM / spacingX));
      const line: [number, number][] = [];
      const reversed = i % 2 === 1;
      for (let j = 0; j <= xSteps; j++) {
        const jj = reversed ? xSteps - j : j;
        const xFrac = jj / xSteps;
        const lng = lngMin + xFrac * (lngMax - lngMin);
        line.push([lat, lng]);
      }
      lines.push(line);
      photoCount += xSteps + 1;
    }
  }

  // Duration
  let totalDist = 0;
  for (const line of lines) {
    for (let k = 1; k < line.length; k++) {
      totalDist += distanceMeters(line[k - 1], line[k]);
    }
  }
  const flightTimeS = totalDist / SPEED_MS + (lines.length - 1) * TURN_TIME_S;
  const flightDuration = Math.ceil(flightTimeS / 60);

  return { gsd, photoCount, flightDuration, flightLines: lines, warnings };
}

function distanceMeters(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const a2 =
    sinLat * sinLat +
    Math.cos((a[0] * Math.PI) / 180) *
      Math.cos((b[0] * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
}

function computeArea(latlngs: [number, number][]): number {
  if (latlngs.length < 3) return 0;
  const R = 6371000;
  let area = 0;
  const n = latlngs.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = (latlngs[i][1] * Math.PI) / 180;
    const yi = (latlngs[i][0] * Math.PI) / 180;
    const xj = (latlngs[j][1] * Math.PI) / 180;
    const yj = (latlngs[j][0] * Math.PI) / 180;
    area += (xj - xi) * (2 + Math.sin(yi) + Math.sin(yj));
  }
  area = Math.abs((area * R * R) / 2);
  return Math.round(area);
}

export function computeAreaDisplay(latlngs: [number, number][]): number {
  return computeArea(latlngs);
}
