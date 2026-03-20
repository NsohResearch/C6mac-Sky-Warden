import { User, Shield, Bell, Key, Building } from "lucide-react";

const sections = [
  { icon: User, label: "Profile", desc: "Update your name, email, and Part 107 certification details" },
  { icon: Shield, label: "Security", desc: "Password, MFA, and active sessions" },
  { icon: Bell, label: "Notifications", desc: "TFR alerts, LAANC updates, mission reminders" },
  { icon: Key, label: "API Keys", desc: "Manage developer API keys and OAuth applications" },
  { icon: Building, label: "Organization", desc: "Tenant settings, user roles, and billing" },
];

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and platform preferences</p>
      </div>

      <div className="space-y-2">
        {sections.map((section, i) => (
          <button
            key={section.label}
            className="w-full flex items-center gap-4 p-4 bg-card rounded-lg shadow-card hover:shadow-card-hover transition-shadow text-left animate-reveal-up active:scale-[0.99]"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <section.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">{section.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{section.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
