import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GrantStatus = "open" | "closing-soon" | "closed";

export interface Grant {
  id: string;
  title: string;
  avgMin: number;
  avgMax: number;
  status: GrantStatus;
  daysRemaining?: number;
  nextCycle?: string;
}

// ─── Hardcoded seed data ──────────────────────────────────────────────────────

const DEFAULT_GRANTS: Grant[] = [
  {
    id: "hud-cdbg",
    title: "HUD Community Dev Block Grant",
    avgMin: 250000,
    avgMax: 800000,
    status: "closing-soon",
    daysRemaining: 47,
  },
  {
    id: "usda-cfp",
    title: "USDA Community Food Projects",
    avgMin: 125000,
    avgMax: 400000,
    status: "open",
    daysRemaining: 55,
  },
  {
    id: "hrsa-rhg",
    title: "HRSA Rural Health Grant",
    avgMin: 100000,
    avgMax: 300000,
    status: "closed",
    nextCycle: "Q1 2027",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

// ─── Status dot ──────────────────────────────────────────────────────────────

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
    );
  }
  return (
    <span
      className="inline-flex rounded-full h-3 w-3 mt-0.5 shrink-0"
      style={{ backgroundColor: "#CCC9C9" }}
    />
  );
}

// ─── Status line ─────────────────────────────────────────────────────────────

function StatusLine({ grant }: { grant: Grant }) {
  if (grant.status === "closed") {
    return (
      <span
        className="text-xs tracking-widest uppercase"
        style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#737171" }}
      >
        · CLOSED
      </span>
    );
  }

  return (
    <span
      className="text-xs tracking-widest uppercase"
      style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#1a7a45" }}
    >
      · OPEN — ACT NOW
    </span>
  );
}

// ─── Grant row ───────────────────────────────────────────────────────────────

function GrantRow({ grant, index, visible }: { grant: Grant; index: number; visible: boolean }) {
  const isOpen = grant.status !== "closed";

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
        {/* Title */}
        <span
          className="text-sm font-bold leading-snug"
          style={{
            fontFamily: "'Lora', serif",
            color: isOpen ? "#000000" : "#737171",
          }}
        >
          {grant.title}
        </span>

        {/* Avg range + days */}
        <span
          className="text-xs leading-snug"
          style={{ fontFamily: "'Outfit', sans-serif", color: "#737171" }}
        >
          Avg {formatDollars(grant.avgMin)}–{formatDollars(grant.avgMax)}
          {grant.daysRemaining !== undefined && (
            <>
              {" · "}
              {grant.status === "closing-soon" && (
                <span style={{ marginRight: 3 }}>⚠️</span>
              )}
              {grant.daysRemaining} days remaining
            </>
          )}
          {grant.nextCycle && ` · Next cycle ${grant.nextCycle}`}
        </span>

        {/* Status tag */}
        <StatusLine grant={grant} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Grants() {
  const [grants, setGrants] = useState<Grant[]>(DEFAULT_GRANTS);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /**
   * Replace body with real API call, e.g.:
   *   const res = await fetch("/api/grants?parcelId=...");
   *   const json = await res.json();
   *   setGrants(json);
   */
  async function fetchGrants() {
    setLoading(true);
    setVisible(false);
    await new Promise((r) => setTimeout(r, 650));

    // Mock response ↓
    setGrants([
      {
        id: "epa-brownfields",
        title: "EPA Brownfields Assessment Grant",
        avgMin: 200000,
        avgMax: 500000,
        status: "open",
        daysRemaining: 30,
      },
      {
        id: "cdc-pphf",
        title: "CDC Prevention & Public Health Fund",
        avgMin: 150000,
        avgMax: 600000,
        status: "closing-soon",
        daysRemaining: 12,
      },
      {
        id: "dot-tiger",
        title: "DOT TIGER Infrastructure Grant",
        avgMin: 1000000,
        avgMax: 5000000,
        status: "closed",
        nextCycle: "Q3 2026",
      },
    ]);

    setLoading(false);
    setVisible(true);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Lora:wght@700&family=Outfit:wght@400;500&display=swap');
      `}</style>

      <div className=" bg-white pl-6  py-12">
        <div className="">

          {/* ── Header ── */}
          {/* ── Section title ── */}
          <div
            className="flex items-center gap-2.5 mb-4"
            style={{
             
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: "80ms",
             
            }}
          >
           
            <h2
              className="text-sm font-bold tracking-[0.18em] uppercase"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: "#000000",
              }}
            >
             Grants.gov — Live Status
            </h2>
          </div>

          {/* ── Divider ── */}
          <div
            className="mb-4 h-px"
            style={{ backgroundColor: "#CCC9C9",  transition: "opacity 0.4s ease", transitionDelay: "140ms" }}
          />


       
          {/* ── Grant list ── */}
          <div className="flex flex-col gap-5">
            {grants.map((grant, i) => (
              <GrantRow key={grant.id} grant={grant} index={i} visible={visible} />
            ))}
          </div>

          {/* ── Divider ── */}
          <div className="mt-10 mb-6 h-px" style={{ backgroundColor: "#CCC9C9" }} />

          {/* ── Refresh button ── */}
          <button
            onClick={fetchGrants}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium transition-colors duration-200 disabled:opacity-50"
            style={{
              fontFamily: "'Outfit', sans-serif",
              backgroundColor: "#000000",
              color: "#ffffff",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#C4911A")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.backgroundColor = "#000000")
            }
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Loading…
              </>
            ) : (
              "Refresh via API"
            )}
          </button>

        </div>
      </div>
    </>
  );
}
