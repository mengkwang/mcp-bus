export type LoadStatus = 'SEA' | 'SDA' | 'LSD'; // Seats Available, Standing Available, Limited Standing
export type BusType = 'DD' | 'SD'; // Double Decker, Single Deck
export type TransitOperator = 'SBS Transit' | 'SMRT' | 'Tower Transit' | 'Go-Ahead';

export interface BusArrivalTiming {
  minutes: number; // 0 = Arr, 1 = 1m, etc.
  load: LoadStatus;
  isDoubleDecker: boolean;
  isWheelchairAccessible: boolean;
  regNo?: string;
  speedKmH?: number;
  distanceMeters?: number;
}

export interface BusServiceArrival {
  serviceNo: string;
  operator: TransitOperator;
  destination: string;
  direction: 1 | 2;
  timings: [BusArrivalTiming, BusArrivalTiming, BusArrivalTiming];
  routeType: 'Trunk' | 'Feeder' | 'Express' | 'City Direct';
  frequency: string;
  firstBus: string;
  lastBus: string;
}

export interface MrtConnection {
  code: string;
  name: string;
  line: 'EW' | 'NS' | 'NE' | 'CC' | 'DT' | 'TE';
  color: string;
  label: string;
}

export interface BusStop {
  code: string; // 5-digit string e.g. "01012"
  name: string; // e.g. "Opp Bugis Junction"
  road: string; // e.g. "Victoria St"
  distanceMeters: number;
  berth?: string;
  services: BusServiceArrival[];
  mrtConnections?: MrtConnection[];
  sheltered: boolean;
  crowdLevel: 'Low' | 'Moderate' | 'Heavy';
  terminalBay?: string;
}

export interface ActiveBusPosition {
  regNo: string;
  isDoubleDecker: boolean;
  load: LoadStatus;
  speedKmH: number;
  currentStopCode: string;
  nextStopCode: string;
  progressPercent: number; // 0-100 between stops
}

export interface RouteStop {
  stopCode: string;
  stopName: string;
  road: string;
  sequence: number;
  distanceKm: number;
  mrtConnections?: MrtConnection[];
  fareStage: number;
}

export interface BusRoute {
  serviceNo: string;
  operator: TransitOperator;
  origin: string;
  destination: string;
  routeType: 'Trunk' | 'Feeder' | 'Express' | 'City Direct';
  operatingHours: string;
  frequencyPeak: string;
  frequencyOffPeak: string;
  totalDistanceKm: number;
  stops: RouteStop[];
  activeBuses: ActiveBusPosition[];
}

export interface InterchangeBerth {
  berthNo: string;
  services: string[];
  destinations: string;
  status: 'Boarding' | 'Queue Forming' | 'Clear';
  nextDepartureMin: number;
  operator: TransitOperator;
}

export interface RailLineStatus {
  lineCode: 'EW' | 'NS' | 'NE' | 'CC' | 'DT' | 'TE';
  lineName: string;
  color: string;
  status: 'Normal Service' | 'Minor Delays' | 'Bridging Bus';
  peakHeadway: string;
  offPeakHeadway: string;
}

export interface ServiceAdvisory {
  id: string;
  type: 'delay' | 'disruption' | 'diversion' | 'weather';
  priority: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  affectedServices: string[];
  affectedLines?: string[];
  timestamp: string;
  resolutionEta?: string;
  externalLinkText?: string;
}

export interface PlannedTrip {
  id: string;
  label: string;
  totalDurationMin: number;
  walkingTimeMin: number;
  fareAdult: number;
  fareStudent: number;
  fareSenior: number;
  co2SavedKg: number;
  legs: {
    type: 'walk' | 'bus' | 'mrt';
    serviceOrLine?: string;
    fromName: string;
    toName: string;
    durationMin: number;
    stopsCount?: number;
    color?: string;
    details?: string;
  }[];
}
