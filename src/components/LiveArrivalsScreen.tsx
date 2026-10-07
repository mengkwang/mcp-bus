import React, { useState } from 'react';
import { BusStop, BusServiceArrival, BusArrivalTiming } from '../types/transit';
import { BusArrivalCard } from './BusArrivalCard';
import { Search, X, MapPin, ShieldCheck, Users, Star, AlertTriangle, Radio, Server, ExternalLink } from 'lucide-react';

interface LiveArrivalsScreenProps {
  stops: BusStop[];
  selectedStop: BusStop;
  onSelectStop: (stop: BusStop) => void;
  favorites: string[];
  onToggleFavorite: (serviceNo: string) => void;
  onSetAlarm: (service: BusServiceArrival, timing: BusArrivalTiming) => void;
  onInspectRoute: (serviceNo: string) => void;
  favoriteStops: string[];
  onToggleFavoriteStop: (stopCode: string) => void;
  activeAlarms: string[];
  onNavigateToAdvisories: () => void;
  isLiveFeed?: boolean;
  ltaKeyConfigured?: boolean;
}

export const LiveArrivalsScreen: React.FC<LiveArrivalsScreenProps> = ({
  stops,
  selectedStop,
  onSelectStop,
  favorites,
  onToggleFavorite,
  onSetAlarm,
  onInspectRoute,
  favoriteStops,
  onToggleFavoriteStop,
  activeAlarms,
  onNavigateToAdvisories,
  isLiveFeed = false,
  ltaKeyConfigured = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fav' | 'seats' | 'dd' | 'wab'>('all');
  const [showApiModal, setShowApiModal] = useState(false);

  // Filter bus stops for the search dropdown/presets
  const filteredStops = stops.filter(
    (s) =>
      s.code.includes(searchQuery) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.road.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.services.some((srv) => srv.serviceNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter services within current stop
  const displayedServices = selectedStop.services.filter((srv) => {
    // text search query match within stop
    if (
      searchQuery &&
      !srv.serviceNo.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !srv.destination.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedStop.code.includes(searchQuery) &&
      !selectedStop.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (activeFilter === 'fav') {
      return favorites.includes(srv.serviceNo);
    }
    if (activeFilter === 'seats') {
      return srv.timings.some((t) => t.load === 'SEA');
    }
    if (activeFilter === 'dd') {
      return srv.timings.some((t) => t.isDoubleDecker);
    }
    if (activeFilter === 'wab') {
      return srv.timings.some((t) => t.isWheelchairAccessible);
    }
    return true;
  });

  const isStopFav = favoriteStops.includes(selectedStop.code);

  // Quick preset stops for instant commuter selection
  const presetStops = [
    { code: '01012', label: 'Bugis Jct' },
    { code: '04121', label: 'SMU / Bras Basah' },
    { code: '09048', label: 'Orchard Blvd' },
    { code: '28009', label: 'Jurong East Int' },
    { code: '03019', label: 'The Esplanade' },
    { code: '84009', label: 'Tampines Int' },
  ];

  const hasAdvisoryAffecting = selectedStop.services.some((s) => ['190', '960', '857'].includes(s.serviceNo));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Live Stop Search Bar & Quick Presets */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 sm:p-4 shadow-[0_2px_4px_rgba(18,24,32,0.03)] space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#82727e]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 5-digit bus stop code, road, or service number (e.g. 01012, Orchard, 190)..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#f8f9ff] border border-[#d4c1ce] rounded-lg text-[#161c24] placeholder-[#82727e] focus:outline-none focus:ring-2 focus:ring-[#6E1D6B] focus:border-[#6E1D6B] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#82727e] hover:text-[#161c24]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Stop Switcher Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
          <span className="text-[#82727e] font-semibold uppercase tracking-wider shrink-0 text-[11px] mr-1">
            Presets:
          </span>
          {presetStops.map((p) => {
            const isCurrent = selectedStop.code === p.code;
            return (
              <button
                key={p.code}
                onClick={() => {
                  const target = stops.find((s) => s.code === p.code);
                  if (target) {
                    onSelectStop(target);
                    setSearchQuery('');
                  }
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#6E1D6B] text-white shadow-xs'
                    : 'bg-[#eff4ff] text-[#50434d] hover:bg-[#e3e8f4] hover:text-[#161c24] border border-[#d4c1ce]/40'
                }`}
              >
                {p.label} <span className="opacity-75 font-mono text-[10px]">({p.code})</span>
              </button>
            );
          })}
        </div>

        {/* Search Results Dropdown (if user is typing) */}
        {searchQuery.trim().length > 0 && (
          <div className="border-t border-[#f1f5f9] pt-2 space-y-1.5 max-h-48 overflow-y-auto">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#82727e]">
              Matching Stops ({filteredStops.length})
            </span>
            {filteredStops.slice(0, 4).map((s) => (
              <button
                key={s.code}
                onClick={() => {
                  onSelectStop(s);
                  setSearchQuery('');
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-[#eff4ff] flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-bold text-[#161c24] group-hover:text-[#6E1D6B] truncate">
                    {s.name} <span className="font-mono text-[#82727e]">({s.code})</span>
                  </div>
                  <div className="text-[11px] text-[#82727e] truncate">{s.road}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {s.services.slice(0, 3).map((srv) => (
                    <span
                      key={srv.serviceNo}
                      className="text-[10px] font-extrabold px-1.5 py-0.5 bg-slate-100 rounded text-slate-800"
                    >
                      {srv.serviceNo}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Active Bus Stop Hero Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-[0_2px_4px_rgba(18,24,32,0.04)] p-4 sm:p-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            {/* Stop Code & Road Name Kicker */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-[#eff4ff] border border-[#d4c1ce] text-[#6E1D6B] font-mono font-bold text-xs">
                {selectedStop.code}
              </span>
              <span className="text-xs font-semibold text-[#82727e] uppercase tracking-wider">
                {selectedStop.road}
              </span>
              {selectedStop.berth && (
                <span className="text-xs font-bold text-[#D95E1E] bg-[#fff7ed] px-2 py-0.5 rounded border border-[#ffb596]/40">
                  {selectedStop.berth}
                </span>
              )}
            </div>

            {/* Stop Main Name */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#161c24] tracking-tight">
              {selectedStop.name}
            </h2>

            {/* Connecting MRT lines */}
            {selectedStop.mrtConnections && selectedStop.mrtConnections.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-semibold text-[#82727e]">Interchange:</span>
                {selectedStop.mrtConnections.map((mrt) => (
                  <span
                    key={mrt.code}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-2xs"
                    style={{ backgroundColor: mrt.color }}
                  >
                    <span>{mrt.code}</span>
                    <span className="font-normal opacity-90">{mrt.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions: Distance, Crowd, Shelter, Fav */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#f1f5f9]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#161c24] bg-slate-100 px-2.5 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5 text-[#D95E1E]" />
                <span className="tabular-nums">{selectedStop.distanceMeters}m away</span>
              </span>

              <button
                onClick={() => onToggleFavoriteStop(selectedStop.code)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isStopFav
                    ? 'bg-[#fff7ed] border-[#ffb596] text-[#D95E1E]'
                    : 'bg-white border-[#E2E8F0] text-[#82727e] hover:text-[#161c24]'
                }`}
                title={isStopFav ? 'Remove stop from favorites' : 'Pin stop to favorites'}
              >
                <Star className={`w-4 h-4 ${isStopFav ? 'fill-[#D95E1E]' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#50434d]">
              {selectedStop.sheltered && (
                <span className="inline-flex items-center gap-1 text-[#00875A]" title="Full Weather Sheltered Canopy">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">Sheltered</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1" title="Commuter Concourse Crowd Status">
                <Users className="w-3.5 h-3.5 text-[#82727e]" />
                <span className="text-[11px] font-medium">{selectedStop.crowdLevel} Crowd</span>
              </span>
            </div>
          </div>
        </div>

        {/* LTA API Status Banner */}
        <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isLiveFeed
                  ? 'bg-emerald-500 animate-pulse'
                  : ltaKeyConfigured
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-[#161c24]">
              {isLiveFeed
                ? 'LTA DataMall v3 Live Feed Active (20s cycle)'
                : ltaKeyConfigured
                ? 'LTA AccountKey Ready · Connecting'
                : 'LTA API Ready (Add LTA_ACCOUNT_KEY in Vercel)'}
            </span>
            <span className="text-[11px] text-[#82727e] font-mono hidden sm:inline">
              · GET /api/bus-arrival?BusStopCode={selectedStop.code}
            </span>
          </div>

          <button
            onClick={() => setShowApiModal(true)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6E1D6B] hover:text-[#520051] bg-[#eff4ff] hover:bg-[#e3e8f4] px-2 py-0.5 rounded cursor-pointer transition-colors shrink-0"
          >
            <Server className="w-3 h-3" />
            <span>API Docs & Setup</span>
          </button>
        </div>

        {/* Live Service Advisory Banner if route affected */}
        {hasAdvisoryAffecting && (
          <div className="mt-3 p-2.5 bg-[#fff7ed] border-l-4 border-[#D95E1E] rounded-r-lg flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D95E1E] shrink-0" />
              <span className="font-semibold text-[#632200]">
                Advisory Active: Weekend diversion affecting Services 190, 960 nearby.
              </span>
            </div>
            <button
              onClick={onNavigateToAdvisories}
              className="text-[#D95E1E] hover:underline font-bold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Details &rarr;
            </button>
          </div>
        )}
      </div>

      {/* LTA API Setup & Endpoint Monitor Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6E1D6B] text-white flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#161c24]">
                    LTA DataMall v3 API Integration
                  </h3>
                  <span className="text-[11px] text-[#82727e]">
                    Land Transport Authority Public Transport Telemetry
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-[#82727e] hover:text-[#161c24] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#50434d]">
              <div className="bg-[#f8f9ff] border border-[#e9eefa] rounded-xl p-3 space-y-1.5">
                <span className="font-bold text-[#161c24] block text-[11px] uppercase tracking-wider">
                  Configured Endpoints
                </span>
                <div className="font-mono text-[11px] space-y-1">
                  <div className="p-1.5 bg-white rounded border border-[#d4c1ce]/40 flex items-center justify-between">
                    <span className="text-[#6E1D6B] font-bold">GET /api/bus-arrival</span>
                    <span className="text-[#82727e]">?BusStopCode=04121[&ServiceNo=7]</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-[#d4c1ce]/40 flex items-center justify-between">
                    <span className="text-[#00875A] font-bold">GET /api/health</span>
                    <span className="text-[#82727e]">Uptime & LTA Key Monitor</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-[#161c24] block text-[11px] uppercase tracking-wider">
                  How to enable Live Data on Vercel
                </span>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
                  <li>Go to your <strong>Vercel Project Dashboard</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Environment Variables</strong>.</li>
                  <li>Add key name: <code className="font-mono font-bold text-[#6E1D6B]">LTA_ACCOUNT_KEY</code></li>
                  <li>Value: Your DataMall AccountKey (from LTA DataMall portal).</li>
                  <li>Deploy/Redeploy. The app immediately queries live 20s telemetry!</li>
                </ol>
              </div>

              <div className="bg-[#eff4ff] p-2.5 rounded-lg border border-[#d4c1ce]/40 flex items-center justify-between gap-2">
                <span className="text-[11px]">
                  Request an official LTA key at <strong>datamall.lta.gov.sg</strong>
                </span>
                <a
                  href="https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-[#6E1D6B] hover:underline"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-[#f1f5f9] flex justify-end">
              <button
                onClick={() => setShowApiModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#6E1D6B] hover:bg-[#581755] rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter Controls (Buttons/Segmented controls adhering to Zero-Pill discipline) */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-[#e9eefa] rounded-lg">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-[#161c24] shadow-xs'
                : 'text-[#50434d] hover:text-[#161c24]'
            }`}
          >
            All Services ({selectedStop.services.length})
          </button>
          <button
            onClick={() => setActiveFilter('fav')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeFilter === 'fav'
                ? 'bg-white text-[#161c24] shadow-xs'
                : 'text-[#50434d] hover:text-[#161c24]'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveFilter('seats')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeFilter === 'seats'
                ? 'bg-white text-[#161c24] shadow-xs'
                : 'text-[#50434d] hover:text-[#161c24]'
            }`}
          >
            Seats Avail
          </button>
          <button
            onClick={() => setActiveFilter('dd')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeFilter === 'dd'
                ? 'bg-white text-[#161c24] shadow-xs'
                : 'text-[#50434d] hover:text-[#161c24]'
            }`}
          >
            Double Deck
          </button>
          <button
            onClick={() => setActiveFilter('wab')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeFilter === 'wab'
                ? 'bg-white text-[#161c24] shadow-xs'
                : 'text-[#50434d] hover:text-[#161c24]'
            }`}
          >
            Wheelchair
          </button>
        </div>

        <div className="text-xs text-[#82727e] font-semibold tracking-wide">
          Showing {displayedServices.length} of {selectedStop.services.length} services
        </div>
      </div>

      {/* 4. Bus Arrival Feed List */}
      <div className="space-y-3">
        {displayedServices.length > 0 ? (
          displayedServices.map((service) => (
            <BusArrivalCard
              key={service.serviceNo}
              service={service}
              isFavorite={favorites.includes(service.serviceNo)}
              onToggleFavorite={onToggleFavorite}
              onSetAlarm={onSetAlarm}
              onInspectRoute={onInspectRoute}
              hasActiveAlarm={activeAlarms.includes(service.serviceNo)}
            />
          ))
        ) : (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-[#161c24]">No bus services match the active filter</p>
            <p className="text-xs text-[#82727e]">
              Try switching back to "All Services" or clearing your search term.
            </p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 px-3.5 py-1.5 text-xs font-bold text-white bg-[#6E1D6B] rounded-lg hover:bg-[#581755] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. Transit Operational Status Signaling Legend */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 sm:p-4 text-xs">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#82727e] mb-2">
          Land Transport Operational Capacity Guide
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#00875A] shrink-0" />
            <span className="text-[#161c24] font-medium text-[11px]">Seats Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E28800] shrink-0" />
            <span className="text-[#161c24] font-medium text-[11px]">Standing Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#DE350B] shrink-0" />
            <span className="text-[#161c24] font-medium text-[11px]">Limited Standing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#0065FF] font-bold text-xs flex items-center gap-1">
              <span>♿ WAB</span>
            </span>
            <span className="text-[#161c24] font-medium text-[11px]">Wheelchair Ramp</span>
          </div>
        </div>
      </div>
    </div>
  );
};
