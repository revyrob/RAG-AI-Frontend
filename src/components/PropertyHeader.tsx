import { useEffect } from "react"
import type { ParcelScore } from "../hooks/useParcelScore"
import type { Parcel } from "../types"

interface Props {
  parcel: ParcelScore | null
  selectedParcel: Parcel | null
}

export default function PropertyHeader({ parcel, selectedParcel }: Props) {
  useEffect(() => {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Lora:wght@700&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }, [])

  // Strip "Parcel A — ", "Parcel B — " etc from the label so only the story name shows
  const storyTitle = (parcel?.label ?? parcel?.story ?? selectedParcel?.story ?? "No parcel selected")
    .replace(/^Parcel\s+[A-Z]\s*[—–-]\s*/i, "")

  const address     = parcel?.address     ?? selectedParcel?.address     ?? "No parcel selected"
  const acres       = parcel?.acres       ?? selectedParcel?.acres
  const zoneContext = parcel?.scores?.zone_context ?? selectedParcel?.zone_context ?? "—"
  const nearestAnchor = parcel?.nearest_anchor ?? selectedParcel?.nearest_anchor ?? "—"
  const minDist     = parcel?.min_dist    ?? selectedParcel?.min_dist_miles
  const openGrants  = (parcel?.grant_flags ?? []).filter(g => g.status === "open").length
                      ?? selectedParcel?.open_grants
                      ?? 0

  return (
    <div className="flex items-start justify-between px-6 py-3 bg-white border-b pb-8">
      {/* Left: Address + meta */}
      <div className="flex flex-col gap-1">
        <h2
          className="font-bold text-gray-900 tracking-tight"
          style={{ fontFamily: "'Lora', serif", fontSize: "20px" }}
        >
          {address}
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{acres != null ? Number(acres).toFixed(1) : "—"} acres</span>
          <span className="text-gray-300">·</span>
          <span>Zoned {zoneContext}</span>
          <span className="text-gray-300">·</span>
          <span>{nearestAnchor}</span>
        </div>
      </div>

      {/* Right: Flag badges */}
      <div className="flex items-center gap-2 mt-1">
        {(parcel || selectedParcel) ? (
          <>
            <span
              className="px-4 py-1 rounded-full text-xs font-medium tracking-wide"
              style={{ backgroundColor: "#a8d8ea", color: "#1a4a5e" }}
            >
              {storyTitle}
            </span>
            <span
              className="px-4 py-1 rounded-full text-xs font-medium tracking-wide"
              style={{ backgroundColor: "#a8d8ea", color: "#1a4a5e" }}
            >
              {openGrants} grants open
            </span>
            <span
              className="px-4 py-1 rounded-full text-xs font-medium tracking-wide"
              style={{ backgroundColor: "#a8d8ea", color: "#1a4a5e" }}
            >
              {minDist != null ? Number(minDist).toFixed(3) : "—"} mi to anchor
            </span>
          </>
        ) : (
          <span
            className="px-4 py-1 rounded-full text-xs font-medium tracking-wide"
            style={{ backgroundColor: "#f5f5f5", color: "#999" }}
          >
            —
          </span>
        )}
      </div>
    </div>
  )
}
