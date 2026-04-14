import { useEffect, useState } from "react";

interface Landmark {
  id: number;
  name: string;
  lat: string;
  lon: string;
  heritage: number;
  industrial: number;
  radius: number;
}

interface ScoreWeight {
  key: string;
  label: string;
  color: string;
  value: number;
}

const GIS_FIELDS = [
  { api: "FID",        rise: "Parcel ID" },
  { api: "PARCEL_NUM", rise: "Parcel Number" },
  { api: "STREET_NUM", rise: "Street Number" },
  { api: "STREET_NAM", rise: "Street Name" },
  { api: "LOCATION",   rise: "Location Label" },
  { api: "District",   rise: "Council District" },
  { api: "CALC_ACRE",  rise: "Lot Size (acres)" },
  { api: "SQ_FT",      rise: "Lot Size (sq ft)" },
  { api: "STRATEGY",   rise: "Disposition Strategy" },
  { api: "DISPLAY",    rise: "Show on Map" },
  { api: "lat",        rise: "Latitude" },
  { api: "lon",        rise: "Longitude" },
  { api: "rings",      rise: "Polygon Geometry" },
];

const VIOLATION_FIELDS = [
  { api: "offence_num",  rise: "Case Number" },
  { api: "case_date",    rise: "Filed Date" },
  { api: "case_type",    rise: "Violation Type" },
  { api: "case_status",  rise: "Status (Open/Closed)" },
  { api: "lien_status",  rise: "Lien Status" },
  { api: "district",     rise: "Council District" },
  { api: "complaint",    rise: "Complaint Description" },
  { api: "year",         rise: "Year" },
];

function FieldTable({ rows }: { rows: { api: string; rise: string }[] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "0.4rem 0.6rem", borderBottom: "1px solid #e8e4d8", color: "#888", fontWeight: 600, width: "50%" }}>
            API Field
          </th>
          <th style={{ textAlign: "left", padding: "0.4rem 0.6rem", borderBottom: "1px solid #e8e4d8", color: "#888", fontWeight: 600 }}>
            RISE Field
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.api} style={{ backgroundColor: i % 2 === 0 ? "#faf7f0" : "#fff" }}>
            <td style={{ padding: "0.35rem 0.6rem", fontFamily: "monospace", color: "#0e3a47", fontSize: "0.78rem" }}>{r.api}</td>
            <td style={{ padding: "0.35rem 0.6rem", color: "#444" }}>{r.rise}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EndpointsSection() {
  const serverUrl = import.meta.env.VITE_SERVER_URL ?? "http://localhost:8000/";
  const [gisUrl, setGisUrl] = useState(`${serverUrl}map/vacant-parcels`);
  const [violationsUrl, setViolationsUrl] = useState(`${serverUrl}map/vacant-parcels/{parcel_num}/violations`);

  return (
    <div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0e3a47", marginBottom: "0.25rem" }}>Endpoints</h2>
      <p style={{ fontSize: "0.82rem", color: "#888", marginBottom: "1.75rem" }}>
        Backend API URLs consumed by RISE. Edit to point at staging or production.
      </p>

      <div style={{ marginBottom: "2rem" }}>
        <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: "0.4rem" }}>
          GIS / Parcel Data
        </label>
        <input
          value={gisUrl}
          onChange={e => setGisUrl(e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "0.55rem 0.75rem",
            border: "1px solid #ddd", borderRadius: "6px",
            fontFamily: "monospace", fontSize: "0.82rem", color: "#0e3a47",
            backgroundColor: "#faf7f0",
            marginBottom: "1rem",
          }}
        />
        <div style={{ border: "1px solid #e8e4d8", borderRadius: "6px", overflow: "hidden" }}>
          <FieldTable rows={GIS_FIELDS} />
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: "0.4rem" }}>
          311 Violations
        </label>
        <input
          value={violationsUrl}
          onChange={e => setViolationsUrl(e.target.value)}
          style={{
            width: "100%", boxSizing: "border-box",
            padding: "0.55rem 0.75rem",
            border: "1px solid #ddd", borderRadius: "6px",
            fontFamily: "monospace", fontSize: "0.82rem", color: "#0e3a47",
            backgroundColor: "#faf7f0",
            marginBottom: "1rem",
          }}
        />
        <div style={{ border: "1px solid #e8e4d8", borderRadius: "6px", overflow: "hidden" }}>
          <FieldTable rows={VIOLATION_FIELDS} />
        </div>
      </div>
    </div>
  );
}

const INITIAL_LANDMARKS: Landmark[] = [
  { id: 1, name: "Dexter Avenue Baptist Church", lat: "32.3776", lon: "-86.3003", heritage: 90, industrial: 10, radius: 0.5 },
  { id: 2, name: "Alabama State Capitol",         lat: "32.3776", lon: "-86.2996", heritage: 95, industrial: 5,  radius: 0.3 },
  { id: 3, name: "Montgomery Riverfront Park",    lat: "32.3673", lon: "-86.2952", heritage: 60, industrial: 20, radius: 0.4 },
  { id: 4, name: "Hyundai Plant (Wetumpka Rd)",   lat: "32.4321", lon: "-86.2701", heritage: 10, industrial: 95, radius: 1.0 },
];

function LandmarksSection() {
  const [landmarks, setLandmarks] = useState<Landmark[]>(INITIAL_LANDMARKS);
  const [form, setForm] = useState({ name: "", lat: "", lon: "", heritage: 50, industrial: 50, radius: 0.5 });

  function remove(id: number) {
    setLandmarks(prev => prev.filter(l => l.id !== id));
  }

  function add() {
    if (!form.name || !form.lat || !form.lon) return;
    setLandmarks(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ name: "", lat: "", lon: "", heritage: 50, industrial: 50, radius: 0.5 });
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0e3a47", marginBottom: "0.25rem" }}>Landmarks</h2>
      <p style={{ fontSize: "0.82rem", color: "#888", marginBottom: "1.75rem" }}>
        Proximity scoring anchors. Heritage and industrial influence weights are applied when scoring nearby parcels.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "2rem" }}>
        {landmarks.map(l => (
          <div key={l.id} style={{
            backgroundColor: "#fff", border: "1px solid #e8e4d8",
            borderRadius: "8px", padding: "0.85rem 1rem",
            position: "relative",
          }}>
            <button
              onClick={() => remove(l.id)}
              style={{
                position: "absolute", top: "0.5rem", right: "0.6rem",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "1rem", color: "#bbb", lineHeight: 1,
              }}
              title="Remove"
            >&times;</button>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1a1a1a", marginBottom: "0.3rem", paddingRight: "1rem" }}>
              {l.name}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#aaa", fontFamily: "monospace", marginBottom: "0.6rem" }}>
              {l.lat}, {l.lon} &nbsp;&middot;&nbsp; {l.radius} mi radius
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "4px", backgroundColor: "#fef2f2", color: "#dc2626", fontWeight: 600 }}>
                Heritage {l.heritage}%
              </span>
              <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "4px", backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: 600 }}>
                Industrial {l.industrial}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        border: "1px dashed #c9a227", borderRadius: "8px",
        padding: "1.25rem", backgroundColor: "#fdf8ee",
      }}>
        <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c9a227", marginBottom: "1rem", fontWeight: 600 }}>
          Add Landmark
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.72rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Rosa Parks Museum"
              style={{ width: "100%", boxSizing: "border-box", padding: "0.45rem 0.65rem", border: "1px solid #ddd", borderRadius: "5px", fontSize: "0.82rem", fontFamily: "inherit" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Latitude</label>
            <input value={form.lat} onChange={e => setForm(p => ({ ...p, lat: e.target.value }))}
              placeholder="32.3776"
              style={{ width: "100%", boxSizing: "border-box", padding: "0.45rem 0.65rem", border: "1px solid #ddd", borderRadius: "5px", fontSize: "0.82rem", fontFamily: "monospace" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Longitude</label>
            <input value={form.lon} onChange={e => setForm(p => ({ ...p, lon: e.target.value }))}
              placeholder="-86.3003"
              style={{ width: "100%", boxSizing: "border-box", padding: "0.45rem 0.65rem", border: "1px solid #ddd", borderRadius: "5px", fontSize: "0.82rem", fontFamily: "monospace" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Heritage influence %</label>
            <input type="number" min={0} max={100} value={form.heritage}
              onChange={e => setForm(p => ({ ...p, heritage: Number(e.target.value) }))}
              style={{ width: "100%", boxSizing: "border-box", padding: "0.45rem 0.65rem", border: "1px solid #ddd", borderRadius: "5px", fontSize: "0.82rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Industrial influence %</label>
            <input type="number" min={0} max={100} value={form.industrial}
              onChange={e => setForm(p => ({ ...p, industrial: Number(e.target.value) }))}
              style={{ width: "100%", boxSizing: "border-box", padding: "0.45rem 0.65rem", border: "1px solid #ddd", borderRadius: "5px", fontSize: "0.82rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.72rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Radius (miles)</label>
            <input type="number" min={0.1} max={5} step={0.1} value={form.radius}
              onChange={e => setForm(p => ({ ...p, radius: Number(e.target.value) }))}
              style={{ width: "100%", boxSizing: "border-box", padding: "0.45rem 0.65rem", border: "1px solid #ddd", borderRadius: "5px", fontSize: "0.82rem" }} />
          </div>
        </div>
        <button
          onClick={add}
          style={{
            backgroundColor: "#0e3a47", color: "#c9a227",
            border: "none", borderRadius: "5px",
            padding: "0.5rem 1.25rem",
            fontFamily: "inherit", fontSize: "0.8rem",
            fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em",
          }}
        >
          Add landmark
        </button>
      </div>
    </div>
  );
}

const INITIAL_WEIGHTS: ScoreWeight[] = [
  { key: "heritage",   label: "Heritage proximity",    color: "#dc2626", value: 25 },
  { key: "industrial", label: "Industrial proximity",  color: "#2563eb", value: 20 },
  { key: "activity",   label: "Foot traffic potential", color: "#7c3aed", value: 15 },
  { key: "proximity",  label: "Civic proximity",        color: "#0891b2", value: 10 },
  { key: "economic",   label: "Economic indicators",    color: "#059669", value: 10 },
  { key: "vacancy",    label: "Vacancy cluster",        color: "#d97706", value: 10 },
  { key: "flood",      label: "Flood risk (inverse)",   color: "#9ca3af", value: 5  },
  { key: "311",        label: "311 distress signals",   color: "#ef4444", value: 5  },
];

function ScoreWeightsSection({ serverUrl }: { serverUrl: string }) {
  const [weights, setWeights] = useState<ScoreWeight[]>(INITIAL_WEIGHTS);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load existing weights from backend on mount
  useEffect(() => {
    fetch(`${serverUrl}config/montgomery/weights`)
      .then(r => r.json())
      .then((data: { weights?: Record<string, number> }) => {
        if (data.weights) {
          // Backend stores decimals (0.25); convert to percentages for the UI
          setWeights(prev => prev.map(w => ({
            ...w,
            value: data.weights![w.key] != null
              ? Math.round(data.weights![w.key] * 100)
              : w.value,
          })));
        }
      })
      .catch(() => { /* keep defaults if endpoint not yet available */ })
      .finally(() => setLoading(false));
  }, [serverUrl]);

  const total = weights.reduce((s, w) => s + w.value, 0);

  function update(key: string, val: number) {
    setWeights(prev => prev.map(w => w.key === key ? { ...w, value: val } : w));
    setSaved(false);
    setSaveError(null);
  }

  function save() {
    if (total !== 100) return;
    setSaveError(null);
    // Convert UI percentages back to decimals for the backend
    const payload: Record<string, number> = {};
    weights.forEach(w => { payload[w.key] = w.value / 100; });
    fetch(`${serverUrl}config/montgomery/weights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weights: payload }),
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      })
      .catch(err => setSaveError(`Failed to save: ${err.message}`));
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0e3a47", marginBottom: "0.25rem" }}>Score Weights</h2>
      <p style={{ fontSize: "0.82rem", color: "#888", marginBottom: "1.75rem" }}>
        Dimension weights used in the composite parcel score. Must total exactly 100%.
        {loading && <span style={{ marginLeft: "0.5rem", color: "#c9a227", fontStyle: "italic" }}>Loading saved weights…</span>}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", marginBottom: "1.75rem" }}>
        {weights.map(w => (
          <div key={w.key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.85rem", color: "#1a1a1a" }}>{w.label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: w.color }}>{w.value}%</span>
            </div>
            <div style={{ position: "relative", height: "6px", backgroundColor: "#e8e4d8", borderRadius: "3px" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, height: "100%",
                width: `${w.value}%`, backgroundColor: w.color,
                borderRadius: "3px", transition: "width 0.15s",
              }} />
            </div>
            <input
              type="range" min={0} max={60} step={1}
              value={w.value}
              onChange={e => update(w.key, Number(e.target.value))}
              style={{ width: "100%", marginTop: "0.2rem", accentColor: w.color }}
            />
          </div>
        ))}
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 1rem",
        border: `1px solid ${total === 100 ? "#86efac" : "#fca5a5"}`,
        borderRadius: "6px",
        backgroundColor: total === 100 ? "#f0fdf4" : "#fef2f2",
        marginBottom: "1rem",
      }}>
        <span style={{ fontSize: "0.85rem", color: total === 100 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
          Total: {total}%{total !== 100 ? ` (${total > 100 ? "over" : "under"} by ${Math.abs(100 - total)}%)` : " — balanced"}
        </span>
        <button
          onClick={save}
          disabled={total !== 100}
          style={{
            backgroundColor: total === 100 ? "#0e3a47" : "#ccc",
            color: total === 100 ? "#c9a227" : "#fff",
            border: "none", borderRadius: "5px",
            padding: "0.45rem 1.25rem",
            fontFamily: "inherit", fontSize: "0.8rem",
            fontWeight: 600, cursor: total === 100 ? "pointer" : "not-allowed",
            letterSpacing: "0.05em",
          }}
        >
          {saved ? "Saved!" : "Save weights"}
        </button>
      </div>

      {saveError && (
        <div style={{ fontSize: "0.78rem", color: "#dc2626", marginBottom: "0.75rem" }}>
          {saveError}
        </div>
      )}
      <p style={{ fontSize: "0.72rem", color: "#bbb", lineHeight: 1.6 }}>
        Weights are saved to the backend and applied when scoring parcels for this city.
      </p>
    </div>
  );
}

type NavItem = "endpoints" | "landmarks" | "weights";

const NAV_ITEMS: { key: NavItem; label: string }[] = [
  { key: "endpoints",  label: "Endpoints"     },
  { key: "landmarks",  label: "Landmarks"     },
  { key: "weights",    label: "Score Weights" },
];

export default function ConfigPage() {
  const [active, setActive] = useState<NavItem>("endpoints");
  const serverUrl = import.meta.env.VITE_SERVER_URL ?? "http://localhost:8000/";

  return (
    <div style={{
      minHeight: "calc(100vh - 52px)",
      backgroundColor: "#f8f4eb",
      fontFamily: "'Lora', Georgia, serif",
      display: "grid",
      gridTemplateColumns: "200px 1fr",
    }}>
      <nav style={{
        borderRight: "1px solid #e8e4d8",
        backgroundColor: "#faf7f0",
        padding: "2rem 0",
      }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#bbb", padding: "0 1.25rem", marginBottom: "0.75rem" }}>
          Configuration
        </div>
        {NAV_ITEMS.map(n => (
          <button
            key={n.key}
            onClick={() => setActive(n.key)}
            style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "0.6rem 1.25rem",
              background: "none", border: "none",
              borderLeft: active === n.key ? "3px solid #c9a227" : "3px solid transparent",
              backgroundColor: active === n.key ? "#fdf8ee" : "transparent",
              color: active === n.key ? "#0e3a47" : "#666",
              fontFamily: "inherit",
              fontSize: "0.88rem",
              fontWeight: active === n.key ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: "2rem 2.5rem", overflowY: "auto" }}>
        {active === "endpoints"  && <EndpointsSection />}
        {active === "landmarks"  && <LandmarksSection />}
        {active === "weights"    && <ScoreWeightsSection serverUrl={serverUrl} />}
      </div>
    </div>
  );
}
