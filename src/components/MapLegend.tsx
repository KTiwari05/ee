export default function MapLegend() {
  const COLORS = { base: "#0ea5e9", highlight: "#ffcc00", hover: "#38bdf8" };

  return (
    <div className="absolute bottom-6 left-6 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-4 w-auto">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
        Map Legend
      </h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: COLORS.base }}
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Default Feature
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: COLORS.highlight }}
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Selected Feature
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: COLORS.hover }}
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            Hovered Feature
          </span>
        </div>
      </div>
    </div>
  );
}