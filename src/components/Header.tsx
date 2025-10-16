import { Search, Map, Menu, } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  featureCount: number;
  filterTerm: string;
  onFilterChange: (term: string) => void;
  onToggleSidebar: () => void;
  isLoading?: boolean;
}

export default function Header({
  featureCount,
  filterTerm,
  onFilterChange,
  onToggleSidebar,
  isLoading = false,
}: HeaderProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <header className="w-full bg-gradient-to-r from-slate-900/80 via-slate-900/70 to-slate-950/80 border-b border-slate-700/50 shadow-2xl px-4 sm:px-6 py-4 flex items-center justify-between backdrop-blur-xl sticky top-0 z-30">
      {/* Left Section - Menu & Branding */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2.5 hover:bg-slate-800/60 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-slate-300 hover:text-white" />
        </button>

        {/* Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 group">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
            <Map className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent truncate">
              Envirozone
            </h1>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  isLoading
                    ? "bg-yellow-400 animate-pulse"
                    : featureCount > 0
                    ? "bg-green-400 animate-pulse"
                    : "bg-slate-500"
                }`}
              />
              <span className="text-xs text-slate-400 font-medium">
                {isLoading
                  ? "Loading..."
                  : `${featureCount} ${featureCount === 1 ? "Feature" : "Features"}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="hidden sm:flex flex-1 max-w-md lg:max-w-lg mx-4 lg:mx-6">
        <div
          className={`relative w-full transition-all duration-300 ${
            isFocused ? "scale-105" : "scale-100"
          }`}
        >
          <div
            className={`absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-pink-500/0 transition-all duration-300 pointer-events-none ${
              isFocused
                ? "from-purple-500/20 to-pink-500/20 blur-lg"
                : "from-purple-500/0 to-pink-500/0"
            }`}
          />
          <div className="relative flex items-center">
            <Search
              className={`w-5 h-5 absolute left-3 transition-colors duration-200 ${
                isFocused ? "text-purple-400" : "text-slate-500"
              }`}
            />
            <input
              type="text"
              value={filterTerm}
              onChange={(e) => onFilterChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search features..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-600/50 bg-slate-800/40 hover:bg-slate-800/60 focus:bg-slate-800/80 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Mobile Search Button (placeholder action) */}
      <button
        onClick={() => {}}
        className="sm:hidden p-2.5 hover:bg-slate-800/60 rounded-lg transition-all duration-200"
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-slate-400 hover:text-slate-300" />
      </button>
    </header>
  );
}
