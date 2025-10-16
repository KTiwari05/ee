// src/App.tsx

import { useState, useMemo } from "react";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header"; // Updated Header component
import { normalizeGeoJSON, extractFeatureList } from "./utils/geojsonHelpers";

type FeatureListItem = {
  id: string | number;
  name: string;
};

export default function App() {
  const [geojson, setGeojson] = useState<any | null>(null);
  const [featureList, setFeatureList] = useState<FeatureListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [filterTerm, setFilterTerm] = useState(""); // State for the new filter

  const handleFileLoad = (validatedJson: any) => {
    if (!validatedJson) {
      alert("Invalid GeoJSON file!");
      return;
    }
    const normalizedData = normalizeGeoJSON(validatedJson);
    setGeojson(normalizedData);
    const features = extractFeatureList(normalizedData);
    setFeatureList(features);
    setFilterTerm(""); // Reset filter on new file load

    if (features.length > 0) {
      setSelectedId(features[0].id);
    } else {
      setSelectedId(null);
    }
  };

  // Filter the feature list based on the search term
  const filteredFeatures = useMemo(() => {
    if (!filterTerm) return featureList;
    return featureList.filter(
      (feature) =>
        feature.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
        String(feature.id).toLowerCase().includes(filterTerm.toLowerCase())
    );
  }, [featureList, filterTerm]);

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-slate-800 dark:to-slate-900">
      {/* Header */}
      <Header
        featureCount={featureList.length}
        filterTerm={filterTerm}
        onFilterChange={setFilterTerm}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          features={filteredFeatures}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onFileLoad={handleFileLoad}
          totalFeatures={featureList.length}
        />

        {/* Main Map Area */}
        <main className="flex-1">
          <MapView
            geojson={geojson}
            selectedId={selectedId}
            onSelectFeature={setSelectedId}
          />
        </main>
      </div>
    </div>
  );
}