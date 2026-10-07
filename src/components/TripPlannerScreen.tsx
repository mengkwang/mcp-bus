import React, { useState } from 'react';
import { SAMPLE_TRIP_PLANS } from '../data/transitData';
import { PlannedTrip } from '../types/transit';
import { ArrowUpDown, Clock, Footprints, DollarSign, Leaf, MapPin, ChevronRight } from 'lucide-react';

interface TripPlannerScreenProps {
  onSelectService: (serviceNo: string) => void;
}

export const TripPlannerScreen: React.FC<TripPlannerScreenProps> = ({
  onSelectService,
}) => {
  const [origin, setOrigin] = useState('Opp Bugis Junction (01012)');
  const [destination, setDestination] = useState('Stevens Stn Exit 2 (40019)');
  const [selectedProfile, setSelectedProfile] = useState<'adult' | 'student' | 'senior'>('adult');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('TRIP-OPT-1');

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const currentPlan = SAMPLE_TRIP_PLANS.find((p) => p.id === selectedPlanId) || SAMPLE_TRIP_PLANS[0];

  const getFare = (plan: PlannedTrip) => {
    if (selectedProfile === 'adult') return `$${plan.fareAdult.toFixed(2)}`;
    if (selectedProfile === 'student') return `$${plan.fareStudent.toFixed(2)}`;
    return `$${plan.fareSenior.toFixed(2)}`;
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Trip Planner Form Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_2px_4px_rgba(18,24,32,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#82727e]">
            Commuter Velocity & Fare Planner
          </h2>
          <span className="text-xs font-semibold text-[#6E1D6B]">
            Singapore Public Transport Fare Matrix
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin */}
          <div className="md:col-span-5 relative">
            <label className="text-[11px] font-bold text-[#82727e] uppercase tracking-wider mb-1 block">
              Origin Stop / Landmark
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#6E1D6B] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#f8f9ff] border border-[#d4c1ce] rounded-lg text-[#161c24] focus:ring-2 focus:ring-[#6E1D6B] focus:outline-none"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center py-1 md:py-0">
            <button
              onClick={handleSwap}
              className="p-2 rounded-lg bg-[#eff4ff] hover:bg-[#e3e8f4] border border-[#d4c1ce] text-[#6E1D6B] transition-colors cursor-pointer"
              title="Swap Origin and Destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-5 relative">
            <label className="text-[11px] font-bold text-[#82727e] uppercase tracking-wider mb-1 block">
              Destination Stop / Landmark
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#D95E1E] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#f8f9ff] border border-[#d4c1ce] rounded-lg text-[#161c24] focus:ring-2 focus:ring-[#6E1D6B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Concession Profile Filter */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#f1f5f9] flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#50434d]">
            <span className="font-semibold text-[#82727e]">Fare Category:</span>
            <div className="flex items-center gap-1 bg-[#eff4ff] p-0.5 rounded-md">
              <button
                onClick={() => setSelectedProfile('adult')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  selectedProfile === 'adult'
                    ? 'bg-white text-[#161c24] shadow-xs'
                    : 'text-[#82727e] hover:text-[#161c24]'
                }`}
              >
                Adult CEPAS
              </button>
              <button
                onClick={() => setSelectedProfile('student')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  selectedProfile === 'student'
                    ? 'bg-white text-[#161c24] shadow-xs'
                    : 'text-[#82727e] hover:text-[#161c24]'
                }`}
              >
                Student Concession
              </button>
              <button
                onClick={() => setSelectedProfile('senior')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  selectedProfile === 'senior'
                    ? 'bg-white text-[#161c24] shadow-xs'
                    : 'text-[#82727e] hover:text-[#161c24]'
                }`}
              >
                Senior Citizen
              </button>
            </div>
          </div>

          <div className="text-xs text-[#00875A] font-semibold flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5" />
            <span>Eco-Friendly Transit Velocity Enabled</span>
          </div>
        </div>
      </div>

      {/* 2. Itinerary Options List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SAMPLE_TRIP_PLANS.map((plan) => {
          const isSelected = plan.id === selectedPlanId;
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-white border-[#6E1D6B] shadow-[0_4px_12px_rgba(110,29,107,0.12)] ring-2 ring-[#6E1D6B]/20'
                  : 'bg-white border-[#E2E8F0] hover:border-[#d4c1ce] shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isSelected ? 'bg-[#6E1D6B] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {plan.id === 'TRIP-OPT-1' ? 'Recommended' : plan.id === 'TRIP-OPT-2' ? 'All Rail' : 'Alternate'}
                  </span>
                  <span className="font-extrabold text-sm text-[#161c24] tabular-nums">
                    {getFare(plan)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#161c24] mt-1.5">
                  {plan.label}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-[#50434d] border-t border-[#f1f5f9] pt-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D95E1E]" />
                  <span className="font-bold text-[#161c24] tabular-nums">{plan.totalDurationMin} mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Footprints className="w-3.5 h-3.5 text-[#82727e]" />
                  <span className="tabular-nums">{plan.walkingTimeMin}m walk</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Selected Itinerary Step-by-Step Breakdown */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-[0_2px_4px_rgba(18,24,32,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f1f5f9] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#161c24]">
              {currentPlan.label}
            </h3>
            <p className="text-xs text-[#82727e] mt-0.5">
              Total Duration: {currentPlan.totalDurationMin} mins · Distance-based fare: {getFare(currentPlan)} · Saved {currentPlan.co2SavedKg}kg CO₂
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Low Congestion Path
            </span>
          </div>
        </div>

        {/* Legs timeline */}
        <div className="space-y-4 pl-4 sm:pl-6 relative before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#cbd5e1]">
          {currentPlan.legs.map((leg, index) => (
            <div key={index} className="relative flex items-start gap-3">
              {/* Timeline marker */}
              <div
                className="w-4 h-4 rounded-full border-2 border-white shrink-0 -ml-4 sm:-ml-5 mt-0.5 shadow-2xs"
                style={{
                  backgroundColor: leg.color || (leg.type === 'walk' ? '#82727e' : '#6E1D6B'),
                }}
              />

              <div className="bg-[#f8f9ff] border border-[#e9eefa] rounded-lg p-3 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded text-white"
                      style={{
                        backgroundColor: leg.color || (leg.type === 'walk' ? '#50434d' : '#6E1D6B'),
                      }}
                    >
                      {leg.type === 'walk' ? 'Walk' : leg.type === 'bus' ? `Bus ${leg.serviceOrLine}` : leg.serviceOrLine}
                    </span>
                    <span className="text-xs font-bold text-[#161c24]">
                      {leg.fromName} &rarr; {leg.toName}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#161c24] tabular-nums shrink-0">
                    {leg.durationMin} mins
                  </span>
                </div>

                {leg.details && (
                  <p className="text-xs text-[#50434d]">
                    {leg.details}
                  </p>
                )}

                {leg.serviceOrLine && leg.type === 'bus' && (
                  <button
                    onClick={() => onSelectService(leg.serviceOrLine!)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6E1D6B] hover:underline pt-1 cursor-pointer"
                  >
                    <span>Inspect Bus {leg.serviceOrLine} Telemetry</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
