import { useEffect, useState } from "react"
import type { GrantFlag, Scores } from "../hooks/useParcelScore"

interface Props {
  grants: GrantFlag[] | null
  scores: Scores | null
}

type GrantStatus = "open" | "closing-soon" | "closed"

interface GrantRow {
  id: string
  title: string
  status: GrantStatus
  daysRemaining?: number | null
  eligibility_pct?: number
  match?: string
  note?: string
}

function StatusDot({ status }: { status: GrantStatus }) {
  if (status === "open" || status === "closing-soon") {
    return (
      <span className="relative flex h-3 w-3 mt-0.5 shrink-0">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
          style={{ backgroundColor: "#3DDC84" }}
        />
        <span
          className="relative inline-flex rounded-full h-3 w-3"
          style={{ backgroundColor: "#3DDC84" }}
        />
      </span>
    )
  }
  return (
    <span
      className="inline-flex rounded-full h-3 w-3 mt-0.5 shrink-0"
      style={{ backgroundColor: "#CCC9C9" }}
    />
  )
}

function StatusLine({ status }: { status: GrantStatus }) {
  if (status === "closed") {
    return (
      <span
        className="text-xs tracking-widest uppercase"
        style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#737171" }}
      >
        · CLOSED
      </span>
    )
  }
  return (
    <span
      className="text-xs tracking-widest uppercase"
      style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#1a7a45" }}
    >
      · OPEN — ACT NOW
    </span>
  )
}

function GrantRowItem({ grant, index, visible }: { grant: GrantRow; index: number; visible: boolean }) {
  const isOpen = grant.status !== "closed"
  return (
    <div
      className="flex gap-3 items-start"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.45s ease, transform 0.45s ease",
        transitionDelay: `${index * 90}ms`,
      }}
    >
      <StatusDot status={grant.status} />
      <div className="flex flex-col gap-0.5">
        <span
          className="text-sm font-bold leading-snug"
          style={{ fontFamily: "'Lora', serif", color: isOpen ? "#000000" : "#737171" }}
        >
          {grant.title}
        </span>
        <span
          className="text-xs leading-snug"
          style={{ fontFamily: "'Outfit', sans-serif", color: "#737171" }}
        >
          {grant.eligibility_pct != null && `Covers ${grant.eligibility_pct}%`}
          {grant.match && ` · Match ${grant.match}`}
          {grant.daysRemaining != null && (
            <>
              {" · "}
              {grant.status === "closing-soon" && <span style={{ marginRight: 3 }}>⚠️</span>}
              {grant.daysRemaining} days remaining
            </>
          )}
          {grant.note && ` · ${grant.note}`}
        </span>
        <StatusLine status={grant.status} />
      </div>
    </div>
  )
}

export default function GrantsLiveStatus({ grants }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [grants])

  // Map API GrantFlag shape → display shape
  const rows: GrantRow[] = (grants ?? []).map((g, i) => ({
    id: `${g.name}-${i}`,
    title: g.name,
    status: g.status === "open"
      ? (g.days_remaining != null && g.days_remaining <= 30 ? "closing-soon" : "open")
      : "closed",
    daysRemaining: g.days_remaining,
    eligibility_pct: g.eligibility_pct,
    match: g.match,
    note: g.note,
  }))

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Lora:wght@700&family=Outfit:wght@400;500&display=swap');`}</style>

      <div className="bg-white pl-6 py-12">
        <div>
          {/* Section title */}
          <div className="flex items-center gap-2.5 mb-4" style={{ transition: "opacity 0.4s ease", transitionDelay: "80ms" }}>
            <h2
              className="text-sm font-bold tracking-[0.18em] uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#000000" }}
            >
              Grants.gov — Live Status
            </h2>
          </div>

          {/* Divider */}
          <div className="mb-4 h-px" style={{ backgroundColor: "#CCC9C9", transition: "opacity 0.4s ease", transitionDelay: "140ms" }} />

          {/* Grant list */}
          <div className="flex flex-col gap-5">
            {rows.map((grant, i) => (
              <GrantRowItem key={grant.id} grant={grant} index={i} visible={visible} />
            ))}
          </div>

          <div className="mt-10 mb-6 h-px" style={{ backgroundColor: "#CCC9C9" }} />
        </div>
      </div>
    </>
  )
}
