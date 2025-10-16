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
}

export default function Sidebar({
  features,
  selectedId,
  onSelect,
  onFileLoad,
  totalFeatures,
}: SidebarProps) {
  return (
    <aside className="w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg overflow-y-auto">
      {/* File Upload */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Upload GeoJSON File
        </label>
        <input
          type="file"
          accept=".json,.geojson"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const json = JSON.parse(event.target?.result as string);
                  onFileLoad(json);
                } catch {
                  alert("Invalid GeoJSON file!");
                }
              };
              reader.readAsText(file);
            }
          }}
          className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-300 dark:hover:file:bg-slate-600"
        />
      </div>

      {/* Feature List */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          Features ({totalFeatures})
        </h2>
        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              onClick={() => onSelect(feature.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedId === feature.id
                  ? "bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-500"
                  : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              }`}
            >
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {feature.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ID: {feature.id}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}