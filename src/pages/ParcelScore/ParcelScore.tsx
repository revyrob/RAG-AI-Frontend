import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RawParcel {
  FID: number;
  TAX_MAP: string;
  PARCEL_NUM: string;
  STREET_NUM: string;
  STREET_NAM: string;
  LOCATION: string;
  NOTES: string;
  STRATEGY: string;
  DISPLAY: string;
  District: number;
  CALC_ACRE: number;
  SQ_FT: number;
  lat: number;
  lon: number;
  rings?: number[][][]; // ArcGIS polygon rings: [[[lon, lat], ...]]
}

// ── Leaflet map component ────────────────────────────────────────────────────
function ParcelMap({ lat, lon, rings }: { lat: number; lon: number; rings?: number[][][] }) {
  const mapDivRef  = useRef<HTMLDivElement>(null);
  const mapRef     = useRef<L.Map | null>(null);
  const layerRef   = useRef<L.Layer | null>(null); // polygon or fallback marker

  // Create map once on mount
  useEffect(() => {
    if (!mapDivRef.current) return;
    const map = L.map(mapDivRef.current, { zoomControl: true, attributionControl: false })
      .setView([lat, lon], 17);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: ["a", "b", "c", "d"],
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-draw whenever parcel changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous layer
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }

    if (rings && rings.length > 0) {
      // ArcGIS rings are [lon, lat] — Leaflet needs [lat, lon]
      const latlngs = rings[0].map(([lng, lt]) => [lt, lng] as L.LatLngExpression);
      const polygon = L.polygon(latlngs as L.LatLngExpression[], {
        color: "#c9a227",
        weight: 2.5,
        fillColor: "#c9a227",
        fillOpacity: 0.2,
      }).addTo(map);
      map.fitBounds(polygon.getBounds(), { padding: [30, 30], animate: false });
      layerRef.current = polygon;
    } else {
      // Fallback: circle marker if no rings
      const marker = L.circleMarker([lat, lon], {
        radius: 10, color: "#c9a227", weight: 2.5,
        fillColor: "#c9a227", fillOpacity: 0.25,
      }).addTo(map);
      map.setView([lat, lon], 17, { animate: false });
      layerRef.current = marker;
    }
  }, [lat, lon, rings]);

  return <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />;
}

// ── Seeded fake data ─────────────────────────────────────────────────────────
// Seeded fake data so the same parcel always gets the same numbers
function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getIncomeProfile(fid: number) {
  const rand = seedRandom(fid * 7);
  const base = 60000 + Math.floor(rand() * 60000);
  return [
    { label: "0.25mi radius", value: `$${(base + 50000).toLocaleString()}/yr` },
    { label: "0.5mi radius",  value: `$${(base + 30000).toLocaleString()}/yr` },
    { label: "1mi radius",    value: `$${(base + 15000).toLocaleString()}/yr` },
    { label: "2mi radius",    value: `$${base.toLocaleString()}/yr` },
  ];
}

const STREET_NAMES = [
  "Commerce St", "Dexter Ave", "Madison Ave", "Jackson St",
  "Monroe St", "Hull St", "Perry St", "Lawrence St",
];

function getComparables(fid: number) {
  const rand = seedRandom(fid * 13);
  return Array.from({ length: 3 }, () => {
    const num = 100 + Math.floor(rand() * 900);
    const street = STREET_NAMES[Math.floor(rand() * STREET_NAMES.length)];
    const sqft = 820 + Math.floor(rand() * 400);
    return { address: `${num} ${street}`, value: `$${sqft.toLocaleString()}/sqft` };
  });
}

const AI_RECOMMENDATIONS = [
  "Strong transit access and high foot traffic make this location suitable for mixed-use residential with ground-floor retail. Income profile supports market-rate units at $1,000–$1,100/sqft with 20% affordable set-aside to qualify for city incentives.",
  "Proximity to educational anchors and low surrounding income density suggest affordable housing or community facility use. Grant funding available through HUD Choice Neighborhoods program.",
  "This lot's acreage and central location make it a strong candidate for a pocket park or urban garden. Community health data indicates a lack of greenspace within a 0.5mi radius.",
  "Adjacent commercial corridor and high vehicle counts support light retail or food hall development. District 3 has active incentive zones that reduce permitting costs by up to 30%.",
  "Heritage corridor designation limits redevelopment height but creates eligibility for historic preservation tax credits. Cultural or civic use recommended.",
];

function getAiRecommendation(fid: number) {
  return AI_RECOMMENDATIONS[fid % AI_RECOMMENDATIONS.length];
}

function parcelLabel(p: RawParcel) {
  return [p.STREET_NUM, p.STREET_NAM].filter(Boolean).join(" ").trim() || p.LOCATION || p.TAX_MAP || "Vacant Lot";
}

const QUICK_TRIES = [
  "Commerce St, Montgomery",
  "Coosa St, Montgomery",
  "Kimball St, Montgomery",
  "Bibb St, Montgomery",
];

export default function ParcelScore() {
  const [parcels, setParcels] = useState<RawParcel[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<RawParcel | null>(null);
  const [suggestions, setSuggestions] = useState<RawParcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number } | null>(null);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetch(`${serverUrl}map/vacant-parcels`)
      .then(r => r.json())
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data as RawParcel[] : [];
        const filtered = list.filter(p => p.DISPLAY !== "NO");
        setParcels(filtered);
        setLoading(false);

        const fid     = searchParams.get("fid");
        const address = searchParams.get("address");
        const latParam = searchParams.get("lat");
        const lonParam = searchParams.get("lon");

        if (address) setQuery(decodeURIComponent(address));

        // Use lat/lon from URL to show map immediately (no parcel list match needed)
        if (latParam && lonParam) {
          setMapCoords({ lat: Number(latParam), lon: Number(lonParam) });
        }

        // Match parcel list for right-panel data
        if (fid != null) {
          const match = filtered.find(p => String(p.FID) === fid);
          if (match) {
            setSelected(match);
            // Fallback coords from parcel if not in URL
            if (!latParam && match.lat) setMapCoords({ lat: match.lat, lon: match.lon });
          }
        }
      })
      .catch(() => setLoading(false));
  }, [serverUrl, searchParams]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelected(null);
    if (!value.trim()) { setSuggestions([]); return; }
    const q = value.toLowerCase();
    setSuggestions(
      parcels.filter(p => parcelLabel(p).toLowerCase().includes(q)).slice(0, 6)
    );
  }

  function handleSelect(p: RawParcel) {
    setSelected(p);
    setQuery(parcelLabel(p));
    setSuggestions([]);
    if (p.lat && p.lon) setMapCoords({ lat: p.lat, lon: p.lon });
  }

  function handleAnalyze() {
    if (suggestions.length > 0) handleSelect(suggestions[0]);
  }

  const incomeProfile  = selected ? getIncomeProfile(selected.FID)  : null;
  const comparables    = selected ? getComparables(selected.FID)     : null;
  const aiRec          = selected ? getAiRecommendation(selected.FID) : null;

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", backgroundColor: "#f8f4eb", fontFamily: "'Lora', Georgia, serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* Heading */}
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.4rem" }}>
          Score any location
        </h1>
        <p style={{ fontSize: "0.88rem", color: "#888", marginBottom: "1.5rem" }}>
          Search any address or neighborhood — get instant parcel intelligence and AI recommendation
        </p>

        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0" }}>
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              backgroundColor: "#fff",
              border: "1.5px solid #ddd",
              borderRight: "none",
              borderRadius: "6px 0 0 6px",
              padding: "0 1rem",
            }}>
              <span style={{ marginRight: "0.6rem", fontSize: "1rem" }}>🔍</span>
              <input
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAnalyze()}
                placeholder="e.g. 123 Commerce St, Montgomery, AL"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "0.9rem",
                  color: "#333",
                  backgroundColor: "transparent",
                  padding: "0.75rem 0",
                }}
              />
            </div>
            <button
              onClick={handleAnalyze}
              style={{
                backgroundColor: "#c9a227",
                color: "#fff",
                border: "none",
                borderRadius: "0 6px 6px 0",
                padding: "0 1.5rem",
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.88rem",
                fontWeight: 700,
                letterSpacing: "0.03em",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Analyze →
            </button>
          </div>

          {/* Dropdown suggestions */}
          {suggestions.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 80,
              backgroundColor: "#fff",
              border: "1px solid #ddd",
              borderTop: "none",
              borderRadius: "0 0 6px 6px",
              zIndex: 20,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}>
              {suggestions.map(p => (
                <div
                  key={p.FID}
                  onClick={() => handleSelect(p)}
                  style={{
                    padding: "0.6rem 1rem",
                    fontSize: "0.85rem",
                    color: "#333",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fdf8ee")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fff")}
                >
                  {parcelLabel(p)}
                  <span style={{ color: "#aaa", fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                    District {p.District} · {p.CALC_ACRE?.toFixed(2)} ac
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick tries */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.78rem", color: "#999" }}>Try:</span>
          {QUICK_TRIES.map(t => (
            <button
              key={t}
              onClick={() => handleQueryChange(t)}
              style={{
                fontSize: "0.78rem",
                color: "#555",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "20px",
                padding: "0.25rem 0.75rem",
                cursor: "pointer",
                fontFamily: "'Lora', Georgia, serif",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Main content grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem" }}>

          {/* Left — map */}
          <div style={{ borderRadius: "8px", minHeight: "360px", overflow: "hidden", position: "relative" }}>
            {mapCoords ? (
              <ParcelMap lat={mapCoords.lat} lon={mapCoords.lon} />
            ) : (
              // Placeholder when no parcel selected
              <div style={{
                width: "100%", height: "100%", minHeight: "360px",
                backgroundColor: "#e8e4d8",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }} />
                <div style={{
                  position: "relative",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  borderRadius: "20px",
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.82rem", color: "#555", fontStyle: "italic",
                }}>
                  {loading ? "Loading parcels…" : "Search an address above to view the map"}
                </div>
              </div>
            )}
          </div>

          {/* Right — data panels */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Neighbourhood Income */}
            <div>
              <div style={{
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                color: "#999",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
              }}>
                Neighbourhood Income Profile
              </div>
              {incomeProfile ? (
                incomeProfile.map(row => (
                  <div key={row.label} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    color: "#333",
                    padding: "0.3rem 0",
                    borderBottom: "1px solid #ede9dd",
                  }}>
                    <span>{row.label}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "0.8rem", color: "#bbb", fontStyle: "italic" }}>
                  Select a parcel to view income data
                </div>
              )}
            </div>

            {/* Comparable Developments */}
            <div>
              <div style={{
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                color: "#999",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
              }}>
                Comparable Developments
              </div>
              {comparables ? (
                comparables.map(row => (
                  <div key={row.address} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    color: "#333",
                    padding: "0.3rem 0",
                    borderBottom: "1px solid #ede9dd",
                  }}>
                    <span>{row.address}</span>
                    <span style={{ fontWeight: 600 }}>{row.value}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "0.8rem", color: "#bbb", fontStyle: "italic" }}>
                  Select a parcel to view comparables
                </div>
              )}
            </div>

            {/* AI Recommendation */}
            <div>
              <div style={{
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                color: "#999",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
              }}>
                AI Recommendation
              </div>
              {aiRec ? (
                <p style={{
                  fontSize: "0.82rem",
                  color: "#444",
                  lineHeight: 1.7,
                  backgroundColor: "#fff",
                  border: "1px solid #ede9dd",
                  borderRadius: "6px",
                  padding: "0.85rem",
                  margin: 0,
                }}>
                  {aiRec}
                </p>
              ) : (
                <div style={{ fontSize: "0.8rem", color: "#bbb", fontStyle: "italic" }}>
                  Select a parcel to view AI recommendation
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
