import React from 'react';
import { Bus, Route, Building2, Navigation2, AlertCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  advisoryCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  advisoryCount = 3,
}) => {
  const tabs = [
    { id: 'arrivals', label: 'Live Bus', icon: Bus },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'interchange', label: 'Berths', icon: Building2 },
    { id: 'planner', label: 'Planner', icon: Navigation2 },
    { id: 'advisories', label: 'Alerts', icon: AlertCircle, badge: advisoryCount },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-2px_10px_rgba(18,24,32,0.06)]">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors relative cursor-pointer ${
                isActive ? 'text-[#6E1D6B]' : 'text-[#82727e] hover:text-[#161c24]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#D95E1E] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold text-[#6E1D6B]' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
