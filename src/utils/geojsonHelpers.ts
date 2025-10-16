import geojsonValidation from "geojson-validation";

/**
Parses and validates a string to ensure it is a valid GeoJSON object.
 */
export function validateGeoJSON(fileContent: string): object | null {
  try {
    const json = JSON.parse(fileContent);
    const isValid = geojsonValidation.valid(json);
    if (!isValid) throw new Error("Invalid GeoJSON structure");
    return json;
  } catch (err) {
    console.error("GeoJSON parse error:", err);
    return null;
  }
}

/**
 Pre-processes GeoJSON to ensure each feature has a consistent `id`.
 This is the best practice to avoid complex logic inside the map component.
 */
export function normalizeGeoJSON(geojson: any) {
  if (!geojson || !geojson.features) return null;

  const processedFeatures = geojson.features.map((f: any, i: number) => {
    // Prioritize `user_id`, then other common IDs, and fall back to index.
    const id = f.properties?.user_id ?? f.properties?.id ?? f.id ?? `feature-${i}`;
    return {
      ...f,
      properties: {
        ...f.properties,
        id: id, // Ensure a consistent `id` property exists for the map
        name: `Feature ${id}`, // Create a display name
      },
    };
  });

  return { ...geojson, features: processedFeatures };
}


/**
 * Extracts a list of features for display in a UI (e.g., a sidebar).
 */
export function extractFeatureList(geojson: any) {
  if (!geojson || !geojson.features) return [];

  return geojson.features.map((f: any) => ({
    // This logic should match the normalization function
    id: f.properties.id,
    name: f.properties.name,
  }));
}