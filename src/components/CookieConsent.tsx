import { useState, useEffect } from "react";
import { t, type Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
}

export default function CookieConsent({ lang }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("skw_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  if (!visible) return null;

  const handle = (accepted: boolean) => {
    localStorage.setItem("skw_cookie_consent", accepted ? "accepted" : "declined");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-reveal-up">
      <div className="max-w-lg mx-auto bg-card border border-border rounded-xl shadow-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-xs text-muted-foreground flex-1 leading-relaxed">
          {t(lang, "cookieNotice")}{" "}
          <a href="/cookies" className="text-accent hover:underline font-medium">
            {t(lang, "cookiePolicy")}
          </a>.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handle(false)}
            className="h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors active:scale-[0.97]"
          >
            {t(lang, "decline")}
          </button>
          <button
            onClick={() => handle(true)}
            className="h-8 px-4 rounded-md bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            {t(lang, "accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
