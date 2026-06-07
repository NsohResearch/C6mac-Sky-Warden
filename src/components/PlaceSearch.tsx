import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlaceResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface PlaceSearchProps {
  onSelect: (place: { name: string; lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  /** Optional country code hint, e.g. "cm,cg,ga,td,gq,cf,et,bw,zm,ss,ao,sn,cd" */
  countryCodes?: string;
  size?: "sm" | "md";
}

/**
 * Friendly place/city search powered by OpenStreetMap Nominatim (free, no API key).
 * Lets users type a city, town, airport or landmark instead of raw lat/lng.
 */
export default function PlaceSearch({
  onSelect,
  placeholder = "Search city, town, or landmark…",
  className,
  countryCodes,
  size = "md",
}: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          addressdetails: "0",
          limit: "6",
        });
        if (countryCodes) params.set("countrycodes", countryCodes);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          { headers: { Accept: "application/json" } }
        );
        if (res.ok) {
          const data = (await res.json()) as PlaceResult[];
          setResults(data);
          setOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, countryCodes]);

  const handlePick = (r: PlaceResult) => {
    onSelect({
      name: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    });
    setQuery(r.display_name.split(",")[0]);
    setOpen(false);
  };

  const inputHeight = size === "sm" ? "h-9" : "h-10";

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg bg-background border border-input pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/30 transition-shadow",
            inputHeight
          )}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
          <ul className="max-h-64 overflow-y-auto">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => handlePick(r)}
                  className="w-full text-left px-3 py-2 hover:bg-accent/10 flex items-start gap-2 transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-xs text-foreground leading-snug">{r.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {open && !loading && results.length === 0 && query.trim().length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-lg p-3 text-xs text-muted-foreground">
          No places found. Try a different search.
        </div>
      )}
    </div>
  );
}
