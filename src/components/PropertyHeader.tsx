import type { ParcelScore } from "../hooks/useParcelScore"

interface Props {
  parcel: ParcelScore | null
}

export default function PropertyHeader({ parcel }: Props) {
  if (!parcel) return null

  const urgencyFlag = parcel.ai_analysis?.urgency_flag
  const urgencyColor =
    urgencyFlag === "high"     ? "#b91c1c"
    : urgencyFlag === "medium" ? "#92620a"
    : "#1a7a45"

  const minDist    = parcel.min_dist != null ? Number(parcel.min_dist).toFixed(3) : "—"
  const finalScore = parcel.scores?.final ?? "—"

  return (
    <div
      className="px-10 pb-4 flex items-start justify-between gap-4"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <div>
        <h2 className="text-base font-bold text-black leading-snug">
          {parcel.label ?? parcel.story ?? "Parcel"}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">{parcel.address}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {parcel.acres} acres
          {parcel.nearest_anchor ? ` · ${parcel.nearest_anchor} (${minDist} mi)` : ""}
          {parcel.owner ? ` · ${parcel.owner}` : ""}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">RISE Score</span>
          <span className="text-2xl font-black text-black tabular-nums">
            {finalScore}
          </span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
        {urgencyFlag && (
          <span
            className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{
              color: urgencyColor,
              backgroundColor: urgencyColor + "18",
              border: `1px solid ${urgencyColor}40`,
            }}
          >
            {urgencyFlag} urgency
          </span>
        )}
      </div>
    </div>
  )
}
