import React, { useState } from 'react';
import { BusRoute, BusStop } from '../types/transit';
import { BUS_ROUTES } from '../data/transitData';
import { Bus, MapPin, Gauge, Clock, ChevronRight, Layers } from 'lucide-react';

interface RouteInspectorScreenProps {
  initialServiceNo?: string;
  onSelectStopCode: (stopCode: string) => void;
  stops: BusStop[];
}

export const RouteInspectorScreen: React.FC<RouteInspectorScreenProps> = ({
  initialServiceNo = '147',
  onSelectStopCode,
}) => {
  const availableServices = Object.keys(BUS_ROUTES);
  const [selectedServiceNo, setSelectedServiceNo] = useState<string>(
    BUS_ROUTES[initialServiceNo] ? initialServiceNo : availableServices[0]
  );

  const route: BusRoute = BUS_ROUTES[selectedServiceNo] || BUS_ROUTES['147'];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Service Selection Tabs */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 sm:p-4 shadow-[0_2px_4px_rgba(18,24,32,0.03)]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#82727e]">
            Select Service Route to Inspect
          </span>
          <span className="text-xs text-[#6E1D6B] font-semibold">
            {route.operator}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {availableServices.map((svc) => {
            const isSelected = svc === selectedServiceNo;
            return (
              <button
                key={svc}
                onClick={() => setSelectedServiceNo(svc)}
                className={`min-w-[68px] px-3 py-2 rounded-lg text-center font-extrabold text-base tracking-tight transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6E1D6B] text-white shadow-sm ring-2 ring-[#6E1D6B]/30'
                    : 'bg-[#eff4ff] text-[#161c24] hover:bg-[#e3e8f4] border border-[#d4c1ce]/40'
                }`}
              >
                {svc}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Route Summary Header Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_2px_4px_rgba(18,24,32,0.03)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-[6px] bg-[#6E1D6B] text-white font-extrabold text-lg">
                {route.serviceNo}
              </span>
              <span className="text-xs font-bold text-[#82727e] uppercase tracking-wider">
                {route.routeType} Service
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#161c24] flex items-center gap-2 flex-wrap">
              <span>{route.origin}</span>
              <span className="text-[#82727e] font-normal">&rarr;</span>
              <span className="text-[#6E1D6B]">{route.destination}</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#50434d] bg-[#f8f9ff] p-2.5 rounded-lg border border-[#e9eefa]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#6E1D6B]" />
              <div>
                <span className="text-[10px] text-[#82727e] block">Hours</span>
                <span className="font-bold text-[#161c24]">{route.operatingHours}</span>
              </div>
            </div>
            <div className="w-[1px] h-6 bg-[#cbd5e1]" />
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[#D95E1E]" />
              <div>
                <span className="text-[10px] text-[#82727e] block">Peak Headway</span>
                <span className="font-bold text-[#161c24]">{route.frequencyPeak}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Fleet Telemetry along this route */}
        <div className="border-t border-[#f1f5f9] pt-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#82727e] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Fleet Telemetry ({route.activeBuses.length} Buses in Transit)
            </span>
            <span className="text-[11px] font-mono text-[#82727e]">
              Total Distance: {route.totalDistanceKm} km
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {route.activeBuses.map((bus) => (
              <div
                key={bus.regNo}
                className="bg-[#eff4ff] border border-[#d4c1ce]/50 rounded-lg p-2.5 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#161c24]">{bus.regNo}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white text-[#6E1D6B] border border-[#d4c1ce]/40 flex items-center gap-0.5">
                    {bus.isDoubleDecker && <Layers className="w-2.5 h-2.5" />}
                    {bus.isDoubleDecker ? 'Double Deck' : 'Single Deck'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#50434d] text-[11px]">
                  <span>Speed: <strong className="text-[#161c24]">{bus.speedKmH} km/h</strong></span>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          bus.load === 'SEA'
                            ? '#00875A'
                            : bus.load === 'SDA'
                            ? '#E28800'
                            : '#DE350B',
                      }}
                    />
                    <span>{bus.load === 'SEA' ? 'Seats Avail' : bus.load === 'SDA' ? 'Standing' : 'Limited'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Stop-by-Stop Linear Schematic Route Diagram */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_2px_4px_rgba(18,24,32,0.03)] space-y-3">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <h3 className="text-sm font-bold text-[#161c24] uppercase tracking-wider">
            Route Stations & Interchange Map
          </h3>
          <span className="text-xs text-[#82727e]">
            {route.stops.length} Sequence Points
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 pt-2 pb-2">
          {/* Vertical route line */}
          <div className="absolute left-[13px] sm:left-[17px] top-4 bottom-4 w-[3px] bg-[#6E1D6B]/30 rounded-full" />

          {route.stops.map((stop) => {
            // Check if any active bus is currently near or approaching this stop
            const approachingBus = route.activeBuses.find(
              (b) => b.currentStopCode === stop.stopCode
            );

            return (
              <div key={stop.stopCode} className="relative group">
                {/* Station Node Marker */}
                <div
                  className={`absolute -left-[19px] sm:-left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    approachingBus
                      ? 'bg-[#D95E1E] border-white ring-3 ring-[#D95E1E]/40 scale-125'
                      : 'bg-white border-[#6E1D6B] group-hover:scale-125 group-hover:bg-[#6E1D6B]'
                  }`}
                />

                {/* Active Bus Marker on track if present */}
                {approachingBus && (
                  <div className="absolute -left-[54px] sm:-left-[60px] -top-1 px-1.5 py-0.5 rounded bg-[#D95E1E] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs animate-bounce">
                    <Bus className="w-2.5 h-2.5" />
                    <span>{approachingBus.speedKmH}k</span>
                  </div>
                )}

                {/* Stop Card Details */}
                <div className="bg-[#f8f9ff] group-hover:bg-[#eff4ff] border border-[#e9eefa] group-hover:border-[#d4c1ce] rounded-lg p-3 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-[#6E1D6B] bg-white px-1.5 py-0.2 rounded border border-[#d4c1ce]/40">
                        {stop.stopCode}
                      </span>
                      <span className="text-[11px] text-[#82727e] font-medium">
                        {stop.road}
                      </span>
                      <span className="text-[10px] text-[#82727e] font-mono">
                        · Stage {stop.fareStage} ({stop.distanceKm} km)
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-[#161c24] group-hover:text-[#6E1D6B] transition-colors">
                      {stop.stopName}
                    </h4>

                    {/* MRT connections badges */}
                    {stop.mrtConnections && stop.mrtConnections.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                        {stop.mrtConnections.map((mrt) => (
                          <span
                            key={mrt.code}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: mrt.color }}
                          >
                            <span>{mrt.code}</span>
                            <span className="font-normal opacity-90">{mrt.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Button to view arrivals at this stop */}
                  <div className="shrink-0 flex items-center gap-2 pt-1 sm:pt-0">
                    <button
                      onClick={() => onSelectStopCode(stop.stopCode)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#6E1D6B] bg-white hover:bg-[#6E1D6B] hover:text-white border border-[#d4c1ce] rounded-md transition-colors cursor-pointer shadow-2xs"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>View Stop</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
