import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface LegendItem {
  color: string;
  label: string;
}

interface Section {
  title: string;
  items: LegendItem[];
}

interface LegendPanelProps {
  sections: Section[];
}

export default function LegendPanel({ sections }: LegendPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!sections.length) return null;

  return (
    <div className={`absolute top-4 right-4 z-[1000] transition-all ${collapsed ? "w-12" : "w-80"}`}>
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4]">
          <h3 className={`text-sm font-bold text-white transition ${collapsed ? "hidden" : ""}`}>
            Legend
          </h3>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-white/20 rounded transition text-white"
          >
            <ChevronDown className={`w-4 h-4 transition ${collapsed ? "-rotate-90" : ""}`} />
          </button>
        </div>

        {!collapsed && (
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {sections.map((sec, i) => (
              <div key={i}>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  {sec.title}
                </h4>
                <div className="space-y-1.5">
                  {sec.items.map((it, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: it.color }}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {it.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}