import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LiveArrivalsScreen } from './components/LiveArrivalsScreen';
import { RouteInspectorScreen } from './components/RouteInspectorScreen';
import { InterchangeHubScreen } from './components/InterchangeHubScreen';
import { TripPlannerScreen } from './components/TripPlannerScreen';
import { AdvisoriesScreen } from './components/AdvisoriesScreen';
import { ArrivalAlertModal } from './components/ArrivalAlertModal';
import { BUS_STOPS } from './data/transitData';
import { BusStop, BusServiceArrival, BusArrivalTiming } from './types/transit';
import { fetchApiHealth, fetchLtaBusArrival } from './services/ltaApi';
import { CheckCircle2, BellRing, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('arrivals');
  const [stops, setStops] = useState<BusStop[]>(BUS_STOPS);
  const [selectedStop, setSelectedStop] = useState<BusStop>(BUS_STOPS[0]);
  const [selectedInspectService, setSelectedInspectService] = useState<string>('147');
  const [isLiveFeed, setIsLiveFeed] = useState<boolean>(false);
  const [ltaKeyConfigured, setLtaKeyConfigured] = useState<boolean>(false);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('transit_velocity_fav_services');
      return saved ? JSON.parse(saved) : ['147', '190'];
    } catch {
      return ['147', '190'];
    }
  });

  const [favoriteStops, setFavoriteStops] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('transit_velocity_fav_stops');
      return saved ? JSON.parse(saved) : ['01012', '04121'];
    } catch {
      return ['01012', '04121'];
    }
  });

  // Alarm & notification state
  const [activeAlarms, setActiveAlarms] = useState<string[]>([]);
  const [alarmModalData, setAlarmModalData] = useState<{
    service: BusServiceArrival;
    timing: BusArrivalTiming;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-refresh timer countdown (15s loop)
  const [secondsToRefresh, setSecondsToRefresh] = useState<number>(15);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Check API Health on initial mount
  useEffect(() => {
    fetchApiHealth().then((health) => {
      if (health) {
        setLtaKeyConfigured(Boolean(health.environment?.hasLtaAccountKey));
      }
    });
  }, []);

  // Telemetry Sync with LTA DataMall v3 API
  const triggerTelemetrySync = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Query the LTA proxy endpoint
      const result = await fetchLtaBusArrival(selectedStop.code);

      if (result.isLive && result.services && result.services.length > 0) {
        setIsLiveFeed(true);
        setLtaKeyConfigured(true);
        // Update current stop's services with live telemetry
        setSelectedStop((prev) => ({
          ...prev,
          services: result.services!,
        }));
        setStops((prev) =>
          prev.map((s) =>
            s.code === selectedStop.code
              ? { ...s, services: result.services! }
              : s
          )
        );
      } else {
        // Fallback simulation when LTA_ACCOUNT_KEY is not configured yet
        setIsLiveFeed(false);
        setLtaKeyConfigured(result.configured);
        setStops((prevStops) =>
          prevStops.map((stop) => ({
            ...stop,
            services: stop.services.map((svc) => ({
              ...svc,
              timings: svc.timings.map((t, idx) => {
                if (idx === 0) {
                  return {
                    ...t,
                    minutes: Math.max(0, t.minutes),
                    speedKmH: Math.floor(20 + Math.random() * 25),
                  };
                }
                return t;
              }) as [BusArrivalTiming, BusArrivalTiming, BusArrivalTiming],
            })),
          }))
        );
      }
    } catch {
      setIsLiveFeed(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedStop.code]);

  // Periodic refresh ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToRefresh((prev) => {
        if (prev <= 1) {
          triggerTelemetrySync();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [triggerTelemetrySync]);

  // Fetch when stop changes
  useEffect(() => {
    triggerTelemetrySync();
  }, [selectedStop.code, triggerTelemetrySync]);

  const handleManualRefresh = () => {
    triggerTelemetrySync();
    setSecondsToRefresh(15);
    showToast('Satellite telemetry synchronized with LTA Datamall API');
  };

  const handleLocateNearMe = () => {
    // Pick nearest stop (Bugis or SMU)
    const nearest = stops[0];
    setSelectedStop(nearest);
    setActiveTab('arrivals');
    showToast(`GPS Position Locked: Nearest stop is ${nearest.name} (45m)`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleFavoriteService = (serviceNo: string) => {
    setFavorites((prev) =>
      prev.includes(serviceNo)
        ? prev.filter((s) => s !== serviceNo)
        : [...prev, serviceNo]
    );
  };

  const handleToggleFavoriteStop = (stopCode: string) => {
    setFavoriteStops((prev) =>
      prev.includes(stopCode)
        ? prev.filter((s) => s !== stopCode)
        : [...prev, stopCode]
    );
  };

  const handleInspectRoute = (serviceNo: string) => {
    setSelectedInspectService(serviceNo);
    setActiveTab('routes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStopCode = (stopCode: string) => {
    const target = stops.find((s) => s.code === stopCode);
    if (target) {
      setSelectedStop(target);
      setActiveTab('arrivals');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleArmAlarm = (serviceNo: string, thresholdMin: number) => {
    if (!activeAlarms.includes(serviceNo)) {
      setActiveAlarms((prev) => [...prev, serviceNo]);
    }
    showToast(`Chime Armed: You will receive an arrival alert when Bus ${serviceNo} is ${thresholdMin}m away!`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-sans text-[#161c24] pb-20 md:pb-8">
      {/* Top Bar (Strict 3-zone contract) */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        secondsToRefresh={secondsToRefresh}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        onLocateNearMe={handleLocateNearMe}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 max-w-sm bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-lg flex items-center justify-between gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white shrink-0 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Screen 1: Live Arrivals Feed */}
        {activeTab === 'arrivals' && (
          <LiveArrivalsScreen
            stops={stops}
            selectedStop={selectedStop}
            onSelectStop={setSelectedStop}
            favorites={favorites}
            onToggleFavorite={handleToggleFavoriteService}
            onSetAlarm={(service, timing) => setAlarmModalData({ service, timing })}
            onInspectRoute={handleInspectRoute}
            favoriteStops={favoriteStops}
            onToggleFavoriteStop={handleToggleFavoriteStop}
            activeAlarms={activeAlarms}
            onNavigateToAdvisories={() => setActiveTab('advisories')}
            isLiveFeed={isLiveFeed}
            ltaKeyConfigured={ltaKeyConfigured}
          />
        )}

        {/* Screen 2: Route Inspector & Linear Stations Schematic */}
        {activeTab === 'routes' && (
          <RouteInspectorScreen
            initialServiceNo={selectedInspectService}
            onSelectStopCode={handleSelectStopCode}
            stops={stops}
          />
        )}

        {/* Screen 3: Multi-Modal Terminal Interchange Berths */}
        {activeTab === 'interchange' && (
          <InterchangeHubScreen
            onSelectService={handleInspectRoute}
          />
        )}

        {/* Screen 4: Trip Planner & Fare Calculator */}
        {activeTab === 'planner' && (
          <TripPlannerScreen
            onSelectService={handleInspectRoute}
          />
        )}

        {/* Screen 5: Service Disruptions & Network Advisories */}
        {activeTab === 'advisories' && (
          <AdvisoriesScreen
            onSelectService={handleInspectRoute}
          />
        )}
      </main>

      {/* Arrival Proximity Alert Modal */}
      {alarmModalData && (
        <ArrivalAlertModal
          service={alarmModalData.service}
          timing={alarmModalData.timing}
          stopName={selectedStop.name}
          onClose={() => setAlarmModalData(null)}
          onArmAlarm={handleArmAlarm}
        />
      )}

      {/* Active Alarm Floater Pill if user armed reminders */}
      {activeAlarms.length > 0 && activeTab === 'arrivals' && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-30 bg-[#6E1D6B] text-white text-xs px-3 py-2 rounded-full shadow-lg flex items-center gap-2 border border-[#82727e]/30">
          <BellRing className="w-3.5 h-3.5 text-[#ffabf3] animate-bounce" />
          <span>Monitoring {activeAlarms.length} Armed Alerts</span>
          <button
            onClick={() => {
              setActiveAlarms([]);
              showToast('Armed alerts cleared');
            }}
            className="text-white/80 hover:text-white ml-1 underline cursor-pointer text-[10px]"
          >
            Clear
          </button>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        advisoryCount={3}
      />
    </div>
  );
}
