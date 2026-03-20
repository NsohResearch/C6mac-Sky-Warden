import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, FileText, Plane, ClipboardList, CheckCircle, ArrowRight,
  ArrowLeft, Upload, AlertTriangle, Shield, MapPin, Clock,
  ChevronDown, Globe, Phone, Mail, Building2, ExternalLink,
  Crosshair, Loader2, Info,
} from 'lucide-react';
import { clsx } from 'clsx';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

// ============================================================
// 55-COUNTRY REGULATORY AUTHORITY DATABASE
// Auto-populated based on geolocation, user can override
// ============================================================
interface CountryEntry {
  code: string;
  name: string;
  flag: string;
  region: string;
  authority: string;
  authorityAcronym: string;
  website: string;
  registrationPortal: string;
  pilotCertName: string;
  primaryRegulation: string;
  registrationRequired: boolean;
  remoteIdRequired: boolean;
  maxAltitudeFt: number;
  currency: string;
  dateFormat: string;
  altitudeUnit: string;
  speedUnit: string;
  emergencyNumber: string;
}

const REGULATORY_COUNTRIES: CountryEntry[] = [
  // North America
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America', authority: 'Federal Aviation Administration', authorityAcronym: 'FAA', website: 'https://www.faa.gov/uas', registrationPortal: 'https://faadronezone.faa.gov', pilotCertName: 'Remote Pilot Certificate (Part 107)', primaryRegulation: '14 CFR Part 107', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 400, currency: 'USD', dateFormat: 'MM/DD/YYYY', altitudeUnit: 'feet', speedUnit: 'mph', emergencyNumber: '911' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America', authority: 'Transport Canada Civil Aviation', authorityAcronym: 'TCCA', website: 'https://tc.canada.ca/en/aviation/drone-safety', registrationPortal: 'https://tc.canada.ca/en/aviation/drone-safety/register-your-drone', pilotCertName: 'RPAS Pilot Certificate (Advanced)', primaryRegulation: 'CARs Part IX', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 400, currency: 'CAD', dateFormat: 'YYYY-MM-DD', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '911' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'North America', authority: 'Agencia Federal de Aviación Civil', authorityAcronym: 'AFAC', website: 'https://www.gob.mx/afac', registrationPortal: 'https://www.gob.mx/afac', pilotCertName: 'RPAS Operator License', primaryRegulation: 'CO AV-23/10 R4', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'MXN', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '911' },
  // Europe
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', authority: 'Civil Aviation Authority', authorityAcronym: 'CAA', website: 'https://www.caa.co.uk/drones', registrationPortal: 'https://register-drones.caa.co.uk', pilotCertName: 'Flyer ID + Operator ID', primaryRegulation: 'UK UAS Regulation', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 400, currency: 'GBP', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'mph', emergencyNumber: '999' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe', authority: 'Direction Générale de l\'Aviation Civile', authorityAcronym: 'DGAC', website: 'https://www.ecologie.gouv.fr/drones', registrationPortal: 'https://alphatango.aviation-civile.gouv.fr', pilotCertName: 'Open Category Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'EUR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe', authority: 'Luftfahrt-Bundesamt', authorityAcronym: 'LBA', website: 'https://www.lba.de/EN/Drones', registrationPortal: 'https://uas-registration.lba-openuav.de', pilotCertName: 'EU Remote Pilot Certificate (A2)', primaryRegulation: 'EU 2019/947 + LuftVO', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'EUR', dateFormat: 'DD.MM.YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'Europe', authority: 'Agencia Estatal de Seguridad Aérea', authorityAcronym: 'AESA', website: 'https://www.seguridadaerea.gob.es/en/drones', registrationPortal: 'https://www.seguridadaerea.gob.es', pilotCertName: 'AESA Pilot Certificate', primaryRegulation: 'EU 2019/947 + RD 517/2024', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'EUR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe', authority: 'Ente Nazionale per l\'Aviazione Civile', authorityAcronym: 'ENAC', website: 'https://www.enac.gov.it/en/drones', registrationPortal: 'https://www.d-flight.it', pilotCertName: 'ENAC UAS Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'EUR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe', authority: 'Inspectie Leefomgeving en Transport', authorityAcronym: 'ILT', website: 'https://www.ilent.nl/onderwerpen/drones', registrationPortal: 'https://www.registreer-uw-drone.nl', pilotCertName: 'EU Remote Pilot Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'EUR', dateFormat: 'DD-MM-YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', region: 'Europe', authority: 'Transportstyrelsen', authorityAcronym: 'TS', website: 'https://www.transportstyrelsen.se/en/aviation/drones', registrationPortal: 'https://www.transportstyrelsen.se', pilotCertName: 'Swedish Drone Pilot Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'SEK', dateFormat: 'YYYY-MM-DD', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', region: 'Europe', authority: 'Luftfartstilsynet', authorityAcronym: 'CAA Norway', website: 'https://luftfartstilsynet.no/en/drones', registrationPortal: 'https://luftfartstilsynet.no/en/drones', pilotCertName: 'Norwegian Drone Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'NOK', dateFormat: 'DD.MM.YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'Europe', authority: 'Federal Office of Civil Aviation', authorityAcronym: 'FOCA', website: 'https://www.bazl.admin.ch/bazl/en/home/drones', registrationPortal: 'https://www.bazl.admin.ch', pilotCertName: 'FOCA Drone Certificate', primaryRegulation: 'EU 2019/947 (adopted)', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'CHF', dateFormat: 'DD.MM.YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', region: 'Europe', authority: 'Irish Aviation Authority', authorityAcronym: 'IAA', website: 'https://www.iaa.ie/general-aviation/drones', registrationPortal: 'https://www.iaa.ie/general-aviation/drones', pilotCertName: 'IAA Drone Pilot Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'EUR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', region: 'Europe', authority: 'Urząd Lotnictwa Cywilnego', authorityAcronym: 'ULC', website: 'https://www.ulc.gov.pl/en/drones', registrationPortal: 'https://drony.ulc.gov.pl', pilotCertName: 'ULC Drone Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'PLN', dateFormat: 'DD.MM.YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', region: 'Europe', authority: 'Austro Control', authorityAcronym: 'ACG', website: 'https://www.austrocontrol.at/en/drones', registrationPortal: 'https://www.dronespace.at', pilotCertName: 'Austro Control Drone Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'EUR', dateFormat: 'DD.MM.YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', region: 'Europe', authority: 'Autoridade Nacional da Aviação Civil', authorityAcronym: 'ANAC', website: 'https://www.anac.pt/vPT/Generico/Drones', registrationPortal: 'https://www.anac.pt', pilotCertName: 'ANAC Drone Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'EUR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', region: 'Europe', authority: 'Direction Générale Transport Aérien', authorityAcronym: 'DGTA', website: 'https://mobilit.belgium.be/en/air/drones', registrationPortal: 'https://mobilit.belgium.be', pilotCertName: 'Belgian Drone Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'EUR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', region: 'Europe', authority: 'Danish Transport Authority', authorityAcronym: 'DTA', website: 'https://www.trafikstyrelsen.dk/en/drones', registrationPortal: 'https://www.trafikstyrelsen.dk', pilotCertName: 'Danish Drone Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'DKK', dateFormat: 'DD-MM-YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', region: 'Europe', authority: 'Finnish Transport & Communications Agency', authorityAcronym: 'Traficom', website: 'https://www.traficom.fi/en/transport/aviation/drones', registrationPortal: 'https://www.droneinfo.fi', pilotCertName: 'Traficom Drone Certificate', primaryRegulation: 'EU 2019/947', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'EUR', dateFormat: 'DD.MM.YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  // Africa
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'Africa', authority: 'Nigerian Civil Aviation Authority', authorityAcronym: 'NCAA', website: 'https://ncaa.gov.ng', registrationPortal: 'https://ncaa.gov.ng/rpas', pilotCertName: 'RPAS Operator Certificate (ROC)', primaryRegulation: 'Nig.CARs Part 21', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'NGN', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'Africa', authority: 'Kenya Civil Aviation Authority', authorityAcronym: 'KCAA', website: 'https://www.kcaa.or.ke', registrationPortal: 'https://www.kcaa.or.ke/rpas', pilotCertName: 'Remote Pilot License (RPL)', primaryRegulation: 'Civil Aviation (RPAS) Regulations 2020', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'KES', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '999' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa', authority: 'South African Civil Aviation Authority', authorityAcronym: 'SACAA', website: 'https://www.caa.co.za', registrationPortal: 'https://www.caa.co.za/rpas', pilotCertName: 'Remote Pilot License (RPL)', primaryRegulation: 'SACAA RPAS Regulations Part 101', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'ZAR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '10111' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', region: 'Africa', authority: 'Ghana Civil Aviation Authority', authorityAcronym: 'GCAA', website: 'https://www.gcaa.com.gh', registrationPortal: 'https://www.gcaa.com.gh', pilotCertName: 'RPAS Operator Certificate', primaryRegulation: 'GCAA RPAS Directives', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'GHS', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', region: 'Africa', authority: 'Rwanda Civil Aviation Authority', authorityAcronym: 'RCAA', website: 'https://www.caa.gov.rw', registrationPortal: 'https://www.caa.gov.rw', pilotCertName: 'RPAS Operator License', primaryRegulation: 'RCAA Drone Regulations 2021', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'RWF', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', region: 'Africa', authority: 'Tanzania Civil Aviation Authority', authorityAcronym: 'TCAA', website: 'https://www.tcaa.go.tz', registrationPortal: 'https://www.tcaa.go.tz', pilotCertName: 'RPAS Permit', primaryRegulation: 'TCAA RPAS Regulations 2020', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'TZS', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', region: 'Africa', authority: 'Uganda Civil Aviation Authority', authorityAcronym: 'UCAA', website: 'https://www.caa.go.ug', registrationPortal: 'https://www.caa.go.ug', pilotCertName: 'RPAS Operator Certificate', primaryRegulation: 'UCAA RPAS Regulations 2021', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'UGX', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '999' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', region: 'Africa', authority: 'Ethiopian Civil Aviation Authority', authorityAcronym: 'ECAA', website: 'https://www.ecaa.gov.et', registrationPortal: 'https://www.ecaa.gov.et', pilotCertName: 'RPAS Operator License', primaryRegulation: 'ECAA RPAS Directive', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'ETB', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '911' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', region: 'Africa', authority: 'Agence Nationale de l\'Aviation Civile', authorityAcronym: 'ANACIM', website: 'https://www.anacim.sn', registrationPortal: 'https://www.anacim.sn', pilotCertName: 'RPAS Operator Authorization', primaryRegulation: 'ANACIM Drone Regulations', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'XOF', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '17' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', region: 'Africa', authority: "Autorité Nationale de l'Aviation Civile", authorityAcronym: 'ANAC-CI', website: 'https://www.anac.ci', registrationPortal: 'https://www.anac.ci', pilotCertName: 'RPAS Authorization', primaryRegulation: 'ANAC Drone Regulations', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'XOF', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '110' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'Africa', authority: 'Egyptian Civil Aviation Authority', authorityAcronym: 'ECAA', website: 'https://www.civilaviation.gov.eg', registrationPortal: 'https://www.civilaviation.gov.eg', pilotCertName: 'RPAS Operator Permit', primaryRegulation: 'ECAA Drone Law No. 28/2020', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'EGP', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '122' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', region: 'Africa', authority: 'Direction Générale de l\'Aviation Civile', authorityAcronym: 'DGAC-MA', website: 'https://www.dgac.gov.ma', registrationPortal: 'https://www.dgac.gov.ma', pilotCertName: 'Professional RPAS Authorization', primaryRegulation: 'Decree No. 2-15-527', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'MAD', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '15' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲', region: 'Africa', authority: 'Cameroon Civil Aviation Authority', authorityAcronym: 'CCAA', website: 'https://www.ccaa.aero', registrationPortal: 'https://www.ccaa.aero', pilotCertName: 'RPAS Operator Permit', primaryRegulation: 'CCAA RPAS Regulations', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'XAF', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '117' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿', region: 'Africa', authority: 'Instituto de Aviação Civil de Moçambique', authorityAcronym: 'IACM', website: 'https://www.iacm.gov.mz', registrationPortal: 'https://www.iacm.gov.mz', pilotCertName: 'RPAS Operator Permit', primaryRegulation: 'IACM RPAS Regulation', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 100, currency: 'MZN', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '119' },
  // Middle East
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Middle East', authority: 'General Civil Aviation Authority', authorityAcronym: 'GCAA', website: 'https://www.gcaa.gov.ae', registrationPortal: 'https://www.gcaa.gov.ae/en/drones', pilotCertName: 'RPAS Operator Certificate', primaryRegulation: 'CAR Part VIII Chapter 4', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 400, currency: 'AED', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '999' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'Middle East', authority: 'General Authority of Civil Aviation', authorityAcronym: 'GACA', website: 'https://www.gaca.gov.sa', registrationPortal: 'https://www.gaca.gov.sa', pilotCertName: 'UAS Operator Certificate', primaryRegulation: 'GACA UAS Regulations', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'SAR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '911' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', region: 'Middle East', authority: 'Civil Aviation Authority of Israel', authorityAcronym: 'CAAI', website: 'https://www.gov.il/en/departments/civil_aviation_authority', registrationPortal: 'https://www.gov.il/en/departments/civil_aviation_authority', pilotCertName: 'Drone Operator License', primaryRegulation: 'Aviation Regulations (RPAS)', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'ILS', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '100' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', region: 'Middle East', authority: 'Qatar Civil Aviation Authority', authorityAcronym: 'QCAA', website: 'https://www.caa.gov.qa', registrationPortal: 'https://www.caa.gov.qa', pilotCertName: 'UAS Operator Permit', primaryRegulation: 'QCAA UAS Regulations', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'QAR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '999' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', region: 'Middle East', authority: 'Public Authority for Civil Aviation', authorityAcronym: 'PACA', website: 'https://www.paca.gov.om', registrationPortal: 'https://www.paca.gov.om', pilotCertName: 'UAS Operator Permit', primaryRegulation: 'PACA UAS Regulations', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'OMR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '9999' },
  // Asia-Pacific
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Asia-Pacific', authority: 'Civil Aviation Safety Authority', authorityAcronym: 'CASA', website: 'https://www.casa.gov.au/drones', registrationPortal: 'https://my.casa.gov.au', pilotCertName: 'RePL (Remote Pilot Licence)', primaryRegulation: 'CASR Part 101', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'AUD', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '000' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Asia-Pacific', authority: 'Civil Aviation Authority of New Zealand', authorityAcronym: 'CAA NZ', website: 'https://www.aviation.govt.nz/drones', registrationPortal: 'https://www.aviation.govt.nz', pilotCertName: 'Part 102 Certificate', primaryRegulation: 'CAR Part 101/102', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'NZD', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '111' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia-Pacific', authority: 'Japan Civil Aviation Bureau', authorityAcronym: 'JCAB', website: 'https://www.mlit.go.jp/koku/koku_tk10_000003.html', registrationPortal: 'https://www.dips-reg.mlit.go.jp', pilotCertName: 'UAS Pilot License (Level 1-4)', primaryRegulation: 'Aviation Act Articles 132+', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 492, currency: 'JPY', dateFormat: 'YYYY/MM/DD', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '110' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia-Pacific', authority: 'Ministry of Land, Infrastructure & Transport', authorityAcronym: 'MOLIT', website: 'https://www.molit.go.kr', registrationPortal: 'https://drone.onestop.go.kr', pilotCertName: 'UAS Pilot Certificate', primaryRegulation: 'Aviation Safety Act', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 492, currency: 'KRW', dateFormat: 'YYYY-MM-DD', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '119' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia-Pacific', authority: 'Directorate General of Civil Aviation', authorityAcronym: 'DGCA', website: 'https://digitalsky.dgca.gov.in', registrationPortal: 'https://digitalsky.dgca.gov.in', pilotCertName: 'Remote Pilot Certificate', primaryRegulation: 'Drone Rules 2021', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 400, currency: 'INR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia-Pacific', authority: 'Civil Aviation Authority of Singapore', authorityAcronym: 'CAAS', website: 'https://www.caas.gov.sg/public-passengers/unmanned-aircraft', registrationPortal: 'https://www.caas.gov.sg/ua', pilotCertName: 'UA Operator Permit', primaryRegulation: 'Unmanned Aircraft Act 2015', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 200, currency: 'SGD', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '995' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Asia-Pacific', authority: 'Civil Aviation Authority of Malaysia', authorityAcronym: 'CAAM', website: 'https://www.caam.gov.my', registrationPortal: 'https://www.caam.gov.my', pilotCertName: 'RPA Pilot License', primaryRegulation: 'MCAR Part 15', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'MYR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '999' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia-Pacific', authority: 'Civil Aviation Authority of Thailand', authorityAcronym: 'CAAT', website: 'https://www.caat.or.th', registrationPortal: 'https://www.caat.or.th', pilotCertName: 'UA Operator Certificate', primaryRegulation: 'CAAT Drone Notification 2020', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 295, currency: 'THB', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '1669' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'Asia-Pacific', authority: 'Civil Aviation Authority of the Philippines', authorityAcronym: 'CAAP', website: 'https://www.caap.gov.ph', registrationPortal: 'https://www.caap.gov.ph', pilotCertName: 'RPAS Operator Certificate', primaryRegulation: 'CAAP MC 01-2015', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'PHP', dateFormat: 'MM/DD/YYYY', altitudeUnit: 'feet', speedUnit: 'kph', emergencyNumber: '911' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Asia-Pacific', authority: 'Directorate General of Civil Aviation', authorityAcronym: 'DGCA-ID', website: 'https://hubud.dephub.go.id', registrationPortal: 'https://hubud.dephub.go.id', pilotCertName: 'UAS Operator License', primaryRegulation: 'PM 37/2020', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 492, currency: 'IDR', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '112' },
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia-Pacific', authority: 'Civil Aviation Administration of China', authorityAcronym: 'CAAC', website: 'http://www.caac.gov.cn', registrationPortal: 'https://uas.caac.gov.cn', pilotCertName: 'UAS Operator Certificate (AOPA/CAAC)', primaryRegulation: 'CAAC UAS Regulations 2024', registrationRequired: true, remoteIdRequired: true, maxAltitudeFt: 394, currency: 'CNY', dateFormat: 'YYYY-MM-DD', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '110' },
  // South America
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'South America', authority: 'Agência Nacional de Aviação Civil', authorityAcronym: 'ANAC-BR', website: 'https://www.gov.br/anac/pt-br/assuntos/drones', registrationPortal: 'https://sistemas.anac.gov.br/sisant', pilotCertName: 'RPAS Operator Certificate', primaryRegulation: 'RBAC-E 94', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'BRL', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '190' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', region: 'South America', authority: 'Aeronáutica Civil de Colombia', authorityAcronym: 'Aerocivil', website: 'https://www.aerocivil.gov.co', registrationPortal: 'https://www.aerocivil.gov.co', pilotCertName: 'RPAS Operator Certificate', primaryRegulation: 'RAC 91 Apéndice 13', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'COP', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '123' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'South America', authority: 'Administración Nacional de Aviación Civil', authorityAcronym: 'ANAC-AR', website: 'https://www.argentina.gob.ar/anac', registrationPortal: 'https://www.argentina.gob.ar/anac/drones', pilotCertName: 'VANT Operator Certificate', primaryRegulation: 'ANAC Resolución 885/2019', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'ARS', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '107' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'South America', authority: 'Dirección General de Aeronáutica Civil', authorityAcronym: 'DGAC-CL', website: 'https://www.dgac.gob.cl', registrationPortal: 'https://www.dgac.gob.cl/rpas', pilotCertName: 'RPAS Operator Certificate', primaryRegulation: 'DAN 151', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'CLP', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '131' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', region: 'South America', authority: 'Dirección General de Aeronáutica Civil', authorityAcronym: 'DGAC-PE', website: 'https://www.gob.pe/mtc', registrationPortal: 'https://www.gob.pe/mtc', pilotCertName: 'RPAS Operator Permit', primaryRegulation: 'NTC 001-2019', registrationRequired: true, remoteIdRequired: false, maxAltitudeFt: 400, currency: 'PEN', dateFormat: 'DD/MM/YYYY', altitudeUnit: 'meters', speedUnit: 'kph', emergencyNumber: '105' },
];

// Group countries by region for dropdown optgroups
const regions = [...new Set(REGULATORY_COUNTRIES.map(c => c.region))];

// Registration fees mapped to country (representative fees)
const registrationFees: Record<string, { amount: string; currency: string; govShare: string; platformShare: string }> = {
  US: { amount: '$5.00', currency: 'USD', govShare: '$3.50', platformShare: '$1.50' },
  CA: { amount: 'CA$10.00', currency: 'CAD', govShare: 'CA$7.00', platformShare: 'CA$3.00' },
  GB: { amount: '£9.00', currency: 'GBP', govShare: '£6.30', platformShare: '£2.70' },
  FR: { amount: '€30.00', currency: 'EUR', govShare: '€21.00', platformShare: '€9.00' },
  DE: { amount: '€30.00', currency: 'EUR', govShare: '€21.00', platformShare: '€9.00' },
  NG: { amount: '₦75,000', currency: 'NGN', govShare: '₦52,500', platformShare: '₦22,500' },
  KE: { amount: 'KSh 65,000', currency: 'KES', govShare: 'KSh 45,500', platformShare: 'KSh 19,500' },
  ZA: { amount: 'R900.00', currency: 'ZAR', govShare: 'R630.00', platformShare: 'R270.00' },
  GH: { amount: 'GH₵350.00', currency: 'GHS', govShare: 'GH₵245.00', platformShare: 'GH₵105.00' },
  RW: { amount: 'RWF 5,000', currency: 'RWF', govShare: 'RWF 3,500', platformShare: 'RWF 1,500' },
  AE: { amount: 'AED 100', currency: 'AED', govShare: 'AED 70', platformShare: 'AED 30' },
  AU: { amount: 'A$20.00', currency: 'AUD', govShare: 'A$14.00', platformShare: 'A$6.00' },
  JP: { amount: '¥1,500', currency: 'JPY', govShare: '¥1,050', platformShare: '¥450' },
  IN: { amount: '₹100', currency: 'INR', govShare: '₹70', platformShare: '₹30' },
  BR: { amount: 'R$55.00', currency: 'BRL', govShare: 'R$38.50', platformShare: 'R$16.50' },
  CN: { amount: '¥50.00', currency: 'CNY', govShare: '¥35.00', platformShare: '¥15.00' },
};

const defaultFee = { amount: '$10.00', currency: 'USD', govShare: '$7.00', platformShare: '$3.00' };

const manufacturers = ['DJI', 'Autel', 'Skydio', 'Parrot', 'Custom'];

const modelsByManufacturer: Record<string, string[]> = {
  DJI: ['Mavic 3 Enterprise', 'Mavic 3T Thermal', 'Matrice 350 RTK', 'Mini 4 Pro', 'Phantom 4 RTK'],
  Autel: ['EVO II Pro V3', 'EVO Max 4T', 'EVO Lite+', 'Dragonfish'],
  Skydio: ['X10', 'X2E', 'S2+'],
  Parrot: ['ANAFI Ai', 'ANAFI USA', 'ANAFI Thermal'],
  Custom: ['Custom Build'],
};

const weightCategories = [
  { value: 'micro', label: 'Micro (<250g)', description: 'No Remote ID required in some jurisdictions' },
  { value: 'small', label: 'Small (250g–25kg)', description: 'Standard registration required' },
  { value: 'medium', label: 'Medium (25–150kg)', description: 'Enhanced registration + inspection' },
  { value: 'large', label: 'Large (>150kg)', description: 'Special certification required' },
];

const registrationFees: Record<Country, { amount: string; currency: string; govShare: string; platformShare: string; authority: string }> = {
  US: { amount: '$5.00', currency: 'USD', govShare: '$3.50', platformShare: '$1.50', authority: 'FAA' },
  CA: { amount: 'CA$10.00', currency: 'CAD', govShare: 'CA$7.00', platformShare: 'CA$3.00', authority: 'Transport Canada' },
  NG: { amount: '\u{20A6}75,000', currency: 'NGN', govShare: '\u{20A6}52,500', platformShare: '\u{20A6}22,500', authority: 'NCAA' },
  KE: { amount: 'KSh 65,000', currency: 'KES', govShare: 'KSh 45,500', platformShare: 'KSh 19,500', authority: 'KCAA' },
  OTHER: { amount: '$10.00', currency: 'USD', govShare: '$7.00', platformShare: '$3.00', authority: 'Local Authority' },
};

const exampleWaypoints = [
  { type: 'Takeoff', name: 'Home Base', lat: '34.0522', lng: '-118.2437', alt: '0', icon: '\u{1F6EB}' },
  { type: 'Waypoint', name: 'WP1', lat: '34.0530', lng: '-118.2420', alt: '200', icon: '\u{1F4CD}' },
  { type: 'Waypoint', name: 'WP2', lat: '34.0545', lng: '-118.2400', alt: '300', icon: '\u{1F4CD}' },
  { type: 'Landing', name: 'Home Base', lat: '34.0522', lng: '-118.2437', alt: '0', icon: '\u{1F6EC}' },
];

const stepsMeta = [
  { label: 'Profile Setup', icon: User },
  { label: 'Pilot Certification', icon: FileText },
  { label: 'Drone Registration', icon: Plane },
  { label: 'File First Flight Plan', icon: ClipboardList },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>(1);

  // Step 1 state — country with geolocation
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [geoDetecting, setGeoDetecting] = useState(false);
  const [geoDetected, setGeoDetected] = useState(false);
  const [geoCountryName, setGeoCountryName] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('individual_pilot');

  // Geolocation on mount — detect user's country and auto-populate
  useEffect(() => {
    const detectCountry = async () => {
      setGeoDetecting(true);
      try {
        // Use IP-based geolocation (no permission required)
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          const countryCode = data.country_code;
          const match = REGULATORY_COUNTRIES.find(c => c.code === countryCode);
          if (match) {
            setSelectedCountry(match.code);
            setGeoCountryName(match.name);
            setGeoDetected(true);
          }
        }
      } catch {
        // Silently fail — user can select manually
      } finally {
        setGeoDetecting(false);
      }
    };
    detectCountry();
  }, []);

  // Step 2 state
  const [certVerified, setCertVerified] = useState(false);
  const [certSkipped, setCertSkipped] = useState(false);

  // Step 3 state
  const [selectedManufacturer, setSelectedManufacturer] = useState('DJI');
  const [selectedModel, setSelectedModel] = useState('Mavic 3 Enterprise');
  const [selectedWeight, setSelectedWeight] = useState('small');
  const [droneRegistered, setDroneRegistered] = useState(false);
  const [generatedDDID, setGeneratedDDID] = useState('');

  // Step 4 state
  const [flightPlanFiled, setFlightPlanFiled] = useState(false);
  const [flightPlanSkipped, setFlightPlanSkipped] = useState(false);
  const [commLostAction, setCommLostAction] = useState('return_home');

  const countryObj = REGULATORY_COUNTRIES.find((c) => c.code === selectedCountry) ?? REGULATORY_COUNTRIES[0];
  const fee = registrationFees[selectedCountry] ?? defaultFee;

  const handleVerifyCert = () => {
    setCertVerified(true);
    setCertSkipped(false);
  };

  const handleSkipCert = () => {
    setCertSkipped(true);
    setCertVerified(false);
  };

  const handleRegisterDrone = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
    const prefix = selectedCountry;
    setGeneratedDDID(`SKW-${prefix}-${id}`);
    setDroneRegistered(true);
  };

  const handleFileFlightPlan = () => {
    setFlightPlanFiled(true);
  };

  const handleSkipFlightPlan = () => {
    setFlightPlanSkipped(true);
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/dashboard');
  };

  const goNext = () => {
    if (step === 4) {
      setStep(5);
    } else if (step < 4) {
      setStep((step + 1) as OnboardingStep);
    }
  };

  const goBack = () => {
    if (step > 1) setStep((step - 1) as OnboardingStep);
  };

  // Completion screen
  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border bg-white p-8 shadow-lg text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Ready to Fly!</h1>
            <p className="text-sm text-gray-500 mb-6">Your account is set up and you're cleared for operations.</p>

            <div className="space-y-3 text-left mb-6">
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Profile verified</p>
                  <p className="text-xs text-gray-500">{countryObj.flag} {countryObj.name} &middot; {countryObj.authorityAcronym}</p>
                </div>
              </div>

              <div className={clsx(
                'flex items-center gap-3 rounded-lg border p-3',
                certVerified ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
              )}>
                {certVerified ? (
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {certVerified ? 'Pilot certification verified' : 'Pilot certification skipped'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {certVerified ? 'Part 107 #P107-XXXXXXX' : 'Flights will be blocked until verified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Drone registered</p>
                  <p className="text-xs text-gray-500 font-mono">{generatedDDID || 'SKW-US-A7B3X9'}</p>
                </div>
              </div>

              <div className={clsx(
                'flex items-center gap-3 rounded-lg border p-3',
                flightPlanFiled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              )}>
                {flightPlanFiled ? (
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                ) : (
                  <ClipboardList size={18} className="text-gray-400 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {flightPlanFiled ? 'First flight plan filed' : 'Flight plan filing skipped'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {flightPlanFiled ? 'SKW-FP-2026-000001' : 'You can file plans from the dashboard'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors mb-4"
            >
              Enter Dashboard
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-blue-600">
              <button className="hover:underline">Register another drone</button>
              <span className="text-gray-300">|</span>
              <button className="hover:underline">File a flight plan</button>
              <span className="text-gray-300">|</span>
              <button className="hover:underline">Explore airspace map</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Top bar */}
      <div className="flex h-14 items-center gap-3 border-b bg-white px-6 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-xs">
          C6
        </div>
        <span className="font-semibold text-sm text-gray-900">C6macEye</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider ml-1">Onboarding</span>
      </div>

      {/* Progress bar */}
      <div className="border-b bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center">
            {stepsMeta.map((s, i) => {
              const stepNum = (i + 1) as OnboardingStep;
              const isActive = step === stepNum;
              const isDone = step > stepNum;
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex items-center gap-2">
                    <div
                      className={clsx(
                        'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold flex-shrink-0 transition-colors',
                        isDone ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {isDone ? <CheckCircle size={16} /> : <Icon size={16} />}
                    </div>
                    <span className={clsx('text-xs font-medium hidden md:block whitespace-nowrap', isActive ? 'text-gray-900' : isDone ? 'text-green-600' : 'text-gray-400')}>
                      {s.label}
                    </span>
                  </div>
                  {i < stepsMeta.length - 1 && (
                    <div className={clsx('flex-1 h-px mx-3', isDone ? 'bg-green-300' : 'bg-gray-200')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border bg-white p-6 md:p-8 shadow-sm">

            {/* Step 1: Profile Setup */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Profile Setup</h2>
                  <p className="text-sm text-gray-500">Tell us about yourself so we can tailor your experience.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" defaultValue="James Park" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" defaultValue="james.park@company.com" disabled className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="tel" placeholder="+1 555 000 0000" className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Company or organization name" className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  {geoDetecting && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                      <Loader2 size={12} className="animate-spin" />
                      Detecting your location...
                    </div>
                  )}
                  {geoDetected && !geoDetecting && (
                    <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
                      <Crosshair size={12} />
                      Auto-detected: {geoCountryName} — you can change this if registering for a different region
                    </div>
                  )}
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      if (geoDetected && e.target.value !== selectedCountry) {
                        setGeoDetected(false); // User overrode geo
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {regions.map((region) => (
                      <optgroup key={region} label={region}>
                        {REGULATORY_COUNTRIES.filter(c => c.region === region).map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.authorityAcronym})</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    <Info size={10} className="inline mr-1" />
                    Select where you'll operate. Traveling? Choose your destination country to pre-register.
                  </p>
                </div>

                {/* Auto-populated Authority Card */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Regulatory Authority</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Authority:</span>
                      <p className="font-medium text-gray-900">{countryObj.authority}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Acronym:</span>
                      <p className="font-medium text-gray-900">{countryObj.authorityAcronym}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Regulation:</span>
                      <p className="font-medium text-gray-900">{countryObj.primaryRegulation}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Pilot Cert:</span>
                      <p className="font-medium text-gray-900">{countryObj.pilotCertName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Max Altitude:</span>
                      <p className="font-medium text-gray-900">{countryObj.maxAltitudeFt} ft AGL</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Remote ID:</span>
                      <p className={clsx('font-medium', countryObj.remoteIdRequired ? 'text-red-600' : 'text-green-600')}>
                        {countryObj.remoteIdRequired ? 'Required' : 'Not Required'}
                      </p>
                    </div>
                  </div>
                  <a href={countryObj.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2">
                    <ExternalLink size={10} /> Visit {countryObj.authorityAcronym} website
                  </a>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" defaultValue="123 Aviation Blvd, San Francisco, CA 94105" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      { value: 'individual_pilot', label: 'Individual Pilot', desc: 'Personal and recreational use' },
                      { value: 'enterprise_manager', label: 'Enterprise Manager', desc: 'Fleet and team management' },
                      { value: 'agency_representative', label: 'Agency Representative', desc: 'Government or regulatory body' },
                      { value: 'developer', label: 'Developer', desc: 'API access and integration' },
                    ]).map((role) => (
                      <label
                        key={role.value}
                        className={clsx(
                          'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                          selectedRole === role.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        )}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={selectedRole === role.value}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="h-4 w-4 text-blue-600 mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{role.label}</p>
                          <p className="text-xs text-gray-500">{role.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pilot Certification */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Pilot Certification</h2>
                  <p className="text-sm text-gray-500">
                    Verify your pilot credentials for {countryObj.flag} {countryObj.name} ({countryObj.authority}).
                  </p>
                </div>

                {/* Country-specific certification fields */}
                {selectedCountry === 'US' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700 font-medium">FAA Requirements</p>
                      <p className="text-xs text-blue-600 mt-0.5">Part 107 Remote Pilot Certificate + TRUST Completion Certificate</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Part 107 Certificate Number</label>
                        <input type="text" placeholder="e.g. 4376829" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" defaultValue="2028-06-15" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-blue-600" />
                      <span className="text-sm text-gray-700">I have completed the FAA TRUST (The Recreational UAS Safety Test)</span>
                    </label>
                  </div>
                )}

                {selectedCountry === 'CA' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700 font-medium">Transport Canada Requirements</p>
                      <p className="text-xs text-blue-600 mt-0.5">Advanced or Basic RPAS Certificate + Pilot Certificate</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RPAS Certificate Type</label>
                        <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option>Advanced RPAS Certificate</option>
                          <option>Basic RPAS Certificate</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                        <input type="text" placeholder="e.g. PC-RPAS-XXXXXXX" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RPAS Pilot Certificate Number</label>
                        <input type="text" placeholder="Pilot certificate number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedCountry === 'NG' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700 font-medium">NCAA Requirements</p>
                      <p className="text-xs text-blue-600 mt-0.5">Remote Operator Certificate (ROC) + Pilot License</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NCAA ROC Number</label>
                        <input type="text" placeholder="e.g. NCAA-ROC-XXXXXXX" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilot License Number</label>
                        <input type="text" placeholder="Pilot license number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                )}

                {selectedCountry === 'KE' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700 font-medium">KCAA Requirements</p>
                      <p className="text-xs text-blue-600 mt-0.5">KCAA Remote Pilot License</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">KCAA Remote Pilot License Number</label>
                        <input type="text" placeholder="e.g. KCAA-RPL-XXXXXXX" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                )}

                {!['US', 'CA', 'NG', 'KE'].includes(selectedCountry) && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <p className="text-xs text-blue-700 font-medium">{countryObj.flag} {countryObj.name} — {countryObj.authorityAcronym} Requirements</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Provide your {countryObj.pilotCertName} details as required by {countryObj.authority}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{countryObj.pilotCertName} Number</label>
                        <input type="text" placeholder="Certificate/license number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Authority</label>
                        <input type="text" defaultValue={countryObj.authorityAcronym} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm" readOnly />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Regulation Reference</label>
                        <input type="text" defaultValue={countryObj.primaryRegulation} className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm" readOnly />
                      </div>
                    </div>
                    {countryObj.remoteIdRequired && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs text-amber-700 font-medium">⚠️ Remote ID Required in {countryObj.name}</p>
                        <p className="text-xs text-amber-600 mt-0.5">Your drone must have an active Remote ID module to operate in this jurisdiction.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload zone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Certification Documents</label>
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 transition-colors cursor-pointer">
                    <div className="text-center">
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                </div>

                {/* Medical certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical Certificate <span className="text-gray-400 font-normal">(if required)</span>
                  </label>
                  <input type="text" placeholder="Medical certificate number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                {/* Verify / Skip */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleVerifyCert}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                      certVerified
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    {certVerified ? <CheckCircle size={16} /> : <Shield size={16} />}
                    {certVerified ? 'Verified' : 'Verify'}
                  </button>

                  {!certVerified && (
                    <button
                      onClick={handleSkipCert}
                      className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Skip for now
                    </button>
                  )}
                </div>

                {certSkipped && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-500" />
                      <p className="text-xs text-amber-700 font-medium">Warning: Flights will be blocked until certification is verified.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Register Your First Drone */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Register Your First Drone</h2>
                  <p className="text-sm text-gray-500">Register your drone to receive a Digital Drone ID (DDID).</p>
                </div>

                {!droneRegistered ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                        <select
                          value={selectedManufacturer}
                          onChange={(e) => {
                            setSelectedManufacturer(e.target.value);
                            setSelectedModel(modelsByManufacturer[e.target.value]?.[0] ?? '');
                          }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {manufacturers.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {(modelsByManufacturer[selectedManufacturer] ?? []).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                        <input type="text" placeholder="e.g. 1ZNBJ4P00C0092" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remote ID Module Serial</label>
                        <input type="text" placeholder="If applicable" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight Category</label>
                      <div className="space-y-2">
                        {weightCategories.map((wc) => (
                          <label
                            key={wc.value}
                            className={clsx(
                              'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                              selectedWeight === wc.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                            )}
                          >
                            <input
                              type="radio"
                              name="weight"
                              value={wc.value}
                              checked={selectedWeight === wc.value}
                              onChange={(e) => setSelectedWeight(e.target.value)}
                              className="h-4 w-4 text-blue-600 mt-0.5"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{wc.label}</p>
                              <p className="text-xs text-gray-500">{wc.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Fee display */}
                    <div className="rounded-lg border bg-gray-50 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Registration Fee</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration Fee</span>
                          <span className="font-medium text-gray-900">{fee.amount}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 pl-4">Government Portion (70%) &mdash; {countryObj.authorityAcronym}</span>
                          <span className="text-gray-500">{fee.govShare}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 pl-4">Platform Processing (30%)</span>
                          <span className="text-gray-500">{fee.platformShare}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs text-amber-700">
                        70% of your registration fee ({fee.govShare}) is remitted to {countryObj.authorityAcronym} to support airspace safety and regulatory oversight.
                      </p>
                    </div>

                    <button
                      onClick={handleRegisterDrone}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                      <Shield size={16} />
                      Register & Pay
                    </button>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mx-auto">
                      <CheckCircle size={32} className="text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Drone Registered!</h3>
                      <p className="text-sm text-gray-500 mt-1">{selectedManufacturer} {selectedModel}</p>
                    </div>
                    <div className="rounded-lg border bg-gray-50 p-4 max-w-xs mx-auto">
                      <p className="text-xs text-gray-500 mb-1">Digital Drone ID</p>
                      <p className="text-2xl font-bold font-mono text-blue-600">{generatedDDID}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: File Your First Flight Plan */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">File Your First Flight Plan</h2>
                  <p className="text-sm text-gray-500">Get familiar with the flight planning process. This step is optional.</p>
                </div>

                {!flightPlanFiled && !flightPlanSkipped ? (
                  <>
                    {/* Map placeholder */}
                    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 h-48 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin size={28} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Map Preview</p>
                        <p className="text-xs text-gray-400">Click to place waypoints on the map</p>
                      </div>
                    </div>

                    {/* Waypoints */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Example Route Waypoints</label>
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">#</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Lat</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Lng</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Alt (ft AGL)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {exampleWaypoints.map((wp, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-xs text-gray-400">{i}</td>
                                <td className="px-3 py-2 text-xs">{wp.icon} {wp.type}</td>
                                <td className="px-3 py-2 text-xs font-medium text-gray-900">{wp.name}</td>
                                <td className="px-3 py-2 text-xs font-mono text-gray-600">{wp.lat}</td>
                                <td className="px-3 py-2 text-xs font-mono text-gray-600">{wp.lng}</td>
                                <td className="px-3 py-2 text-xs font-mono text-gray-600">{wp.alt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Date/time pickers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Departure</label>
                        <input type="datetime-local" defaultValue="2026-03-25T09:00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Arrival</label>
                        <input type="datetime-local" defaultValue="2026-03-25T09:45" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>

                    <div className="rounded-lg border bg-gray-50 p-3 flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Estimated duration: <span className="font-medium">45 minutes</span></span>
                    </div>

                    {/* Contingency */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Contingency Plan</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Communication Lost Action</label>
                          <select
                            value={commLostAction}
                            onChange={(e) => setCommLostAction(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="return_home">Return to Home</option>
                            <option value="land_immediately">Land Immediately</option>
                            <option value="hover">Hover in Place</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Emergency Contact Name</label>
                          <input type="text" placeholder="Name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Emergency Contact Phone</label>
                          <input type="tel" placeholder="+1 555 000 0000" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* Airspace check */}
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm font-medium text-green-800">Route clear</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1 ml-6">Class G airspace, no TFR conflicts</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleFileFlightPlan}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                      >
                        <Plane size={16} />
                        File Flight Plan
                      </button>
                      <button
                        onClick={handleSkipFlightPlan}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Skip for now
                      </button>
                    </div>

                    <p className="text-xs text-gray-400">You can file plans from the dashboard later.</p>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mx-auto">
                      {flightPlanFiled ? (
                        <CheckCircle size={32} className="text-green-500" />
                      ) : (
                        <ClipboardList size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {flightPlanFiled ? 'Flight Plan Filed!' : 'Flight Plan Skipped'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {flightPlanFiled ? 'Flight Plan #SKW-FP-2026-000001' : 'You can file plans from the dashboard later.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <button
                onClick={goBack}
                disabled={step === 1}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                )}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={goNext}
                disabled={step === 3 && !droneRegistered}
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
                  step === 3 && !droneRegistered
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                )}
              >
                {step === 4 ? 'Complete Setup' : 'Next'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
