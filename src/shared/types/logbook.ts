export interface FlightLogEntry {
  id: string;
  pilotId: string;
  date: string;
  droneId: string;
  droneName: string;
  droneModel: string;
  serialNumber: string;
  departureLocation: string;
  departureCoords: { lat: number; lng: number };
  arrivalLocation: string;
  flightDuration: number; // minutes
  hobbs: { start: number; end: number };
  conditions: 'day_vfr' | 'night_vfr' | 'day_bvlos' | 'night_bvlos';
  operationType: 'recreational' | 'part_107' | 'part_107_waiver' | 'public_coa' | 'training';
  missionType: 'survey' | 'inspection' | 'photography' | 'delivery' | 'agriculture' | 'search_rescue' | 'training' | 'maintenance_check' | 'other';
  maxAltitudeAGL: number;
  distanceTraveled: number;
  laancAuthorization?: string;
  flightPlanId?: string;
  weather: { wind: number; visibility: number; ceiling: number | null; temperature: number };
  incidents: string[];
  notes: string;
  crew: Array<{ name: string; role: 'PIC' | 'visual_observer' | 'payload_operator' }>;
  signatures?: { pilotSignature: boolean; supervisorSignature?: boolean };
  autoLogged: boolean;
}

export interface PilotLogbookSummary {
  totalFlightTime: number;
  totalFlights: number;
  dayVFR: number;
  nightVFR: number;
  dayBVLOS: number;
  nightBVLOS: number;
  last90Days: number;
  last12Months: number;
  currentMonth: number;
  uniqueAircraft: number;
  averageFlightDuration: number;
  longestFlight: number;
  totalDistance: number;
  certificationsCurrent: Array<{ name: string; number: string; issueDate: string; expiryDate: string; status: 'current' | 'expiring_soon' | 'expired' }>;
  recurrency: { current: boolean; flightsLast90Days: number; requiredFlights: number; lastBFR: string; nextBFRDue: string };
}

export interface PilotCertification {
  id: string;
  type: 'part_107' | 'part_61' | 'foreign_equiv' | 'training_cert' | 'medical';
  name: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: 'current' | 'expiring_soon' | 'expired';
  documentUrl?: string;
  ratings?: string[];
  waivers?: Array<{ waiverId: string; type: string; expiryDate: string; conditions: string }>;
}
