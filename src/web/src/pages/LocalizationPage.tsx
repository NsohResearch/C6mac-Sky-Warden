import { useState } from 'react';
import {
  Globe, Check, ChevronDown, Save, Languages, Clock, Ruler, DollarSign,
  Calendar, MapPin, Thermometer, Weight, Gauge, ArrowLeftRight, Users,
  CheckCircle, AlertCircle, BarChart3, Hash,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { SupportedLanguage, LocalizationPreferences, TranslationProgress } from '../../../shared/types/i18n';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockLanguages: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', region: 'North America', flag: '\u{1F1FA}\u{1F1F8}', completionPercent: 100, dateFormat: 'MM/DD/YYYY', numberFormat: { decimal: '.', thousands: ',', currency: 'USD' }, measurementSystem: 'imperial', altitudeUnit: 'feet', speedUnit: 'knots', distanceUnit: 'nm', temperatureUnit: 'fahrenheit', weightUnit: 'lbs', timezone: 'America/New_York' },
  { code: 'fr', name: 'French', nativeName: 'Fran\u00e7ais', direction: 'ltr', region: 'Europe', flag: '\u{1F1EB}\u{1F1F7}', completionPercent: 94, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: ',', thousands: ' ', currency: 'EUR' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Europe/Paris' },
  { code: 'es', name: 'Spanish', nativeName: 'Espa\u00f1ol', direction: 'ltr', region: 'Europe', flag: '\u{1F1EA}\u{1F1F8}', completionPercent: 91, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Europe/Madrid' },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Portugu\u00eas', direction: 'ltr', region: 'South America', flag: '\u{1F1E7}\u{1F1F7}', completionPercent: 87, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: ',', thousands: '.', currency: 'BRL' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'America/Sao_Paulo' },
  { code: 'ar', name: 'Arabic', nativeName: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', direction: 'rtl', region: 'Middle East', flag: '\u{1F1F8}\u{1F1E6}', completionPercent: 78, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: '.', thousands: ',', currency: 'SAR' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Asia/Riyadh' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', region: 'East Africa', flag: '\u{1F1F0}\u{1F1EA}', completionPercent: 62, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: '.', thousands: ',', currency: 'KES' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Africa/Nairobi' },
  { code: 'am', name: 'Amharic', nativeName: '\u12A0\u121B\u122D\u129B', direction: 'ltr', region: 'East Africa', flag: '\u{1F1EA}\u{1F1F9}', completionPercent: 45, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: '.', thousands: ',', currency: 'ETB' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Africa/Addis_Ababa' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', direction: 'ltr', region: 'West Africa', flag: '\u{1F1F3}\u{1F1EC}', completionPercent: 38, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: '.', thousands: ',', currency: 'NGN' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Africa/Lagos' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yor\u00f9b\u00e1', direction: 'ltr', region: 'West Africa', flag: '\u{1F1F3}\u{1F1EC}', completionPercent: 34, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: '.', thousands: ',', currency: 'NGN' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Africa/Lagos' },
  { code: 'zh', name: 'Chinese', nativeName: '\u4E2D\u6587', direction: 'ltr', region: 'East Asia', flag: '\u{1F1E8}\u{1F1F3}', completionPercent: 89, dateFormat: 'YYYY-MM-DD', numberFormat: { decimal: '.', thousands: ',', currency: 'CNY' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Asia/Shanghai' },
  { code: 'ja', name: 'Japanese', nativeName: '\u65E5\u672C\u8A9E', direction: 'ltr', region: 'East Asia', flag: '\u{1F1EF}\u{1F1F5}', completionPercent: 86, dateFormat: 'YYYY-MM-DD', numberFormat: { decimal: '.', thousands: ',', currency: 'JPY' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Asia/Tokyo' },
  { code: 'ko', name: 'Korean', nativeName: '\uD55C\uAD6D\uC5B4', direction: 'ltr', region: 'East Asia', flag: '\u{1F1F0}\u{1F1F7}', completionPercent: 82, dateFormat: 'YYYY-MM-DD', numberFormat: { decimal: '.', thousands: ',', currency: 'KRW' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Asia/Seoul' },
  { code: 'hi', name: 'Hindi', nativeName: '\u0939\u093F\u0928\u094D\u0926\u0940', direction: 'ltr', region: 'South Asia', flag: '\u{1F1EE}\u{1F1F3}', completionPercent: 74, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: '.', thousands: ',', currency: 'INR' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Asia/Kolkata' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', region: 'Europe', flag: '\u{1F1E9}\u{1F1EA}', completionPercent: 93, dateFormat: 'DD.MM.YYYY', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Europe/Berlin' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', region: 'Europe', flag: '\u{1F1EE}\u{1F1F9}', completionPercent: 88, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: ',', thousands: '.', currency: 'EUR' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Europe/Rome' },
  { code: 'tr', name: 'Turkish', nativeName: 'T\u00fcrk\u00e7e', direction: 'ltr', region: 'Europe', flag: '\u{1F1F9}\u{1F1F7}', completionPercent: 71, dateFormat: 'DD.MM.YYYY', numberFormat: { decimal: ',', thousands: '.', currency: 'TRY' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Europe/Istanbul' },
  { code: 'ru', name: 'Russian', nativeName: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439', direction: 'ltr', region: 'Europe', flag: '\u{1F1F7}\u{1F1FA}', completionPercent: 85, dateFormat: 'DD.MM.YYYY', numberFormat: { decimal: ',', thousands: ' ', currency: 'RUB' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Europe/Moscow' },
  { code: 'th', name: 'Thai', nativeName: '\u0E44\u0E17\u0E22', direction: 'ltr', region: 'Southeast Asia', flag: '\u{1F1F9}\u{1F1ED}', completionPercent: 58, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: '.', thousands: ',', currency: 'THB' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Asia/Bangkok' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Ti\u1EBFng Vi\u1EC7t', direction: 'ltr', region: 'Southeast Asia', flag: '\u{1F1FB}\u{1F1F3}', completionPercent: 52, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: ',', thousands: '.', currency: 'VND' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Asia/Ho_Chi_Minh' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', region: 'Southeast Asia', flag: '\u{1F1EE}\u{1F1E9}', completionPercent: 67, dateFormat: 'DD/MM/YYYY', numberFormat: { decimal: ',', thousands: '.', currency: 'IDR' }, measurementSystem: 'metric', altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg', timezone: 'Asia/Jakarta' },
];

const mockPreferences: LocalizationPreferences = {
  userId: 'usr-001',
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  measurementSystem: 'imperial',
  altitudeUnit: 'feet',
  speedUnit: 'knots',
  distanceUnit: 'nm',
  temperatureUnit: 'fahrenheit',
  weightUnit: 'lbs',
  timezone: 'America/New_York',
  currency: 'USD',
  firstDayOfWeek: 0,
  coordinateFormat: 'dd',
};

const mockTranslationProgress: TranslationProgress[] = [
  { language: 'English', totalStrings: 4820, translatedStrings: 4820, reviewedStrings: 4820, completionPercent: 100, lastUpdated: '2026-03-20', contributors: ['Core Team'] },
  { language: 'French', totalStrings: 4820, translatedStrings: 4531, reviewedStrings: 4200, completionPercent: 94, lastUpdated: '2026-03-18', contributors: ['Pierre D.', 'Marie L.', 'Jean-Luc R.'] },
  { language: 'German', totalStrings: 4820, translatedStrings: 4482, reviewedStrings: 4100, completionPercent: 93, lastUpdated: '2026-03-17', contributors: ['Hans M.', 'Katrin S.'] },
  { language: 'Spanish', totalStrings: 4820, translatedStrings: 4386, reviewedStrings: 4050, completionPercent: 91, lastUpdated: '2026-03-16', contributors: ['Carlos R.', 'Ana G.', 'Miguel T.'] },
  { language: 'Chinese', totalStrings: 4820, translatedStrings: 4290, reviewedStrings: 3900, completionPercent: 89, lastUpdated: '2026-03-15', contributors: ['Wei L.', 'Xiao C.'] },
  { language: 'Italian', totalStrings: 4820, translatedStrings: 4242, reviewedStrings: 3800, completionPercent: 88, lastUpdated: '2026-03-14', contributors: ['Marco B.', 'Lucia F.'] },
  { language: 'Portuguese', totalStrings: 4820, translatedStrings: 4193, reviewedStrings: 3700, completionPercent: 87, lastUpdated: '2026-03-13', contributors: ['Pedro S.', 'Camila O.'] },
  { language: 'Japanese', totalStrings: 4820, translatedStrings: 4145, reviewedStrings: 3650, completionPercent: 86, lastUpdated: '2026-03-12', contributors: ['Yuki T.', 'Haruto N.'] },
  { language: 'Russian', totalStrings: 4820, translatedStrings: 4097, reviewedStrings: 3500, completionPercent: 85, lastUpdated: '2026-03-11', contributors: ['Ivan K.', 'Natalia S.'] },
  { language: 'Korean', totalStrings: 4820, translatedStrings: 3952, reviewedStrings: 3400, completionPercent: 82, lastUpdated: '2026-03-10', contributors: ['Minjun P.', 'Soyeon K.'] },
  { language: 'Arabic', totalStrings: 4820, translatedStrings: 3760, reviewedStrings: 3200, completionPercent: 78, lastUpdated: '2026-03-09', contributors: ['Ahmed H.', 'Fatima A.'] },
  { language: 'Hindi', totalStrings: 4820, translatedStrings: 3567, reviewedStrings: 3000, completionPercent: 74, lastUpdated: '2026-03-08', contributors: ['Rahul P.', 'Priya S.'] },
  { language: 'Turkish', totalStrings: 4820, translatedStrings: 3422, reviewedStrings: 2900, completionPercent: 71, lastUpdated: '2026-03-07', contributors: ['Mehmet Y.'] },
  { language: 'Indonesian', totalStrings: 4820, translatedStrings: 3229, reviewedStrings: 2700, completionPercent: 67, lastUpdated: '2026-03-06', contributors: ['Budi W.', 'Siti R.'] },
  { language: 'Swahili', totalStrings: 4820, translatedStrings: 2988, reviewedStrings: 2400, completionPercent: 62, lastUpdated: '2026-03-05', contributors: ['Juma M.'] },
  { language: 'Thai', totalStrings: 4820, translatedStrings: 2796, reviewedStrings: 2200, completionPercent: 58, lastUpdated: '2026-03-04', contributors: ['Somchai L.'] },
  { language: 'Vietnamese', totalStrings: 4820, translatedStrings: 2506, reviewedStrings: 2000, completionPercent: 52, lastUpdated: '2026-03-03', contributors: ['Minh T.', 'Lan P.'] },
  { language: 'Amharic', totalStrings: 4820, translatedStrings: 2169, reviewedStrings: 1600, completionPercent: 45, lastUpdated: '2026-03-02', contributors: ['Abebe G.'] },
  { language: 'Hausa', totalStrings: 4820, translatedStrings: 1832, reviewedStrings: 1200, completionPercent: 38, lastUpdated: '2026-02-28', contributors: ['Ibrahim D.'] },
  { language: 'Yoruba', totalStrings: 4820, translatedStrings: 1639, reviewedStrings: 1000, completionPercent: 34, lastUpdated: '2026-02-25', contributors: ['Adewale O.'] },
];

const timezoneGroups: Record<string, string[]> = {
  'Americas': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage', 'America/Sao_Paulo', 'America/Buenos_Aires', 'America/Mexico_City', 'America/Toronto', 'America/Vancouver'],
  'Europe': ['Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome', 'Europe/Moscow', 'Europe/Istanbul', 'Europe/Amsterdam', 'Europe/Warsaw', 'Europe/Zurich'],
  'Africa': ['Africa/Lagos', 'Africa/Nairobi', 'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Addis_Ababa', 'Africa/Casablanca', 'Africa/Dar_es_Salaam', 'Africa/Accra'],
  'Asia': ['Asia/Dubai', 'Asia/Riyadh', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Bangkok', 'Asia/Singapore', 'Asia/Ho_Chi_Minh', 'Asia/Jakarta'],
  'Pacific': ['Pacific/Auckland', 'Pacific/Sydney', 'Pacific/Fiji', 'Pacific/Honolulu', 'Pacific/Guam'],
};

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '\u20ac', name: 'Euro' },
  { code: 'GBP', symbol: '\u00a3', name: 'British Pound' },
  { code: 'NGN', symbol: '\u20a6', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '\u00a5', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '\u00a5', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '\u20b9', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'KRW', symbol: '\u20a9', name: 'Korean Won' },
  { code: 'TRY', symbol: '\u20ba', name: 'Turkish Lira' },
  { code: 'RUB', symbol: '\u20bd', name: 'Russian Ruble' },
  { code: 'THB', symbol: '\u0e3f', name: 'Thai Baht' },
  { code: 'SAR', symbol: '\ufdfc', name: 'Saudi Riyal' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
];

// ─── Component ──────────────────────────────────────────────────────────────────

export function LocalizationPage() {
  const [preferences, setPreferences] = useState<LocalizationPreferences>(mockPreferences);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedTimezoneGroup, setExpandedTimezoneGroup] = useState<string | null>(null);
  const [searchLanguage, setSearchLanguage] = useState('');

  const activeLanguage = mockLanguages.find(l => l.code === preferences.language) ?? mockLanguages[0];

  const filteredLanguages = mockLanguages.filter(l =>
    l.name.toLowerCase().includes(searchLanguage.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(searchLanguage.toLowerCase())
  );

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const updatePref = <K extends keyof LocalizationPreferences>(key: K, value: LocalizationPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    setPreferences(prev => ({
      ...prev,
      language: lang.code,
      dateFormat: lang.dateFormat,
      measurementSystem: lang.measurementSystem,
      altitudeUnit: lang.altitudeUnit,
      speedUnit: lang.speedUnit,
      distanceUnit: lang.distanceUnit,
      temperatureUnit: lang.temperatureUnit,
      weightUnit: lang.weightUnit,
      timezone: lang.timezone,
      currency: lang.numberFormat.currency,
    }));
  };

  const getDatePreview = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    switch (preferences.dateFormat) {
      case 'DD/MM/YYYY': return `${dd}/${mm}/${yyyy}`;
      case 'YYYY-MM-DD': return `${yyyy}-${mm}-${dd}`;
      default: return `${mm}/${dd}/${yyyy}`;
    }
  };

  const getTimePreview = () => {
    const d = new Date();
    if (preferences.timeFormat === '24h') {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    const h = d.getHours() % 12 || 12;
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
    return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ampm}`;
  };

  const getCoordinatePreview = () => {
    switch (preferences.coordinateFormat) {
      case 'dms': return '40\u00b044\'54"N 73\u00b059\'08"W';
      case 'ddm': return '40\u00b044.900\'N 73\u00b059.133\'W';
      default: return '40.748817, -73.985428';
    }
  };

  const getNumberPreview = () => {
    const lang = mockLanguages.find(l => l.code === preferences.language);
    if (!lang) return '1,234.56';
    return `1${lang.numberFormat.thousands}234${lang.numberFormat.decimal}56`;
  };

  const currencyObj = currencies.find(c => c.code === preferences.currency);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
            <Globe className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Language & Regional Settings</h1>
            <p className="text-sm text-gray-400">Configure language, date formats, units of measurement, and regional preferences</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={clsx(
            'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all',
            showSaved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-sky-600 hover:bg-sky-500 text-white'
          )}
        >
          {showSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {showSaved ? 'Preferences Saved' : 'Save Preferences'}
        </button>
      </div>

      {/* Current Language Banner */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{activeLanguage.flag}</span>
          <div>
            <p className="text-sm text-gray-400">Current Language</p>
            <p className="text-lg font-semibold">{activeLanguage.name} ({activeLanguage.nativeName})</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={clsx(
            'px-2.5 py-1 rounded text-xs font-medium border',
            activeLanguage.direction === 'rtl'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
          )}>
            {activeLanguage.direction.toUpperCase()}
          </span>
          <span className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {activeLanguage.completionPercent}% Translated
          </span>
        </div>
      </div>

      {/* Language Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Languages className="w-5 h-5 text-sky-400" />
            Select Language
          </h2>
          <input
            type="text"
            placeholder="Search languages..."
            value={searchLanguage}
            onChange={e => setSearchLanguage(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 w-56"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang)}
              className={clsx(
                'relative p-4 rounded-xl border text-left transition-all hover:border-sky-500/50',
                preferences.language === lang.code
                  ? 'bg-sky-500/10 border-sky-500/40 ring-1 ring-sky-500/30'
                  : 'bg-gray-900/60 border-gray-800 hover:bg-gray-900'
              )}
            >
              {preferences.language === lang.code && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-sky-400" />
                </div>
              )}
              <span className="text-2xl">{lang.flag}</span>
              <p className="mt-2 font-medium text-sm">{lang.name}</p>
              <p className="text-xs text-gray-400">{lang.nativeName}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={clsx(
                  'px-1.5 py-0.5 rounded text-[10px] font-medium',
                  lang.direction === 'rtl' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-800 text-gray-400'
                )}>
                  {lang.direction.toUpperCase()}
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all',
                      lang.completionPercent === 100 ? 'bg-emerald-500' : lang.completionPercent >= 75 ? 'bg-sky-500' : lang.completionPercent >= 50 ? 'bg-amber-500' : 'bg-orange-500'
                    )}
                    style={{ width: `${lang.completionPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{lang.completionPercent}%</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Settings */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            Regional Settings
          </h2>

          {/* Date Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Date Format</label>
            <div className="flex gap-2">
              {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => updatePref('dateFormat', fmt)}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                    preferences.dateFormat === fmt
                      ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Preview: {getDatePreview()}</p>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Time Format</label>
            <div className="flex gap-2">
              {(['12h', '24h'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => updatePref('timeFormat', fmt)}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                    preferences.timeFormat === fmt
                      ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  )}
                >
                  {fmt === '12h' ? '12-hour' : '24-hour'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Preview: {getTimePreview()}</p>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Timezone</label>
            <div className="bg-gray-800 border border-gray-700 rounded-lg divide-y divide-gray-700 max-h-52 overflow-y-auto">
              {Object.entries(timezoneGroups).map(([region, zones]) => (
                <div key={region}>
                  <button
                    onClick={() => setExpandedTimezoneGroup(expandedTimezoneGroup === region ? null : region)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-300">{region}</span>
                    <ChevronDown className={clsx('w-4 h-4 text-gray-500 transition-transform', expandedTimezoneGroup === region && 'rotate-180')} />
                  </button>
                  {expandedTimezoneGroup === region && (
                    <div className="pb-1">
                      {zones.map(tz => (
                        <button
                          key={tz}
                          onClick={() => updatePref('timezone', tz)}
                          className={clsx(
                            'w-full text-left px-5 py-1.5 text-xs transition-colors',
                            preferences.timezone === tz ? 'text-sky-400 bg-sky-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                          )}
                        >
                          {tz.replace(/_/g, ' ')}
                          {preferences.timezone === tz && <Check className="w-3 h-3 inline ml-2" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Current: {preferences.timezone.replace(/_/g, ' ')}</p>
          </div>

          {/* First Day of Week */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">First Day of Week</label>
            <div className="flex gap-2">
              {([{ v: 0 as const, l: 'Sunday' }, { v: 1 as const, l: 'Monday' }, { v: 6 as const, l: 'Saturday' }]).map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => updatePref('firstDayOfWeek', v)}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                    preferences.firstDayOfWeek === v
                      ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinate Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Coordinate Format
            </label>
            <div className="flex gap-2">
              {([{ v: 'dd' as const, l: 'Decimal Degrees' }, { v: 'dms' as const, l: 'DMS' }, { v: 'ddm' as const, l: 'DDM' }]).map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => updatePref('coordinateFormat', v)}
                  className={clsx(
                    'px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                    preferences.coordinateFormat === v
                      ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Example: {getCoordinatePreview()}</p>
          </div>
        </div>

        {/* Measurement Units */}
        <div className="space-y-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 space-y-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Ruler className="w-5 h-5 text-sky-400" />
              Measurement Units
            </h2>

            {/* System Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Measurement System</label>
              <div className="flex gap-2">
                {(['metric', 'imperial'] as const).map(sys => (
                  <button
                    key={sys}
                    onClick={() => {
                      updatePref('measurementSystem', sys);
                      if (sys === 'metric') {
                        setPreferences(prev => ({ ...prev, measurementSystem: sys, altitudeUnit: 'meters', speedUnit: 'kmh', distanceUnit: 'km', temperatureUnit: 'celsius', weightUnit: 'kg' }));
                      } else {
                        setPreferences(prev => ({ ...prev, measurementSystem: sys, altitudeUnit: 'feet', speedUnit: 'knots', distanceUnit: 'nm', temperatureUnit: 'fahrenheit', weightUnit: 'lbs' }));
                      }
                    }}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize',
                      preferences.measurementSystem === sys
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    )}
                  >
                    {sys}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Units */}
            <div className="space-y-3">
              {/* Altitude */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center gap-1.5"><ArrowLeftRight className="w-3.5 h-3.5" /> Altitude</span>
                <div className="flex gap-1.5">
                  {(['feet', 'meters'] as const).map(u => (
                    <button key={u} onClick={() => updatePref('altitudeUnit', u)} className={clsx('px-2.5 py-1 rounded text-xs font-medium border transition-all', preferences.altitudeUnit === u ? 'bg-sky-500/10 border-sky-500/40 text-sky-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600')}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5" /> Speed</span>
                <div className="flex gap-1.5">
                  {(['knots', 'mph', 'kmh', 'ms'] as const).map(u => (
                    <button key={u} onClick={() => updatePref('speedUnit', u)} className={clsx('px-2.5 py-1 rounded text-xs font-medium border transition-all', preferences.speedUnit === u ? 'bg-sky-500/10 border-sky-500/40 text-sky-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600')}>
                      {u === 'kmh' ? 'km/h' : u === 'ms' ? 'm/s' : u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Distance</span>
                <div className="flex gap-1.5">
                  {(['nm', 'miles', 'km'] as const).map(u => (
                    <button key={u} onClick={() => updatePref('distanceUnit', u)} className={clsx('px-2.5 py-1 rounded text-xs font-medium border transition-all', preferences.distanceUnit === u ? 'bg-sky-500/10 border-sky-500/40 text-sky-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600')}>
                      {u === 'nm' ? 'nautical mi' : u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5" /> Temperature</span>
                <div className="flex gap-1.5">
                  {(['celsius', 'fahrenheit'] as const).map(u => (
                    <button key={u} onClick={() => updatePref('temperatureUnit', u)} className={clsx('px-2.5 py-1 rounded text-xs font-medium border transition-all', preferences.temperatureUnit === u ? 'bg-sky-500/10 border-sky-500/40 text-sky-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600')}>
                      {u === 'celsius' ? '\u00b0C' : '\u00b0F'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400 flex items-center gap-1.5"><Weight className="w-3.5 h-3.5" /> Weight</span>
                <div className="flex gap-1.5">
                  {(['kg', 'lbs'] as const).map(u => (
                    <button key={u} onClick={() => updatePref('weightUnit', u)} className={clsx('px-2.5 py-1 rounded text-xs font-medium border transition-all', preferences.weightUnit === u ? 'bg-sky-500/10 border-sky-500/40 text-sky-400' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600')}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Conversion Preview */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Live Conversion Preview</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-400">100 feet</span>
                <span className="text-white font-medium">= 30.48 meters</span>
                <span className="text-gray-400">60 knots</span>
                <span className="text-white font-medium">= 111.12 km/h</span>
                <span className="text-gray-400">1 nautical mile</span>
                <span className="text-white font-medium">= 1.852 km</span>
                <span className="text-gray-400">72\u00b0F</span>
                <span className="text-white font-medium">= 22.2\u00b0C</span>
                <span className="text-gray-400">5.5 lbs</span>
                <span className="text-white font-medium">= 2.49 kg</span>
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-sky-400" />
              Currency & Number Format
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Currency</label>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {currencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => updatePref('currency', c.code)}
                    className={clsx(
                      'px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left',
                      preferences.currency === c.code
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    )}
                  >
                    <span className="font-bold">{c.symbol}</span> {c.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Number Format Preview</p>
              <p className="text-lg font-mono text-white">
                {currencyObj?.symbol}{getNumberPreview()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Translation Progress */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            Translation Progress
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors">
            <Languages className="w-4 h-4" />
            Contribute Translation
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400">
                <th className="pb-3 pr-4 font-medium">Language</th>
                <th className="pb-3 pr-4 font-medium text-right">Total</th>
                <th className="pb-3 pr-4 font-medium text-right">Translated</th>
                <th className="pb-3 pr-4 font-medium text-right">Reviewed</th>
                <th className="pb-3 pr-4 font-medium">Completion</th>
                <th className="pb-3 pr-4 font-medium">Last Updated</th>
                <th className="pb-3 font-medium">Contributors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {mockTranslationProgress.map(tp => (
                <tr key={tp.language} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 pr-4 font-medium text-white">{tp.language}</td>
                  <td className="py-3 pr-4 text-right text-gray-400">{tp.totalStrings.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right text-gray-300">{tp.translatedStrings.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right text-gray-300">{tp.reviewedStrings.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            tp.completionPercent === 100 ? 'bg-emerald-500' : tp.completionPercent >= 75 ? 'bg-sky-500' : tp.completionPercent >= 50 ? 'bg-amber-500' : 'bg-orange-500'
                          )}
                          style={{ width: `${tp.completionPercent}%` }}
                        />
                      </div>
                      <span className={clsx(
                        'text-xs font-medium',
                        tp.completionPercent === 100 ? 'text-emerald-400' : tp.completionPercent >= 75 ? 'text-sky-400' : tp.completionPercent >= 50 ? 'text-amber-400' : 'text-orange-400'
                      )}>
                        {tp.completionPercent}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{tp.lastUpdated}</td>
                  <td className="py-3 text-gray-400 text-xs">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {tp.contributors.join(', ')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Toast */}
      {showSaved && (
        <div className="fixed bottom-6 right-6 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-xl flex items-center gap-2 shadow-xl shadow-emerald-500/10 animate-in slide-in-from-bottom-4">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Localization preferences saved successfully</span>
        </div>
      )}
    </div>
  );
}
