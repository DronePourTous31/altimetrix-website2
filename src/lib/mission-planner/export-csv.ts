export function exportCSV(flightLines: [number, number][][]): void {
  const rows = [["waypoint", "lat", "lng", "altitude"]];
  let wp = 1;
  for (const line of flightLines) {
    for (const [lat, lng] of line) {
      rows.push([String(wp), lat.toFixed(6), lng.toFixed(6), "60"]);
      wp++;
    }
  }
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "waypoints-altimetrix.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
