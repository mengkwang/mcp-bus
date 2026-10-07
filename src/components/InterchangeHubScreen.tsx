import React, { useState } from 'react';
import { INTERCHANGE_BERTHS, RAIL_LINES_DATA } from '../data/transitData';
import { Building2, Train, Clock, Users, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';

interface InterchangeHubScreenProps {
  onSelectService: (serviceNo: string) => void;
}

export const InterchangeHubScreen: React.FC<InterchangeHubScreenProps> = ({
  onSelectService,
}) => {
  const [selectedHub, setSelectedHub] = useState<'jurong' | 'bugis' | 'tampines'>('jurong');

  const hubNames = {
    jurong: { title: 'Jurong East Integrated Transport Hub', bayCode: 'JTH-01', crowd: '64% Moderate' },
    bugis: { title: 'Bugis Civic Interconnect & Berth Network', bayCode: 'BGN-04', crowd: '48% Light' },
    tampines: { title: 'Tampines Concourse Regional Interchange', bayCode: 'TPC-02', crowd: '52% Moderate' },
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Hub Header Card with Realistic Photo Asset & Fallback */}
      <div className="relative rounded-xl overflow-hidden bg-slate-900 text-white shadow-[0_4px_16px_rgba(18,24,32,0.1)] border border-[#E2E8F0]">
        <div className="h-44 sm:h-52 w-full relative">
          <img
            src="/src/assets/images/transit_interchange_hub_1791347736476.jpg"
            alt="Singapore modern transit interchange passenger concourse"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#D95E1E] text-white font-mono font-bold text-xs uppercase tracking-wider">
                Multi-Modal Velocity Terminal
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Bay Code: {hubNames[selectedHub].bayCode}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              {hubNames[selectedHub].title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#ffb596]" />
                <span>Interchange Crowd: <strong>{hubNames[selectedHub].crowd}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Air-Conditioned Concourse</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hub Selector Segmented Control */}
        <div className="bg-slate-950/80 p-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedHub('jurong')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              selectedHub === 'jurong'
                ? 'bg-[#6E1D6B] text-white'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Jurong East Hub (West)
          </button>
          <button
            onClick={() => setSelectedHub('bugis')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              selectedHub === 'bugis'
                ? 'bg-[#6E1D6B] text-white'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Bugis / Downtown (Central)
          </button>
          <button
            onClick={() => setSelectedHub('tampines')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              selectedHub === 'tampines'
                ? 'bg-[#6E1D6B] text-white'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Tampines Hub (East)
          </button>
        </div>
      </div>

      {/* 2. Terminal Berth Departures Board */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_2px_4px_rgba(18,24,32,0.03)] space-y-3">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#6E1D6B]" />
            <h3 className="text-sm font-bold text-[#161c24] uppercase tracking-wider">
              Terminal Berth Departures Queue
            </h3>
          </div>
          <span className="text-xs text-[#82727e] font-semibold">
            {INTERCHANGE_BERTHS.length} Active Bays
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {INTERCHANGE_BERTHS.map((berth) => {
            const isBoarding = berth.status === 'Boarding';
            return (
              <div
                key={berth.berthNo}
                className="bg-[#f8f9ff] border border-[#e9eefa] hover:border-[#d4c1ce] rounded-xl p-3.5 transition-all flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-lg bg-[#6E1D6B] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {berth.berthNo}
                    </span>
                    <div>
                      <div className="text-[11px] font-semibold text-[#82727e] uppercase">
                        {berth.operator}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {berth.services.map((svc) => (
                          <button
                            key={svc}
                            onClick={() => onSelectService(svc)}
                            className="px-2 py-0.5 rounded bg-white hover:bg-[#6E1D6B] hover:text-white text-[#161c24] font-extrabold text-xs border border-[#cbd5e1] transition-colors cursor-pointer shadow-2xs"
                            title={`Inspect Service ${svc}`}
                          >
                            {svc}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight shrink-0 ${
                      isBoarding
                        ? 'bg-emerald-100 text-[#00875A] border border-emerald-300'
                        : berth.status === 'Queue Forming'
                        ? 'bg-amber-100 text-[#E28800] border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {berth.status}
                  </span>
                </div>

                <div className="text-xs text-[#50434d] flex items-center justify-between gap-2 border-t border-[#e2e8f0]/60 pt-2">
                  <span className="truncate" title={berth.destinations}>
                    {berth.destinations}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 font-bold text-[#161c24] tabular-nums">
                    <Clock className="w-3 h-3 text-[#D95E1E]" />
                    <span>Departs in {berth.nextDepartureMin}m</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Connecting Rail Network Status Monitor */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_2px_4px_rgba(18,24,32,0.03)] space-y-3">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-[#1B6B93]" />
            <h3 className="text-sm font-bold text-[#161c24] uppercase tracking-wider">
              MRT Rail Interconnect Status & Frequencies
            </h3>
          </div>
          <span className="text-xs text-[#82727e]">
            Live SMRT & SBS Transit Feeds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RAIL_LINES_DATA.map((rail) => {
            const isDelayed = rail.status !== 'Normal Service';
            return (
              <div
                key={rail.lineCode}
                className="bg-[#f8f9ff] border border-[#e9eefa] rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-extrabold text-white shadow-2xs"
                      style={{ backgroundColor: rail.color }}
                    >
                      {rail.lineCode}
                    </span>
                    <span className="text-xs font-bold text-[#161c24] truncate">
                      {rail.lineName}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isDelayed
                        ? 'bg-amber-100 text-[#E28800]'
                        : 'bg-emerald-100 text-[#00875A]'
                    }`}
                  >
                    {rail.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#50434d] border-t border-[#e2e8f0]/40 pt-1.5">
                  <span>Peak Headway: <strong className="text-[#161c24]">{rail.peakHeadway}</strong></span>
                  <span>Off-Peak: <strong className="text-[#161c24]">{rail.offPeakHeadway}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
