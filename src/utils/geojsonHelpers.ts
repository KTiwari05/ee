// Utility functions for GeoJSON processing

export function normalizeGeoJSON(data: any) {
  if (!data || !data.features) return data;
  
  return {
    ...data,
    features: data.features.map((feature: any, index: number) => ({
      ...feature,
      properties: {
        ...feature.properties,
        id: feature.properties.id ?? feature.id ?? index,
        name: feature.properties.name ?? `Feature ${index + 1}`,
      },
    })),
  };
}

export function extractFeatureList(geojson: any) {
  if (!geojson?.features) return [];
  
  return geojson.features.map((feature: any) => ({
    id: feature.properties.id,
    name: feature.properties.name,
  }));
}

export const norm = (v: unknown) => 
  v === null || v === undefined ? "" : String(v);