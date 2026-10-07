import React, { useState } from 'react';
import { SERVICE_ADVISORIES } from '../data/transitData';
import { ServiceAdvisory } from '../types/transit';
import { AlertCircle, AlertTriangle, CloudRain, ExternalLink, Clock, ShieldAlert } from 'lucide-react';

interface AdvisoriesScreenProps {
  onSelectService: (serviceNo: string) => void;
}

export const AdvisoriesScreen: React.FC<AdvisoriesScreenProps> = ({
  onSelectService,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'disruption' | 'diversion' | 'weather'>('all');

  const filteredAdvisories = SERVICE_ADVISORIES.filter((adv) => {
    if (filterType === 'all') return true;
    return adv.type === filterType;
  });

  const getBorderColor = (adv: ServiceAdvisory) => {
    if (adv.type === 'disruption' || adv.priority === 'high') return '#DE350B'; // red
    return '#D95E1E'; // secondary orange for delays/diversions/weather
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'disruption':
        return <ShieldAlert className="w-5 h-5 text-[#DE350B]" />;
      case 'diversion':
        return <AlertTriangle className="w-5 h-5 text-[#D95E1E]" />;
      case 'weather':
        return <CloudRain className="w-5 h-5 text-[#1B6B93]" />;
      default:
        return <AlertCircle className="w-5 h-5 text-[#D95E1E]" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Header & System Status Banner */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_2px_4px_rgba(18,24,32,0.03)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#82727e]">
                Operations Control Centre Feed
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#161c24] mt-1">
              Network Status & Commuter Advisories
            </h2>
          </div>

          <div className="text-xs text-[#50434d] bg-[#f8f9ff] px-3 py-1.5 rounded-lg border border-[#e9eefa]">
            Broadcasting 3 Active Bulletins across 12 sectors
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-[#f1f5f9] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-[#6E1D6B] text-white'
                : 'bg-[#eff4ff] text-[#50434d] hover:bg-[#e3e8f4]'
            }`}
          >
            All Bulletins ({SERVICE_ADVISORIES.length})
          </button>
          <button
            onClick={() => setFilterType('disruption')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'disruption'
                ? 'bg-[#6E1D6B] text-white'
                : 'bg-[#eff4ff] text-[#50434d] hover:bg-[#e3e8f4]'
            }`}
          >
            Track Delays
          </button>
          <button
            onClick={() => setFilterType('diversion')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'diversion'
                ? 'bg-[#6E1D6B] text-white'
                : 'bg-[#eff4ff] text-[#50434d] hover:bg-[#e3e8f4]'
            }`}
          >
            Road Diversions
          </button>
          <button
            onClick={() => setFilterType('weather')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'weather'
                ? 'bg-[#6E1D6B] text-white'
                : 'bg-[#eff4ff] text-[#50434d] hover:bg-[#e3e8f4]'
            }`}
          >
            Weather Impact
          </button>
        </div>
      </div>

      {/* 2. Advisory Banners with 4px left border accent */}
      <div className="space-y-3.5">
        {filteredAdvisories.map((advisory) => {
          const borderColor = getBorderColor(advisory);

          return (
            <div
              key={advisory.id}
              className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_2px_4px_rgba(18,24,32,0.04)] p-4 sm:p-5 relative overflow-hidden transition-all hover:shadow-[0_4px_12px_rgba(18,24,32,0.06)]"
              style={{ borderLeft: `4px solid ${borderColor}` }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {getTypeIcon(advisory.type)}
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#82727e]">
                        {advisory.id}
                      </span>
                      <span className="text-[11px] font-semibold text-[#82727e] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{advisory.timestamp}</span>
                      </span>
                    </div>

                    {advisory.resolutionEta && (
                      <span className="text-xs font-bold text-[#50434d] bg-slate-100 px-2 py-0.5 rounded">
                        {advisory.resolutionEta}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#161c24] leading-snug">
                    {advisory.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#50434d] leading-relaxed">
                    {advisory.description}
                  </p>

                  {/* Affected Services Tags */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#f1f5f9] flex-wrap">
                    <span className="text-[11px] font-bold text-[#82727e] uppercase tracking-wider">
                      Affected Services:
                    </span>
                    {advisory.affectedServices.map((svc) => (
                      <button
                        key={svc}
                        onClick={() => onSelectService(svc)}
                        className="px-2 py-0.5 rounded text-xs font-bold bg-[#eff4ff] hover:bg-[#6E1D6B] hover:text-white text-[#161c24] border border-[#d4c1ce]/40 transition-colors cursor-pointer"
                        title={`Inspect Service ${svc}`}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>

                  {/* External link / schematic view */}
                  {advisory.externalLinkText && (
                    <div className="pt-1">
                      <a
                        href="#advisory-details"
                        onClick={(e) => e.preventDefault()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D95E1E] hover:underline cursor-pointer"
                      >
                        <span>{advisory.externalLinkText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
