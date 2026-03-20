// SkyWarden — White-Label Branding System

export interface BrandPreset {
  id: string;
  name: string;
  logo?: string;
  primaryHsl: string;
  accentHsl: string;
  backgroundHsl: string;
  foregroundHsl: string;
  borderRadius: string;
  fontFamily: string;
}

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: 'sky-warden',
    name: 'Sky Warden (Default)',
    primaryHsl: '220 18% 20%',
    accentHsl: '36 95% 52%',
    backgroundHsl: '40 20% 97%',
    foregroundHsl: '220 20% 14%',
    borderRadius: '0.5rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  {
    id: 'aviation-blue',
    name: 'Aviation Blue',
    primaryHsl: '215 65% 28%',
    accentHsl: '195 85% 45%',
    backgroundHsl: '210 20% 97%',
    foregroundHsl: '215 25% 12%',
    borderRadius: '0.375rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  {
    id: 'savanna',
    name: 'Savanna',
    primaryHsl: '25 45% 22%',
    accentHsl: '38 80% 55%',
    backgroundHsl: '35 25% 96%',
    foregroundHsl: '25 30% 15%',
    borderRadius: '0.75rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  {
    id: 'gov-formal',
    name: 'Government Formal',
    primaryHsl: '220 30% 18%',
    accentHsl: '0 70% 48%',
    backgroundHsl: '0 0% 98%',
    foregroundHsl: '220 15% 12%',
    borderRadius: '0.25rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  {
    id: 'emerald',
    name: 'Emerald Tech',
    primaryHsl: '160 40% 18%',
    accentHsl: '152 60% 42%',
    backgroundHsl: '150 15% 97%',
    foregroundHsl: '160 25% 12%',
    borderRadius: '0.5rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
];

export function applyBrandPreset(preset: BrandPreset) {
  const root = document.documentElement;
  root.style.setProperty('--primary', preset.primaryHsl);
  root.style.setProperty('--accent', preset.accentHsl);
  root.style.setProperty('--background', preset.backgroundHsl);
  root.style.setProperty('--foreground', preset.foregroundHsl);
  root.style.setProperty('--radius', preset.borderRadius);
  root.style.setProperty('--font-sans', preset.fontFamily);
}

export function resetBrand() {
  const root = document.documentElement;
  ['--primary', '--accent', '--background', '--foreground', '--radius', '--font-sans'].forEach(
    prop => root.style.removeProperty(prop)
  );
}

// White-label config for 20 countries (12 existing + 8 expansion)
export const WHITELABEL_COUNTRIES = [
  'US', 'CA', 'NG', 'KE', 'ZA', 'GH', 'RW', 'TZ', 'ET', 'SN', 'CI', 'UG',
  'CM', 'MZ', 'AO', 'ZM', 'MW', 'BW', 'NA', 'MG',
] as const;
