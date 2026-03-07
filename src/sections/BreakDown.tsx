import AiRecommendations from "../components/AiRecommendations"
import CommunityHealth from "../components/CommunityHealth"
import FootTraffic from "../components/FootTraffic"
import GrantsLiveStatus from "../components/Grants"
import PropertyHeader from "../components/PropertyHeader"
import { useParcelScore } from "../hooks/useParcelScore"
import type { Parcel } from "../types"

type ParcelId = "A" | "B" | "C"

interface Props {
  parcels: Parcel[]
  selectedParcel: Parcel | null
}

// ─── Pulsing dot ─────────────────────────────────────────────────────────────
function PulseDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ backgroundColor: "#3DDC84" }}
      />
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ backgroundColor: "#3DDC84" }}
      />
    </span>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-amber-100/60 ${className}`} />
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="mx-4 mt-2 flex items-center gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <span>⚠ {message}</span>
      <button
        onClick={onRetry}
        className="ml-auto rounded border border-red-300 px-2 py-0.5 text-xs hover:bg-red-100 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}

// ─── Score pill ───────────────────────────────────────────────────────────────
function ScorePill({ score, label }: { score: number; label: string }) {
  const color  = score >= 75 ? "#1a7a45" : score >= 50 ? "#92620a" : "#b91c1c"
  const bg     = score >= 75 ? "#e6fdf2" : score >= 50 ? "#fef9ec" : "#fef2f2"
  const border = score >= 75 ? "#3DDC84" : score >= 50 ? "#C4911A" : "#f87171"
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tracking-widest"
      style={{ fontFamily: "'IBM Plex Mono', monospace", color, backgroundColor: bg, border: `1px solid ${border}` }}
    >
      {score}/100 · {label}
    </span>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center text-gray-400"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      <div className="text-center space-y-2">
        <div className="text-2xl">↑</div>
        <p className="text-sm">Select a parcel above to see AI analysis</p>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BreakDown({ selectedParcel }: Props) {
  // Derive parcel ID directly from the selected parcel
  const parcelId = (selectedParcel?.id?.toUpperCase() ?? null) as ParcelId | null
  const { data, loading, error, refetch } = useParcelScore(parcelId)

  return (
    <div className="flex flex-col h-screen mt-12 border-b border-[#C4911A] pb-4">

      {/* Header row */}
      <div className="flex items-center justify-between pr-6">
        <h1 className="p-4 pl-10 text-black font-section">AI ANALYSIS</h1>
        {data && !loading && (
          <ScorePill score={data.scores.final} label={data.scores.zone_context} />
        )}
      </div>

      {/* No parcel selected */}
      {!selectedParcel && <EmptyState />}

      {selectedParcel && (
        <>
          {/* Error */}
          {error && <ErrorBanner message={error} onRetry={refetch} />}

          {/* Property header */}
          {loading ? (
            <div className="px-10 pb-4 space-y-2">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : (
            <PropertyHeader parcel={data} />
          )}

          {/* Three-column layout */}
          <div className="flex flex-row flex-1 overflow-hidden">

            {/* ── Left: AI Recommendations (50%) ── */}
            <div className="w-[50%] flex flex-col border-r border-yellow-500">
              <div className="mb-8">
                <h1
                  className="leading-tight pl-4"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#000000" }}
                >
                  AI Recommendations — Math scored · AI explained
                </h1>
                <div className="mt-2 h-px w-16" style={{ backgroundColor: "#C4911A" }} />
              </div>
              {loading ? (
                <div className="px-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <AiRecommendations data={data?.ai_analysis ?? null} scores={data?.scores ?? null} />
              )}
            </div>

            {/* ── Middle: Live Signals (30%) ── */}
            <div className="w-[30%] flex flex-col border-r border-yellow-500">
              <div className="mb-8">
                <h1
                  className="leading-tight pl-4"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#000000" }}
                >
                  Live Signals{" "}
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-widest"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      backgroundColor: "#e6fdf2",
                      color: "#1a7a45",
                      border: "1px solid #3DDC84",
                    }}
                  >
                    <PulseDot />
                    REAL-TIME
                  </span>
                </h1>
                <div className="mt-2 h-px w-16" style={{ backgroundColor: "#C4911A" }} />
              </div>
              {loading ? (
                <div className="px-4 space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <>
                  <FootTraffic data={data?.foot_traffic ?? null} />
                  <GrantsLiveStatus grants={data?.grant_flags ?? null} scores={data?.scores ?? null} />
                </>
              )}
            </div>

            {/* ── Right: Community Health (20%) ── */}
            <div className="w-[20%]">
              <div className="mb-8">
                <h1
                  className="leading-tight pl-4"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#000000" }}
                >
                  Community Health
                </h1>
                <div className="mt-2 h-px w-16" style={{ backgroundColor: "#C4911A" }} />
              </div>
              {loading ? (
                <div className="px-4 space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <CommunityHealth
                  healthFlags={data?.health_flags ?? null}
                  scores={data?.scores ?? null}
                />
              )}
            </div>

          </div>
        </>
      )}
    </div>
  )
}
