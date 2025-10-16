import { useState } from "react";
import { Upload, Layers, ChevronDown, X, FileJson, Database, Zap } from "lucide-react";

interface Feature {
  id: string | number;
  name: string;
}

interface SidebarProps {
  features: Feature[];
  selectedId: string | number | null;
  onSelect: (id: string | number | null) => void;
  onFileLoad: (file: any) => void;
  totalFeatures: number;
  catalog: any;
  onLayerChange: (key: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FeatureList = ({ features, selectedId, onSelect }: any) => (
  <div className="space-y-2">
    {features.map((feature: Feature) => (
      <button
        key={feature.id}
        onClick={() => onSelect(feature.id)}
        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group ${
          selectedId === feature.id
            ? "bg-gradient-to-r from-yellow-500/40 to-amber-500/40 border border-yellow-400/50 shadow-lg shadow-yellow-500/20"
            : "hover:bg-slate-700/50 border border-transparent hover:border-slate-600/50"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              selectedId === feature.id
                ? "bg-gradient-to-r from-yellow-400 to-amber-400 shadow-lg shadow-yellow-500/50 scale-125"
                : "bg-slate-500 group-hover:bg-slate-400"
            }`}
          />
          <span
            className={`text-sm font-medium truncate ${
              selectedId === feature.id
                ? "text-white"
                : "text-slate-300 group-hover:text-slate-100"
            }`}
          >
            {feature.name}
          </span>
        </div>
      </button>
    ))}
  </div>
);

export default function Sidebar({
  features,
  selectedId,
  onSelect,
  onFileLoad,
  totalFeatures,
  catalog,
  onLayerChange,
  isOpen,
  onClose,
}: SidebarProps) {
  const [layerKey, setLayerKey] = useState<string>("");
  const [isFileHovering, setIsFileHovering] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    upload: true,
    features: totalFeatures > 0,
    layers: Object.keys(catalog).length > 0,
  });

  const catalogEntries = Object.entries(catalog) as Array<[string, any[]]>;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onFileLoad(json);
        e.target.value = "";
      } catch {
        alert("Invalid GeoJSON file. Please check your file format.");
      }
    };
    reader.readAsText(file);
  };

  const SectionHeader = ({
    icon: Icon,
    title,
    isExpanded,
    badge,
    onClick,
  }: any) => (
    <button
      onClick={onClick}
      className="w-full group"
    >
      <div className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-700/40 transition-colors duration-200 rounded-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 group-hover:from-yellow-500/30 group-hover:to-amber-500/30 transition-colors">
            <Icon className="w-4.5 h-4.5 text-yellow-300" />
          </div>
          <div className="text-left min-w-0">
            <span className="font-semibold text-slate-100 group-hover:text-white transition-colors text-sm">
              {title}
            </span>
            {badge && (
              <div className="text-xs text-slate-400 mt-0.5">
                {badge}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-4.5 h-4.5 text-slate-400 group-hover:text-slate-300 transition-all duration-300 flex-shrink-0 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>
    </button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50
          w-80 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 
          text-slate-100 border-r border-slate-700/50
          shadow-2xl overflow-y-auto backdrop-blur-xl
          transition-all duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/50 backdrop-blur-md border-b border-slate-700/30 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 animate-pulse" />
            <h2 className="font-bold text-lg bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
              Layers
            </h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800/60 transition-colors hover:scale-110 duration-200"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-200" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Upload Section */}
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 rounded-xl border border-slate-700/40 hover:border-slate-600/50 transition-all duration-300 overflow-hidden group">
            <SectionHeader
              icon={Upload}
              title="Upload Data"
              isExpanded={expandedSections.upload}
              badge="GeoJSON, JSON"
              onClick={() => toggleSection("upload")}
            />

            {expandedSections.upload && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-700/30">
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsFileHovering(true);
                  }}
                  onDragLeave={() => setIsFileHovering(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsFileHovering(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const json = JSON.parse(
                            event.target?.result as string
                          );
                          onFileLoad(json);
                        } catch {
                          alert("Invalid GeoJSON file!");
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-5 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer ${
                    isFileHovering
                      ? "border-purple-400/60 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                      : "border-slate-600/50 hover:border-slate-500/70 hover:bg-slate-700/20"
                  }`}
                >
                  <input
                    type="file"
                    accept=".json,.geojson"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <FileJson
                    className={`w-6 h-6 mb-2 transition-colors ${
                      isFileHovering ? "text-purple-300" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold text-center ${
                      isFileHovering ? "text-purple-300" : "text-slate-400"
                    }`}
                  >
                    {isFileHovering ? "Drop file here" : "Click or drag file"}
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Features Section */}
          {totalFeatures > 0 && (
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 rounded-xl border border-slate-700/40 hover:border-slate-600/50 transition-all duration-300 overflow-hidden">
              <SectionHeader
                icon={Layers}
                title="Features"
                isExpanded={expandedSections.features}
                badge={`${totalFeatures} items`}
                onClick={() => toggleSection("features")}
              />

              {expandedSections.features && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-700/30 max-h-96 overflow-y-auto custom-scrollbar">
                  <FeatureList
                    features={features}
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                </div>
              )}
            </div>
          )}

          {/* Data Layers Section */}
          {catalogEntries.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 rounded-xl border border-slate-700/40 hover:border-slate-600/50 transition-all duration-300 overflow-hidden">
              <SectionHeader
                icon={Database}
                title="Data Layers"
                isExpanded={expandedSections.layers}
                badge={`${catalogEntries.length} ${
                  catalogEntries.length === 1 ? "category" : "categories"
                }`}
                onClick={() => toggleSection("layers")}
              />

              {expandedSections.layers && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-700/30">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Select Layer
                    </label>
                    <select
                      value={layerKey}
                      onChange={(e) => {
                        const key = e.target.value;
                        setLayerKey(key);
                        onLayerChange(key || null);
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-slate-600/50 
                        bg-slate-800/60 hover:bg-slate-800/80 focus:bg-slate-800
                        text-slate-100 placeholder-slate-500
                        focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                        focus:outline-none
                        transition-all duration-200
                        appearance-none cursor-pointer
                        bg-no-repeat bg-right
                        pr-10
                        "
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a5b4' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundPosition: "right 0.75rem center",
                        backgroundSize: "1.2em 1.2em",
                      }}
                    >
                      <option value="">-- Select a layer --</option>
                      {catalogEntries.map(([category, layers]) => (
                        <optgroup key={category} label={category}>
                          {layers.flatMap((layer: any) =>
                            (layer.variants || []).map((variant: any) => (
                              <option
                                key={`${layer.id}:${variant.id}`}
                                value={`${category}|${layer.id}|${variant.id}`}
                              >
                                {layer.title} • {variant.label}
                              </option>
                            ))
                          )}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {totalFeatures === 0 && catalogEntries.length === 0 && (
            <div className="mt-8 p-6 rounded-xl border border-slate-700/30 bg-slate-800/20 text-center">
              <Zap className="w-8 h-8 mx-auto text-slate-500 mb-3" />
              <p className="text-sm text-slate-400 font-medium">
                Upload GeoJSON to get started
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supported formats: .json, .geojson
              </p>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.5);
        }
      `}</style>
    </>
  );
}