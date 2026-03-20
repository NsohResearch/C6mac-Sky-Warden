import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { User, Shield, Bell, Key, Building, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");

  const { data: tenant } = useQuery({
    queryKey: ["settings-tenant"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenants").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["settings-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: apiKeys = [] } = useQuery({
    queryKey: ["settings-apikeys"],
    queryFn: async () => {
      const { data, error } = await supabase.from("api_keys").select("id, name, key_prefix, is_active, scopes, environment, created_at, last_used_at").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("No user");
      const { error } = await supabase.from("user_profiles").update({
        display_name: displayName,
        phone: phone || null,
      }).eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["settings-tenant"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const sections = [
    { icon: User, label: "Profile", desc: "Update your name, email, and certification details", id: "profile" },
    { icon: Shield, label: "Security", desc: "Password, MFA, and active sessions", id: "security" },
    { icon: Bell, label: "Notifications", desc: "TFR alerts, LAANC updates, mission reminders", id: "notifications" },
    { icon: Key, label: "API Keys", desc: `${apiKeys.length} key(s) configured`, id: "apikeys" },
    { icon: Building, label: "Organization", desc: tenant ? `${tenant.name} · ${tenant.regulatory_authority}` : "Tenant settings", id: "organization" },
  ];

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-6">
      <div className="animate-reveal-up">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and platform preferences</p>
      </div>

      <div className="space-y-2">
        {sections.map((section, i) => (
          <div key={section.id}>
            <button
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
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

            {/* Profile section expanded */}
            {activeSection === "profile" && section.id === "profile" && (
              <div className="mt-2 bg-card rounded-lg shadow-card p-5 space-y-4 animate-reveal-up">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Display Name</label>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                  <input value={profile?.email ?? ""} disabled className="w-full h-9 rounded-md bg-muted/50 px-3 text-sm text-muted-foreground cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="w-full h-9 rounded-md bg-muted px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Region</label>
                  <input value={profile?.region ?? ""} disabled className="w-full h-9 rounded-md bg-muted/50 px-3 text-sm text-muted-foreground cursor-not-allowed" />
                </div>
                <button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97] disabled:opacity-50">
                  <Save className="w-4 h-4" /> {updateProfile.isPending ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}

            {/* API Keys section */}
            {activeSection === "apikeys" && section.id === "apikeys" && (
              <div className="mt-2 bg-card rounded-lg shadow-card p-5 animate-reveal-up">
                {apiKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No API keys configured.</p>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{key.name}</p>
                          <p className="text-xs text-muted-foreground mono">{key.key_prefix}••••••••</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${key.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                            {key.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-muted-foreground">{key.environment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Organization section */}
            {activeSection === "organization" && section.id === "organization" && tenant && (
              <div className="mt-2 bg-card rounded-lg shadow-card p-5 animate-reveal-up">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-muted-foreground">Organization</p><p className="font-medium text-foreground">{tenant.name}</p></div>
                  <div><p className="text-xs text-muted-foreground">Region</p><p className="font-medium text-foreground">{tenant.country_name}</p></div>
                  <div><p className="text-xs text-muted-foreground">Authority</p><p className="font-medium text-foreground">{tenant.regulatory_authority}</p></div>
                  <div><p className="text-xs text-muted-foreground">Plan</p><p className="font-medium text-foreground capitalize">{tenant.plan}</p></div>
                </div>
                {roles.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((r) => (
                        <span key={r.id} className="text-xs px-2.5 py-1 rounded-full bg-muted text-foreground">{r.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
