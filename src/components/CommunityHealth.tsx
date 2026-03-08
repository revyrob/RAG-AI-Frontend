import { useEffect } from "react"
import type { HealthFlags, Scores } from "../hooks/Useparcelscore"

interface Props {
  healthFlags: HealthFlags | null
  scores: Scores | null
}

const monoFont = "'IBM Plex Mono', monospace"
const bodyFont = "'Outfit', sans-serif"

interface HealthSignal {
  label: string
  value: string
  isHighlight?: boolean
}

function buildSignals(healthFlags: HealthFlags | null, scores: Scores | null): HealthSignal[] {
  const signals: HealthSignal[] = []

  if (scores?.flood_label) {
    signals.push({ label: "Flood Rating", value: scores.flood_label })
  }
  if (scores?.destress_label) {
    signals.push({ label: "Community Distress", value: scores.destress_label })
  }
  if (healthFlags?.food_insecurity_pct != null) {
    signals.push({ label: "Food Insecurity", value: `${healthFlags.food_insecurity_pct}%`, isHighlight: true })
  }
  if (healthFlags?.asthma_rate_multiplier != null) {
    signals.push({ label: "Asthma Rate", value: `${healthFlags.asthma_rate_multiplier}× avg` })
  }
  if (healthFlags?.nearest_grocery_mi != null) {
    signals.push({ label: "Nearest grocery store", value: `${healthFlags.nearest_grocery_mi} mi`, isHighlight: true })
  }
  if (healthFlags?.nearest_clinic_mi != null) {
    signals.push({ label: "Nearest clinic", value: `${healthFlags.nearest_clinic_mi} mi` })
  }
  if (healthFlags?.median_income != null) {
    signals.push({ label: "Median household income", value: `$${healthFlags.median_income.toLocaleString()}`, isHighlight: true })
  }
  if (healthFlags?.unemployment_rate != null) {
    signals.push({ label: "Unemployment", value: `${healthFlags.unemployment_rate}%` })
  }
  if (healthFlags?.workforce_in_tech_pct != null) {
    signals.push({ label: "Tech workforce", value: `${healthFlags.workforce_in_tech_pct}%` })
  }
  if (healthFlags?.veterans_in_workforce != null) {
    signals.push({ label: "Veterans in workforce", value: `${healthFlags.veterans_in_workforce}%` })
  }

  return signals
}

export default function CommunityHealth({ healthFlags, scores }: Props) {
  useEffect(() => {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Outfit:wght@400;600;700&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }, [])

  const signals = buildSignals(healthFlags, scores)

  return (
    <div className="flex flex-col pl-6 py-12">
      <div style={{ fontFamily: bodyFont }}>

        {/* Section title */}
        <div
          className="flex items-center gap-2.5 mb-4"
          style={{ transition: "opacity 0.4s ease, transform 0.4s ease", transitionDelay: "80ms" }}
        >
          <h2
            className="text-sm font-bold tracking-[0.18em] uppercase"
            style={{ fontFamily: monoFont, color: "#000000" }}
          >
            Community Health Signals
          </h2>
        </div>

        {/* Divider */}
        <div
          className="mb-4 h-px"
          style={{ backgroundColor: "#CCC9C9", transition: "opacity 0.4s ease", transitionDelay: "140ms" }}
        />

        {/* Signal rows */}
        <div className="px-5 pb-4 flex flex-col gap-1">
          {signals.map((signal, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 px-4 rounded-xl"
              style={{ backgroundColor: "#f5f3fb" }}
            >
              <span className="text-sm" style={{ color: "#3d3352", fontFamily: bodyFont }}>
                {signal.label}
              </span>
              <span className="text-sm font-semibold" style={{ color: "#2d2440", fontFamily: monoFont }}>
                {signal.value}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-5 mb-4" style={{ borderTop: "1px solid #e8e4f3" }} />

        {/* Quote */}
        <div className="px-5 pb-6">
          <p
            className="text-sm leading-relaxed italic"
            style={{ color: "#4a4060", fontFamily: bodyFont, fontSize: "0.82rem" }}
          >
            "These health indicators directly inform recommendation priority.
            Where childhood health risk is elevated, RISE weights food access
            and green infrastructure above commercial development."
          </p>
        </div>

      </div>
    </div>
  )
}
