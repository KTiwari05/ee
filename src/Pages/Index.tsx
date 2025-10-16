import { useState, useMemo, useEffect } from "react";
import MapView from "../components/MapView";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { normalizeGeoJSON, extractFeatureList, norm } from "../utils/geojsonHelpers";

type FeatureListItem = {
  id: string | number;
  name: string;
};

export default function Index() {
  const [geojson, setGeojson] = useState<any | null>(null);
  const [featureList, setFeatureList] = useState<FeatureListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [activeLayerKey, setActiveLayerKey] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<any>({});
  const [filterTerm, setFilterTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://e2da2525-8e56-48da-94b7-6c04d3f64fe2-00-2utec47fablah.sisko.replit.dev/api/catalog");
        if (res.ok) setCatalog(await res.json());
      } catch (err) {
        console.error("Catalog fetch failed:", err);
      }
    })();
  }, []);

  const handleFileLoad = (validatedJson: any) => {
    if (!validatedJson) {
      alert("Invalid GeoJSON file!");
      return;
    }
    const normalizedData = normalizeGeoJSON(validatedJson);
    setGeojson(normalizedData);

    const features = extractFeatureList(normalizedData);
    setFeatureList(features);
    setFilterTerm("");
    setSelectedId(features.length ? norm(features[0].id) : null);
    setIsSidebarOpen(false); // Close sidebar on mobile after upload
  };

  const filteredFeatures = useMemo(() => {
    if (!filterTerm) return featureList;
    return featureList.filter(
      (feature) =>
        feature.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
        String(feature.id).toLowerCase().includes(filterTerm.toLowerCase())
    );
  }, [featureList, filterTerm]);

  return (
    <div className="w-screen h-screen flex flex-col bg-background">
      <Header
        featureCount={featureList.length}
        filterTerm={filterTerm}
        onFilterChange={setFilterTerm}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          features={filteredFeatures}
          selectedId={norm(selectedId)}
          onSelect={(id) => setSelectedId(norm(id))}
          onFileLoad={handleFileLoad}
          totalFeatures={featureList.length}
          catalog={catalog}
          onLayerChange={setActiveLayerKey}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 relative">
          <MapView
            geojson={geojson}
            selectedId={norm(selectedId)}
            onSelectFeature={(id) => setSelectedId(norm(id))}
            activeLayerKey={activeLayerKey}
            catalog={catalog}
          />
        </main>
      </div>
    </div>
  );
}