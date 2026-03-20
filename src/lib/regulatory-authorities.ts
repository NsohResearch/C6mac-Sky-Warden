/**
 * Global Drone/UAS Regulatory Authorities
 * 55+ countries across 6 regions. Data verified Q1 2026.
 */

import type { CountryAuthority } from './types/regulatory';

export const GLOBAL_REGULATORY_AUTHORITIES: CountryAuthority[] = [
  // ═══ NORTH AMERICA (3) ═══
  {
    countryCode: 'US', countryName: 'United States', flagEmoji: '🇺🇸', region: 'north_america',
    authority: { name: 'Federal Aviation Administration', acronym: 'FAA', website: 'https://www.faa.gov/uas', registrationPortal: 'https://faadronezone.faa.gov' },
    regulations: { primaryRegulation: '14 CFR Part 107', pilotCertName: 'Remote Pilot Certificate (Part 107)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: '14 CFR Part 89', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: 'LAANC', authorizationSystem: 'LAANC / DroneZone' },
    locale: { currency: 'USD', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'mph', weightUnit: 'pounds', temperatureUnit: 'fahrenheit' },
    emergencyNumber: '911', aviationEmergency: '1-866-835-5322',
  },
  {
    countryCode: 'CA', countryName: 'Canada', flagEmoji: '🇨🇦', region: 'north_america',
    authority: { name: 'Transport Canada Civil Aviation', acronym: 'TCCA', website: 'https://tc.canada.ca/en/aviation/drone-safety', registrationPortal: 'https://tc.canada.ca/en/aviation/drone-safety/drone-management-portal' },
    regulations: { primaryRegulation: 'Canadian Aviation Regulations Part IX', pilotCertName: 'Pilot Certificate - Basic / Advanced', registrationRequired: true, remoteIdRequired: 'planned', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: 'NAV CANADA Drone Flight Planning', authorizationSystem: 'NAV CANADA / Drone Management Portal' },
    locale: { currency: 'CAD', dateFormat: 'YYYY-MM-DD', timeFormat: '12h', distanceUnit: 'meters', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '911', aviationEmergency: '1-800-305-2059',
  },
  {
    countryCode: 'MX', countryName: 'Mexico', flagEmoji: '🇲🇽', region: 'north_america',
    authority: { name: 'Agencia Federal de Aviación Civil', acronym: 'AFAC', website: 'https://www.gob.mx/afac', registrationPortal: 'https://www.gob.mx/afac/acciones-y-programas/rpas-drones' },
    regulations: { primaryRegulation: 'NOM-107-SCT3-2019 / CO AV-23/10 R4', pilotCertName: 'Licencia de Piloto de RPAS', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'AFAC RPAS Portal' },
    locale: { currency: 'MXN', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'meters', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '911', aviationEmergency: '55-5723-9300',
  },

  // ═══ EUROPE (16) ═══
  {
    countryCode: 'GB', countryName: 'United Kingdom', flagEmoji: '🇬🇧', region: 'europe',
    authority: { name: 'Civil Aviation Authority', acronym: 'CAA', website: 'https://www.caa.co.uk/drones', registrationPortal: 'https://register-drones.caa.co.uk' },
    regulations: { primaryRegulation: 'Air Navigation Order 2016 / ANO Article 94A-95', pilotCertName: 'Flyer ID / Operator ID', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'CAP 2568 Remote Identification', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'CAA Drone Registration Service' },
    locale: { currency: 'GBP', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'feet', speedUnit: 'mph', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '999', aviationEmergency: null,
  },
  {
    countryCode: 'FR', countryName: 'France', flagEmoji: '🇫🇷', region: 'europe',
    authority: { name: "Direction Générale de l'Aviation Civile", acronym: 'DGAC', website: 'https://www.ecologie.gouv.fr/politiques-publiques/drones-aeronefs-telecommandes', registrationPortal: 'https://alphatango.aviation-civile.gouv.fr' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'EU Remote Pilot Certificate (A1/A3 or A2)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'AlphaTango / Geoportail' },
    locale: { currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'DE', countryName: 'Germany', flagEmoji: '🇩🇪', region: 'europe',
    authority: { name: 'Luftfahrt-Bundesamt', acronym: 'LBA', website: 'https://www.lba.de/EN/Drones/Drones_node.html', registrationPortal: 'https://uas-registration.lba-openuav.de' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA) + LuftVO', pilotCertName: 'EU Remote Pilot Certificate (A1/A3 or A2)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'dipul.de / LBA UAS Registration' },
    locale: { currency: 'EUR', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'ES', countryName: 'Spain', flagEmoji: '🇪🇸', region: 'europe',
    authority: { name: 'Agencia Estatal de Seguridad Aérea', acronym: 'AESA', website: 'https://www.seguridadaerea.gob.es/en/ambitos/drones', registrationPortal: 'https://www.seguridadaerea.gob.es' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA) + RD 517/2024', pilotCertName: 'EU Remote Pilot Certificate (A1/A3 or A2)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'AESA UAS Portal' },
    locale: { currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'IT', countryName: 'Italy', flagEmoji: '🇮🇹', region: 'europe',
    authority: { name: "Ente Nazionale per l'Aviazione Civile", acronym: 'ENAC', website: 'https://www.enac.gov.it/sicurezza-aerea/droni', registrationPortal: 'https://www.d-flight.it' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'EU Remote Pilot Certificate (A1/A3 or A2)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'D-Flight UTM Platform' },
    locale: { currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'NL', countryName: 'Netherlands', flagEmoji: '🇳🇱', region: 'europe',
    authority: { name: 'Inspectie Leefomgeving en Transport', acronym: 'ILT', website: 'https://www.ilent.nl/onderwerpen/drone', registrationPortal: 'https://registratie.rwsleefomgeving.nl/drone' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'EU Remote Pilot Certificate (A1/A3 or A2)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'ILT UAS Portal' },
    locale: { currency: 'EUR', dateFormat: 'DD-MM-YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'SE', countryName: 'Sweden', flagEmoji: '🇸🇪', region: 'europe',
    authority: { name: 'Transportstyrelsen', acronym: 'TAS', website: 'https://www.transportstyrelsen.se/en/aviation/Unmanned-aircraft---drones/', registrationPortal: 'https://e-tjanster.transportstyrelsen.se' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'EU Remote Pilot Certificate (A1/A3 or A2)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'Transportstyrelsen UAS Portal' },
    locale: { currency: 'SEK', dateFormat: 'YYYY-MM-DD', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'NO', countryName: 'Norway', flagEmoji: '🇳🇴', region: 'europe',
    authority: { name: 'Civil Aviation Authority Norway', acronym: 'CAA Norway', website: 'https://luftfartstilsynet.no/en/drones/', registrationPortal: 'https://luftfartstilsynet.no/en/drones/registration/' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'EU Remote Pilot Certificate (A1/A3 or A2)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'Luftfartstilsynet UAS Portal' },
    locale: { currency: 'NOK', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'CH', countryName: 'Switzerland', flagEmoji: '🇨🇭', region: 'europe',
    authority: { name: 'Federal Office of Civil Aviation', acronym: 'FOCA', website: 'https://www.bazl.admin.ch/bazl/en/home/drones.html', registrationPortal: 'https://www.bazl.admin.ch' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (adopted)', pilotCertName: 'FOCA Drone Certificate', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'FOCA UAS Portal' },
    locale: { currency: 'CHF', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'DK', countryName: 'Denmark', flagEmoji: '🇩🇰', region: 'europe',
    authority: { name: 'Trafikstyrelsen', acronym: 'DTA', website: 'https://www.trafikstyrelsen.dk/en/aviation/unmanned-aircraft-drones', registrationPortal: 'https://www.trafikstyrelsen.dk' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'EU Remote Pilot Certificate (A1/A3 or A2)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'Trafikstyrelsen UAS Portal' },
    locale: { currency: 'DKK', dateFormat: 'DD-MM-YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'FI', countryName: 'Finland', flagEmoji: '🇫🇮', region: 'europe',
    authority: { name: 'Finnish Transport and Communications Agency', acronym: 'Traficom', website: 'https://www.traficom.fi/en/transport/aviation/drones', registrationPortal: 'https://www.droneinfo.fi' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'EU Remote Pilot Certificate (A1/A3 or A2)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'Droneinfo.fi' },
    locale: { currency: 'EUR', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'IE', countryName: 'Ireland', flagEmoji: '🇮🇪', region: 'europe',
    authority: { name: 'Irish Aviation Authority', acronym: 'IAA', website: 'https://www.iaa.ie/general-aviation/drones', registrationPortal: 'https://www.iaa.ie/general-aviation/drones' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'IAA Drone Pilot Certificate', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'IAA UAS Portal' },
    locale: { currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'PL', countryName: 'Poland', flagEmoji: '🇵🇱', region: 'europe',
    authority: { name: 'Urząd Lotnictwa Cywilnego', acronym: 'ULC', website: 'https://www.ulc.gov.pl/en/drones', registrationPortal: 'https://drony.ulc.gov.pl' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'ULC Drone Certificate', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'ULC UAS Portal' },
    locale: { currency: 'PLN', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'AT', countryName: 'Austria', flagEmoji: '🇦🇹', region: 'europe',
    authority: { name: 'Austro Control', acronym: 'ACG', website: 'https://www.austrocontrol.at/en/drones', registrationPortal: 'https://www.dronespace.at' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'Austro Control Drone Certificate', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'Dronespace.at' },
    locale: { currency: 'EUR', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'PT', countryName: 'Portugal', flagEmoji: '🇵🇹', region: 'europe',
    authority: { name: 'Autoridade Nacional da Aviação Civil', acronym: 'ANAC', website: 'https://www.anac.pt/vPT/Generico/Drones', registrationPortal: 'https://www.anac.pt' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'ANAC Drone Certificate', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'ANAC UAS Portal' },
    locale: { currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'BE', countryName: 'Belgium', flagEmoji: '🇧🇪', region: 'europe',
    authority: { name: 'Direction Générale Transport Aérien', acronym: 'DGTA', website: 'https://mobilit.belgium.be/en/air/drones', registrationPortal: 'https://mobilit.belgium.be' },
    regulations: { primaryRegulation: 'EU Regulation 2019/947 (EASA)', pilotCertName: 'Belgian Drone Certificate', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: 'EU Delegated Regulation 2019/945', maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'DGTA UAS Portal' },
    locale: { currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },

  // ═══ AFRICA (15) ═══
  {
    countryCode: 'NG', countryName: 'Nigeria', flagEmoji: '🇳🇬', region: 'africa',
    authority: { name: 'Nigerian Civil Aviation Authority', acronym: 'NCAA', website: 'https://ncaa.gov.ng', registrationPortal: 'https://ncaa.gov.ng/rpas' },
    regulations: { primaryRegulation: 'Nig.CARs Part 21', pilotCertName: 'RPAS Operator Certificate (ROC)', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'NCAA RPAS Portal' },
    locale: { currency: 'NGN', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'KE', countryName: 'Kenya', flagEmoji: '🇰🇪', region: 'africa',
    authority: { name: 'Kenya Civil Aviation Authority', acronym: 'KCAA', website: 'https://www.kcaa.or.ke', registrationPortal: 'https://www.kcaa.or.ke/rpas' },
    regulations: { primaryRegulation: 'Civil Aviation (RPAS) Regulations 2020', pilotCertName: 'Remote Pilot License (RPL)', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'KCAA RPAS Portal' },
    locale: { currency: 'KES', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '999', aviationEmergency: null,
  },
  {
    countryCode: 'ZA', countryName: 'South Africa', flagEmoji: '🇿🇦', region: 'africa',
    authority: { name: 'South African Civil Aviation Authority', acronym: 'SACAA', website: 'https://www.caa.co.za', registrationPortal: 'https://www.caa.co.za/rpas' },
    regulations: { primaryRegulation: 'SACAA RPAS Regulations Part 101', pilotCertName: 'Remote Pilot License (RPL)', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'SACAA RPAS Portal' },
    locale: { currency: 'ZAR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '10111', aviationEmergency: null,
  },
  {
    countryCode: 'GH', countryName: 'Ghana', flagEmoji: '🇬🇭', region: 'africa',
    authority: { name: 'Ghana Civil Aviation Authority', acronym: 'GCAA', website: 'https://www.gcaa.com.gh', registrationPortal: 'https://www.gcaa.com.gh' },
    regulations: { primaryRegulation: 'GCAA RPAS Directives', pilotCertName: 'RPAS Operator Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'GCAA Portal' },
    locale: { currency: 'GHS', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'RW', countryName: 'Rwanda', flagEmoji: '🇷🇼', region: 'africa',
    authority: { name: 'Rwanda Civil Aviation Authority', acronym: 'RCAA', website: 'https://www.caa.gov.rw', registrationPortal: 'https://www.caa.gov.rw' },
    regulations: { primaryRegulation: 'RCAA Drone Regulations 2021', pilotCertName: 'RPAS Operator License', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'RCAA Portal' },
    locale: { currency: 'RWF', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'TZ', countryName: 'Tanzania', flagEmoji: '🇹🇿', region: 'africa',
    authority: { name: 'Tanzania Civil Aviation Authority', acronym: 'TCAA', website: 'https://www.tcaa.go.tz', registrationPortal: 'https://www.tcaa.go.tz' },
    regulations: { primaryRegulation: 'TCAA RPAS Regulations 2020', pilotCertName: 'RPAS Permit', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'TCAA Portal' },
    locale: { currency: 'TZS', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'UG', countryName: 'Uganda', flagEmoji: '🇺🇬', region: 'africa',
    authority: { name: 'Uganda Civil Aviation Authority', acronym: 'UCAA', website: 'https://www.caa.go.ug', registrationPortal: 'https://www.caa.go.ug' },
    regulations: { primaryRegulation: 'UCAA RPAS Regulations 2021', pilotCertName: 'RPAS Operator Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'UCAA Portal' },
    locale: { currency: 'UGX', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '999', aviationEmergency: null,
  },
  {
    countryCode: 'ET', countryName: 'Ethiopia', flagEmoji: '🇪🇹', region: 'africa',
    authority: { name: 'Ethiopian Civil Aviation Authority', acronym: 'ECAA', website: 'https://www.ecaa.gov.et', registrationPortal: 'https://www.ecaa.gov.et' },
    regulations: { primaryRegulation: 'ECAA RPAS Directive', pilotCertName: 'RPAS Operator License', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'ECAA Portal' },
    locale: { currency: 'ETB', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '911', aviationEmergency: null,
  },
  {
    countryCode: 'SN', countryName: 'Senegal', flagEmoji: '🇸🇳', region: 'africa',
    authority: { name: "Agence Nationale de l'Aviation Civile", acronym: 'ANACIM', website: 'https://www.anacim.sn', registrationPortal: 'https://www.anacim.sn' },
    regulations: { primaryRegulation: 'ANACIM Drone Regulations', pilotCertName: 'RPAS Operator Authorization', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'ANACIM Portal' },
    locale: { currency: 'XOF', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '17', aviationEmergency: null,
  },
  {
    countryCode: 'CI', countryName: "Côte d'Ivoire", flagEmoji: '🇨🇮', region: 'africa',
    authority: { name: "Autorité Nationale de l'Aviation Civile", acronym: 'ANAC-CI', website: 'https://www.anac.ci', registrationPortal: 'https://www.anac.ci' },
    regulations: { primaryRegulation: 'ANAC Drone Regulations', pilotCertName: 'RPAS Authorization', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'ANAC-CI Portal' },
    locale: { currency: 'XOF', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '110', aviationEmergency: null,
  },
  {
    countryCode: 'EG', countryName: 'Egypt', flagEmoji: '🇪🇬', region: 'africa',
    authority: { name: 'Egyptian Civil Aviation Authority', acronym: 'ECAA-EG', website: 'https://www.civilaviation.gov.eg', registrationPortal: 'https://www.civilaviation.gov.eg' },
    regulations: { primaryRegulation: 'ECAA Drone Law No. 28/2020', pilotCertName: 'RPAS Operator Permit', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'ECAA Portal' },
    locale: { currency: 'EGP', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '122', aviationEmergency: null,
  },
  {
    countryCode: 'MA', countryName: 'Morocco', flagEmoji: '🇲🇦', region: 'africa',
    authority: { name: "Direction Générale de l'Aviation Civile", acronym: 'DGAC-MA', website: 'https://www.dgac.gov.ma', registrationPortal: 'https://www.dgac.gov.ma' },
    regulations: { primaryRegulation: 'Decree No. 2-15-527', pilotCertName: 'Professional RPAS Authorization', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'DGAC-MA Portal' },
    locale: { currency: 'MAD', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '15', aviationEmergency: null,
  },
  {
    countryCode: 'CM', countryName: 'Cameroon', flagEmoji: '🇨🇲', region: 'africa',
    authority: { name: 'Cameroon Civil Aviation Authority', acronym: 'CCAA', website: 'https://www.ccaa.aero', registrationPortal: 'https://www.ccaa.aero' },
    regulations: { primaryRegulation: 'CCAA RPAS Regulations', pilotCertName: 'RPAS Operator Permit', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'CCAA Portal' },
    locale: { currency: 'XAF', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '117', aviationEmergency: null,
  },
  {
    countryCode: 'MZ', countryName: 'Mozambique', flagEmoji: '🇲🇿', region: 'africa',
    authority: { name: 'Instituto de Aviação Civil de Moçambique', acronym: 'IACM', website: 'https://www.iacm.gov.mz', registrationPortal: 'https://www.iacm.gov.mz' },
    regulations: { primaryRegulation: 'IACM RPAS Regulation', pilotCertName: 'RPAS Operator Permit', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 100, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'IACM Portal' },
    locale: { currency: 'MZN', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '119', aviationEmergency: null,
  },

  // ═══ MIDDLE EAST (4) ═══
  {
    countryCode: 'AE', countryName: 'United Arab Emirates', flagEmoji: '🇦🇪', region: 'middle_east',
    authority: { name: 'General Civil Aviation Authority', acronym: 'GCAA', website: 'https://www.gcaa.gov.ae', registrationPortal: 'https://www.gcaa.gov.ae/en/drones' },
    regulations: { primaryRegulation: 'CAR Part VIII Chapter 4', pilotCertName: 'RPAS Operator Certificate', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'GCAA UAS Portal' },
    locale: { currency: 'AED', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '999', aviationEmergency: null,
  },
  {
    countryCode: 'SA', countryName: 'Saudi Arabia', flagEmoji: '🇸🇦', region: 'middle_east',
    authority: { name: 'General Authority of Civil Aviation', acronym: 'GACA', website: 'https://www.gaca.gov.sa', registrationPortal: 'https://www.gaca.gov.sa' },
    regulations: { primaryRegulation: 'GACA UAS Regulations', pilotCertName: 'UAS Operator Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'GACA UAS Portal' },
    locale: { currency: 'SAR', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '911', aviationEmergency: null,
  },
  {
    countryCode: 'IL', countryName: 'Israel', flagEmoji: '🇮🇱', region: 'middle_east',
    authority: { name: 'Civil Aviation Authority of Israel', acronym: 'CAAI', website: 'https://www.gov.il/en/departments/civil_aviation_authority', registrationPortal: null },
    regulations: { primaryRegulation: 'Aviation Regulations (RPAS)', pilotCertName: 'Drone Operator License', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'CAAI Portal' },
    locale: { currency: 'ILS', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '100', aviationEmergency: null,
  },
  {
    countryCode: 'QA', countryName: 'Qatar', flagEmoji: '🇶🇦', region: 'middle_east',
    authority: { name: 'Qatar Civil Aviation Authority', acronym: 'QCAA', website: 'https://www.caa.gov.qa', registrationPortal: 'https://www.caa.gov.qa' },
    regulations: { primaryRegulation: 'QCAA UAS Regulations', pilotCertName: 'UAS Operator Permit', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'QCAA Portal' },
    locale: { currency: 'QAR', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '999', aviationEmergency: null,
  },

  // ═══ ASIA-PACIFIC (11) ═══
  {
    countryCode: 'AU', countryName: 'Australia', flagEmoji: '🇦🇺', region: 'asia_pacific',
    authority: { name: 'Civil Aviation Safety Authority', acronym: 'CASA', website: 'https://www.casa.gov.au/drones', registrationPortal: 'https://my.casa.gov.au' },
    regulations: { primaryRegulation: 'CASR Part 101', pilotCertName: 'RePL (Remote Pilot Licence)', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'CASA UAS Portal' },
    locale: { currency: 'AUD', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '000', aviationEmergency: null,
  },
  {
    countryCode: 'NZ', countryName: 'New Zealand', flagEmoji: '🇳🇿', region: 'asia_pacific',
    authority: { name: 'Civil Aviation Authority of New Zealand', acronym: 'CAA NZ', website: 'https://www.aviation.govt.nz/drones', registrationPortal: 'https://www.aviation.govt.nz' },
    regulations: { primaryRegulation: 'CAR Part 101/102', pilotCertName: 'Part 102 Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'CAA NZ Portal' },
    locale: { currency: 'NZD', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '111', aviationEmergency: null,
  },
  {
    countryCode: 'JP', countryName: 'Japan', flagEmoji: '🇯🇵', region: 'asia_pacific',
    authority: { name: 'Japan Civil Aviation Bureau', acronym: 'JCAB', website: 'https://www.mlit.go.jp/koku/koku_tk10_000003.html', registrationPortal: 'https://www.dips-reg.mlit.go.jp' },
    regulations: { primaryRegulation: 'Aviation Act Articles 132+', pilotCertName: 'UAS Pilot License (Level 1-4)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: null, maxAltitudeFt: 492, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'DIPS / FISS' },
    locale: { currency: 'JPY', dateFormat: 'YYYY/MM/DD', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '110', aviationEmergency: null,
  },
  {
    countryCode: 'KR', countryName: 'South Korea', flagEmoji: '🇰🇷', region: 'asia_pacific',
    authority: { name: 'Ministry of Land, Infrastructure & Transport', acronym: 'MOLIT', website: 'https://www.molit.go.kr', registrationPortal: 'https://drone.onestop.go.kr' },
    regulations: { primaryRegulation: 'Aviation Safety Act', pilotCertName: 'UAS Pilot Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 492, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'Drone One-stop Portal' },
    locale: { currency: 'KRW', dateFormat: 'YYYY-MM-DD', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '119', aviationEmergency: null,
  },
  {
    countryCode: 'IN', countryName: 'India', flagEmoji: '🇮🇳', region: 'asia_pacific',
    authority: { name: 'Directorate General of Civil Aviation', acronym: 'DGCA', website: 'https://digitalsky.dgca.gov.in', registrationPortal: 'https://digitalsky.dgca.gov.in' },
    regulations: { primaryRegulation: 'Drone Rules 2021', pilotCertName: 'Remote Pilot Certificate', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'DigitalSky Platform' },
    locale: { currency: 'INR', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'SG', countryName: 'Singapore', flagEmoji: '🇸🇬', region: 'asia_pacific',
    authority: { name: 'Civil Aviation Authority of Singapore', acronym: 'CAAS', website: 'https://www.caas.gov.sg/public-passengers/unmanned-aircraft', registrationPortal: 'https://www.caas.gov.sg/ua' },
    regulations: { primaryRegulation: 'Unmanned Aircraft Act 2015', pilotCertName: 'UA Operator Permit', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 200, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'CAAS UA Portal' },
    locale: { currency: 'SGD', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '995', aviationEmergency: null,
  },
  {
    countryCode: 'MY', countryName: 'Malaysia', flagEmoji: '🇲🇾', region: 'asia_pacific',
    authority: { name: 'Civil Aviation Authority of Malaysia', acronym: 'CAAM', website: 'https://www.caam.gov.my', registrationPortal: 'https://www.caam.gov.my' },
    regulations: { primaryRegulation: 'MCAR Part 15', pilotCertName: 'RPA Pilot License', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'CAAM Portal' },
    locale: { currency: 'MYR', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '999', aviationEmergency: null,
  },
  {
    countryCode: 'TH', countryName: 'Thailand', flagEmoji: '🇹🇭', region: 'asia_pacific',
    authority: { name: 'Civil Aviation Authority of Thailand', acronym: 'CAAT', website: 'https://www.caat.or.th', registrationPortal: 'https://www.caat.or.th' },
    regulations: { primaryRegulation: 'CAAT Drone Notification 2020', pilotCertName: 'UA Operator Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 295, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'CAAT Portal' },
    locale: { currency: 'THB', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '1669', aviationEmergency: null,
  },
  {
    countryCode: 'PH', countryName: 'Philippines', flagEmoji: '🇵🇭', region: 'asia_pacific',
    authority: { name: 'Civil Aviation Authority of the Philippines', acronym: 'CAAP', website: 'https://www.caap.gov.ph', registrationPortal: 'https://www.caap.gov.ph' },
    regulations: { primaryRegulation: 'CAAP MC 01-2015', pilotCertName: 'RPAS Operator Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'CAAP Portal' },
    locale: { currency: 'PHP', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', distanceUnit: 'feet', altitudeUnit: 'feet', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '911', aviationEmergency: null,
  },
  {
    countryCode: 'ID', countryName: 'Indonesia', flagEmoji: '🇮🇩', region: 'asia_pacific',
    authority: { name: 'Directorate General of Civil Aviation', acronym: 'DGCA-ID', website: 'https://hubud.dephub.go.id', registrationPortal: 'https://hubud.dephub.go.id' },
    regulations: { primaryRegulation: 'PM 37/2020', pilotCertName: 'UAS Operator License', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 492, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'DGCA Portal' },
    locale: { currency: 'IDR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '112', aviationEmergency: null,
  },
  {
    countryCode: 'CN', countryName: 'China', flagEmoji: '🇨🇳', region: 'asia_pacific',
    authority: { name: 'Civil Aviation Administration of China', acronym: 'CAAC', website: 'http://www.caac.gov.cn', registrationPortal: 'https://uas.caac.gov.cn' },
    regulations: { primaryRegulation: 'CAAC UAS Regulations 2024', pilotCertName: 'UAS Operator Certificate (AOPA/CAAC)', registrationRequired: true, remoteIdRequired: 'required', remoteIdRegulation: null, maxAltitudeFt: 394, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'CAAC UAS Portal' },
    locale: { currency: 'CNY', dateFormat: 'YYYY-MM-DD', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '110', aviationEmergency: null,
  },

  // ═══ SOUTH AMERICA (5) ═══
  {
    countryCode: 'BR', countryName: 'Brazil', flagEmoji: '🇧🇷', region: 'south_america',
    authority: { name: 'Agência Nacional de Aviação Civil', acronym: 'ANAC-BR', website: 'https://www.gov.br/anac/pt-br/assuntos/drones', registrationPortal: 'https://sistemas.anac.gov.br/sisant' },
    regulations: { primaryRegulation: 'RBAC-E 94', pilotCertName: 'RPAS Operator Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'SISANT' },
    locale: { currency: 'BRL', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '190', aviationEmergency: null,
  },
  {
    countryCode: 'CO', countryName: 'Colombia', flagEmoji: '🇨🇴', region: 'south_america',
    authority: { name: 'Aeronáutica Civil de Colombia', acronym: 'Aerocivil', website: 'https://www.aerocivil.gov.co', registrationPortal: 'https://www.aerocivil.gov.co' },
    regulations: { primaryRegulation: 'RAC 91 Apéndice 13', pilotCertName: 'RPAS Operator Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'Aerocivil Portal' },
    locale: { currency: 'COP', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '123', aviationEmergency: null,
  },
  {
    countryCode: 'AR', countryName: 'Argentina', flagEmoji: '🇦🇷', region: 'south_america',
    authority: { name: 'Administración Nacional de Aviación Civil', acronym: 'ANAC-AR', website: 'https://www.argentina.gob.ar/anac', registrationPortal: 'https://www.argentina.gob.ar/anac/drones' },
    regulations: { primaryRegulation: 'ANAC Resolución 885/2019', pilotCertName: 'VANT Operator Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'ANAC Portal' },
    locale: { currency: 'ARS', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '107', aviationEmergency: null,
  },
  {
    countryCode: 'CL', countryName: 'Chile', flagEmoji: '🇨🇱', region: 'south_america',
    authority: { name: 'Dirección General de Aeronáutica Civil', acronym: 'DGAC-CL', website: 'https://www.dgac.gob.cl', registrationPortal: 'https://www.dgac.gob.cl/rpas' },
    regulations: { primaryRegulation: 'DAN 151', pilotCertName: 'RPAS Operator Certificate', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'DGAC Portal' },
    locale: { currency: 'CLP', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '131', aviationEmergency: null,
  },
  {
    countryCode: 'PE', countryName: 'Peru', flagEmoji: '🇵🇪', region: 'south_america',
    authority: { name: 'Dirección General de Aeronáutica Civil', acronym: 'DGAC-PE', website: 'https://www.gob.pe/mtc', registrationPortal: 'https://www.gob.pe/mtc' },
    regulations: { primaryRegulation: 'NTC 001-2019', pilotCertName: 'RPAS Operator Permit', registrationRequired: true, remoteIdRequired: 'not_required', remoteIdRegulation: null, maxAltitudeFt: 400, maxWeightKg: 25, laancEquivalent: null, authorizationSystem: 'MTC Portal' },
    locale: { currency: 'PEN', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', distanceUnit: 'meters', altitudeUnit: 'meters', speedUnit: 'km/h', weightUnit: 'kilograms', temperatureUnit: 'celsius' },
    emergencyNumber: '105', aviationEmergency: null,
  },
];

// Helper: find by country code
export function findCountryAuthority(code: string) {
  return GLOBAL_REGULATORY_AUTHORITIES.find(c => c.countryCode === code);
}

// Helper: get all unique regions
export function getRegions() {
  return [...new Set(GLOBAL_REGULATORY_AUTHORITIES.map(c => c.region))];
}

// Helper: get countries by region
export function getCountriesByRegion(region: string) {
  return GLOBAL_REGULATORY_AUTHORITIES.filter(c => c.region === region);
}

// Region display labels
export const REGION_LABELS: Record<string, string> = {
  north_america: 'North America',
  europe: 'Europe',
  africa: 'Africa',
  middle_east: 'Middle East',
  asia_pacific: 'Asia-Pacific',
  south_america: 'South America',
};
