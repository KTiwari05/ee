import { CheckCircle2, Zap, Loader } from "lucide-react";

interface Feature {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface FeatureListProps {
  features: Feature[];
  selectedId: string | number | null;
  onSelect: (id: string | number) => void;
  isLoading?: boolean;
}

export default function FeatureList({
  features,
  selectedId,
  onSelect,
  isLoading = false,
}: FeatureListProps) {
  const norm = (v: unknown) => (v === null || v === undefined ? "" : String(v));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="relative w-12 h-12 mb-4">
          <Loader className="w-12 h-12 text-purple-400 animate-spin" />
        </div>
        <p className="text-sm text-slate-400 font-medium">Loading features...</p>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Zap className="w-10 h-10 text-slate-600 mb-3" />
        <p className="text-sm text-slate-400 font-medium text-center">
          No features found
        </p>
        <p className="text-xs text-slate-500 mt-1 text-center">
          Upload a GeoJSON file to see features here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {features.map((feature, index) => {
        const id = norm(feature.id);
        const isSelected = norm(selectedId) === id;

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="w-full group relative"
          >
            {/* Background gradient on hover/select */}
            <div
              className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-r from-purple-500/25 to-pink-500/25 shadow-lg shadow-purple-500/20"
                  : "bg-transparent group-hover:bg-slate-700/20"
              }`}
            />

            {/* Content */}
            <div
              className="relative flex items-center gap-3 px-3 py-3 border-l-3 transition-all duration-200 border-transparent group-hover:border-slate-600/50"
              style={{
                borderLeftColor: isSelected ? "rgb(168, 85, 247)" : "transparent",
              }}
            >
              {/* Index Badge */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                    : "bg-slate-800/60 text-slate-300 group-hover:bg-slate-700/80 group-hover:text-slate-100"
                }`}
              >
                {index + 1}
              </div>

              {/* Feature Info */}
              <div className="flex-1 min-w-0 text-left">
                <p
                  className={`text-sm font-semibold truncate transition-colors duration-200 ${
                    isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
                  }`}
                >
                  {feature.name}
                </p>
                <p className="text-xs text-slate-500 font-mono truncate group-hover:text-slate-400 transition-colors">
                  ID: {id}
                </p>
              </div>

              {/* Check Icon */}
              <div
                className={`flex-shrink-0 transition-all duration-300 ${
                  isSelected
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-75 group-hover:opacity-50"
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-purple-300" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
