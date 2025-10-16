import { useEffect, useRef, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Pane } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Info, Layers } from "lucide-react";

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
  activeLayerKey?: string | null;
  catalog?: any;
}

// --------- Color helpers ----------
const generatePolygonColor = (
  layerKey: string | null,
  featureId: string | number
): string => {
  if (!layerKey) return "rgba(218, 165, 32, 0.7)"; // dark yellow default

  const combined = `${layerKey}:${featureId}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const hues = [
    "rgba(218, 165, 32, 0.7)",  // Dark yellow
    "rgba(210, 180, 140, 0.7)", // Tan
    "rgba(184, 134, 11, 0.7)",  // Dark goldenrod
    "rgba(204, 153, 0, 0.7)",   // Deep gold
    "rgba(188, 143, 143, 0.7)", // Rosy brown
    "rgba(169, 132, 94, 0.7)",  // Brown
  ];
  const index = Math.abs(hash) % hues.length;
  return hues[index];
};

const API_BASE = "http://localhost:8000";
const ESRI_IMAGERY_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

export default function MapView({
  geojson,
  selectedId,
  onSelectFeature,
  activeLayerKey,
  catalog = {},
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const layerMap = useRef<Map<string | number, L.Path>>(new Map());
  const overlayRef = useRef<L.TileLayer | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  // hover popup state
  const [popupContent, setPopupContent] = useState<FeatureProperties | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafMove = useRef<number | null>(null);

  const getStyle = (featureId?: string | number): L.PathOptions => {
    const isSelected = featureId === selectedId;
    const isHovered = featureId === hoveredId;
    const baseColor = featureId
      ? generatePolygonColor(activeLayerKey ?? null, featureId)
      : "rgba(218, 165, 32, 0.7)";

    return {
      color: isSelected ? "rgba(168, 85, 247, 0.95)" : baseColor,
      weight: isSelected ? 4 : isHovered ? 3 : 2.5,
      fillColor: isSelected ? "rgba(168, 85, 247, 0.95)" : baseColor,
      fillOpacity: isSelected ? 0.65 : isHovered ? 0.5 : 0.4,
    };
  };

  // feature interactivity
  const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
    const featureId = String(feature.properties.id);
    const polygonLayer = layer as L.Path;
    layerMap.current.set(featureId, polygonLayer);

    polygonLayer.on({
      mouseover: (e: L.LeafletMouseEvent) => {
        setHoveredId(featureId);
        // show popup on hover
        updatePopupFromEvent(e, feature.properties);
        polygonLayer.setStyle(getStyle(featureId));
        polygonLayer.bringToFront();
      },
      mousemove: (e: L.LeafletMouseEvent) => {
        // keep popup following cursor, throttled with rAF
        if (rafMove.current) cancelAnimationFrame(rafMove.current);
        rafMove.current = requestAnimationFrame(() => {
          updatePopupFromEvent(e, feature.properties);
        });
      },
      mouseout: () => {
        setHoveredId(null);
        setPopupContent(null);
        polygonLayer.setStyle(getStyle(featureId));
      },
      click: () => {
        // click only selects (keeps hover-only info behavior)
        onSelectFeature?.(featureId);
      },
    });
  };

  const updatePopupFromEvent = (e: L.LeafletMouseEvent, props: FeatureProperties) => {
    const point = mapRef.current?.latLngToContainerPoint(e.latlng);
    if (!point) return;
    setPopupContent(props);
    setPopupPosition({ x: point.x + 18, y: point.y - 18 }); // slight offset
  };

  // initial zoom to dataset
  useEffect(() => {
    const map = mapRef.current;
    if (!geojson || !map || geojson.features.length === 0) return;
    const bounds = L.geoJSON(geojson).getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [100, 100] });
  }, [geojson]);

  // smooth transition on selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    // reset styles
    layerMap.current.forEach((layer, id) => {
      layer.setStyle(getStyle(id));
    });

    const targetLayer = layerMap.current.get(String(selectedId));
    if (!targetLayer) return;

    const bounds = (targetLayer as any).getBounds?.();
    if (bounds && bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [140, 140],
        duration: 2.5,
        easeLinearity: 0.15,
      });
    }

    // brief glow
    (targetLayer as any).setStyle({
      weight: 5,
      color: "rgba(168, 85, 247, 0.95)",
      fillOpacity: 0.7,
    });
    const t = setTimeout(() => {
      (targetLayer as any).setStyle(getStyle(selectedId));
    }, 1200);
    return () => clearTimeout(t);
  }, [selectedId]);

  // overlay tiles
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.getPane("overlayTiles")) {
      map.createPane("overlayTiles");
      map.getPane("overlayTiles")!.style.zIndex = "650";
      map.getPane("overlayTiles")!.style.mixBlendMode = "multiply"; // good contrast
    }

    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }

    if (!activeLayerKey) return;

    setIsLoading(true);
    (async () => {
      try {
        const [, layerId, variantId] = activeLayerKey.split("|");
        const res = await fetch(`${API_BASE}/api/tile/${layerId}/${variantId}`);
        if (!res.ok) throw new Error(`Tile fetch failed: ${res.statusText}`);
        const { url } = await res.json();

        const tile = L.tileLayer(url, { opacity: 0.7, pane: "overlayTiles" });
        tile.addTo(map);
        overlayRef.current = tile;
      } catch (err) {
        console.error("Error loading overlay:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [activeLayerKey]);

  // legend
  const legend = useMemo(() => {
    if (!activeLayerKey || !catalog) return null;
    const [, layerId] = activeLayerKey.split("|");
    for (const category in catalog) {
      const foundLayer = catalog[category]?.find(
        (layer: any) => layer.id === layerId
      );
      if (foundLayer?.legend && foundLayer.legend.length > 0)
        return foundLayer.legend;
    }
    return null;
  }, [activeLayerKey, catalog]);

  return (
    <div className="relative w-full h-full bg-slate-950">
      <MapContainer
        ref={mapRef as any}
        center={[20.59, 78.96]}
        zoom={4}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <Pane name="basemapPane" style={{ zIndex: 200 }} />
        <Pane name="overlayTiles" style={{ zIndex: 650 }} />
        <Pane name="featuresPane" style={{ zIndex: 1000 }} />

        <TileLayer
          url={ESRI_IMAGERY_URL}
          attribution="Tiles © Esri, Maxar, Earthstar Geographics"
          pane="basemapPane"
        />

        {geojson && (
          <GeoJSON
            key="geojson-layer"
            data={geojson}
            pane="featuresPane"
            style={(feature) => getStyle(feature?.properties.id)}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* Legend */}
      {legend && (
        <div className="absolute top-8 right-8 z-[2000]">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-300 dark:border-slate-700 shadow-2xl rounded-2xl p-5 w-80 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Legend
              </h3>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700 mb-3" />
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {legend.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <span
                    className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-800 dark:text-slate-200 truncate">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading chip */}
      {isLoading && (
        <div className="absolute top-8 left-8 z-[2000] flex items-center gap-3 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg">
          <div className="relative w-4 h-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin" />
            <div className="absolute inset-1 rounded-full bg-white dark:bg-slate-800" />
          </div>
          <span className="text-sm font-medium">Loading overlay...</span>
        </div>
      )}

      {/* Hover Info Popup */}
      {popupContent && (
        <div
          className="absolute z-[2100] pointer-events-none animate-[fadeIn_0.15s_ease-out]"
          style={{ left: `${popupPosition.x}px`, top: `${popupPosition.y}px` }}
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl p-4 w-80 max-h-96 overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                  {popupContent.name}
                </h4>
              </div>
              {/* close is disabled for hover popup to keep pointer-events none;
                  kept for parity but hidden */}
              <button className="hidden p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-700 mb-3" />
            <div className="space-y-2">
              {Object.entries(popupContent)
                .filter(([k]) => k !== "id" && k !== "name")
                .map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-purple-600 dark:text-purple-300 mb-0.5">
                      {k}
                    </p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 break-words">
                      {String(v).length > 160 ? String(v).slice(0, 160) + "…" : String(v)}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* local animations + scrollbar styling */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.4); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 0.6); }
      `}</style>
    </div>
  );
}
