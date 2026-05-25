export function exportKML(
  flightLines: [number, number][][],
  zoneLatLngs: [number, number][],
  altitude: number
): void {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>Plan de vol AltiMetrix</name>
  <Style id="zone">
    <PolyStyle><color>66ff0000</color></PolyStyle>
    <LineStyle><color>ff0000ff</color><width>3</width></LineStyle>
  </Style>
  <Placemark><name>Zone</name><styleUrl>#zone</styleUrl>
    <Polygon><outerBoundaryIs><LinearRing><coordinates>`;

  for (const [lat, lng] of zoneLatLngs) {
    kml += `${lng},${lat},${altitude} `;
  }
  kml += `</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;

  flightLines.forEach((line, idx) => {
    kml += `
  <Placemark><name>Ligne ${idx + 1}</name>
    <LineString><extrude>1</extrude><tessellate>1</tessellate>
    <altitudeMode>relativeToGround</altitudeMode>
    <coordinates>`;
    for (const [lat, lng] of line) {
      kml += `${lng},${lat},${altitude} `;
    }
    kml += `</coordinates></LineString></Placemark>`;
  });

  kml += `
</Document>
</kml>`;

  const blob = new Blob([kml], { type: "application/vnd.google-earth.kml+xml" });
  downloadBlob(blob, "plan-de-vol-altimetrix.kml");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
