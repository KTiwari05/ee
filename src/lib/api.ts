const API_BASE = "http://localhost:8000";

export interface LayerVariant {
  id: string;
  label: string;
}

export interface Layer {
  id: string;
  title: string;
  variants: LayerVariant[];
  legend?: Array<{ color: string; label: string }>;
}

export type Catalog = Record<string, Layer[]>;

export async function fetchCatalog(): Promise<Catalog> {
  const res = await fetch(`${API_BASE}/api/catalog`);
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchTile(layerId: string, variantId: string) {
  const res = await fetch(`${API_BASE}/api/tile/${layerId}/${variantId}`);
  if (!res.ok) throw new Error(`Tile fetch failed: ${res.statusText}`);
  return res.json();
}