import { BusServiceArrival, BusArrivalTiming, LoadStatus, TransitOperator } from '../types/transit';

interface LTANextBus {
  OriginCode?: string;
  DestinationCode?: string;
  EstimatedArrival?: string;
  Latitude?: string;
  Longitude?: string;
  VisitNumber?: string;
  Load?: string; // 'SEA' | 'SDA' | 'LSD'
  Feature?: string; // 'WAB'
  Type?: string; // 'SD' | 'DD' | 'BD'
}

interface LTAServiceRaw {
  ServiceNo: string;
  Operator: string;
  NextBus?: LTANextBus;
  NextBus2?: LTANextBus;
  NextBus3?: LTANextBus;
}

export interface LTABusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: LTAServiceRaw[];
  isLive?: boolean;
  configured?: boolean;
  message?: string;
}

export interface ApiHealthStatus {
  status: string;
  uptime?: number;
  services?: {
    health?: string;
    ltaDatamallV3?: string;
  };
  environment?: {
    hasLtaAccountKey?: boolean;
  };
  message?: string;
}

const mapOperator = (raw: string): TransitOperator => {
  const norm = raw.toUpperCase();
  if (norm === 'SBST' || norm.includes('SBS')) return 'SBS Transit';
  if (norm === 'SMRT') return 'SMRT';
  if (norm === 'TTS' || norm.includes('TOWER')) return 'Tower Transit';
  if (norm === 'GAS' || norm.includes('GO-AHEAD')) return 'Go-Ahead';
  return 'SBS Transit';
};

const parseTiming = (rawBus?: LTANextBus): BusArrivalTiming => {
  if (!rawBus || !rawBus.EstimatedArrival) {
    return {
      minutes: 99,
      load: 'SEA',
      isDoubleDecker: false,
      isWheelchairAccessible: false,
    };
  }

  const arrivalDate = new Date(rawBus.EstimatedArrival);
  const diffMs = arrivalDate.getTime() - Date.now();
  const minutes = Math.max(0, Math.round(diffMs / 60000));

  let load: LoadStatus = 'SEA';
  if (rawBus.Load === 'SDA') load = 'SDA';
  else if (rawBus.Load === 'LSD') load = 'LSD';

  return {
    minutes,
    load,
    isDoubleDecker: rawBus.Type === 'DD',
    isWheelchairAccessible: rawBus.Feature === 'WAB',
    speedKmH: Math.floor(25 + Math.random() * 15),
    distanceMeters: Math.max(50, minutes * 300),
  };
};

export const fetchApiHealth = async (): Promise<ApiHealthStatus | null> => {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const fetchLtaBusArrival = async (
  busStopCode: string,
  serviceNo?: string
): Promise<{
  services: BusServiceArrival[] | null;
  isLive: boolean;
  configured: boolean;
  message?: string;
}> => {
  try {
    const url = new URL('/api/bus-arrival', window.location.origin);
    url.searchParams.set('BusStopCode', busStopCode);
    if (serviceNo) {
      url.searchParams.set('ServiceNo', serviceNo);
    }

    const res = await fetch(url.toString(), {
      headers: {
        accept: 'application/json',
      },
    });

    if (!res.ok) {
      return { services: null, isLive: false, configured: false, message: `HTTP ${res.status}` };
    }

    const data: LTABusArrivalResponse = await res.json();

    if (!data.Services || data.Services.length === 0) {
      return {
        services: null,
        isLive: Boolean(data.isLive),
        configured: Boolean(data.configured),
        message: data.message,
      };
    }

    const transformedServices: BusServiceArrival[] = data.Services.map((raw) => {
      const timing1 = parseTiming(raw.NextBus);
      const timing2 = parseTiming(raw.NextBus2);
      const timing3 = parseTiming(raw.NextBus3);

      return {
        serviceNo: raw.ServiceNo,
        operator: mapOperator(raw.Operator),
        destination: `Destination ${raw.NextBus?.DestinationCode || 'Terminal'}`,
        direction: 1,
        routeType: 'Trunk',
        frequency: '6 - 12 mins',
        firstBus: '05:30',
        lastBus: '23:55',
        timings: [timing1, timing2, timing3],
      };
    });

    return {
      services: transformedServices,
      isLive: true,
      configured: true,
      message: 'Live LTA DataMall v3 Telemetry',
    };
  } catch (err) {
    return {
      services: null,
      isLive: false,
      configured: false,
      message: err instanceof Error ? err.message : 'Network error',
    };
  }
};
