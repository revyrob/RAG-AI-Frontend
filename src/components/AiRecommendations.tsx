import type { AiAnalysis, Scores } from "../hooks/useParcelScore"

interface Props {
  data: AiAnalysis | null
  scores: Scores | null
}

const COST_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Quick Win <$500K":      { bg: "#e6fdf2", text: "#1a7a45", border: "#3DDC84" },
  "Mid-Term $500K-$5M":    { bg: "#fef9ec", text: "#92620a", border: "#C4911A" },
  "Mid-Term $500K–$5M":    { bg: "#fef9ec", text: "#92620a", border: "#C4911A" },
  "Major $5M+":            { bg: "#fef2f2", text: "#b91c1c", border: "#f87171" },
}

function CostBadge({ tier }: { tier: string }) {
  const style = COST_COLORS[tier] ?? { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" }
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide"
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {tier}
    </span>
  )
}

function FitBar({ score }: { score: number }) {
  const color = score >= 75 ? "#3DDC84" : score >= 50 ? "#C4911A" : "#f87171"
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-bold tabular-nums"
        style={{ fontFamily: "'IBM Plex Mono', monospace", color }}
      >
        {score}
      </span>
    </div>
  )
}

export default function AiRecommendations({ data, scores }: Props) {
  if (!data) {
    return (
      <div
        className="px-4 text-xs text-gray-400 italic"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        No recommendations available.
      </div>
    )
  }

  const urgencyColor =
    data.urgency_flag === "high" ? "#b91c1c"
    : data.urgency_flag === "medium" ? "#92620a"
    : "#1a7a45"

  return (
    <div className="flex flex-col gap-0 overflow-y-auto px-4">

      {/* Summary + urgency */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <p
          className="text-xs text-gray-600 leading-relaxed flex-1"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {data.one_line_summary}
        </p>
        <span
          className="flex-shrink-0 text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: urgencyColor,
            backgroundColor: urgencyColor + "18",
            border: `1px solid ${urgencyColor}40`,
          }}
        >
          {data.urgency_flag}
        </span>
      </div>

      {/* Score breakdown bar */}
      {scores && (
        <div
          className="mb-5 grid grid-cols-2 gap-x-4 gap-y-1.5 p-3 rounded border border-amber-100 bg-amber-50/40 text-xs"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {[
            ["Heritage",   scores.heritage],
            ["Industrial", scores.industrial],
            ["Activity",   scores.activity],
            ["Proximity",  scores.proximity],
            ["Economic",   scores.economic],
            ["Vacancy",    scores.vacancy],
          ].map(([label, val]) => (
            <div key={label as string}>
              <div className="flex justify-between text-gray-500">
                <span>{label as string}</span>
                <span className="font-semibold text-black">{val as number}</span>
              </div>
              <div className="h-1 rounded-full bg-gray-200 overflow-hidden mt-0.5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${val as number}%`,
                    backgroundColor: (val as number) >= 70 ? "#3DDC84" : "#C4911A",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-4">
        {data.recommendations.map((rec) => (
          <div
            key={rec.rank}
            className="border border-gray-100 rounded-lg p-3 hover:border-amber-200 hover:bg-amber-50/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-black text-amber-600"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  #{rec.rank}
                </span>
                <span
                  className="text-sm font-semibold text-black"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {rec.name}
                </span>
              </div>
              <CostBadge tier={rec.cost_tier} />
            </div>

            <FitBar score={rec.fit_score} />

            <p
              className="mt-2 text-xs text-gray-600 leading-relaxed"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {rec.explanation}
            </p>

            {rec.grant_flag && rec.grant_flag !== "None" && (
              <div
                className="mt-2 flex items-center gap-1.5 text-xs text-amber-800"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                <span>🔑</span>
                <span>{rec.grant_flag}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
