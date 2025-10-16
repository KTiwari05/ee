interface HeaderProps {
  featureCount: number;
  filterTerm: string;
  onFilterChange: (term: string) => void;
}

export default function Header({ featureCount, filterTerm, onFilterChange }: HeaderProps) {
  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-slate-700 dark:to-slate-800 shadow-md px-6 py-4 flex items-center justify-between">
      {/* Title and Feature Count */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white">
          TCS Envirozone
        </h1>
        <span className="text-sm text-blue-200 dark:text-slate-400">
          {featureCount} Features
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={filterTerm}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Search features..."
          className="pl-10 pr-4 py-2 rounded-lg border border-blue-400 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-300 dark:focus:ring-slate-500 focus:outline-none w-64 sm:w-80"
        />
        <svg
          className="w-5 h-5 text-blue-400 dark:text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16l-4-4m0 0l4-4m-4 4h16"
          />
        </svg>
      </div>
    </header>
  );
}