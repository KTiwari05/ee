import { useMap } from "react-leaflet";
import L from "leaflet";

interface Props {
  geojson: any | null;
}

export default function ViewAllButton({ geojson }: Props) {
  const map = useMap();

  const handleClick = () => {
    if (!geojson) return;
    try {
      const bounds = L.geoJSON(geojson).getBounds();
      map.flyToBounds(bounds, { padding: [30, 30], duration: 1.2 });
    } catch (err) {
      console.warn("Could not fit all features:", err);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="absolute top-24 left-6 z-[1000] px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 flex items-center gap-2 group"
    >
      <svg 
        className="w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform group-hover:scale-110" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
        />
      </svg>
      <span className="text-sm">View All Features</span>
    </button>
  );
}