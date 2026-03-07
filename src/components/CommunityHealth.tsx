import type { HealthFlags, Scores } from "../hooks/useParcelScore"

interface Props {
  healthFlags: HealthFlags | null
  scores: Scores | null
}

function StatRow({
  label,
  value,
  unit = "",
  severity = "neutral",
}: {
  label: string
  value: string | number
  unit?: string
  severity?: "critical" | "warning" | "good" | "neutral"
}) {
  const color =
    severity === "critical" ? "#b91c1c"
    : severity === "warning"  ? "#92620a"
    : severity === "good"     ? "#1a7a45"
    : "#374151"

  const bg =
    severity === "critical" ? "#fef2f2"
    : severity === "warning"  ? "#fef9ec"
    : severity === "good"     ? "#e6fdf2"
    : "#f9fafb"

  return (
    <div
      className="rounded p-2.5 mb-2"
      style={{ backgroundColor: bg, fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <div className="text-xs text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-bold" style={{ color }}>
        {value}
        {unit && <span className="text-xs font-normal ml-1 text-gray-500">{unit}</span>}
      </div>
    </div>
  )
}

function getSeverity(key: keyof HealthFlags, value: number): "critical" | "warning" | "good" | "neutral" {
  switch (key) {
    case "food_insecurity_pct":
      return value >= 30 ? "critical" : value >= 15 ? "warning" : "good"
    case "asthma_rate_multiplier":
      return value >= 2 ? "critical" : value >= 1.5 ? "warning" : "good"
    case "nearest_clinic_mi":
      return value >= 2 ? "critical" : value >= 1 ? "warning" : "good"
    case "nearest_grocery_mi":
      return value >= 2 ? "critical" : value >= 1 ? "warning" : "good"
    case "unemployment_rate":
      return value >= 10 ? "critical" : value >= 6 ? "warning" : "good"
    case "workforce_in_tech_pct":
      return value < 5 ? "warning" : value >= 15 ? "good" : "neutral"
    case "veterans_in_workforce":
      return "neutral"
    case "median_income":
      return value < 25000 ? "critical" : value < 40000 ? "warning" : "good"
    default:
      return "neutral"
  }
}

const HEALTH_LABELS: Record<keyof HealthFlags, { label: string; unit: string }> = {
  food_insecurity_pct:      { label: "Food Insecurity",      unit: "%" },
  asthma_rate_multiplier:   { label: "Asthma Rate",          unit: "× avg" },
  nearest_clinic_mi:        { label: "Nearest Clinic",       unit: "mi" },
  nearest_grocery_mi:       { label: "Nearest Grocery",      unit: "mi" },
  median_income:             { label: "Median Income",        unit: "$/yr" },
  unemployment_rate:         { label: "Unemployment",         unit: "%" },
  workforce_in_tech_pct:     { label: "Tech Workforce",       unit: "%" },
  veterans_in_workforce:     { label: "Veterans",             unit: "%" },
}

export default function CommunityHealth({ healthFlags, scores }: Props) {
  if (!healthFlags) {
    return (
      <div
        className="px-4 text-xs text-gray-400 italic"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        No health data.
      </div>
    )
  }

  const entries = Object.entries(healthFlags) as [keyof HealthFlags, number][]

  return (
    <div className="px-4 overflow-y-auto">
      {entries.map(([key, value]) => {
        const meta = HEALTH_LABELS[key]
        if (!meta) return null
        const sev = getSeverity(key, value)
        const displayValue =
          key === "median_income"
            ? `$${Number(value).toLocaleString()}`
            : value
        return (
          <StatRow
            key={key}
            label={meta.label}
            value={displayValue}
            unit={key === "median_income" ? "" : meta.unit}
            severity={sev}
          />
        )
      })}

      {/* 311 top complaints */}
      {scores?.destress_top_complaints?.length > 0 && (
        <div className="mt-3">
          <div
            className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Top 311 Complaints
          </div>
          {scores.destress_top_complaints.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs mb-1.5 px-2.5 py-1.5 rounded bg-gray-50 border border-gray-100"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <span className="text-gray-600 truncate flex-1 mr-2">{c.type}</span>
              <span className="font-bold text-black flex-shrink-0">{c.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
