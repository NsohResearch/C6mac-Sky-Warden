// C6macEye — Flight Plan & Waypath Authorization Types
// Drone operators must file flight plans with waypoints before flying,
// analogous to IFR/VFR flight plans in manned aviation (FAA Form 7233-1).
// No drone can fly without a filed and authorized flight plan.

// ============================================================
// FLIGHT PLAN & WAYPATH TYPES
// ============================================================

export type FlightPlanStatus =
  | 'draft'           // Being composed
  | 'filed'           // Submitted for review/authorization
  | 'pending_auth'    // Awaiting LAANC/authority approval
  | 'authorized'      // Cleared to fly (like "cleared as filed")
  | 'active'          // Currently being flown
  | 'completed'       // Flight completed, plan closed
  | 'cancelled'       // Cancelled before flight
  | 'expired'         // Authorization window passed without flight
  | 'deviated'        // Drone deviated from filed plan
  | 'emergency';      // Emergency declared

export type FlightRuleType = 'visual' | 'instrument' | 'special_vfr';
// visual = VLOS (Visual Line of Sight) — most Part 107
// instrument = BVLOS (Beyond Visual Line of Sight) — waiver required
// special_vfr = Night operations or reduced visibility — waiver required

export type AltitudeReference = 'agl' | 'msl';
// agl = Above Ground Level (standard for drones)
// msl = Mean Sea Level (used near airports)

export type FlightPlanType = 'standard' | 'recurring' | 'emergency' | 'training' | 'survey' | 'delivery' | 'inspection';

export type WaypointType = 'takeoff' | 'waypoint' | 'loiter' | 'poi' | 'landing' | 'alternate_landing' | 'rally_point';
// takeoff = launch point
// waypoint = route point (fly through)
// loiter = hover/orbit at this point for duration
// poi = point of interest (camera target, not flown to)
// landing = planned landing point
// alternate_landing = emergency/alternate landing
// rally_point = safe return point if comms lost

export type ContingencyAction = 'return_to_home' | 'land_immediately' | 'hover_in_place' | 'continue_to_rally' | 'manual_override';

/** Individual waypoint in a flight plan */
export interface Waypoint {
  id: string;
  sequenceNumber: number; // Order in the route (0-based)
  type: WaypointType;
  name?: string; // "WP1", "Inspection Point Alpha", "Home"

  // Position
  latitude: number;
  longitude: number;
  altitudeFt: number; // Altitude at this waypoint
  altitudeReference: AltitudeReference;

  // Speed
  speedKnots?: number; // Ground speed at this segment
  climbRateFootPerMin?: number; // Vertical speed to reach this altitude

  // Loiter (if type === 'loiter')
  loiterDurationSeconds?: number;
  loiterRadiusFt?: number; // Orbit radius
  loiterDirection?: 'clockwise' | 'counterclockwise';

  // Camera/sensor action at waypoint
  action?: WaypointAction;

  // Computed fields (filled by system)
  distanceFromPreviousFt?: number;
  estimatedArrivalTime?: string; // ISO datetime
  airspaceClass?: string; // What airspace this waypoint is in
  requiresAuthorization?: boolean; // Does this waypoint need LAANC/auth
}

export interface WaypointAction {
  type: 'take_photo' | 'start_video' | 'stop_video' | 'drop_payload' | 'scan' | 'hover_inspect' | 'none';
  parameters?: Record<string, unknown>;
}

/** Route geometry and corridor */
export interface FlightRoute {
  /** GeoJSON LineString of the route */
  routeGeometry: GeoJSONLineString;

  /** GeoJSON Polygon of the operation corridor (buffered route) */
  corridorGeometry: GeoJSONPolygon;

  /** Buffer distance from route centerline in feet */
  corridorWidthFt: number; // e.g., 100ft on each side of route

  /** Minimum altitude along route (AGL) */
  minAltitudeFt: number;

  /** Maximum altitude along route (AGL) */
  maxAltitudeFt: number;

  /** Total route distance in nautical miles */
  totalDistanceNm: number;

  /** Estimated flight time in minutes */
  estimatedFlightTimeMinutes: number;

  /** Altitude profile — array of [distanceNm, altitudeFt] pairs */
  altitudeProfile: [number, number][];
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number, number?][]; // [lng, lat, alt?]
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

/** Complete flight plan */
export interface FlightPlan {
  id: string;
  tenantId: string;
  missionId?: string; // Link to mission if applicable

  // Identity
  flightPlanNumber: string; // SKW-FP-YYYY-NNNNNN (sequential)
  status: FlightPlanStatus;
  type: FlightPlanType;
  flightRules: FlightRuleType;

  // Who
  pilotId: string;
  pilotName: string;
  pilotCertification: string; // Part 107 cert number
  observerIds?: string[]; // Visual observers for BVLOS

  // What
  droneId: string;
  droneRegistrationDDID: string; // SKW-US-XXXXXX — must be registered
  droneModel: string;
  remoteIdSerial?: string;

  // When
  proposedDepartureTime: string; // ISO datetime
  proposedArrivalTime: string;
  estimatedDurationMinutes: number;
  authorizationWindowStart: string; // Earliest allowed start
  authorizationWindowEnd: string; // Latest allowed end (typically +2 hours)
  actualDepartureTime?: string;
  actualArrivalTime?: string;

  // Where — THE WAYPATH
  waypoints: Waypoint[];
  route: FlightRoute;
  departurePoint: string; // Name/description of takeoff location
  arrivalPoint: string; // Name/description of landing location
  alternateLocations: string[]; // Alternate landing sites

  // Altitude
  cruiseAltitudeFt: number; // Primary cruise altitude
  maxAltitudeFt: number; // Maximum altitude in the plan
  altitudeReference: AltitudeReference;

  // Airspace
  airspacesTransited: AirspaceTransit[];
  laancAuthorizationIds: string[]; // Linked LAANC authorizations
  tfrConflicts: string[]; // Active TFR IDs that conflict
  notamConflicts: string[]; // Active NOTAM IDs in the area

  // Weather
  weatherBriefing?: WeatherBriefing;

  // Contingency
  contingencyPlan: ContingencyPlan;

  // Authorization
  authorizedBy?: string; // System, authority name, or user
  authorizedAt?: string;
  authorizationNotes?: string;
  denialReason?: string;

  // Tracking (during active flight)
  currentPosition?: { lat: number; lng: number; altFt: number; headingDeg: number };
  deviationAlerts: DeviationAlert[];

  // Filing
  filedAt?: string;
  filedBy: string;
  closedAt?: string;
  closedBy?: string;
  closeReason?: 'completed' | 'cancelled' | 'emergency' | 'diverted' | 'expired';

  // Metadata
  notes?: string;
  attachments?: string[]; // URLs to supporting documents (waivers, permits)

  createdAt: string;
  updatedAt: string;
}

/** Airspace transit record — each airspace the route passes through */
export interface AirspaceTransit {
  airspaceClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'G';
  airspaceName: string; // "LAX Class B Surface Area"
  facilityId?: string; // Airport identifier
  entryPoint: { lat: number; lng: number };
  exitPoint: { lat: number; lng: number };
  maxAltitudeInAirspaceFt: number;
  authorizationRequired: boolean;
  authorizationStatus: 'not_required' | 'pending' | 'authorized' | 'denied';
  laancAuthorizationId?: string;
  uasfmCeilingFt?: number; // UASFM max altitude for auto-approval
}

/** Weather briefing snapshot at time of filing */
export interface WeatherBriefing {
  briefingTime: string; // ISO datetime
  source: string; // "NWS" / "aviation_weather_gov"

  // Surface conditions at departure
  windSpeedKnots: number;
  windGustKnots?: number;
  windDirectionDeg: number;
  visibilityMiles: number;
  ceilingFt?: number;
  temperature: number;
  dewpoint: number;
  altimeterInHg: number;

  // Conditions
  conditions: 'vfr' | 'mvfr' | 'ifr' | 'lifr';
  precipitation: string[]; // 'rain', 'snow', 'thunderstorm', 'fog', etc.

  // Hazards
  kpIndex?: number; // Geomagnetic (affects GPS)
  turbulenceForecast?: string;
  icingForecast?: string;

  // Go/No-Go
  withinOperatingLimits: boolean;
  weatherRiskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  advisories: string[];
}

/** Contingency plan — required for every flight plan */
export interface ContingencyPlan {
  /** Action if communication lost */
  commsLostAction: ContingencyAction;
  commsLostTimeoutSeconds: number; // How long before triggering action

  /** Action if GPS lost */
  gpsLostAction: ContingencyAction;

  /** Action if battery critical */
  lowBatteryThresholdPercent: number; // e.g., 20%
  lowBatteryAction: ContingencyAction;
  criticalBatteryThresholdPercent: number; // e.g., 10%
  criticalBatteryAction: ContingencyAction;

  /** Action if geofence breached */
  geofenceBreachAction: ContingencyAction;

  /** Emergency landing locations (ordered by preference) */
  emergencyLandingLocations: EmergencyLandingLocation[];

  /** Return to home settings */
  returnToHomeAltitudeFt: number;
  returnToHomeLocation: { lat: number; lng: number };

  /** Emergency contact */
  emergencyContactName: string;
  emergencyContactPhone: string;

  /** ATC notification phone (for Class B/C/D operations) */
  atcContactNumber?: string;
}

export interface EmergencyLandingLocation {
  name: string;
  latitude: number;
  longitude: number;
  surfaceType: 'paved' | 'grass' | 'gravel' | 'water' | 'rooftop' | 'open_field';
  notes?: string;
  distanceFromRouteNm: number;
}

/** Deviation alert — triggered when drone deviates from filed plan */
export interface DeviationAlert {
  id: string;
  timestamp: string;
  type: 'lateral' | 'vertical' | 'speed' | 'geofence' | 'time' | 'comms_lost';
  severity: 'info' | 'warning' | 'critical';
  message: string;

  // Where the drone actually is
  actualPosition: { lat: number; lng: number; altFt: number };

  // Where it should be
  expectedPosition?: { lat: number; lng: number; altFt: number };

  // How far off
  deviationDistanceFt?: number;
  deviationAltitudeFt?: number;

  // Resolution
  resolved: boolean;
  resolvedAt?: string;
  resolution?: string; // "Pilot corrected course" / "RTH activated" / "Authority notified"
}

// ============================================================
// ONBOARDING / REGISTRATION-FIRST FLOW TYPES
// ============================================================

export type OnboardingStep =
  | 'profile_setup'
  | 'pilot_certification'
  | 'drone_registration'
  | 'first_flight_plan'
  | 'completed';

export type OnboardingStatus = 'incomplete' | 'in_progress' | 'completed' | 'blocked';

/** Tracks a user's onboarding progress */
export interface OnboardingProgress {
  userId: string;
  tenantId: string;
  currentStep: OnboardingStep;
  status: OnboardingStatus;

  steps: {
    profileSetup: StepStatus;
    pilotCertification: StepStatus;
    droneRegistration: StepStatus;
    firstFlightPlan: StepStatus;
  };

  // Blocking reasons
  blockingReasons: string[];

  completedAt?: string;
  lastUpdatedAt: string;
}

export interface StepStatus {
  completed: boolean;
  completedAt?: string;
  required: boolean;
  skippable: boolean;
  data?: Record<string, unknown>; // Step-specific data
}
