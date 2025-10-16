// src/components/FeatureList.tsx

interface Props {
  features: { id: string | number; name: string }[];
  selectedId: string | number | null;
  onSelect: (id: string | number) => void;
}

export default function FeatureList({ features, selectedId, onSelect }: Props) {
  return (
    <div className="space-y-1">
      {features.map((feature, index) => (
        <div
          key={feature.id}
          onClick={() => onSelect(feature.id)}
          className={`
            group flex items-center gap-3 w-full p-2.5 rounded-md cursor-pointer transition-all duration-150
            ${selectedId === feature.id
              ? 'bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border-l-4 border-transparent'
            }
          `}
        >
          {/* Index Number */}
          <div className={`
            flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold
            ${selectedId === feature.id
              ? 'bg-blue-500 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }
          `}>
            {index + 1}
          </div>

          {/* Feature Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
              {feature.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
              ID: {feature.id}
            </p>
          </div>

          {/* Selected Checkmark */}
          {selectedId === feature.id && (
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      ))}
      {features.length === 0 && (
         <div className="text-center py-10 px-4">
           <p className="text-sm text-slate-500 dark:text-slate-400">No features match your filter.</p>
         </div>
      )}
    </div>
  );
}