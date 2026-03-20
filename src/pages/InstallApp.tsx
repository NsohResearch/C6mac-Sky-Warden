import { useState, useEffect } from "react";
import { Download, Smartphone, Monitor, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import logoMark from "@/assets/logo-mark.png";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) setIsInstalled(true);

    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const features = [
    "Pre-flight checklists on the field",
    "Quick B4UFLY airspace checks",
    "Live telemetry monitoring",
    "LAANC authorization requests",
    "Offline flight log sync",
    "Push notifications for alerts",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <img src={logoMark} alt="SkyWarden" className="w-20 h-20 rounded-2xl shadow-lg mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
            Install SkyWarden
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            Add SkyWarden to your home screen for instant access to your drone operations platform — even offline.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 mb-6">
          {isInstalled ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-1">Already Installed!</h2>
              <p className="text-sm text-muted-foreground mb-4">SkyWarden is on your home screen.</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : deferredPrompt ? (
            <div className="text-center py-4">
              <Monitor className="w-10 h-10 text-accent mx-auto mb-3" />
              <h2 className="text-lg font-bold text-foreground mb-2">Ready to Install</h2>
              <button
                onClick={handleInstall}
                className="inline-flex items-center gap-2 h-12 px-8 rounded-lg bg-accent text-accent-foreground font-bold hover:opacity-90 transition-opacity active:scale-[0.98] shadow-sm"
              >
                <Download className="w-5 h-5" />
                Install SkyWarden
              </button>
            </div>
          ) : isIOS ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-8 h-8 text-accent shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">Install on iOS</h2>
                  <p className="text-xs text-muted-foreground">Follow these steps in Safari:</p>
                </div>
              </div>
              <ol className="space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  Tap the <strong>Share</strong> button (square with arrow)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  Scroll down and tap <strong>Add to Home Screen</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  Tap <strong>Add</strong> to confirm
                </li>
              </ol>
            </div>
          ) : (
            <div className="text-center py-4">
              <Monitor className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-sm font-semibold text-foreground mb-1">Install from your browser</h2>
              <p className="text-xs text-muted-foreground">
                On Chrome/Edge: click the install icon in the address bar. On mobile: use your browser's "Add to Home Screen" option.
              </p>
            </div>
          )}
        </div>

        {/* Feature list */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            What you get
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          <Link to="/dashboard" className="text-accent hover:underline">Skip to Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
