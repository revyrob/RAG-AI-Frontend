import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FootTrafficData {
  upcomingEvents: string[];
  windowLabel: string;
  trafficSummary: string;
}

// ─── Hardcoded seed data (swap with API call later) ───────────────────────────

const DEFAULT_DATA: FootTrafficData = {
  upcomingEvents: [],
  windowLabel: "30-day window",
  trafficSummary: "Low foot traffic zone — below city average",
};

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
  );
}

// ─── Foot Traffic SVG icon ────────────────────────────────────────────────────

function FootTrafficIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* head */}
      <circle cx="12" cy="4" r="1.8" fill="currentColor" stroke="none" />
      {/* body / stride */}
      <path d="M10 8.5 C9 11 7.5 12.5 6 14" />
      <path d="M14 8.5 C15 11 16.5 12.5 18 14" />
      {/* legs */}
      <path d="M10 13 L8 19" />
      <path d="M14 13 L16 19" />
      {/* connecting torso */}
      <path d="M10 8.5 Q12 10.5 14 8.5" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FootTraffic() {
  const [data, setData] = useState<FootTrafficData>(DEFAULT_DATA);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  /**
   * Replace body of this function with a real API call, e.g.:
   *   const res = await fetch("/api/foot-traffic?parcelId=...");
   *   const json = await res.json();
   *   setData(json);
   */
  async function fetchData() {
    setLoading(true);
    setVisible(false);
    await new Promise((r) => setTimeout(r, 650));

    // Mock API response ↓
    setData({
      upcomingEvents: ["Farmers Market · Sat 8 AM", "Community Fair · Sun 10 AM"],
      windowLabel: "30-day window",
      trafficSummary: "Moderate foot traffic zone — near city average",
    });

    setLoading(false);
    setVisible(true);
  }

  const hasEvents = data.upcomingEvents.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Lora:wght@700&family=Outfit:wght@400;500&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeSlideUp 0.45s ease forwards;
        }

      `}</style>

      <div className=" bg-white flex items-start justify-center px-6 py-12">
        <div className="w-[50%] ">

          {/* ── Live Signals badge row ── */}
          <div
            className="flex items-center gap-3 mb-6"
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.4s ease",
              transitionDelay: "0ms",
            }}
          >
            <span
              className="text-sm"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "#737171",
              }}
            >
              Live Signals
            </span>

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
              REAL - TIME
            </span>
          </div>

          {/* ── Section title ── */}
          <div
            className="flex items-center gap-2.5 mb-4"
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.4s ease, transform 0.4s ease",
              transitionDelay: "80ms",
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <span style={{ color: "#000000" }}>
              <FootTrafficIcon size={20} />
            </span>
            <h2
              className="text-sm font-bold tracking-[0.18em] uppercase"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: "#000000",
              }}
            >
              Foot Traffic · Live Status
            </h2>
          </div>

          {/* ── Divider ── */}
          <div
            className="mb-4 h-px"
            style={{ backgroundColor: "#CCC9C9", opacity: visible ? 1 : 0, transition: "opacity 0.4s ease", transitionDelay: "140ms" }}
          />

          {/* ── Upcoming events ── */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: "180ms",
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {hasEvents ? (
              <ul className="mb-4 flex flex-col gap-1.5">
                {data.upcomingEvents.map((ev, i) => (
                  <li
                    key={i}
                   className="text-sm"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: "#000000",
                      
                    }}
                  >
                    {ev}
                  </li>
                ))}
              </ul>
            ) : (
              <p
               className="text-sm mb-4"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: "#000000",
                  
                }}
              >
                No upcoming events detected
              </p>
            )}
          </div>

          {/* ── Traffic summary ── */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.45s ease, transform 0.45s ease",
              transitionDelay: "260ms",
              transform: visible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <p
             className="text-sm"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "#000000",
                
              }}
            >
              <span style={{ color: "#737171" }}>{data.windowLabel} · </span>
              {data.trafficSummary}
            </p>
          </div>

          {/* ── Divider ── */}
          <div
            className="mt-8 mb-6 h-px"
            style={{ backgroundColor: "#CCC9C9" }}
          />

          {/* ── Refresh button ── */}
          <button
            onClick={fetchData}
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
