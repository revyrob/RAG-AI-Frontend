import { useEffect } from "react"
import type { FootTrafficData } from "../hooks/useParcelScore"

interface Props {
  data: FootTrafficData | null
}

export default function FootTraffic({ data }: Props) {
  useEffect(() => {
    const link = document.createElement("link")
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap"
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }, [])
  if (!data) {
    return (
      <div
        className="px-4 text-xs text-gray-400 italic mb-4"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        No foot traffic data.
      </div>
    )
  }

  const scoreColor =
    data.score >= 70 ? "#1a7a45"
    : data.score >= 40 ? "#92620a"
    : "#b91c1c"

  const maxVisits = data.top_locations[0]?.visits ?? 1

  return (
    <div className="px-4 mb-5">
      {/* Score header */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-bold uppercase tracking-widest text-gray-500"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Foot Traffic
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-black tabular-nums"
            style={{ fontFamily: "'Outfit', sans-serif", color: scoreColor }}
          >
            {data.score}
          </span>
          <span className="text-xs text-gray-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
            /100
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${data.score}%`, backgroundColor: scoreColor }}
        />
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-2 gap-2 mb-3 text-xs"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="bg-gray-50 rounded p-2">
          <div className="text-gray-400">Locations</div>
          <div className="font-bold text-black">{data.location_count}</div>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <div className="text-gray-400">Total Visits</div>
          <div className="font-bold text-black">{data.total_visits.toLocaleString()}</div>
        </div>
      </div>

      {/* Source badge */}
      <div className="mb-2 flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
            data.source === "arcgis"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
          }`}
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {data.source === "arcgis" ? "✅ ArcGIS Live" : "⚠ Fallback Data"}
        </span>
      </div>

      {/* Top locations */}
      <div className="space-y-1.5">
        {data.top_locations.slice(0, 4).map((loc, i) => (
          <div key={i} className="group">
            <div
              className="flex items-center justify-between text-xs mb-0.5"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span className="text-gray-700 truncate flex-1 mr-2">{loc.name}</span>
              <span className="text-gray-400 flex-shrink-0">{loc.dist_miles.toFixed(2)}mi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(loc.visits / maxVisits) * 100}%`,
                    backgroundColor: i === 0 ? "#C4911A" : "#d1d5db",
                  }}
                />
              </div>
              <span
                className="text-xs tabular-nums text-gray-500 w-14 text-right"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {loc.visits.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
