import React from 'react';
import { RefreshCw, Navigation, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  secondsToRefresh: number;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  onLocateNearMe: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  secondsToRefresh,
  onManualRefresh,
  isRefreshing,
  onLocateNearMe,
}) => {
  const navItems = [
    { id: 'arrivals', label: 'Live Arrivals' },
    { id: 'routes', label: 'Route Inspector' },
    { id: 'interchange', label: 'Interchange Hub' },
    { id: 'planner', label: 'Trip Planner' },
    { id: 'advisories', label: 'Advisories' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-[0_2px_4px_rgba(18,24,32,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title (Single text element wordmark in Plus Jakarta Sans) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#6E1D6B] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <button
            onClick={() => onTabChange('arrivals')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#161c24] group-hover:text-[#6E1D6B] transition-colors whitespace-nowrap">
              Metropolitan Transit Velocity
            </span>
          </button>
        </div>

        {/* Zone 2: Nav Links (Desktop clean text links) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer py-1 relative ${
                  isActive
                    ? 'text-[#6E1D6B] font-bold'
                    : 'text-[#50434d] hover:text-[#161c24]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-[-16px] left-0 right-0 h-[2.5px] bg-[#6E1D6B] rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Refresh Ticker & Geolocation Trigger) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onLocateNearMe}
            title="Locate nearest bus stop"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6E1D6B] bg-[#eff4ff] hover:bg-[#e3e8f4] border border-[#d4c1ce] rounded-lg transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#6E1D6B]" />
            <span>Near Me</span>
          </button>

          <button
            onClick={onManualRefresh}
            title="Sync live telemetry"
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-[#6E1D6B] hover:bg-[#581755] active:scale-98 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-white ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span className="tabular-nums font-mono">
              {isRefreshing ? 'Syncing...' : `${secondsToRefresh}s`}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
