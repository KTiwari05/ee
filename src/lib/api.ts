const API_BASE = "https://e2da2525-8e56-48da-94b7-6c04d3f64fe2-00-2utec47fablah.sisko.replit.dev";

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