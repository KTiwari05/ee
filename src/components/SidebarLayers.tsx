import { useEffect, useState } from "react";
import type { Catalog } from "../lib/api";
import { fetchCatalog, fetchTile } from "../lib/api";
import L from "leaflet";

interface Props {
  map: L.Map | null;
}

type ActiveTile = { layer: L.TileLayer, opacity: number, label: string };

export default function SidebarLayers({ map }: Props) {
  const [catalog, setCatalog] = useState<Catalog>({});
  const [active, setActive] = useState<Record<string, ActiveTile>>({}); // key = `${layerId}:${variantId}`

  useEffect(() => {
    fetchCatalog().then(setCatalog).catch(console.error);
  }, []);

  const ensureOverlayPane = (m: L.Map) => {
    if (!m.getPane("overlayTiles")) {
      m.createPane("overlayTiles");
      // Below vectors (overlayPane=400), above basemap
      m.getPane("overlayTiles")!.style.zIndex = "350";
    }
  };

  const toggle = async (layerId: string, variantId: string, label: string) => {
    if (!map) return;
    const key = `${layerId}:${variantId}`;
    const existing = active[key];
    if (existing) {
      map.removeLayer(existing.layer);
      const copy = { ...active };
      delete copy[key];
      setActive(copy);
      return;
    }
    ensureOverlayPane(map);
    const { url } = await fetchTile(layerId, variantId);
    const tile = L.tileLayer(url, { opacity: 0.7, pane: "overlayTiles" }).addTo(map);
    setActive(prev => ({ ...prev, [key]: { layer: tile, opacity: 0.7, label } }));
  };

  const setOpacity = (key: string, value: number) => {
    const entry = active[key];
    if (!entry) return;
    entry.layer.setOpacity(value);
    setActive(prev => ({ ...prev, [key]: { ...entry, opacity: value } }));
  };

  return (
    <div className="w-80 bg-[#FAFAFA] dark:bg-[#2A2A2A] backdrop-blur border-r border-[#E0E0E0] dark:border-[#3A3A3A] h-full overflow-y-auto">
      <div className="p-3 text-sm font-semibold bg-gradient-to-r from-[#6B4F2A] to-[#8B6A3A] text-[#FAFAFA]">Layers</div>
      {Object.entries(catalog).map(([category, layers]) => (
        <div key={category} className="px-3 pb-3 pt-3">
          <div className="text-xs uppercase text-[#6B6B6B] dark:text-[#A0A0A0] mb-1">{category}</div>
          {layers.map(l => (
            <div key={l.id} className="mb-3">
              <div className="font-medium text-[#4A4A4A] dark:text-[#D0D0D0]">{l.title}</div>
              {l.variants.map(v => {
                const key = `${l.id}:${v.id}`;
                const isOn = !!active[key];
                return (
                  <div key={v.id} className="flex items-center justify-between gap-3 py-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="accent-[#6B4F2A]"
                        checked={isOn}
                        onChange={() => toggle(l.id, v.id, v.label)}
                      />
                      <span>{v.label}</span>
                    </label>
                    <input
                      type="range" min={0} max={1} step={0.05}
                      value={active[key]?.opacity ?? 0}
                      onChange={(e) => setOpacity(key, parseFloat(e.target.value))}
                      className="w-28 accent-[#6B4F2A] disabled:opacity-40"
                      disabled={!isOn}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
