import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl, Pane } from "react-leaflet";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import "leaflet/dist/leaflet.css";
import PopupContent from "./PopupContent";


/** ======= Types ======= */
interface FeatureProperties {
  id: string | number;
  name: string;
  [key: string]: any;
}
interface GeoJSONFeature {
  type: "Feature";
  properties: FeatureProperties;
  geometry: any;
}
interface Props {
  geojson: { type: "FeatureCollection"; features: GeoJSONFeature[] } | null;
  selectedId: string | number | null;
  onSelectFeature?: (id: string | number | null) => void;
}
type Catalog = {
  [category: string]: Array<{
    id: string;
    title: string;
    collection: string;
    variants: Array<{ id: string; label: string; vis?: any }>;
    legend?: Array<{ color: string; label: string }>;
  }>;
};
type ActiveTile = {
  layer: L.TileLayer;
  opacity: number;
  category: string;
  layerId: string;
  layerTitle: string;
  variantId: string;
  variantLabel: string;
};

/** ======= Constants ======= */
const API_BASE = "http://localhost:8000";
const COLORS = { base: "#0ea5e9", highlight: "#ffcc00", hover: "#38bdf8" };
// Replace fragile Google base with solid Esri imagery overlay
const ESRI_IMAGERY_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

/** ============================================================================
 *  MapView
 *  ==========================================================================*/
export default function MapView({ geojson, selectedId, onSelectFeature }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const layerMap = useRef<Map<string | number, L.Path>>(new Map());
  // const { BaseLayer } = LayersControl;

  // Satellite overlay state (2D base + satellite overlay on top)
  const satRef = useRef<L.TileLayer | null>(null);
  const [satOn, setSatOn] = useState(false);
  const [satOpacity, setSatOpacity] = useState(0.6);

  // Catalog + active overlay state
  const [catalog, setCatalog] = useState<Catalog>({});
  const [active, setActive] = useState<Record<string, ActiveTile>>({}); // key = `${layerId}:${variantId}`

  // ---- fetch catalog from backend ----
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/catalog`);
        if (!res.ok) throw new Error("Catalog fetch failed");
        const data: Catalog = await res.json();
        setCatalog(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);
  const catalogEntries = useMemo(
    () => Object.entries(catalog) as Array<[string, Catalog[string]]>,
    [catalog]
  );

  // ---- feature styling + handlers (unchanged interaction) ----
  const getStyle = (featureId?: string | number): L.PathOptions => {
    const isSelected = featureId === selectedId;
    return {
      color: isSelected ? COLORS.highlight : COLORS.base,
      weight: isSelected ? 3.5 : 2,
      fillColor: isSelected ? COLORS.highlight : COLORS.base,
      fillOpacity: isSelected ? 0.5 : 0.2,
    };
  };

  const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
    const featureId = feature.properties.id;
    const polygonLayer = layer as L.Path;
    layerMap.current.set(featureId, polygonLayer);

    polygonLayer.bindPopup(
      ReactDOMServer.renderToString(<PopupContent properties={feature.properties} />)
    );

    polygonLayer.on({
      mouseover: (e) => {
        if (featureId !== selectedId) {
          e.target.setStyle({ color: COLORS.hover, fillColor: COLORS.hover });
        }
        polygonLayer.bringToFront();
      },
      mouseout: () => polygonLayer.setStyle(getStyle(featureId)),
      click: () => {
        onSelectFeature?.(featureId);
        mapRef.current?.closePopup();
      },
    });
  };

  // ---- initial zoom to first feature ----
  useEffect(() => {
    const map = mapRef.current;
    if (!geojson || !map || geojson.features.length === 0) return;
    const firstFeature = geojson.features[0];
    const bounds = L.geoJSON(firstFeature).getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [100, 100] });
  }, [geojson]);

  // ---- cinematic fly-to on selection ----
  useEffect(() => {
    const map = mapRef.current;
    if (!selectedId || !map) return;

    layerMap.current.forEach((layer, id) => layer.setStyle(getStyle(id)));
    const targetLayer = layerMap.current.get(selectedId);

    if (targetLayer) {
      targetLayer.bringToFront();
      const bounds = (targetLayer as any).getBounds?.();
      if (bounds) {
        map.flyToBounds(bounds, { padding: [120, 120], duration: 3, easeLinearity: 0.2 });
      }
    }
  }, [selectedId]);

  /** ===================== EE TILE MANAGEMENT ===================== */

  // Toggle an overlay variant on/off and ensure it renders above basemap.
  const toggleVariant = async (
    category: string,
    layerId: string,
    layerTitle: string,
    variantId: string,
    variantLabel: string
  ) => {
    const map = mapRef.current;
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

    try {
      const res = await fetch(`${API_BASE}/api/tile/${layerId}/${variantId}`);
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();

      // Ensure overlays render BETWEEN base tiles and vectors
      const tile = L.tileLayer(url, { opacity: 0.6, pane: "overlayTiles", zIndex: 650 }).addTo(map);

      setActive(prev => ({
        ...prev,
        [key]: {
          layer: tile,
          opacity: 0.7,
          category,
          layerId,
          layerTitle,
          variantId,
          variantLabel,
        },
      }));
    } catch (err) {
      console.error("Tile fetch failed:", err);
    }
  };

  const setVariantOpacity = (key: string, value: number) => {
    const entry = active[key];
    if (!entry) return;
    entry.layer.setOpacity(value);
    setActive(prev => ({ ...prev, [key]: { ...entry, opacity: value } }));
  };

  // dynamic legend: show legend for any layer that has one and is active
  const legendSections = useMemo(() => {
    const activeByLayer: Record<string, { title: string; variants: string[]; category: string }> = {};
    Object.entries(active).forEach(([_, info]) => {
      if (!activeByLayer[info.layerId]) {
        activeByLayer[info.layerId] = { title: info.layerTitle, variants: [], category: info.category };
      }
      activeByLayer[info.layerId].variants.push(info.variantLabel);
    });

    const sections: Array<{ title: string; items: Array<{ color: string; label: string }> }> = [];
    for (const [, layers] of catalogEntries) {
      layers.forEach(layer => {
        if (activeByLayer[layer.id]) {
          if (layer.legend && layer.legend.length) {
            sections.push({ title: layer.title, items: layer.legend });
          } else {
            const items = activeByLayer[layer.id].variants.map(v => ({ color: "#888", label: v }));
            sections.push({ title: layer.title, items });
          }
        }
      });
    }
    return sections;
  }, [active, catalogEntries]);

  // Satellite overlay toggle/opacity
  const toggleSatellite = () => {
    const map = mapRef.current;
    if (!map) return;
    if (satOn) {
      if (satRef.current) map.removeLayer(satRef.current);
      satRef.current = null;
      setSatOn(false);
      return;
    }
    // ensure pane exists
    if (!map.getPane("overlayTiles")) {
      map.createPane("overlayTiles");
      map.getPane("overlayTiles")!.style.zIndex = "350"; // below vectors (overlayPane=400), above basemap
    }
    const t = L.tileLayer(ESRI_IMAGERY_URL, { pane: "overlayTiles", opacity: satOpacity }).addTo(map);
    satRef.current = t;
    setSatOn(true);
  };

  const setSatelliteOpacity = (val: number) => {
    setSatOpacity(val);
    if (satRef.current) satRef.current.setOpacity(val);
  };

  /** ===================== RENDER ===================== */
  return (
    <div className="w-full h-full relative bg-[#F5F5F5] dark:bg-[#1E1E1E] overflow-hidden">
      <div className="flex w-full h-full">
        {/* ===== Left Layer Panel with improved UI ===== */}
        <div className="w-80 bg-[#FAFAFA] dark:bg-[#2A2A2A] backdrop-blur border-r border-[#E0E0E0] dark:border-[#3A3A3A] overflow-y-auto">
          <div className="px-4 py-3 text-sm font-semibold bg-gradient-to-r from-[#6B4F2A] to-[#8B6A3A] text-[#FAFAFA]">
            Layers
          </div>

          {/* Basemap overlays (2D base + satellite overlay on top) */}
          <div className="px-4 pb-4 pt-3 border-b border-[#E0E0E0] dark:border-[#3A3A3A]">
            <div className="text-[10px] uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0] mb-2">
              Basemap
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-[#4A4A4A] dark:text-[#D0D0D0]">
                <input
                  type="checkbox"
                  className="accent-[#6B4F2A]"
                  checked={satOn}
                  onChange={toggleSatellite}
                />
                <span>Satellite imagery</span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={satOn ? satOpacity : 0}
                onChange={(e) => setSatelliteOpacity(parseFloat(e.target.value))}
                className="w-28 accent-[#6B4F2A] disabled:opacity-40"
                disabled={!satOn}
                title="Opacity"
              />
            </div>
          </div>

          {/* Catalog */}
          {catalogEntries.length === 0 && (
            <div className="px-4 py-3 text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">Loading catalog…</div>
          )}
          {catalogEntries.map(([category, layers]) => (
            <div key={category} className="px-4 pb-4 pt-3">
              <div className="text-[10px] uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0] mb-2">
                {category}
              </div>
              {layers.map(layer => (
                <div key={layer.id} className="mb-3">
                  <div className="font-medium text-[#4A4A4A] dark:text-[#D0D0D0] mb-1">{layer.title}</div>
                  {layer.variants.map(variant => {
                    const key = `${layer.id}:${variant.id}`;
                    const isOn = !!active[key];
                    return (
                      <div key={variant.id} className="flex items-center justify-between gap-3 py-1">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="accent-[#6B4F2A]"
                            checked={isOn}
                            onChange={() =>
                              toggleVariant(category, layer.id, layer.title, variant.id, variant.label)
                            }
                          />
                          <span>{variant.label}</span>
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={0.85}
                          step={0.05}
                          value={active[key]?.opacity ?? 0}
                          onChange={e => setVariantOpacity(key, parseFloat(e.target.value))}
                          className="w-28 accent-[#6B4F2A] disabled:opacity-40"
                          disabled={!isOn}
                          title="Opacity"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}

          {/* Active chips */}
          {Object.keys(active).length > 0 && (
            <div className="px-4 pb-4">
              <div className="text-[10px] uppercase tracking-wider text-[#6B6B6B] dark:text-[#A0A0A0] mb-2">
                Active
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(active).map(([key, entry]) => (
                  <button
                    key={key}
                    onClick={() =>
                      toggleVariant(entry.category, entry.layerId, entry.layerTitle, entry.variantId, entry.variantLabel)
                    }
                    className="text-xs px-2 py-1 rounded bg-[#E0E0E0] text-[#4A4A4A] dark:bg-[#3A3A3A] dark:text-[#D0D0D0] hover:bg-[#FFCCCC] hover:text-[#FF0000] transition"
                    title="Click to remove"
                  >
                    {entry.variantLabel}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== Map Area ===== */}
        <div className="relative flex-1">
          <MapContainer
              ref={mapRef}
              center={[20.59, 78.96]}
              zoom={4}
              className="w-full h-full"
              scrollWheelZoom={true}
            >
              <Pane name="basemapPane" style={{ zIndex: 200 }} />
              <Pane
                name="overlayTiles"
                style={{
                  zIndex: 650,
                  mixBlendMode: "screen", // prevents “dark stacking” of multiple overlays
                }}
              />
              <Pane name="featuresPane" style={{ zIndex: 1000 }} />

              {/* Ensure panes exist BEFORE any layer mounts */}
              {/* <Pane name="basemapPane" style={{ zIndex: 200 }} />
              <Pane name="overlayTiles" style={{ zIndex: 650 }} /> */}

              <LayersControl position="topright">
                {/* Satellite (no key) */}
                <LayersControl.BaseLayer checked name="Esri World Imagery (Satellite)">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
                    pane="basemapPane"
                    zIndex={200}
                  />
                </LayersControl.BaseLayer>

                {/* Black & White option (no key) */}
                <LayersControl.BaseLayer name="Stamen Toner Lite (B/W)">
                  <TileLayer
                    url="https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png"
                    attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, CC BY 3.0 — Map data &copy; OpenStreetMap contributors'
                    pane="basemapPane"
                    zIndex={200}
                  />
                </LayersControl.BaseLayer>

                {/* If you still want OSM color as a third option */}
                <LayersControl.BaseLayer name="OpenStreetMap">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                    pane="basemapPane"
                    zIndex={200}
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              {geojson && (
                <GeoJSON
                  key="geojson-layer"
                  data={geojson}
                  pane="featuresPane"                      // <<< put polygons above all tiles
                  style={(feature) => getStyle(feature?.properties.id)}
                  onEachFeature={onEachFeature}
                />
              )}

            </MapContainer>



          {/* ===== Legend Panel (top-right) ===== */}
          {/* Renders only when something is active & present in catalog */}
          {legendSections.length > 0 && (
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 dark:bg-slate-900/95 rounded-lg border border-slate-200 dark:border-slate-800 shadow p-3 w-80">
              <div className="text-sm font-semibold mb-2">Legend</div>
              {legendSections.map((sec, i) => (
                <div key={i} className="mb-3">
                  <div className="text-sm font-medium mb-1">{sec.title}</div>
                  {sec.items.map((it, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm mb-1">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: it.color }} />
                      <span>{it.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* ===== Base Feature Legend (bottom-left) ===== */}
          <div className="absolute bottom-6 left-6 z-[400] bg-[#FAFAFA]/95 dark:bg-[#2A2A2A]/95 rounded-xl border border-[#E0E0E0] dark:border-[#3A3A3A] shadow-md p-3 max-w-xs">
            <div className="text-xs font-medium text-[#6B6B6B] dark:text-[#A0A0A0] mb-2">Map Legend</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.base }} />
              <span className="text-sm text-[#4A4A4A] dark:text-[#D0D0D0]">Default Feature</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.highlight }} />
              <span className="text-sm text-[#4A4A4A] dark:text-[#D0D0D0]">Selected Feature</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.hover }} />
              <span className="text-sm text-[#4A4A4A] dark:text-[#D0D0D0]">Hovered Feature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
