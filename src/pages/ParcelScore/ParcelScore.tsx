import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Shared localStorage type ─────────────────────────────────────────────────
export interface StoredParcel {
  fid: number;
  parcelNum: string;
  address: string;
  lat: number;
  lon: number;
  rings: number[][][] | null;
}

function readStoredParcel(): StoredParcel | null {
  try {
    const raw = localStorage.getItem("selectedParcel");
    return raw ? (JSON.parse(raw) as StoredParcel) : null;
  } catch {
    return null;
  }
}

// ── Raw parcel type (for search) ─────────────────────────────────────────────
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
  rings?: number[][][];
}

// ── Leaflet map component ────────────────────────────────────────────────────
function ParcelMap({
  lat,
  lon,
  address,
}: {
  lat: number;
  lon: number;
  address: string;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapDivRef.current) return;

    const map = L.map(mapDivRef.current, { zoomControl: true }).setView(
      [lat, lon],
      17,
    );

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: ["a", "b", "c", "d"],
      },
    ).addTo(map);

    L.circleMarker([lat, lon], {
      radius: 10,
      color: "#c9a227",
      weight: 2.5,
      fillColor: "#c9a227",
      fillOpacity: 0.7,
    })
      .addTo(map)
      .bindPopup(address, { closeButton: false })
      .openPopup();

    return () => {
      map.remove();
    };
  }, [lat, lon, address]);

  return <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />;
}

// ── Seeded fake analytics ────────────────────────────────────────────────────
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
    const num    = 100 + Math.floor(rand() * 900);
    const street = STREET_NAMES[Math.floor(rand() * STREET_NAMES.length)];
    const sqft   = 820 + Math.floor(rand() * 400);
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
  return (
    [p.STREET_NUM, p.STREET_NAM].filter(Boolean).join(" ").trim() ||
    p.LOCATION ||
    p.TAX_MAP ||
    "Vacant Lot"
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ParcelScore() {
  // Source of truth: whatever was selected on CityMap (persisted in localStorage)
  const [storedParcel, setStoredParcel] = useState<StoredParcel | null>(readStoredParcel);

  // Parcel list — fetched only for the search-another-parcel feature
  const [parcels, setParcels]         = useState<RawParcel[]>([]);
  const [query, setQuery]             = useState("");
  const [suggestions, setSuggestions] = useState<RawParcel[]>([]);
  const [loading, setLoading]         = useState(true);

  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const navigate  = useNavigate();

  // Fetch parcel list for search
  useEffect(() => {
    fetch(`${serverUrl}map/vacant-parcels`)
      .then((r) => r.json())
      .then((data: unknown) => {
        const raw: RawParcel[] = Array.isArray(data)
          ? (data as RawParcel[])
          : ((data as { parcels?: RawParcel[] }).parcels ?? []);
        setParcels(raw.filter((p) => p.DISPLAY !== "NO"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [serverUrl]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (!value.trim()) { setSuggestions([]); return; }
    const q = value.split(",")[0].toLowerCase().trim();
    setSuggestions(
      parcels.filter((p) => parcelLabel(p).toLowerCase().includes(q)).slice(0, 6),
    );
  }

  function handleSelect(p: RawParcel) {
    const stored: StoredParcel = {
      fid:       p.FID,
      parcelNum: p.PARCEL_NUM,
      address:   parcelLabel(p),
      lat:       p.lat,
      lon:       p.lon,
      rings:     p.rings ?? null,
    };
    localStorage.setItem("selectedParcel", JSON.stringify(stored));
    setStoredParcel(stored);
    setQuery("");
    setSuggestions([]);
  }

  function handleAnalyze() {
    if (suggestions.length > 0) handleSelect(suggestions[0]);
  }

  // Analytics driven by stored FID
  const fid          = storedParcel?.fid ?? null;
  const incomeProfile = fid != null ? getIncomeProfile(fid) : null;
  const comparables   = fid != null ? getComparables(fid)   : null;
  const aiRec         = fid != null ? getAiRecommendation(fid) : null;

  return (
    <div
      style={{
        minHeight: "calc(100vh - 52px)",
        backgroundColor: "#f8f4eb",
        fontFamily: "'Lora', Georgia, serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2rem" }}>

        {/* ── Selected parcel banner (from CityMap) ── */}
        {storedParcel ? (
          <div
            style={{
              backgroundColor: "#0e3a47",
              borderRadius: "8px",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.12em",
                  color: "#c9a227",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                Selected parcel
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
                {storedParcel.address}
              </div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", marginTop: "0.2rem" }}>
                {storedParcel.lat.toFixed(5)}, {storedParcel.lon.toFixed(5)}
                {storedParcel.parcelNum ? ` · ${storedParcel.parcelNum}` : ""}
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("selectedParcel");
                setStoredParcel(null);
              }}
              style={{
                background: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.5)",
                borderRadius: "4px",
                padding: "0.3rem 0.6rem",
                cursor: "pointer",
                fontSize: "0.72rem",
                fontFamily: "'Lora', Georgia, serif",
                flexShrink: 0,
              }}
            >
              Clear
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.4rem" }}>
              Score any location
            </h1>
            <p style={{ fontSize: "0.88rem", color: "#888", marginBottom: "1.5rem" }}>
              Select a parcel on the City Map, or search below.
            </p>
          </>
        )}

       

        {/* ── Main content grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem" }}>

          {/* Left — Leaflet map */}
          <div style={{ height: "360px", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
            {storedParcel ? (
              <ParcelMap
                key={storedParcel.fid}
                lat={storedParcel.lat}
                lon={storedParcel.lon}
                address={storedParcel.address}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#e8e4d8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    backgroundColor: "rgba(255,255,255,0.85)",
                    borderRadius: "20px",
                    padding: "0.5rem 1.25rem",
                    fontSize: "0.82rem",
                    color: "#555",
                    fontStyle: "italic",
                  }}
                >
                  Select a parcel from the City Map to view it here
                </div>
              </div>
            )}
          </div>

          {/* Right — data panels */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* Neighbourhood Income */}
            <div>
              <div style={{ fontSize: "0.68rem", letterSpacing: "0.12em", color: "#999", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Neighbourhood Income Profile
              </div>
              {incomeProfile ? (
                incomeProfile.map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#333", padding: "0.3rem 0", borderBottom: "1px solid #ede9dd" }}>
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
              <div style={{ fontSize: "0.68rem", letterSpacing: "0.12em", color: "#999", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                Comparable Developments
              </div>
              {comparables ? (
                comparables.map((row) => (
                  <div key={row.address} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#333", padding: "0.3rem 0", borderBottom: "1px solid #ede9dd" }}>
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
              <div style={{ fontSize: "0.68rem", letterSpacing: "0.12em", color: "#999", marginBottom: "0.75rem", textTransform: "uppercase" }}>
                AI Recommendation
              </div>
              {aiRec ? (
                <p style={{ fontSize: "0.82rem", color: "#444", lineHeight: 1.7, backgroundColor: "#fff", border: "1px solid #ede9dd", borderRadius: "6px", padding: "0.85rem", margin: 0 }}>
                  {aiRec}
                </p>
              ) : (
                <div style={{ fontSize: "0.8rem", color: "#bbb", fontStyle: "italic" }}>
                  Select a parcel to view AI recommendation
                </div>
              )}
            </div>

            {/* 311 Signals — available whenever a parcel is stored */}
            {storedParcel && (
              <button
                onClick={() => navigate("/311-signals")}
                style={{
                  width: "100%",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  padding: "0.55rem",
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                View 311 distress signals →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
