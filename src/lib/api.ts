export type Catalog = {
  [category: string]: Array<{
    id: string;
    title: string;
    collection: string;
    variants: Array<{ id: string; label: string; vis: any }>;
    legend?: Array<{ color: string; label: string }>;
  }>;
};

const BASE = "https://e2da2525-8e56-48da-94b7-6c04d3f64fe2-00-2utec47fablah.sisko.replit.dev";

export async function fetchCatalog(): Promise<Catalog> {
  const res = await fetch(`${BASE}/api/catalog`);
  if (!res.ok) throw new Error("catalog fetch failed");
  return res.json();
}

export async function fetchTile(layerId: string, variantId: string): Promise<{url: string, vis: any}> {
  const res = await fetch(`${BASE}/api/tile/${layerId}/${variantId}`);
  if (!res.ok) throw new Error("tile fetch failed");
  return res.json();
}
