import React from 'react';
import { BusServiceArrival, BusArrivalTiming, LoadStatus } from '../types/transit';
import { Star, Bell, Route, Accessibility, Layers } from 'lucide-react';

interface BusArrivalCardProps {
  service: BusServiceArrival;
  isFavorite: boolean;
  onToggleFavorite: (serviceNo: string) => void;
  onSetAlarm: (service: BusServiceArrival, timing: BusArrivalTiming) => void;
  onInspectRoute: (serviceNo: string) => void;
  hasActiveAlarm?: boolean;
}

export const BusArrivalCard: React.FC<BusArrivalCardProps> = ({
  service,
  isFavorite,
  onToggleFavorite,
  onSetAlarm,
  onInspectRoute,
  hasActiveAlarm = false,
}) => {
  const getCapacityColor = (load: LoadStatus) => {
    switch (load) {
      case 'SEA':
        return '#00875A'; // Green - Seats Available
      case 'SDA':
        return '#E28800'; // Amber - Standing Available
      case 'LSD':
        return '#DE350B'; // Red - Limited Standing
      default:
        return '#00875A';
    }
  };

  const getCapacityLabel = (load: LoadStatus) => {
    switch (load) {
      case 'SEA':
        return 'Seats Available';
      case 'SDA':
        return 'Standing Available';
      case 'LSD':
        return 'Limited Standing';
      default:
        return 'Seats Available';
    }
  };

  const formatTiming = (minutes: number) => {
    if (minutes <= 0) return 'Arr';
    return `${minutes}m`;
  };

  // Determine badge background based on service type or operator
  const isExpress = service.routeType === 'Express';

  return (
    <div className="group bg-white rounded-xl border border-[#E2E8F0] shadow-[0_2px_4px_rgba(18,24,32,0.04)] hover:border-[#d4c1ce] hover:shadow-[0_4px_12px_rgba(18,24,32,0.06)] transition-all p-3.5 sm:p-4">
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Column 1: Route Badge & Operator (Left column) */}
        <div className="col-span-3 sm:col-span-2 flex flex-col items-start gap-1">
          <div
            className={`min-w-[62px] px-2.5 py-1.5 rounded-[6px] text-center font-extrabold text-white text-xl sm:text-[22px] tracking-[-0.02em] leading-none shadow-xs ${
              isExpress
                ? 'bg-[#D95E1E]'
                : 'bg-[#6E1D6B]'
            }`}
          >
            {service.serviceNo}
          </div>
          <span className="text-[10px] font-semibold text-[#82727e] truncate max-w-full">
            {service.operator}
          </span>
        </div>

        {/* Column 2: Destination & Route Meta (Center column) */}
        <div className="col-span-9 sm:col-span-5 flex flex-col justify-center min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#50434d] uppercase tracking-wider">
              To
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#161c24] truncate group-hover:text-[#6E1D6B] transition-colors">
              {service.destination}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-[#50434d] flex-wrap">
            <span className="font-medium text-[#82727e]">{service.routeType}</span>
            <span aria-hidden="true" className="text-[#82727e]">·</span>
            <span className="text-[#82727e]">Every {service.frequency}</span>
          </div>

          {/* Action buttons (Inspect & Fav & Alarm) */}
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={() => onInspectRoute(service.serviceNo)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-[#6E1D6B] hover:text-[#520051] bg-[#eff4ff] hover:bg-[#e3e8f4] rounded transition-colors cursor-pointer"
              title="Inspect full route diagram"
            >
              <Route className="w-3 h-3 text-[#6E1D6B]" />
              <span>Route</span>
            </button>

            <button
              onClick={() => onToggleFavorite(service.serviceNo)}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isFavorite
                  ? 'text-[#D95E1E] bg-[#fff7ed]'
                  : 'text-[#82727e] hover:text-[#161c24] hover:bg-slate-100'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#D95E1E]' : ''}`} />
            </button>

            <button
              onClick={() => onSetAlarm(service, service.timings[0])}
              className={`p-1 rounded transition-colors cursor-pointer ${
                hasActiveAlarm
                  ? 'text-[#6E1D6B] bg-[#f8eaff]'
                  : 'text-[#82727e] hover:text-[#161c24] hover:bg-slate-100'
              }`}
              title="Set arrival reminder chime"
            >
              <Bell className={`w-3.5 h-3.5 ${hasActiveAlarm ? 'fill-[#6E1D6B]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Column 3: Next 3 Arrival Timings (Right column) */}
        <div className="col-span-12 sm:col-span-5 flex items-center justify-end sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1f5f9]">
          {service.timings.map((timing, idx) => {
            const capColor = getCapacityColor(timing.load);
            const isNext = idx === 0;

            return (
              <div
                key={idx}
                className={`relative flex flex-col items-center justify-center min-w-[70px] sm:min-w-[76px] py-2 px-2 rounded-lg border transition-all ${
                  isNext
                    ? 'bg-slate-50 border-[#cbd5e1] shadow-xs'
                    : 'bg-white border-[#E2E8F0]'
                }`}
                title={`Next ${idx + 1}: ${timing.minutes} min (${getCapacityLabel(
                  timing.load
                )}, ${timing.isDoubleDecker ? 'Double Decker' : 'Single Deck'}, ${
                  timing.isWheelchairAccessible ? 'Wheelchair Accessible' : ''
                })`}
              >
                {/* 3px Color-Coded Capacity Line at the top of the chip */}
                <div
                  className="absolute top-0 left-1 right-1 h-[3px] rounded-t-full"
                  style={{ backgroundColor: capColor }}
                />

                {/* Arrival Minute indicator */}
                <span
                  className={`text-base sm:text-[17px] font-extrabold tabular-nums leading-none tracking-tight ${
                    isNext && timing.minutes <= 1
                      ? 'text-[#D95E1E] animate-pulse'
                      : 'text-[#161c24]'
                  }`}
                >
                  {formatTiming(timing.minutes)}
                </span>

                {/* Sub-label indicators: Capacity dot + DD + WAB */}
                <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-[#50434d]">
                  {/* Capacity colored indicator dot */}
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: capColor }}
                  />

                  {/* Double Decker (DD) Badge */}
                  {timing.isDoubleDecker && (
                    <span
                      className="font-bold text-[9px] text-[#161c24] bg-slate-200/80 px-1 py-0.2 rounded shrink-0 flex items-center gap-0.5"
                      title="Double Decker Bus"
                    >
                      <Layers className="w-2.5 h-2.5 text-[#161c24]" />
                      DD
                    </span>
                  )}

                  {/* Wheelchair Accessible Bus (WAB) Badge */}
                  {timing.isWheelchairAccessible && (
                    <span title="Wheelchair Accessible Bus">
                      <Accessibility className="w-2.5 h-2.5 text-[#0065FF] shrink-0" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
