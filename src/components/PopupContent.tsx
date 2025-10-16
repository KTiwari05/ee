interface FeatureProperties {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface Props {
  properties: FeatureProperties;
}

export default function PopupContent({ properties }: Props) {
  return (
    <div className="min-w-[240px]">
      <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white px-4 py-3 -mx-3 -mt-3 rounded-t-lg mb-3">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-medium uppercase tracking-wider opacity-90">Feature Details</span>
        </div>
        <h3 className="text-lg font-bold">
          {properties?.name ?? "Unnamed Feature"}
        </h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Feature ID</span>
          <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 ml-2">
            {properties?.id ?? "N/A"}
          </span>
        </div>
        
        {Object.keys(properties).length > 2 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Additional Properties
            </p>
            <div className="space-y-1.5">
              {Object.entries(properties)
                .filter(([key]) => key !== 'id' && key !== 'name')
                .slice(0, 3)
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-slate-900 dark:text-slate-100 font-medium ml-2">
                      {String(value)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}