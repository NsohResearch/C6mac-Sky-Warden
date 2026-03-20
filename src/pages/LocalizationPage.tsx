import { useState } from "react";
import { Globe, Check, Save, Clock, Ruler, DollarSign, Calendar, Thermometer, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", name: "English", native: "English", flag: "🇺🇸", completion: 100 },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷", completion: 94 },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸", completion: 91 },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷", completion: 88 },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦", completion: 82 },
  { code: "sw", name: "Swahili", native: "Kiswahili", flag: "🇰🇪", completion: 76 },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳", completion: 85 },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵", completion: 79 },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪", completion: 90 },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳", completion: 72 },
];

const measurementSystems = [
  { id: "imperial", label: "Imperial (ft, mph, °F)", desc: "USA standard" },
  { id: "metric", label: "Metric (m, km/h, °C)", desc: "International standard" },
  { id: "aviation", label: "Aviation (ft, knots, °C)", desc: "ICAO standard" },
];

export default function LocalizationPage() {
  const [selectedLang, setSelectedLang] = useState("en");
  const [measurement, setMeasurement] = useState("imperial");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Localization</h1><p className="text-sm text-muted-foreground mt-1">20 languages, regional settings, measurement units</p></div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 active:scale-[0.97] transition-all"><Save className="w-4 h-4" /> Save Settings</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Languages className="w-5 h-5" /> Display Language</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {languages.map(lang => (
              <button key={lang.code} onClick={() => setSelectedLang(lang.code)} className={cn("w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left", selectedLang === lang.code ? "border-primary bg-primary/5" : "border-border hover:bg-muted")}>
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="font-medium text-sm">{lang.name}</span><span className="text-xs text-muted-foreground">{lang.native}</span></div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full max-w-[120px]"><div className="h-full bg-primary rounded-full" style={{ width: `${lang.completion}%` }} /></div>
                    <span className="text-xs text-muted-foreground">{lang.completion}%</span>
                  </div>
                </div>
                {selectedLang === lang.code && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Ruler className="w-5 h-5" /> Measurement System</h3>
            <div className="space-y-2">
              {measurementSystems.map(sys => (
                <button key={sys.id} onClick={() => setMeasurement(sys.id)} className={cn("w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left", measurement === sys.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted")}>
                  <div><p className="font-medium text-sm">{sys.label}</p><p className="text-xs text-muted-foreground">{sys.desc}</p></div>
                  {measurement === sys.id && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> Regional Preferences</h3>
            <div className="space-y-3">
              {[
                { label: "Date Format", value: "MM/DD/YYYY" },
                { label: "Time Format", value: "12-hour" },
                { label: "Currency", value: "USD ($)" },
                { label: "Timezone", value: "America/New_York (UTC-5)" },
                { label: "Temperature", value: "°F (Fahrenheit)" },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{pref.label}</span>
                  <span className="font-medium">{pref.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
