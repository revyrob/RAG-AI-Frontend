import type { GrantFlag, Scores } from "../hooks/useParcelScore"

interface Props {
  grants: GrantFlag[] | null
  scores: Scores | null
}

function UrgencyRing({ daysRemaining }: { daysRemaining: number }) {
  const color =
    daysRemaining <= 14 ? "#b91c1c"
    : daysRemaining <= 30 ? "#92620a"
    : "#1a7a45"
  return (
    <span
      className="text-xs font-bold tabular-nums"
      style={{ fontFamily: "'IBM Plex Mono', monospace", color }}
    >
      {daysRemaining}d
    </span>
  )
}

export default function GrantsLiveStatus({ grants, scores }: Props) {
  if (!grants) {
    return (
      <div
        className="px-4 text-xs text-gray-400 italic"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        No grant data.
      </div>
    )
  }

  const open   = grants.filter((g) => g.status === "open")
  const closed = grants.filter((g) => g.status === "closed")

  return (
    <div className="px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-bold uppercase tracking-widest text-gray-500"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Grants
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-semibold"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {open.length} open
        </span>
      </div>

      {/* 311 distress signal */}
      {scores && (
        <div
          className="mb-3 flex items-center justify-between rounded border border-amber-100 bg-amber-50/50 px-2.5 py-2 text-xs"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          <span className="text-gray-600">311 Distress</span>
          <span className="font-bold text-black">{scores.destress_label}</span>
        </div>
      )}

      {/* Flood risk */}
      {scores && (
        <div
          className="mb-3 flex items-center justify-between rounded border border-blue-100 bg-blue-50/50 px-2.5 py-2 text-xs"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          <span className="text-gray-600">Flood Risk</span>
          <span className="font-bold text-black">{scores.flood_label}</span>
        </div>
      )}

      {/* Open grants */}
      <div className="space-y-2 mb-3">
        {open.map((g, i) => (
          <div
            key={i}
            className="rounded border border-green-100 bg-green-50/40 p-2.5"
          >
            <div className="flex items-start justify-between gap-1 mb-1">
              <span
                className="text-xs font-semibold text-gray-800 leading-tight flex-1"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {g.name}
              </span>
              {g.days_remaining != null && (
                <UrgencyRing daysRemaining={g.days_remaining} />
              )}
            </div>
            <div
              className="flex items-center gap-3 text-xs text-gray-500"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {g.eligibility_pct != null && (
                <span>covers {g.eligibility_pct}%</span>
              )}
              {g.match && <span>match {g.match}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Closed grants */}
      {closed.length > 0 && (
        <div className="space-y-1.5">
          {closed.map((g, i) => (
            <div
              key={i}
              className="rounded border border-gray-100 bg-gray-50/40 p-2 opacity-60"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs text-gray-500 line-through"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {g.name}
                </span>
                <span
                  className="text-xs text-gray-400"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  closed
                </span>
              </div>
              {g.note && (
                <p
                  className="text-xs text-gray-400 mt-0.5 no-underline"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", textDecoration: "none" }}
                >
                  {g.note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
