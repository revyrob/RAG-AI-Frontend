import type { AiAnalysis, Scores } from "../hooks/useParcelScore"

interface Props {
  data: AiAnalysis | null
  scores: Scores | null
}

function ScoreBar({ score, animate }: { score: number; animate: boolean }) {
  return (
    <div className="relative h-1.5 w-[50%] rounded-full overflow-hidden" style={{ backgroundColor: "#CCC9C9" }}>
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
        style={{
          width: animate ? `${score}%` : "0%",
          backgroundColor: "#C4911A",
        }}
      />
    </div>
  )
}

function RankCard({ rank, score, title, body, visible, delayIndex }: {
  rank: number
  score: number
  title: string
  body: string
  visible: boolean
  delayIndex: number
}) {
  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${delayIndex * 80}ms`,
      }}
    >
      {/* Rank + bar row */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="shrink-0 text-xs leading-none"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#737171", letterSpacing: "0.02em" }}
        >
          #{rank}
        </span>
        <div className="flex-1">
          <ScoreBar score={score} animate={visible} />
        </div>
        <span
          className="shrink-0 text-xs font-semibold leading-none"
          style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#C4911A", letterSpacing: "0.04em" }}
        >
          {score}%
        </span>
      </div>

      {/* Title */}
      <h2
        className="text-xl font-bold leading-snug mb-2"
        style={{ fontFamily: "'Lora', serif", color: "#000000" }}
      >
        {title}
      </h2>

      {/* Body */}
      <p
        className="text-sm leading-relaxed"
        style={{ fontFamily: "'Outfit', sans-serif", color: "#000000", opacity: 0.75 }}
      >
        {body}
      </p>
    </div>
  )
}

export default function AiRecommendations({ data }: Props) {
  const visible = !!data

  const recs = data?.recommendations ?? []

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Lora:wght@700&family=Outfit:wght@400;500&display=swap');`}</style>

      <div className="bg-white flex items-start justify-center px-6 py-12">
        <div>
          <div className="flex flex-col gap-8">
            {recs.map((rec, i) => (
              <RankCard
                key={rec.rank}
                rank={rec.rank}
                score={rec.fit_score}
                title={rec.name}
                body={rec.explanation}
                visible={visible}
                delayIndex={i}
              />
            ))}
          </div>

          <div className="mt-10 mb-6 h-px w-full" style={{ backgroundColor: "#CCC9C9" }} />

          {data?.one_line_summary && (
            <p
              className="text-xs leading-relaxed"
              style={{ fontFamily: "'Outfit', sans-serif", color: "#737171" }}
            >
              {data.one_line_summary}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
