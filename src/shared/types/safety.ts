import type { UUID, ISOTimestamp, GeoJSONPolygon } from './common';

// ============================================================
// AVIATION SAFETY REPORTING PROGRAM (ASRP) FOR UAS
// ============================================================

// Based on NASA ASRS + FAA DroneZone mandatory reporting (14 CFR 107.9)

export type SafetyReportType = 'mandatory' | 'voluntary';
// mandatory: 14 CFR 107.9 — serious injury, loss of consciousness, property damage >$500
// voluntary: NASA ASRS-style — near-miss, airspace violation, equipment anomaly, etc.

export type IncidentSeverity = 'none' | 'minor' | 'moderate' | 'serious' | 'critical' | 'fatal';

export type IncidentCategory =
  | 'near_midair_collision'      // Near-miss with manned aircraft
  | 'airspace_violation'         // Unauthorized airspace entry
  | 'loss_of_control'            // Flyaway or loss of command
  | 'equipment_failure'          // Motor, ESC, GPS, battery failure
  | 'battery_emergency'          // Battery fire, swelling, rapid discharge
  | 'loss_of_link'               // Lost communication with drone
  | 'flyaway'                    // Drone flies away uncontrolled
  | 'crash'                      // Uncontrolled ground impact
  | 'injury_to_person'           // Person injured by drone
  | 'property_damage'            // Damage to third-party property
  | 'wildlife_strike'            // Bird or wildlife collision
  | 'interference'               // GPS jamming, RF interference
  | 'regulatory_violation'       // Part 107 rule violation
  | 'remote_id_failure'          // Remote ID broadcast failure
  | 'geofence_breach'            // Drone exceeded authorized area
  | 'altitude_violation'         // Exceeded authorized altitude
  | 'night_operations_incident'  // Incident during night ops
  | 'bvlos_incident'             // Incident during BVLOS operations
  | 'payload_drop'               // Unintended payload release
  | 'other';

export type ReportStatus =
  | 'draft'           // Being composed
  | 'submitted'       // Submitted to platform
  | 'under_review'    // Being reviewed by safety officer
  | 'filed_faa'       // Filed with FAA (mandatory reports)
  | 'filed_asrs'      // Filed with NASA ASRS (voluntary)
  | 'acknowledged'    // Acknowledged by reviewing authority
  | 'closed'          // Investigation complete
  | 'archived';       // Archived after retention period

export type MandatoryReportTrigger =
  | 'serious_injury'            // AIS Level 3+ injury
  | 'loss_of_consciousness'     // Any person loses consciousness
  | 'property_damage_over_500'  // Damage exceeding $500
  | 'none';                     // Not a mandatory trigger

/** Complete safety/incident report */
export interface SafetyReport {
  id: UUID;
  tenantId: UUID;
  reportNumber: string; // SKW-SR-YYYY-NNNNNN

  // Report classification
  reportType: SafetyReportType;
  mandatoryTrigger: MandatoryReportTrigger;
  categories: IncidentCategory[]; // Can have multiple
  severity: IncidentSeverity;

  // Status & workflow
  status: ReportStatus;
  confidential: boolean; // Reporter requests confidentiality (ASRS protection)
  deidentified: boolean; // PII removed for analysis

  // === SECTION 1: EVENT INFO ===
  eventDate: string; // ISO date of the incident
  eventTime: string; // Local time HH:MM
  eventTimezone: string; // IANA timezone
  eventDuration?: string; // How long the event lasted

  // Location
  eventLatitude: number;
  eventLongitude: number;
  eventAltitudeFt?: number;
  eventAltitudeReference: 'agl' | 'msl';
  eventLocation: string; // Description: "2 miles NE of KLAX"
  nearestAirport?: string; // ICAO identifier
  airspaceClass?: string; // B, C, D, E, G
  withinControlledAirspace: boolean;

  // Weather at time of event
  weatherConditions?: 'vmc' | 'imc'; // Visual vs Instrument meteorological
  windSpeedKnots?: number;
  windDirection?: number;
  visibility?: string; // "10+ miles", "3 miles", etc.
  lightConditions: 'day' | 'twilight' | 'night';

  // === SECTION 2: AIRCRAFT/OPERATOR INFO ===
  // Reporter
  reporterId: UUID;
  reporterRole: 'remote_pilot' | 'visual_observer' | 'crew_member' | 'bystander' | 'atc' | 'other';
  reporterCertification?: string; // Part 107 cert number
  reporterExperienceHours?: number;

  // Drone
  droneId?: UUID;
  droneRegistrationDDID?: string; // SKW-XX-XXXXXX
  droneMake: string;
  droneModel: string;
  droneSerialNumber?: string;
  droneWeightGrams: number;
  droneCategory: 'micro' | 'small' | 'medium' | 'large';

  // UAS type (per ASRS categories)
  uasType: 'multirotor' | 'fixed_wing' | 'vtol' | 'helicopter' | 'airship' | 'other';

  // Remote ID status at time of event
  remoteIdActive: boolean;
  remoteIdMethod?: 'standard' | 'broadcast_module' | 'fria' | 'none';
  remoteIdSerialNumber?: string;

  // Flight context
  flightPlanId?: UUID;
  laancAuthorizationId?: UUID;
  missionId?: UUID;
  operationType: 'part_107' | 'part_107_waiver' | 'recreational' | 'public_safety' | 'government' | 'other';

  // Operational context (from ASRS UAS form)
  operationalContext: OperationalContext[];

  // === SECTION 3: EVENT DETAILS ===
  // What happened
  narrative: string; // Free-text description of the event (minimum 100 chars for mandatory)

  // Other aircraft involved (for near-miss reports)
  otherAircraftInvolved: boolean;
  otherAircraftType?: string; // "Cessna 172", "Boeing 737", "Unknown helicopter", etc.
  otherAircraftAltitude?: number;
  closestApproachFt?: number; // Minimum distance
  closestApproachVerticalFt?: number;
  otherAircraftRegistration?: string;
  atcContactMade?: boolean;

  // Damage/injury
  injuries: InjuryRecord[];
  propertyDamage: PropertyDamageRecord[];
  totalPropertyDamageEstimate?: number; // USD
  droneDamaged: boolean;
  droneRecovered: boolean;

  // Contributing factors
  contributingFactors: ContributingFactor[];

  // Corrective actions taken
  correctiveActions: string[];
  preventiveRecommendations: string[];

  // === SECTION 4: REGULATORY FILING ===
  // FAA mandatory (14 CFR 107.9) — within 10 calendar days
  faaFilingRequired: boolean;
  faaFilingDeadline?: string; // event_date + 10 days
  faaFiledAt?: ISOTimestamp;
  faaConfirmationNumber?: string;
  faaDroneZoneSubmissionId?: string;

  // NASA ASRS voluntary filing
  asrsFilingRecommended: boolean;
  asrsFiledAt?: ISOTimestamp;
  asrsConfirmationNumber?: string;

  // ASRS enforcement protection conditions met
  asrsProtectionEligible: boolean;
  asrsProtectionConditions: ASRSProtectionCheck;

  // === SECTION 5: INVESTIGATION ===
  assignedInvestigator?: UUID;
  investigationNotes?: string;
  rootCause?: string;
  finalClassification?: string;
  lessonsLearned?: string;
  closedAt?: ISOTimestamp;
  closedBy?: UUID;

  // Attachments
  attachments: ReportAttachment[];

  // Metadata
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  submittedAt?: ISOTimestamp;
}

export type OperationalContext =
  | 'commercial_operations'
  | 'aerial_photography'
  | 'aerial_survey'
  | 'agriculture'
  | 'construction'
  | 'delivery'
  | 'emergency_response'
  | 'infrastructure_inspection'
  | 'law_enforcement'
  | 'news_gathering'
  | 'real_estate'
  | 'recreation'
  | 'research'
  | 'training';

export interface InjuryRecord {
  personType: 'crew' | 'bystander' | 'other';
  severity: 'none' | 'minor' | 'serious' | 'fatal';
  aisLevel?: number; // Abbreviated Injury Scale 1-6
  description: string;
  medicalAttentionSought: boolean;
  lossOfConsciousness: boolean;
  hospitalized: boolean;
}

export interface PropertyDamageRecord {
  type: 'vehicle' | 'building' | 'infrastructure' | 'aircraft' | 'personal_property' | 'other';
  description: string;
  estimatedDamage: number; // USD
  ownerNotified: boolean;
  insuranceClaimFiled: boolean;
}

export type ContributingFactor =
  | 'pilot_error'
  | 'equipment_malfunction'
  | 'software_error'
  | 'weather'
  | 'gps_interference'
  | 'rf_interference'
  | 'battery_failure'
  | 'motor_failure'
  | 'sensor_failure'
  | 'communication_failure'
  | 'airspace_complexity'
  | 'fatigue'
  | 'distraction'
  | 'inadequate_planning'
  | 'inadequate_training'
  | 'regulatory_confusion'
  | 'visibility'
  | 'bird_strike'
  | 'unknown'
  | 'other';

/** ASRS enforcement protection eligibility check */
export interface ASRSProtectionCheck {
  /** Violation was inadvertent and not deliberate */
  unintentional: boolean;
  /** Did not involve a criminal offense */
  noCriminalOffense: boolean;
  /** Did not involve an accident (14 CFR definition) */
  noAccident: boolean;
  /** Pilot competency not in question */
  noSafetyDisqualification: boolean;
  /** No prior violations within 5 years */
  noPriorViolations: boolean;
  /** Report filed within 10 days of event */
  filedWithin10Days: boolean;
  /** All conditions met = eligible for protection */
  allConditionsMet: boolean;
}

export interface ReportAttachment {
  id: UUID;
  type: 'photo' | 'video' | 'flight_log' | 'telemetry' | 'document' | 'drone_data' | 'witness_statement';
  fileName: string;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  description?: string;
  uploadedAt: ISOTimestamp;
}

// ============================================================
// ENHANCED REMOTE ID COMPLIANCE (14 CFR Part 89)
// ============================================================

export type RemoteIdComplianceMethod = 'standard' | 'broadcast_module' | 'fria' | 'none';

export type RemoteIdMessageType = 'basic_id' | 'location' | 'auth' | 'self_id' | 'system' | 'operator_id';

/** Standard Remote ID message elements per 14 CFR 89.305 */
export interface RemoteIdMessage {
  /** Message type */
  messageType: RemoteIdMessageType;

  /** Protocol version */
  protocolVersion: number;

  /** UAS serial number (ANSI/CTA-2063-A format) */
  uasSerialNumber: string;

  /** Session ID (generated per flight) */
  sessionId?: string;

  /** UA (drone) latitude */
  uaLatitude: number;
  /** UA longitude */
  uaLongitude: number;
  /** UA geodetic altitude (WGS84) */
  uaGeodeticAltitude: number;
  /** UA pressure altitude */
  uaPressureAltitude?: number;

  /** Control station latitude (Standard RID only) */
  csLatitude?: number;
  /** Control station longitude (Standard RID only) */
  csLongitude?: number;
  /** Control station geodetic altitude */
  csGeodeticAltitude?: number;

  /** Takeoff location latitude (Broadcast Module only) */
  takeoffLatitude?: number;
  /** Takeoff location longitude (Broadcast Module only) */
  takeoffLongitude?: number;

  /** UA speed (m/s) */
  uaSpeed: number;
  /** UA heading/direction (degrees from true north) */
  uaDirection: number;
  /** UA vertical speed (m/s, positive = up) */
  uaVerticalSpeed?: number;

  /** Timestamp */
  timestamp: ISOTimestamp;
  /** Timestamp accuracy (seconds) */
  timestampAccuracy: number;

  /** Emergency status */
  emergencyStatus: RemoteIdEmergencyStatus;

  /** Horizontal position accuracy category */
  horizontalAccuracy: RemoteIdAccuracyCategory;
  /** Vertical accuracy category */
  verticalAccuracy: RemoteIdAccuracyCategory;
  /** Speed accuracy category */
  speedAccuracy: RemoteIdAccuracyCategory;

  /** Operator ID (in UAS-registered countries) */
  operatorId?: string;

  /** Self-ID description (free text) */
  selfIdDescription?: string;
}

export type RemoteIdEmergencyStatus =
  | 'none'
  | 'general_emergency'
  | 'medical_emergency'
  | 'low_fuel';

export type RemoteIdAccuracyCategory =
  | 'unknown'
  | 'lt_10m'   // < 10 meters (most accurate)
  | 'lt_30m'   // < 30 meters
  | 'lt_100m'  // < 100 meters
  | 'lt_500m'  // < 500 meters
  | 'ge_500m'; // >= 500 meters

/** Remote ID compliance check per drone */
export interface RemoteIdComplianceCheck {
  droneId: UUID;
  droneSerialNumber: string;
  complianceMethod: RemoteIdComplianceMethod;

  // Hardware checks
  hasRemoteIdModule: boolean;
  moduleManufacturer?: string;
  moduleModel?: string;
  moduleSerialNumber?: string;
  moduleFirmwareVersion?: string;

  // Serial number format check (ANSI/CTA-2063-A)
  serialNumberValid: boolean;
  serialNumberFormat: string;

  // Broadcast capability checks
  broadcastFrequency: number; // Hz — must be >= 1 Hz
  broadcastFrequencyCompliant: boolean; // >= 1 Hz
  positionAccuracy: number; // feet — must be <= 100 ft (95%)
  positionAccuracyCompliant: boolean; // <= 100 ft
  altitudeAccuracy: number; // feet — must be <= 150 ft (95%)
  altitudeAccuracyCompliant: boolean; // <= 150 ft
  transmissionLatency: number; // seconds — must be <= 1 sec
  transmissionLatencyCompliant: boolean;

  // FRIA check
  operatingInFria: boolean;
  friaId?: string;
  friaName?: string;

  // Overall compliance
  compliant: boolean;
  complianceIssues: string[];
  lastCheckedAt: ISOTimestamp;
  nextCheckDue: ISOTimestamp;
}

// ============================================================
// ENHANCED B4UFLY ADVISORY
// ============================================================

export type AdvisoryLevel = 'green' | 'yellow' | 'red';
// green = Informational, flight likely permitted
// yellow = Caution, restrictions or authorizations may apply
// red = Warning, flight not recommended or prohibited

export type AdvisorySource =
  | 'airspace_class'
  | 'uasfm'
  | 'tfr'
  | 'notam'
  | 'airport_proximity'
  | 'sua'              // Special Use Airspace (MOA, restricted, prohibited)
  | 'national_park'
  | 'military_training_route'
  | 'stadium'          // Stadiums/sporting events (TFR)
  | 'wildfire'
  | 'presidential_tfr'
  | 'washington_dc_frzsfr'  // DC Flight Restricted Zone / Special Flight Rules Area
  | 'custom_geofence';      // Agency-defined

/** B4UFLY-style airspace advisory */
export interface B4UFlyAdvisory {
  id: UUID;
  level: AdvisoryLevel;
  source: AdvisorySource;
  title: string;
  description: string;

  // Applicability
  effectiveStart?: ISOTimestamp;
  effectiveEnd?: ISOTimestamp;
  permanent: boolean;

  // Location
  geometry?: GeoJSONPolygon;
  centerLat?: number;
  centerLng?: number;
  radiusNm?: number;

  // Airspace details
  airspaceClass?: string;
  ceilingFt?: number;
  floorFt?: number;

  // Authorization
  authorizationRequired: boolean;
  laancAvailable: boolean;
  uasfmMaxAltitudeFt?: number;

  // Action required
  actionRequired: string; // "Obtain LAANC authorization", "Contact ATC", "Do not fly"

  // References
  notamNumber?: string;
  tfrNumber?: string;
  facilityId?: string; // Airport/facility
}

/** Complete B4UFLY check result */
export interface B4UFlyCheckResult {
  // Query parameters
  latitude: number;
  longitude: number;
  altitudeFt: number;
  radius: number; // check radius in NM
  timestamp: ISOTimestamp;

  // Overall advisory
  overallLevel: AdvisoryLevel;
  canFly: boolean;
  requiresAuthorization: boolean;

  // Individual advisories
  advisories: B4UFlyAdvisory[];

  // Nearest airport
  nearestAirport?: {
    icaoId: string;
    name: string;
    distanceNm: number;
    towerFrequency?: string;
    laancEnabled: boolean;
    airspaceClass: string;
  };

  // UASFM grid info
  uasfmGrid?: {
    gridId: string;
    maxAltitudeFt: number;
    laancReady: boolean;
    chartCycle: string;
    facilityId: string;
  };

  // Active TFRs
  activeTfrs: Array<{
    notamNumber: string;
    type: string;
    effectiveStart: ISOTimestamp;
    effectiveEnd: ISOTimestamp;
    description: string;
    ceilingFt: number;
    floorFt: number;
  }>;

  // Metadata
  dataTimestamp: ISOTimestamp; // When the underlying data was last updated
  disclaimer: string; // Legal disclaimer
}
