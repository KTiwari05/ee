/**
 * Ensures each feature in a GeoJSON file has a unique "id".
 * Adds index-based fallback IDs if missing.
 */
export function preprocessGeoJSON(geojson: any) {
  if (!geojson || !geojson.features) return geojson;
  const clone = JSON.parse(JSON.stringify(geojson)); // deep copy

  clone.features = clone.features.map((f: any, i: number) => {
    if (!f.id) f.id = `feature-${i}`;
    return f;
  });

  return clone;
}
