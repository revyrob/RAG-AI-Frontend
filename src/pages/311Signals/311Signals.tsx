import { useEffect, useState } from "react";

const RADIUS_MILES = 0.3;

interface Violation {
  offence_num: string;
  parcel_no: string;
  address: string;
  case_date: string;
  case_type: string;
  case_status: string;
  lien_status: string;
  complaint: string;
  year: string | number;
  category: string;
  lat: number;
  lon: number;
}

interface ViolationWithContext extends Violation {
  distanceMiles: number;
}

// Haversine distance in miles
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getUrgency(v: Violation): "URGENT" | "ELEVATED" | "NORMAL" {
  const t = (v.case_type + " " + v.complaint + " " + v.category).toUpperCase();
  if (
    t.includes("DRUG") ||
    t.includes("DUMPING") ||
    t.includes("HAZARD") ||
    t.includes("FIRE")
  )
    return "URGENT";
  if (
    t.includes("NUISANCE") ||
    t.includes("VEGETATION") ||
    t.includes("ABANDON") ||
    t.includes("GRAFFITI") ||
    t.includes("VACANT")
  )
    return "ELEVATED";
  return "NORMAL";
}

function urgencyColor(u: string) {
  if (u === "URGENT")
    return { border: "#ef4444", badge: "#fef2f2", text: "#dc2626" };
  if (u === "ELEVATED")
    return { border: "#f59e0b", badge: "#fffbeb", text: "#d97706" };
  return { border: "#22c55e", badge: "#f0fdf4", text: "#16a34a" };
}

function scoreBoost(u: string) {
  if (u === "URGENT") return 18;
  if (u === "ELEVATED") return 10;
  return 4;
}

function daysAgo(dateStr: string) {
  if (!dateStr) return "unknown date";
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "1 day ago";
  if (diff < 30) return `${diff} days ago`;
  if (diff < 365)
    return `${Math.floor(diff / 30)} month${Math.floor(diff / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diff / 365)} year${Math.floor(diff / 365) > 1 ? "s" : ""} ago`;
}

const FILTER_TYPES = [
  "Overgrown Vegetation",
  "Illegal Dumping",
  "Abandoned Building",
  "Drug Activity",
  "Vacant Lot",
  "Noise Complaint",
  "Graffiti",
];

// Simple in-memory cache so navigating back doesn't re-fetch 20k records
let _violationsCache: Violation[] | null = null;
let _violationsCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export default function Signals311() {
  const [violations, setViolations] = useState<ViolationWithContext[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalFetched, setTotalFetched] = useState(0);
  const [activeFilter, setFilter] = useState<string | null>(null);
  const serverUrl = import.meta.env.VITE_SERVER_URL;

  // Read selected parcel from localStorage (written by CityMap → ParcelScore)
  const stored = (() => {
    try {
      const raw = localStorage.getItem("selectedParcel");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const centerLat: number | null = stored?.lat ?? null;
  const centerLon: number | null = stored?.lon ?? null;
  const parcelAddr: string = stored?.address ?? "Unknown parcel";

  useEffect(() => {
    if (centerLat === null || centerLon === null) return;

    setLoading(true);

    const loadViolations = async () => {
      try {
        let allViolations: Violation[];
        
        // Use cache if fresh
        const now = Date.now();
        if (_violationsCache && now - _violationsCacheTime < CACHE_TTL_MS) {
          allViolations = _violationsCache;
        } else {
          // Ensure trailing slash handled correctly
          const base = serverUrl.endsWith("/") ? serverUrl : serverUrl + "/";
          const res = await fetch(`${base}map/violations-bulk`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          allViolations = (data.violations ?? []) as Violation[];
          _violationsCache = allViolations;
          _violationsCacheTime = now;
          console.log("[311Signals] all violations (fresh fetch):", allViolations);
        }

        setTotalFetched(allViolations.length);

        // Filter to within RADIUS_MILES of the selected parcel centroid
        const nearby: ViolationWithContext[] = [];
        for (const v of allViolations) {
          if (v.lat == null || v.lon == null) continue;
          const dist = haversine(centerLat, centerLon, v.lat, v.lon);
          if (dist <= RADIUS_MILES) {
            nearby.push({ ...v, distanceMiles: dist });
          }
        }

        // Sort by date descending
        nearby.sort(
          (a, b) =>
            new Date(b.case_date).getTime() - new Date(a.case_date).getTime()
        );

        console.log(
          `[311Signals] violations within ${RADIUS_MILES}mi of (${centerLat}, ${centerLon}):`,
          nearby,
        );
        setViolations(nearby);
      } catch (err) {
        console.error("Failed to load violations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadViolations();
  }, [serverUrl, centerLat, centerLon]);

  if (centerLat === null || centerLon === null) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 52px)",
          backgroundColor: "#f8f4eb",
          fontFamily: "'Lora', Georgia, serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#aaa" }}>
          <div style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            No parcel selected
          </div>
          <div style={{ fontSize: "0.82rem", fontStyle: "italic" }}>
            Open a parcel from the City Map and click &ldquo;View 311 distress
            signals&rdquo;
          </div>
        </div>
      </div>
    );
  }

  // Filter by active chip — match against the backend-provided category field
  const filtered = activeFilter
    ? violations.filter(
        (v) =>
          v.category?.toLowerCase() === activeFilter.toLowerCase() ||
          (v.case_type + " " + v.complaint)
            .toLowerCase()
            .includes(activeFilter.toLowerCase())
      )
    : violations;

  const totalOpen = violations.filter(
    (v) => (v.case_status || "").toUpperCase() === "OPEN"
  ).length;
  const totalClosed = violations.length - totalOpen;

  const activeBoosts = filtered.slice(0, 4).map((v) => ({
    label:
      v.case_type.charAt(0).toUpperCase() +
      v.case_type.slice(1).toLowerCase(),
    pts: scoreBoost(getUrgency(v)),
  }));

  return (
    <div
      style={{
        minHeight: "calc(100vh - 52px)",
        backgroundColor: "#f8f4eb",
        fontFamily: "'Lora', Georgia, serif",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 0,
          height: "calc(100vh - 52px)",
        }}
      >
        {/* Left column */}
        <div style={{ overflowY: "auto", padding: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: "0.75rem",
            }}
          >
            311 distress signals
          </h1>

          {/* Selected parcel banner */}
          <div
            style={{
              backgroundColor: "#0e3a47",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              display: "inline-flex",
              flexDirection: "column",
              gap: "0.15rem",
            }}
          >
            <div
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                color: "#c9a227",
                textTransform: "uppercase",
              }}
            >
              Selected parcel
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
              {parcelAddr}
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
              {centerLat?.toFixed(13)}, {centerLon?.toFixed(13)}
            </div>
          </div>

          <p
            style={{
              fontSize: "0.82rem",
              color: "#888",
              marginBottom: "0.5rem",
            }}
          >
            Within {RADIUS_MILES} mi
            &nbsp;&middot;&nbsp;
            {loading
              ? `scanning ${totalFetched.toLocaleString()} records…`
              : `${violations.length} incidents found`}
          </p>

          {/* Filter chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.4rem",
              marginBottom: "1.5rem",
            }}
          >
            {FILTER_TYPES.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(activeFilter === f ? null : f)}
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  border:
                    activeFilter === f
                      ? "1.5px solid #c9a227"
                      : "1px solid #ccc",
                  backgroundColor: activeFilter === f ? "#fdf8ee" : "#fff",
                  color: activeFilter === f ? "#c9a227" : "#555",
                  cursor: "pointer",
                  fontWeight: activeFilter === f ? 600 : 400,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Feed */}
          {loading ? (
            <div
              style={{
                color: "#aaa",
                fontStyle: "italic",
                fontSize: "0.88rem",
              }}
            >
              Loading {RADIUS_MILES} mi radius&hellip; (fetching{" "}
              {totalFetched > 0
                ? `${totalFetched.toLocaleString()} records`
                : "violations"}
              )
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                color: "#aaa",
                fontStyle: "italic",
                fontSize: "0.88rem",
              }}
            >
              No violations found within {RADIUS_MILES} miles.
              {totalFetched > 0 && (
                <span>
                  {" "}
                  ({totalFetched.toLocaleString()} total records scanned)
                </span>
              )}
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
            >
              {filtered.map((v, i) => {
                const urgency = getUrgency(v);
                const colors = urgencyColor(urgency);
                const boost = scoreBoost(urgency);
                const displayType = v.case_type
                  ? v.case_type.charAt(0).toUpperCase() +
                    v.case_type.slice(1).toLowerCase()
                  : v.category;
                return (
                  <div
                    key={`violation-${i}-${v.parcel_no ?? ""}-${v.case_date ?? ""}`}
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #e8e4d8",
                      borderLeft: `4px solid ${colors.border}`,
                      borderRadius: "6px",
                      padding: "1rem 1.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "0.3rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        {displayType}
                        {v.complaint
                          ? ` \u2014 ${v.complaint.charAt(0).toUpperCase() + v.complaint.slice(1).toLowerCase()}`
                          : ""}
                      </div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          color: colors.text,
                          backgroundColor: colors.badge,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          flexShrink: 0,
                          marginLeft: "0.5rem",
                        }}
                      >
                        {urgency}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#888",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {v.address || v.parcel_no || "Unknown address"}
                      &nbsp;&middot;&nbsp;
                      {v.distanceMiles.toFixed(2)} mi away&nbsp;&middot;&nbsp;
                      {daysAgo(v.case_date)}&nbsp;
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color:
                            (v.case_status || "").toUpperCase() === "OPEN"
                              ? "#16a34a"
                              : "#888",
                          fontWeight:
                            (v.case_status || "").toUpperCase() === "OPEN"
                              ? 600
                              : 400,
                        }}
                      >
                        {v.case_status
                          ? v.case_status.charAt(0).toUpperCase() +
                            v.case_status.slice(1).toLowerCase()
                          : "Unknown"}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: colors.text,
                          fontWeight: 600,
                        }}
                      >
                        +{boost}pts urgency boost
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div
          style={{
            borderLeft: "1px solid #e8e4d8",
            padding: "2rem 1.25rem",
            overflowY: "auto",
            backgroundColor: "#faf7f0",
          }}
        >
          {/* Stats */}
          <div
            style={{ display: "flex", gap: "1rem", marginBottom: "1.75rem" }}
          >
            {[
              { label: "In radius", value: violations.length },
              { label: "Open cases", value: totalOpen },
              { label: "Closed cases", value: totalClosed },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#0e3a47",
                  }}
                >
                  {loading ? "\u2014" : s.value}
                </div>
                <div
                  style={{
                    fontSize: "0.62rem",
                    color: "#aaa",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Radius info */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "6px",
              padding: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#16a34a",
                marginBottom: "0.25rem",
              }}
            >
              Search radius: {RADIUS_MILES} mi
            </div>
            <div style={{ fontSize: "0.72rem", color: "#16a34a" }}>
              {totalFetched.toLocaleString()} total records scanned &middot;{" "}
              {violations.length} within radius
            </div>
          </div>

          {/* Score Boost Logic */}
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              color: "#aaa",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Score Boost Logic
          </div>

          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              padding: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#dc2626",
                marginBottom: "0.4rem",
              }}
            >
              Urgent triggers (&times;2 weight)
            </div>
            {[
              "Drug activity on vacant land",
              "Illegal dumping · abandoned bldg",
              "3+ complaints in 30 days",
            ].map((t) => (
              <div
                key={t}
                style={{
                  fontSize: "0.75rem",
                  color: "#dc2626",
                  marginBottom: "0.2rem",
                }}
              >
                {t}
              </div>
            ))}
          </div>

          <div
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "6px",
              padding: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#d97706",
                marginBottom: "0.4rem",
              }}
            >
              Elevated triggers (&times;1.5 weight)
            </div>
            {[
              "Overgrown vegetation",
              "Abandoned vehicle · graffiti",
              "2 complaints in 30 days",
            ].map((t) => (
              <div
                key={t}
                style={{
                  fontSize: "0.75rem",
                  color: "#d97706",
                  marginBottom: "0.2rem",
                }}
              >
                {t}
              </div>
            ))}
          </div>

          <div
            style={{
              height: "1px",
              backgroundColor: "#e8e4d8",
              marginBottom: "1.5rem",
            }}
          />

          {/* Active Boosts */}
          <div
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              color: "#aaa",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Active Boosts Today
          </div>

          {loading ? (
            <div style={{ fontSize: "0.8rem", color: "#bbb", fontStyle: "italic" }}>
              Loading&hellip;
            </div>
          ) : activeBoosts.length === 0 ? (
            <div style={{ fontSize: "0.8rem", color: "#bbb", fontStyle: "italic" }}>
              No active boosts
            </div>
          ) : (
            activeBoosts.map((b, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.82rem",
                  padding: "0.35rem 0",
                  borderBottom: "1px solid #ede9dd",
                }}
              >
                <span style={{ color: "#333" }}>{b.label}</span>
                <span style={{ fontWeight: 700, color: "#c9a227" }}>
                  +{b.pts} pts
                </span>
              </div>
            ))
          )}

          <div
            style={{
              height: "1px",
              backgroundColor: "#e8e4d8",
              margin: "1.5rem 0",
            }}
          />

          <p style={{ fontSize: "0.7rem", color: "#bbb", lineHeight: 1.6 }}>
            311 data from Montgomery ArcGIS Code Violations layer. All{" "}
            {totalFetched.toLocaleString()} violation records are scanned;
            only those within {RADIUS_MILES} mi of the selected parcel are
            shown. Results cached for 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}