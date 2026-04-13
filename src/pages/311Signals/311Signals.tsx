import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const RADIUS_MILES = 0.3;

interface RawParcel {
  FID: number;
  PARCEL_NUM: string;
  STREET_NUM: string;
  STREET_NAM: string;
  LOCATION: string;
  District: number;
  CALC_ACRE: number;
  lat: number;
  lon: number;
}

interface Violation {
  offence_num: string;
  case_date: string;
  case_type: string;
  case_status: string;
  lien_status: string;
  district: string;
  complaint: string;
  year: string;
}

interface ViolationResult {
  parcel_id: string;
  total: number;
  open: number;
  closed: number;
  violations: Violation[];
}

interface ViolationWithContext extends Violation {
  parcelAddress: string;
  distanceMiles: number;
}

// Haversine distance in miles
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
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

function parcelAddress(p: RawParcel): string {
  return [p.STREET_NUM, p.STREET_NAM].filter(Boolean).join(" ") || p.LOCATION || String(p.FID);
}

function getUrgency(v: Violation): "URGENT" | "ELEVATED" | "NORMAL" {
  const t = (v.case_type + " " + v.complaint).toUpperCase();
  if (t.includes("DRUG") || t.includes("DUMPING") || t.includes("HAZARD") || t.includes("FIRE")) return "URGENT";
  if (t.includes("NUISANCE") || t.includes("VEGETATION") || t.includes("ABANDON") || t.includes("GRAFFITI")) return "ELEVATED";
  return "NORMAL";
}

function urgencyColor(u: string) {
  if (u === "URGENT")   return { border: "#ef4444", badge: "#fef2f2", text: "#dc2626" };
  if (u === "ELEVATED") return { border: "#f59e0b", badge: "#fffbeb", text: "#d97706" };
  return                       { border: "#22c55e", badge: "#f0fdf4", text: "#16a34a" };
}

function scoreBoost(u: string) {
  if (u === "URGENT")   return 18;
  if (u === "ELEVATED") return 10;
  return 4;
}

function daysAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "1 day ago";
  if (diff < 30)  return `${diff} days ago`;
  if (diff < 365) return `${Math.floor(diff / 30)} month${Math.floor(diff / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diff / 365)} year${Math.floor(diff / 365) > 1 ? "s" : ""} ago`;
}

const FILTER_TYPES = [
  "Overgrown vegetation", "Illegal dumping", "Abandoned building",
  "Drug activity", "Vacant lot", "Noise complaint", "Graffiti",
];

export default function Signals311() {
  const [violations, setViolations]   = useState<ViolationWithContext[]>([]);
  const [loading, setLoading]         = useState(false);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [activeFilter, setFilter]     = useState<string | null>(null);
  const [searchParams]                = useSearchParams();
  const serverUrl                     = import.meta.env.VITE_SERVER_URL;

  const latParam  = searchParams.get("lat");
  const lonParam  = searchParams.get("lon");
  const parcelNum = searchParams.get("parcel_num");
  const parcelAddr = searchParams.get("address")
    ? decodeURIComponent(searchParams.get("address")!)
    : parcelNum ?? "Unknown parcel";

  const centerLat = latParam ? Number(latParam) : null;
  const centerLon = lonParam ? Number(lonParam) : null;

  useEffect(() => {
    if (centerLat === null || centerLon === null) return;

    setLoading(true);

    // 1. Fetch all parcels, filter to those within 0.3 miles
    fetch(`${serverUrl}map/vacant-parcels`)
      .then(r => r.json())
      .then(async (data: unknown) => {
        const raw: RawParcel[] = Array.isArray(data)
          ? (data as RawParcel[])
          : ((data as { parcels?: RawParcel[] }).parcels ?? []);

        const nearby = raw.filter(p =>
          p.lat != null &&
          p.lon != null &&
          haversine(centerLat!, centerLon!, p.lat, p.lon) <= RADIUS_MILES
        );

        setNearbyCount(nearby.length);

        // 2. Fetch violations for all nearby parcels in parallel
        const settled = await Promise.allSettled(
          nearby.map(p =>
            fetch(`${serverUrl}map/vacant-parcels/${p.PARCEL_NUM}/violations`)
              .then(r => r.json())
              .then((res: ViolationResult) => ({
                parcel: p,
                violations: res.violations ?? [],
                distance: haversine(centerLat!, centerLon!, p.lat, p.lon),
              }))
          )
        );

        // 3. Flatten all violations with address + distance context
        const all: ViolationWithContext[] = settled
          .filter((r): r is PromiseFulfilledResult<{ parcel: RawParcel; violations: Violation[]; distance: number }> =>
            r.status === "fulfilled"
          )
          .flatMap(r =>
            r.value.violations.map(v => ({
              ...v,
              parcelAddress: parcelAddress(r.value.parcel),
              distanceMiles: r.value.distance,
            }))
          )
          .sort((a, b) => new Date(b.case_date).getTime() - new Date(a.case_date).getTime());

        setViolations(all);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [serverUrl, centerLat, centerLon]);

  if (centerLat === null || centerLon === null) {
    return (
      <div style={{ minHeight: "calc(100vh - 52px)", backgroundColor: "#f8f4eb", fontFamily: "'Lora', Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#aaa" }}>
          <div style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No parcel selected</div>
          <div style={{ fontSize: "0.82rem", fontStyle: "italic" }}>Open a parcel from the City Map and click &ldquo;View 311 distress signals&rdquo;</div>
        </div>
      </div>
    );
  }

  const filtered = activeFilter
    ? violations.filter(v =>
        (v.case_type + " " + v.complaint).toLowerCase().includes(activeFilter.toLowerCase())
      )
    : violations;

  const totalOpen   = violations.filter(v => v.case_status === "OPEN").length;
  const totalClosed = violations.filter(v => v.case_status !== "OPEN").length;

  const activeBoosts = filtered.slice(0, 4).map(v => ({
    label: v.case_type.charAt(0) + v.case_type.slice(1).toLowerCase(),
    pts:   scoreBoost(getUrgency(v)),
  }));

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", backgroundColor: "#f8f4eb", fontFamily: "'Lora', Georgia, serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 0, height: "calc(100vh - 52px)" }}>

        {/* Left column */}
        <div style={{ overflowY: "auto", padding: "2rem" }}>

          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.3rem" }}>
            311 distress signals
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#888", marginBottom: "0.5rem" }}>
            {parcelAddr} &nbsp;&middot;&nbsp; within {RADIUS_MILES} mi &nbsp;&middot;&nbsp; {nearbyCount} parcels scanned
          </p>

          {/* Filter chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.5rem" }}>
            {FILTER_TYPES.map(f => (
              <button
                key={f}
                onClick={() => setFilter(activeFilter === f ? null : f)}
                style={{
                  fontFamily: "'Lora', Georgia, serif",
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  border: activeFilter === f ? "1.5px solid #c9a227" : "1px solid #ccc",
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
            <div style={{ color: "#aaa", fontStyle: "italic", fontSize: "0.88rem" }}>Scanning {RADIUS_MILES} mi radius&hellip;</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: "#aaa", fontStyle: "italic", fontSize: "0.88rem" }}>No violations found within {RADIUS_MILES} miles.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filtered.map((v, i) => {
                const urgency = getUrgency(v);
                const colors  = urgencyColor(urgency);
                const boost   = scoreBoost(urgency);
                return (
                  <div
                    key={`${v.offence_num}-${i}`}
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #e8e4d8",
                      borderLeft: `4px solid ${colors.border}`,
                      borderRadius: "6px",
                      padding: "1rem 1.25rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1a1a1a" }}>
                        {v.case_type.charAt(0) + v.case_type.slice(1).toLowerCase()}
                        {v.complaint ? ` \u2014 ${v.complaint.charAt(0) + v.complaint.slice(1).toLowerCase()}` : ""}
                      </div>
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                        color: colors.text, backgroundColor: colors.badge,
                        padding: "0.15rem 0.5rem", borderRadius: "4px",
                        flexShrink: 0, marginLeft: "0.5rem",
                      }}>
                        {urgency}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "#888", marginBottom: "0.5rem" }}>
                      {v.parcelAddress} &nbsp;&middot;&nbsp; {v.distanceMiles.toFixed(2)} mi away &nbsp;&middot;&nbsp; {daysAgo(v.case_date)} &nbsp;
                      <span style={{
                        fontSize: "0.7rem",
                        color: v.case_status === "OPEN" ? "#16a34a" : "#888",
                        fontWeight: v.case_status === "OPEN" ? 600 : 400,
                      }}>
                        {v.case_status.charAt(0) + v.case_status.slice(1).toLowerCase()}
                      </span>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: colors.text, fontWeight: 600 }}>
                        +{boost}pts urgency boost
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{
          borderLeft: "1px solid #e8e4d8",
          padding: "2rem 1.25rem",
          overflowY: "auto",
          backgroundColor: "#faf7f0",
        }}>

          {/* Stats */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.75rem" }}>
            {[
              { label: "Total violations", value: violations.length },
              { label: "Open cases",       value: totalOpen         },
              { label: "Closed cases",     value: totalClosed       },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0e3a47" }}>{loading ? "\u2014" : s.value}</div>
                <div style={{ fontSize: "0.62rem", color: "#aaa", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Radius info */}
          <div style={{
            backgroundColor: "#f0fdf4", border: "1px solid #86efac",
            borderRadius: "6px", padding: "0.75rem", marginBottom: "1rem",
          }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#16a34a", marginBottom: "0.25rem" }}>
              Search radius: {RADIUS_MILES} mi
            </div>
            <div style={{ fontSize: "0.72rem", color: "#16a34a" }}>
              {nearbyCount} parcels within radius &middot; all linked violations included
            </div>
          </div>

          {/* Score Boost Logic */}
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "#aaa", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Score Boost Logic
          </div>

          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#dc2626", marginBottom: "0.4rem" }}>Urgent triggers (&times;2 weight)</div>
            {["Drug activity on vacant land", "Illegal dumping \u00b7 abandoned bldg", "3+ complaints in 30 days"].map(t => (
              <div key={t} style={{ fontSize: "0.75rem", color: "#dc2626", marginBottom: "0.2rem" }}>{t}</div>
            ))}
          </div>

          <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "0.75rem", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#d97706", marginBottom: "0.4rem" }}>Elevated triggers (&times;1.5 weight)</div>
            {["Overgrown vegetation", "Abandoned vehicle \u00b7 graffiti", "2 complaints in 30 days"].map(t => (
              <div key={t} style={{ fontSize: "0.75rem", color: "#d97706", marginBottom: "0.2rem" }}>{t}</div>
            ))}
          </div>

          <div style={{ height: "1px", backgroundColor: "#e8e4d8", marginBottom: "1.5rem" }} />

          {/* Active Boosts */}
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", color: "#aaa", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Active Boosts Today
          </div>

          {loading ? (
            <div style={{ fontSize: "0.8rem", color: "#bbb", fontStyle: "italic" }}>Loading&hellip;</div>
          ) : activeBoosts.length === 0 ? (
            <div style={{ fontSize: "0.8rem", color: "#bbb", fontStyle: "italic" }}>No active boosts</div>
          ) : (
            activeBoosts.map((b, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: "0.82rem", padding: "0.35rem 0",
                borderBottom: "1px solid #ede9dd",
              }}>
                <span style={{ color: "#333" }}>{b.label}</span>
                <span style={{ fontWeight: 700, color: "#c9a227" }}>+{b.pts} pts</span>
              </div>
            ))
          )}

          <div style={{ height: "1px", backgroundColor: "#e8e4d8", margin: "1.5rem 0" }} />

          <p style={{ fontSize: "0.7rem", color: "#bbb", lineHeight: 1.6 }}>
            311 data refreshes every 24h from Montgomery Open Data API. Violations shown for all vacant parcels within {RADIUS_MILES} mi of the selected property.
          </p>
        </div>
      </div>
    </div>
  );
}
