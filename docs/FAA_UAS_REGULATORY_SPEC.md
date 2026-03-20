# FAA UAS Regulatory Technical Specification

> C6macEye Platform Implementation Reference
> Last Updated: 2026-03-20

---

## Table of Contents

1. [LAANC (Low Altitude Authorization and Notification Capability)](#1-laanc)
2. [B4UFLY (Before You Fly)](#2-b4ufly)
3. [Remote ID (14 CFR Part 89)](#3-remote-id)
4. [Aviation Safety Reporting Program (ASRP) for UAS](#4-asrp)

---

## 1. LAANC

### 1.1 Overview

LAANC is the FAA's automated system enabling near-real-time airspace authorization for UAS operations in controlled airspace. UAS Service Suppliers (USS) act as intermediaries between drone operators and the FAA's LAANC system interface.

**Regulatory basis:** 14 CFR Part 107 (commercial); 49 USC 44809 (recreational via TRUST).

### 1.2 USS Requirements

To process LAANC authorizations, a USS must:

- Enter into a formal agreement with the FAA
- Complete the 5-phase New Applicant Onboarding Process
- Comply with FAA ATO LAANC USS Performance Rules (currently v9)
- Validate operator submissions against statutory/regulatory requirements
- Maintain connectivity to the FAA UAS Data Exchange
- Validate: operation type, time of day, location, and maximum altitude
- Automatically cancel pending Further Coordination requests 24 hours before proposed start time if FAA has not responded
- Provide operator access and validation of operational submissions

### 1.3 Authorization Request Data Fields

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `operator_name` | string | Full legal name of the aircraft operator |
| `operator_phone` | string | Telephone number for operational coordination |
| `operator_email` | string | Contact email address |
| `regulation_type` | enum | `PART_107` or `RECREATIONAL_44809` |
| `operation_start_datetime` | ISO 8601 | Requested date/time operations will commence |
| `operation_end_datetime` | ISO 8601 | Requested date/time operations will conclude |
| `operation_duration` | duration | Duration of the operation |
| `max_altitude_agl_ft` | integer | Requested altitude in feet AGL (increments of 50, max 400) |
| `operation_area` | GeoJSON | Description of proposed operation area (center/radius or polygon) |
| `uasfm_ids` | string[] | Identifiers of applicable UAS Facility Map(s) |
| `uasfm_versions` | string[] | Versions of applicable UASFM(s) |

#### Recommended/Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `pilot_certificate_number` | string | Part 107 remote pilot certificate number |
| `aircraft_registration` | string | FAA registration number |
| `operation_description` | string | Free-text description of proposed operation |
| `number_of_aircraft` | integer | Number of UAS to be operated |

### 1.4 Near-Real-Time (NRT) Authorization Workflow

This is the automated approval path for operations at or below UASFM ceiling altitudes.

```
Operator submits request via USS app/portal
        |
        v
USS validates request data completeness
        |
        v
USS checks against FAA UAS Data Exchange:
  - UAS Facility Maps (UASFM)
  - Special Use Airspace data
  - Airport and Airspace Class data
  - Temporary Flight Restrictions (TFRs)
  - NOTAMs
        |
        v
Is requested altitude <= UASFM grid ceiling?
  AND is LAANC Ready flag = "true"?
  AND no conflicting TFRs/NOTAMs?
        |
   YES  |  NO
   |    |   |
   v    |   v
AUTO-   | Route to Further
APPROVE | Coordination
   |    |
   v    |
Authorization issued    |
(near-real-time)        |
   |                    |
   v                    v
Operator receives    See Section 1.5
authorization number
```

**NRT Processing Requirements:**
- Authorization must be issued in near-real-time (seconds to minutes)
- Valid from the approved start time of the operation
- USS must verify LAANC Ready flag is `true` for the relevant facility
- Authorization is for a specific time window, location, and altitude

### 1.5 Further Coordination Workflow

For operations requesting altitudes above the UASFM ceiling but no higher than 400 ft AGL, or when automated approval is not possible.

```
Operator submits Further Coordination request
(must be >= 72 hours before operation start)
        |
        v
USS forwards to FAA Air Traffic facility
        |
        v
FAA ATM or designee manually reviews
        |
        v
  +-----+------+----------+
  |            |           |
  v            v           v
APPROVED    DENIED    NO RESPONSE
  |            |           |
  v            v           v
USS notifies  USS notifies  USS auto-cancels
operator      operator     24 hrs before
              (may include  proposed start
              feedback,     time
              e.g. "Resubmit
              - lower
              altitude")
```

**Further Coordination Requirements:**
- Only available to Part 107 operators (not recreational)
- Must be submitted at least 72 hours before requested start time
- FAA goal: respond within 30 days; may take up to 90 days
- If no response, USS must auto-cancel 24 hours before proposed start time
- No back-and-forth negotiation; response is Approved, Denied, or Auto-canceled
- Denial responses may include feedback text (e.g., "Resubmit - lower altitude")

### 1.6 UASFM Grid and Altitude Ceilings

**Grid format:** 30 arc-seconds latitude x 30 arc-seconds longitude (Alaska grids may vary).

**Altitude ceiling values** (feet AGL, in 50-ft increments):

| Value | Meaning |
|-------|---------|
| 0 | No UAS flights authorized without facility coordination |
| 50 | Auto-approve up to 50 ft AGL |
| 100 | Auto-approve up to 100 ft AGL |
| 150 | Auto-approve up to 150 ft AGL |
| 200 | Auto-approve up to 200 ft AGL |
| 250 | Auto-approve up to 250 ft AGL |
| 300 | Auto-approve up to 300 ft AGL |
| 350 | Auto-approve up to 350 ft AGL |
| 400 | Auto-approve up to 400 ft AGL |

**Grid data attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `grid_id` | string | Unique grid cell identifier |
| `ceiling_ft` | integer | Maximum auto-approval altitude (0-400, step 50) |
| `facility_id` | string | Associated ATC facility identifier |
| `laanc_ready` | boolean | Whether LAANC is active for this grid/facility pair |
| `geometry` | GeoJSON Polygon | Grid cell boundary (30"x30" lat/lon) |
| `effective_date` | date | Chart cycle effective date |
| `chart_cycle` | string | 56-day FAA chart cycle identifier |

**Important rule:** If a UASFM grid extends beyond a controlled airspace boundary, the airspace boundary has precedence over the grid boundary.

### 1.7 Authorization Response Format

| Field | Type | Description |
|-------|------|-------------|
| `authorization_id` | string | Unique authorization identifier |
| `status` | enum | `APPROVED`, `DENIED`, `PENDING_FURTHER_COORDINATION`, `AUTO_CANCELED`, `EXPIRED` |
| `operator_name` | string | Name of authorized operator |
| `effective_start` | ISO 8601 | Authorization start date/time |
| `effective_end` | ISO 8601 | Authorization end date/time |
| `max_altitude_ft` | integer | Approved maximum altitude AGL |
| `operation_area` | GeoJSON | Approved operational area |
| `facility_id` | string | Authorizing ATC facility |
| `denial_reason` | string | (If denied) Feedback text from ATC |
| `issued_at` | ISO 8601 | Timestamp of authorization issuance |
| `authorization_type` | enum | `NEAR_REAL_TIME` or `FURTHER_COORDINATION` |

---

## 2. B4UFLY

### 2.1 Overview

B4UFLY is the FAA-approved airspace awareness service for recreational and commercial drone operators. It provides situational awareness by checking flight locations against multiple FAA data sources.

**Approved B4UFLY providers (as of 2025):** Airspace Link, Aloft, AutoPylot, Avision, UASidekick.

### 2.2 Data Sources Checked

The platform must check the following FAA data sources:

| Data Source | Description | Update Frequency |
|-------------|-------------|------------------|
| FAA Sectional Charts | Airspace class boundaries (B, C, D, E) | 56-day chart cycle |
| UAS Facility Maps (UASFM) | Altitude grid information per controlled airspace | 56-day chart cycle |
| Temporary Flight Restrictions (TFRs) | Active airspace restrictions (events, emergencies, VIP, etc.) | Real-time via FNS NOTAM Search |
| NOTAMs | Notices to Air Missions | Real-time |
| Airport/Heliport data | Location and boundaries of airports and heliports | As published |
| Special Use Airspace (SUA) | Prohibited, restricted, warning, MOA, alert areas | 56-day chart cycle |
| National Security Areas | Washington DC FRZ/SFRA, critical infrastructure | As published |
| National Parks | NPS boundaries (drone flights generally prohibited) | As published |
| Military Training Routes | Low-altitude military flight corridors | 56-day chart cycle |
| Stadium TFRs | Major sporting events (3 NM radius, surface to 3,000 ft) | Event-based |
| Wildfires/Emergency TFRs | Active wildfire and emergency restrictions | Real-time |

### 2.3 Advisory Level System

The platform must display advisories using the following color-coded system:

| Level | Color | Meaning | Action Required |
|-------|-------|---------|-----------------|
| **FLY** | Green | No known restrictions | Fly within Part 107 / recreational rules |
| **ADVISORIES** | Yellow | Caution; proximity to controlled airspace or temporary restrictions | Review advisories; authorization may be needed |
| **DO NOT FLY** | Red | Flight prohibited or requires specific authorization (e.g., LAANC) | Must obtain authorization or do not operate |

### 2.4 Required Information Display

The platform must present the following to the pilot:

#### Location-Based Advisories (within 2-mile radius of planned flight)

| Information | Required | Description |
|-------------|----------|-------------|
| Advisory level (color) | Yes | Green/Yellow/Red classification |
| Airspace class | Yes | B, C, D, E, G designation |
| UASFM ceiling | Yes | Maximum auto-approval altitude for the location |
| Active TFRs | Yes | Any temporary flight restrictions affecting the area |
| Nearby airports | Yes | Airports and heliports within advisory radius |
| National parks | Yes | NPS boundaries and restrictions |
| Military areas | Yes | MOAs, restricted areas, military training routes |
| LAANC availability | Yes | Whether LAANC is available at this location |
| NOTAM alerts | Yes | Active NOTAMs for the area |
| Local restrictions | Recommended | State/local drone ordinances if available |
| Controlled airspace boundaries | Yes | Displayed on map with boundaries |

#### Pilot Guidance

| Guidance Element | Description |
|------------------|-------------|
| Authorization requirement | Whether LAANC or other authorization is needed |
| Altitude restrictions | Maximum permitted altitude at location |
| Time-based restrictions | TFR effective periods |
| Link to LAANC | Direct path to request authorization if needed |
| Regulatory reference | Applicable rule (Part 107, 44809, etc.) |

### 2.5 Data Model for Airspace Advisories

```
AirspaceAdvisory {
  advisory_id: string
  location: GeoJSON Point
  radius_nm: number           // check radius (typically 2 NM)
  advisory_level: enum        // GREEN, YELLOW, RED
  airspace_class: enum        // B, C, D, E, G
  uasfm_ceiling_ft: integer   // 0-400 or null (uncontrolled)
  laanc_available: boolean
  active_tfrs: TFR[]
  active_notams: NOTAM[]
  nearby_airports: Airport[]
  special_use_airspace: SUA[]
  national_parks: NationalPark[]
  military_routes: MTR[]
  restrictions: Restriction[]
  checked_at: ISO 8601
}

TFR {
  tfr_id: string              // NOTAM number
  type: enum                  // VIP, SECURITY, HAZARD, SPECIAL_EVENT, SPACE_OPERATIONS, TEMPORARY
  effective_start: ISO 8601
  effective_end: ISO 8601
  altitude_floor_ft: integer
  altitude_ceiling_ft: integer
  area: GeoJSON Polygon
  description: string
  notam_number: string
}
```

---

## 3. Remote ID (14 CFR Part 89)

### 3.1 Overview

Remote ID enables identification and location tracking of UAS in flight. Compliance has been mandatory since March 16, 2024, for all drones required to be registered with the FAA.

### 3.2 Three Compliance Methods

#### Method 1: Standard Remote ID UAS

Factory-equipped drones that broadcast identification and location of both the drone and control station.

| Requirement | Detail |
|-------------|--------|
| Broadcasts | Drone ID, drone location/altitude, control station location/altitude, velocity, timestamp, emergency status |
| Connectivity | No internet connection required (broadcast-only in final rule) |
| Pre-flight check | Automatic self-test; cannot take off if Remote ID is non-functional |
| In-flight monitoring | Continuous monitoring of Remote ID functionality |
| Tamper resistance | Design must reduce ability to tamper with Remote ID |

#### Method 2: Remote ID Broadcast Module

Retrofit module attached to existing drones. Broadcasts drone ID, drone location/altitude, and takeoff location (not live control station location).

| Requirement | Detail |
|-------------|--------|
| Broadcasts | Drone ID, drone location/altitude, takeoff location/altitude, velocity, timestamp, emergency status |
| VLOS required | Pilot must maintain visual line of sight |
| Serial number | Displayed on the module itself |
| Attachment | Must be attached to the drone and remain attached throughout flight |

#### Method 3: FAA-Recognized Identification Area (FRIA)

Designated geographic areas where drones may operate without Remote ID equipment.

| Requirement | Detail |
|-------------|--------|
| VLOS required | Must maintain visual line of sight |
| Boundary | Must remain within the FRIA boundary |
| Application | Community-based organizations or educational institutions apply to FAA |
| Equipment | No Remote ID equipment required within the FRIA |

### 3.3 Broadcast Message Elements

#### Standard Remote ID (14 CFR 89.305)

| # | Message Element | Data Type | Description |
|---|----------------|-----------|-------------|
| 1 | **UA ID** | string | Serial number (ANSI/CTA-2063-A) OR session ID |
| 2 | **UA Latitude** | float64 | Geographic latitude of unmanned aircraft |
| 3 | **UA Longitude** | float64 | Geographic longitude of unmanned aircraft |
| 4 | **UA Geometric Altitude** | float32 | Geometric altitude of unmanned aircraft (WGS-84) |
| 5 | **UA Velocity** | vector | Velocity of unmanned aircraft (speed + direction) |
| 6 | **CS Latitude** | float64 | Geographic latitude of control station |
| 7 | **CS Longitude** | float64 | Geographic longitude of control station |
| 8 | **CS Geometric Altitude** | float32 | Geometric altitude of control station (WGS-84) |
| 9 | **Timestamp** | UTC | Time mark (UTC) of position source output applicability |
| 10 | **Emergency Status** | enum | Emergency status indication of the UA |

#### Broadcast Module (14 CFR 89.315)

| # | Message Element | Data Type | Description |
|---|----------------|-----------|-------------|
| 1 | **UA ID** | string | Serial number (ANSI/CTA-2063-A) OR session ID |
| 2 | **UA Latitude** | float64 | Geographic latitude of unmanned aircraft |
| 3 | **UA Longitude** | float64 | Geographic longitude of unmanned aircraft |
| 4 | **UA Geometric Altitude** | float32 | Geometric altitude of unmanned aircraft (WGS-84) |
| 5 | **UA Velocity** | vector | Velocity of unmanned aircraft |
| 6 | **Takeoff Latitude** | float64 | Latitude of takeoff location (not live CS) |
| 7 | **Takeoff Longitude** | float64 | Longitude of takeoff location (not live CS) |
| 8 | **Takeoff Geometric Altitude** | float32 | Altitude of takeoff location |
| 9 | **Timestamp** | UTC | Time mark of position source output applicability |
| 10 | **Emergency Status** | enum | Emergency status indication of the UA |

**Key difference:** Standard Remote ID broadcasts live control station location; Broadcast Modules broadcast static takeoff location instead.

### 3.4 Performance Requirements (14 CFR 89.310 / 89.320)

| Requirement | Standard Remote ID | Broadcast Module |
|-------------|-------------------|------------------|
| **UA Position Accuracy** | Within 100 ft of true position (95% probability) | Within 100 ft of true position (95% probability) |
| **UA Altitude Accuracy** | Within 150 ft of true geometric altitude (95% probability) | Within 150 ft of true geometric altitude (95% probability) |
| **CS/Takeoff Position Accuracy** | Within 15 ft (95% probability) | Within 15 ft (95% probability) |
| **Message Update Rate** | At least 1 message per second | At least 1 message per second |
| **Transmission Latency** | Position broadcast no later than 1.0 second from measurement | Position broadcast no later than 1.0 second from measurement |
| **Broadcast Protocol** | Non-proprietary specification | Non-proprietary specification |
| **RF Spectrum** | Compatible with personal wireless devices (47 CFR Part 15) | Compatible with personal wireless devices (47 CFR Part 15) |
| **Broadcast Technology** | WiFi Beacon / Bluetooth 4.0+ (Legacy Advertising or Long Range) | WiFi Beacon / Bluetooth 4.0+ (Legacy Advertising or Long Range) |
| **Pre-flight Self-Test** | Required; must not take off if failed | Required; must not take off if failed |
| **In-flight Monitoring** | Continuous | Continuous |
| **Tamper Resistance** | Required | Required |
| **Broadcast Duration** | From takeoff to shutdown | From takeoff to shutdown |

### 3.5 Serial Number Format (ANSI/CTA-2063-A)

The serial number must comply with ANSI/CTA-2063-A ("Small Unmanned Aerial Systems Serial Numbers," September 2019).

| Component | Description |
|-----------|-------------|
| **Character set** | ASCII: uppercase A-Z (excluding "O"), digits 0-9, period (.) |
| **Structure** | Manufacturer code + length character + device serial number |
| **Manufacturer code** | Registered with the standards body |
| **Length indicator** | Single character denoting the serial number's total length |
| **Maximum length** | 20 characters |

### 3.6 Broadcast vs. Network Remote ID

| Aspect | Broadcast Remote ID | Network Remote ID |
|--------|-------------------|-------------------|
| **Status** | Implemented (mandatory since March 2024) | Original NPRM proposed; removed from final rule |
| **Mechanism** | Direct RF broadcast (WiFi/Bluetooth) | Internet connection to a Remote ID USS |
| **Detection** | Any compatible personal wireless device can receive | Would have required USS infrastructure |
| **Current rule** | The only required method | Not required; FAA may develop alternative strategy |
| **Session ID assignment** | FAA developing alternative strategy (originally was USS-assigned) | N/A (not implemented) |

**For platform implementation:** Focus on broadcast Remote ID. Network Remote ID was removed from the final rule but the FAA may introduce it in future rulemaking. The platform should store and display broadcast data received by ground-based receivers or network-reported data if/when available.

### 3.7 USS Requirements for Remote ID

Under the current rule, Remote ID USS responsibilities include:

| Responsibility | Detail |
|----------------|--------|
| Public data access | Provide to the public: UAS ID (serial number or session ID) |
| Law enforcement data | Provide registration data associated with serial/session ID only to law enforcement or federal government |
| Data retention | Retain documentation and substantiating data for acceptance period + 24 months |
| Means of compliance | Submit testing and validation procedures to FAA |
| Compliance verification | Demonstrate through analysis, ground test, or flight test how the UA meets Subpart D requirements |

### 3.8 Remote ID Data Model for Platform

```
RemoteIDMessage {
  message_id: uuid
  received_at: ISO 8601
  ua_id: string                  // Serial number or session ID
  ua_id_type: enum               // SERIAL_NUMBER, SESSION_ID
  ua_latitude: float64
  ua_longitude: float64
  ua_altitude_geometric_m: float32   // WGS-84 geometric altitude
  ua_velocity_ns_mps: float32       // North-South velocity (m/s)
  ua_velocity_ew_mps: float32       // East-West velocity (m/s)
  ua_velocity_vertical_mps: float32 // Vertical velocity (m/s)
  ua_speed_mps: float32             // Ground speed (m/s)
  ua_heading_deg: float32           // Track direction (degrees)
  cs_latitude: float64              // Control station (Standard) or takeoff (Module)
  cs_longitude: float64
  cs_altitude_geometric_m: float32
  location_source: enum             // CONTROL_STATION, TAKEOFF_LOCATION
  timestamp_utc: ISO 8601           // UTC time mark from position source
  emergency_status: enum            // NONE, IN_PROGRESS, UNKNOWN
  broadcast_protocol: enum          // WIFI_BEACON, BT4_LEGACY, BT5_LONG_RANGE
  receiver_id: string               // ID of the ground receiver station
  receiver_location: GeoJSON Point  // Location of receiving station
  signal_strength_dbm: integer      // RSSI (optional)
}
```

---

## 4. Aviation Safety Reporting Program (ASRP) for UAS

### 4.1 Overview

The FAA extended the Aviation Safety Reporting Program (ASRP) to UAS operations. The program operates through two primary channels:

1. **NASA ASRS** -- Voluntary, confidential, non-punitive safety reporting
2. **FAA DroneZone Part 107 Accident Reporting** -- Mandatory accident reporting per 14 CFR 107.9

### 4.2 Mandatory Reporting (14 CFR 107.9)

#### Reporting Triggers

A report is **required** within 10 calendar days when an operation involves:

| Trigger | Threshold |
|---------|-----------|
| **Serious injury** | AIS Level 3 or higher (reversible, typically requires overnight hospitalization) |
| **Loss of consciousness** | Any loss of consciousness to any person |
| **Property damage** | Damage to property (other than the sUAS itself) exceeding $500 repair cost, OR fair market value exceeding $500 in case of total loss |

#### Required Data Fields (DroneZone Accident Report)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `reporter_name` | Yes | string | Full legal name of remote PIC or owner |
| `reporter_email` | Yes | string | Contact email address |
| `reporter_phone` | Yes | string | Telephone number |
| `pilot_certificate_number` | Recommended | string | Part 107 remote pilot certificate number |
| `alternate_email` | No | string | Secondary contact email |
| `uas_registration_number` | Recommended | string | FAA sUAS registration number |
| `accident_location` | Yes | GeoJSON/address | Location where the accident occurred |
| `accident_date` | Yes | date | Date of the accident |
| `accident_time` | Yes | time | Time of the accident |
| `event_description` | Yes | text | Narrative description of the event |
| `injury_details` | Conditional | text | Description and severity of injuries (if applicable) |
| `property_damage_details` | Conditional | text | Description and estimated cost of property damage |
| `property_damage_amount` | Conditional | decimal | Estimated repair cost or fair market value |

#### Submission Deadline

- **10 calendar days** from the date the operation involving the accident occurred
- Submit via FAA DroneZone portal (https://faadronezone.faa.gov)

### 4.3 Voluntary Reporting (NASA ASRS)

#### Eligible Reporters

- Recreational drone pilots
- FAA Part 107 certified operators
- Public sector operators
- Part 135 commercial operators
- Bystanders to safety incidents
- Anyone involved in UAS operations

#### Reportable Event Types

| Category | Examples |
|----------|----------|
| **Near mid-air collision** | Proximity to manned aircraft, other drones, or obstacles |
| **Equipment malfunction** | Hardware failure, software errors, automation issues |
| **Lost link / flyaway** | Loss of command-and-control link, uncontrolled flight |
| **Uncontrolled descent** | Unexpected loss of lift, crash not meeting 107.9 threshold |
| **Airspace violation** | Unintentional entry into restricted/controlled airspace |
| **Environmental hazard** | Bird strike, weather-related incident, GPS interference |
| **Communication failure** | ATC communication issues, crew miscommunication |
| **Procedural error** | Checklist deviation, operational mistake |
| **Human factors** | Fatigue, distraction, training deficiency |

**Exclusions from ASRS:** Accidents (which require mandatory FAA reporting) and criminal activity.

#### ASRS Report Form Structure

**Section 1: Return Receipt / ID Strip**

| Field | Type | Description |
|-------|------|-------------|
| `reporter_name` | string | Full name (removed after processing) |
| `reporter_address` | string | Mailing address (for receipt return) |
| `reporter_phone` | string | Phone number for follow-up |

**Section 2: Event and Operational Information**

| Field | Type | Description |
|-------|------|-------------|
| `event_date` | date | Date of the event |
| `event_time_local` | time | Local time of the event |
| `event_location` | location | Where the event occurred |
| `weather_conditions` | text | VMC/IMC, visibility, wind, ceiling |
| `uas_type` | enum | MULTI_ROTOR, FIXED_WING, HELICOPTER, HYBRID_VTOL, OTHER |
| `uas_manufacturer` | string | Make of the UAS |
| `uas_model` | string | Model of the UAS |
| `operation_type` | enum | RECREATIONAL, PART_107, PUBLIC, PART_135 |
| `operational_context` | enum | See context categories below |
| `altitude_agl` | integer | Altitude above ground level at time of event |
| `flight_phase` | enum | PRE_FLIGHT, TAKEOFF, CRUISE, APPROACH, LANDING, POST_FLIGHT |

**Operational Context Categories:**

| Context | Description |
|---------|-------------|
| `AERIAL_SHOW_EVENT` | Fireworks, airshow |
| `EMERGENCY_SERVICES` | Police, fire, SAR operations |
| `OPEN_SPACE_FIELD` | Open area flight |
| `AIRCRAFT_UAS_PROXIMITY` | Near other aircraft or UAS |
| `INDOORS_CONFINED` | Indoor or confined space operation |
| `POPULATED_AREA` | Residential or populated area |
| `AIRPORT_AERODROME` | Near airport, aerodrome, or heliport |
| `MOVING_VEHICLES` | Near highways, busy streets, bridges |
| `PRIVATE_PROPERTY` | Over private property |
| `CRITICAL_INFRASTRUCTURE` | Near power plants, government facilities |
| `NATURAL_DISASTER` | Disaster response operation |
| `RECREATIONAL_SITE` | Club or fixed flying site |
| `CROWD_EVENT` | Sporting event, concert, festival |
| `NO_DRONE_ZONE` | Restricted airspace, local restrictions, TFRs |

**Section 3: Narrative**

| Field | Type | Description |
|-------|------|-------------|
| `narrative` | text | Free-form description: WHO, WHAT, WHERE, WHEN, WHY, HOW |
| `cause_analysis` | text | Reporter's assessment of root cause |
| `prevention_suggestion` | text | What could prevent recurrence |

### 4.4 ASRP Protections for Reporters

#### Enforcement-Related Incentive (from AC 00-46F)

Filing an ASRS report provides protection from FAA civil penalties or certificate suspension **if all conditions are met:**

| Condition | Requirement |
|-----------|-------------|
| **Unintentional** | The violation was inadvertent and not deliberate |
| **No criminal offense** | No criminal activity involved |
| **No accident** | Event did not constitute an accident (per NTSB definition) |
| **No safety disqualification** | Pilot competency is not in question |
| **No prior violations** | No FAA violations in the preceding 5 years |
| **Timely filing** | Written report submitted to NASA within 10 days of the event |

#### Confidentiality Protections

| Protection | Detail |
|------------|--------|
| De-identification | Personal identifying information is removed before analysis |
| Generalization | Dates, times, and locations are generalized in published reports |
| Non-punitive | FAA will not use ASRS reports to initiate enforcement |
| Voluntary | Participation is entirely voluntary |
| Separation | NASA operates independently from FAA enforcement |

### 4.5 Platform Safety Reporting Data Model

```
SafetyReport {
  report_id: uuid
  report_type: enum              // MANDATORY_107_9, VOLUNTARY_ASRS, INTERNAL
  report_status: enum            // DRAFT, SUBMITTED, ACKNOWLEDGED, CLOSED
  tenant_id: uuid                // Multi-tenant isolation

  // Reporter Information
  reporter_user_id: uuid
  reporter_name: string
  reporter_email: string
  reporter_phone: string
  reporter_certificate: string   // Part 107 certificate number

  // Event Details
  event_date: date
  event_time_utc: timestamp
  event_time_local: timestamp
  event_timezone: string
  event_location: PostGIS Point
  event_location_description: string
  event_altitude_agl_ft: integer

  // Aircraft Information
  uas_registration: string
  uas_type: enum                 // MULTI_ROTOR, FIXED_WING, HELICOPTER, HYBRID_VTOL, OTHER
  uas_manufacturer: string
  uas_model: string
  uas_serial_number: string
  remote_id_serial: string

  // Event Classification
  event_category: enum           // NEAR_MISS, FLYAWAY, LOSS_OF_CONTROL, AIRSPACE_VIOLATION,
                                 // EQUIPMENT_FAILURE, INJURY, PROPERTY_DAMAGE, LOST_LINK,
                                 // ENVIRONMENTAL, PROCEDURAL_ERROR, OTHER
  operational_context: enum      // See context categories above
  flight_phase: enum             // PRE_FLIGHT, TAKEOFF, CRUISE, APPROACH, LANDING, POST_FLIGHT
  operation_type: enum           // RECREATIONAL, PART_107, PUBLIC, PART_135

  // Severity / Outcome
  injury_occurred: boolean
  injury_severity: enum          // NONE, MINOR, SERIOUS_AIS3, FATAL
  loss_of_consciousness: boolean
  property_damage_occurred: boolean
  property_damage_amount_usd: decimal
  property_description: string

  // Narrative
  event_narrative: text
  cause_analysis: text
  prevention_suggestion: text
  weather_conditions: text

  // Regulatory
  meets_107_9_threshold: boolean  // Computed: serious injury OR property damage > $500
  mandatory_deadline: date        // event_date + 10 calendar days
  faa_submission_date: date       // When submitted to FAA DroneZone
  asrs_submission_date: date      // When submitted to NASA ASRS
  asrs_receipt_id: string         // NASA return receipt identifier

  // Audit
  created_at: timestamp
  updated_at: timestamp
  created_by: uuid
  submitted_at: timestamp
}

// Automatic threshold check
FUNCTION check_mandatory_reporting(report):
  IF report.injury_severity IN (SERIOUS_AIS3, FATAL)
     OR report.loss_of_consciousness = true
     OR report.property_damage_amount_usd > 500:
    SET report.meets_107_9_threshold = true
    SET report.mandatory_deadline = report.event_date + INTERVAL '10 days'
    ALERT operator: "This event requires mandatory FAA reporting within 10 days"
```

### 4.6 Incident Types for Internal Platform Tracking

Beyond FAA reporting, the platform should track these operational incident categories:

| Category | Description | Mandatory FAA Report? |
|----------|-------------|----------------------|
| Near mid-air collision | Proximity to manned aircraft | No (voluntary ASRS) |
| Flyaway | Loss of control, UA departs intended area | Only if property damage >$500 |
| Loss of control | UA does not respond to commands | Only if injury/damage threshold met |
| Airspace violation | Unauthorized entry into controlled/restricted airspace | No (voluntary ASRS) |
| Equipment failure | Motor, battery, sensor, communication failure | Only if injury/damage threshold met |
| Serious injury | AIS Level 3+ injury to any person | Yes (14 CFR 107.9) |
| Loss of consciousness | Any person loses consciousness | Yes (14 CFR 107.9) |
| Property damage >$500 | Damage to third-party property | Yes (14 CFR 107.9) |
| Property damage <=$500 | Minor property damage | No (voluntary ASRS) |
| Lost link | C2 link lost during flight | Only if injury/damage threshold met |
| GPS/GNSS interference | Navigation degradation or spoofing | No (voluntary ASRS) |
| Battery event | Fire, thermal runaway, unexpected depletion | Only if injury/damage threshold met |
| Bird strike | Collision with wildlife | Only if injury/damage threshold met |

---

## Appendix A: Data Source Update Frequencies

| Data Source | Update Cycle | Source |
|-------------|-------------|--------|
| UAS Facility Maps (UASFM) | 56-day FAA chart cycle | FAA UDDS (udds-faa.opendata.arcgis.com) |
| Sectional Charts / Airspace | 56-day chart cycle | FAA |
| TFRs | Real-time | FNS NOTAM Search |
| NOTAMs | Real-time | FNS NOTAM Search |
| Airport data | As published | FAA NASR |
| Special Use Airspace | 56-day chart cycle | FAA |
| Remote ID broadcast data | 1 Hz (per aircraft) | Ground receivers |

## Appendix B: Key Regulatory References

| Regulation | Subject |
|------------|---------|
| 14 CFR Part 107 | Small Unmanned Aircraft Systems (commercial operations) |
| 14 CFR 107.9 | Safety event reporting requirements |
| 14 CFR Part 89 | Remote Identification of Unmanned Aircraft |
| 14 CFR 89.305 | Standard Remote ID minimum message elements |
| 14 CFR 89.310 | Standard Remote ID minimum performance requirements |
| 14 CFR 89.315 | Broadcast module minimum message elements |
| 14 CFR 89.320 | Broadcast module minimum performance requirements |
| 49 USC 44809 | Exception for limited recreational operations |
| AC 00-46F | Aviation Safety Reporting Program (ASRP) advisory circular |
| ANSI/CTA-2063-A | Small UAS Serial Numbers standard |
| 47 CFR Part 15 | RF spectrum for personal wireless devices |
| ASTM F3411 | Standard Specification for Remote ID and Tracking |

## Appendix C: Key FAA Systems and Endpoints

| System | Purpose | URL / Reference |
|--------|---------|-----------------|
| FAA DroneZone | Registration, waivers, accident reporting | https://faadronezone.faa.gov |
| FAA UDDS | UASFM GeoJSON data download | https://udds-faa.opendata.arcgis.com |
| LAANC USS API | USS-to-FAA authorization interface | https://api.faa.gov/laanc/s/ |
| FNS NOTAM Search | TFR and NOTAM data | https://notams.aim.faa.gov/notamSearch |
| NASA ASRS | Voluntary safety reporting | https://asrs.arc.nasa.gov |
| NASA ASRS UAS Form | UAS-specific report form | https://asrs.arc.nasa.gov/docs/uas.pdf |
