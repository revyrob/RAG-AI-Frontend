import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Badge {
  label: string;
  variant: "heritage" | "food" | "grant" | "default" | "ix_hub" | "food_desert";
}

interface Signal {
  label: string;
  value: string;
  urgent?: boolean;
}

interface ParcelCardProps {
  address: string;
  city?: string;
  facts: string;
  badges?: Badge[];
  signals?: Signal[];
  onClick?: () => void;
  onHover?: () => void;
  active?: boolean;
  className?: string;
  /** Height of the map section in px. Default: 200 */
  mapHeight?: number;
  /** Zoom level passed to Leaflet. Default: 16 */
  mapZoom?: number;
}

// ── Geocoder ──────────────────────────────────────────────────────────────────
// Uses Nominatim (free, no key). Falls back to Montgomery city centre on error.

const geocodeCache: Record<string, { lat: number; lon: number }> = {};

async function geocodeAddress(address: string, city = ""): Promise<{ lat: number; lon: number }> {
  const query = [address, city].filter(Boolean).join(", ");
  if (geocodeCache[query]) return geocodeCache[query];

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res  = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await res.json();
    if (data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      geocodeCache[query] = result;
      return result;
    }
  } catch (_) {}

  // Fallback: Montgomery, AL city centre
  return { lat: 32.3792, lon: -86.3077 };
}

// ── Badge styles ──────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, { text: string; border: string; icon?: string }> = {
  heritage:    { text: "#C4911A",              border: "rgba(249,115,22,0.3)",  icon: "🏛️" },
  food:        { text: "#e8a830",              border: "rgba(232,168,48,0.3)",  icon: "🌽" },
  food_desert: { text: "#e8a830",              border: "rgba(232,168,48,0.3)",  icon: "🌽" },
  ix_hub:      { text: "#4ade80",              border: "rgba(74,222,128,0.3)",  icon: "⚡" },
  grant:       { text: "#4ade80",              border: "rgba(74,222,128,0.3)",  icon: "💰" },
  default:     { text: "rgba(255,255,255,0.7)",border: "rgba(255,255,255,0.15)",icon: "🏛️" },
};

function BadgeTag({ label, variant }: Badge) {
  const s = BADGE_STYLES[variant] ?? BADGE_STYLES["default"];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        color: s.text,
        border: `1px solid ${s.border}`,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {s.icon && <span style={{ fontSize: "0.75rem" }}>{s.icon}</span>}
      {label}
    </span>
  );
}

// ── Leaflet singleton loader ──────────────────────────────────────────────────
// Script + CSS are injected only once no matter how many cards are on screen.

let leafletPromise: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise<void>((resolve, reject) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id   = "leaflet-css";
      link.rel  = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if ((window as any).L) { resolve(); return; }
    const script    = document.createElement("script");
    script.src      = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload   = () => resolve();
    script.onerror  = () => reject(new Error("Leaflet failed to load"));
    document.head.appendChild(script);
  });
  return leafletPromise;
}

// ── LeafletMap ────────────────────────────────────────────────────────────────
// The div gets an EXPLICIT pixel height so Leaflet always has a measured
// container. invalidateSize() is called after paint for safety.

interface LeafletMapProps {
  lat: number;
  lon: number;
  zoom: number;
  height: number;
}

function LeafletMap({ lat, lon, zoom, height }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;

    loadLeaflet().then(() => {
      if (destroyed || !containerRef.current) return;
      const L = (window as any).L;

      // Always destroy the previous instance before creating a new one
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, {
        center:             [lat, lon],
        zoom,
        zoomControl:        false,
        attributionControl: false,
        dragging:           false,
        scrollWheelZoom:    false,
        doubleClickZoom:    false,
        boxZoom:            false,
        keyboard:           false,
        tap:                false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);

      // Amber teardrop pin
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:12px;height:12px;
          border-radius:50% 50% 50% 0;
          background:#e8a830;
          transform:rotate(-45deg);
          border:2px solid rgba(255,255,255,0.9);
        "></div>`,
        iconSize:   [12, 12],
        iconAnchor: [6, 12],
      });

      L.marker([lat, lon], { icon }).addTo(map);

      // Let the browser finish painting before telling Leaflet to resize
      requestAnimationFrame(() => {
        if (!destroyed) map.invalidateSize();
      });

      mapRef.current = map;
    }).catch(console.error);

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, zoom]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height, display: "block" }}
    />
  );
}

// ── MapSection ────────────────────────────────────────────────────────────────

interface MapSectionProps {
  address: string;
  city?: string;
  height: number;
  zoom: number;
}

function MapSection({ address, city, height, zoom }: MapSectionProps) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    geocodeAddress(address, city).then(setCoords);
  }, [address, city]);

  const resolvedLat = coords?.lat ?? 32.3792;
  const resolvedLon = coords?.lon ?? -86.3077;

  return (
    <div
      style={{
        position:     "relative",
        width:        "100%",
        height,
        flexShrink:   0,
        borderRadius: "0 0 12px 12px",
        overflow:     "hidden",
        background:   "#0a2030",
      }}
    >
      <LeafletMap lat={resolvedLat} lon={resolvedLon} zoom={zoom} height={height} />

      {/* Coordinate pill */}
      <div style={{
        position: "absolute", bottom: 8, left: 8, zIndex: 999,
        fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.55rem",
        color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.55)",
        padding: "2px 7px", borderRadius: 4, pointerEvents: "none",
        letterSpacing: "0.04em",
      }}>
        {resolvedLat.toFixed(4)}, {resolvedLon.toFixed(4)}
      </div>

      {/* Compass */}
      <div style={{
        position: "absolute", top: 8, right: 8, zIndex: 999,
        width: 20, height: 20, borderRadius: "50%",
        background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.5rem",
        color: "rgba(255,255,255,0.7)", pointerEvents: "none",
      }}>
        N
      </div>
    </div>
  );
}

// ── ParcelCard ────────────────────────────────────────────────────────────────

export default function ParcelCard({
  address   = "1100 W Jeff Davis Ave",
  city      = "Montgomery AL, 36104",
  facts     = "2.6 acres · Vacant 12 yrs · Zoned C-1",
  badges    = [],
  signals   = [],
  onClick,
  onHover,
  active    = false,
  className = "",
  mapHeight = 250,  // ← adjust map height here
  mapZoom   = 16,   // ← adjust zoom level here
}: ParcelCardProps) {
  const [hovered, setHovered] = useState(false);
  const isHighlighted = active || hovered;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); onHover?.(); }}
      onMouseLeave={() => setHovered(false)}
      className={`overflow-hidden flex cursor-pointer select-none ${className} flex-col`}
      style={{
        backgroundColor: "#0e3a47",
        border:       isHighlighted ? "1px solid rgba(232,168,48,0.8)" : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        height:       450,
        boxShadow:    isHighlighted
          ? "0 0 0 2px rgba(232,168,48,0.25), 0 4px 9px rgba(0,0,0,0.45)"
          : "",
        transition:   "all 0.22s ease",
        width:        520,
        transform:    isHighlighted ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      {/* Info */}
      <div className="flex flex-col flex-1 p-5 gap-2.5 min-w-0">
        <h2
          className="leading-tight"
          style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 700,
            fontSize: "clamp(1.1rem, 2vw, 1.3rem)", letterSpacing: "-0.01em",
            color: "#ffffff",
          }}
        >
          {address}
        </h2>

        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
          <div>{facts}</div>
          <div>{city}</div>
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {badges.map((b, i) => <BadgeTag key={i} {...b} />)}
          </div>
        )}

        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "2px 0" }} />

        <ul className="flex flex-col gap-1.5">
          {signals.map((s, i) => (
            <li key={i} className="flex items-baseline gap-1"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.74rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.4 }}>
              <span style={{ color: s.urgent ? "#4ade80" : "rgba(255,255,255,0.35)", fontSize: "0.55rem", marginTop: 1, flexShrink: 0 }}>●</span>
              <span>
                {s.label}{" "}
                <span style={{ color: s.urgent ? "#4ade80" : "rgba(255,255,255,0.88)", fontWeight: 600 }}>
                  {s.value}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Map */}
      <MapSection address={address} city={city} height={mapHeight} zoom={mapZoom} />
    </div>
  );
}
