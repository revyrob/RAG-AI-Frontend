import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Recommendation {
  rank: number;
  score: number; // 0–100
  title: string;
  body: string;
}

// ─── Hardcoded seed data (swap with API response later) ───────────────────────

const DEFAULT_DATA: Recommendation[] = [
  {
    rank: 1,
    score: 94,
    title: "Community Grocery + Fresh Food Hub",
    body: "This parcel sits in a census-designated food desert where the nearest grocery store is 2.8 miles away — effectively inaccessible without a car for 6,200 residents. With 41% childhood food insecurity and a 2.4× above-average pediatric asthma rate documented in this tract, a community grocery here is not a retail project. It is a public health intervention. With HUD CDBG funding currently open, this is the most actionable opportunity in Montgomery's vacant land portfolio.",
  },
  {
    rank: 2,
    score: 81,
    title: "Urban Farm + Community Kitchen",
    body: "A productive urban farm with a shared commercial kitchen for food entrepreneurs. Generates local employment, reduces food costs, and creates a replicable economic model for other vacant lots in the same depressed corridor. Qualifies for USDA urban agriculture funding.",
  },
  {
    rank: 3,
    score: 77,
    title: "Pediatric Health & Wellness Clinic",
    body: "The 2.4× above-average childhood asthma rate in this census tract is directly linked to food insecurity, environmental stressors, and lack of preventive care access. A community clinic prioritizing pediatric services addresses root causes of the health disparity documented here.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  );
}

function RankCard({
  item,
  visible,
  delayIndex,
}: {
  item: Recommendation;
  visible: boolean;
  delayIndex: number;
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
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#737171",
            letterSpacing: "0.02em",
          }}
        >
          #{item.rank}
        </span>

        <div className="flex-1">
          <ScoreBar score={item.score} animate={visible} />
        </div>

        <span
          className="shrink-0 text-xs font-semibold leading-none"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#C4911A",
            letterSpacing: "0.04em",
          }}
        >
          {item.score}%
        </span>
      </div>

      {/* Title */}
      <h2
        className="text-xl font-bold leading-snug mb-2"
        style={{
          fontFamily: "'Lora', serif",
          color: "#000000",
        }}
      >
        {item.title}
      </h2>

      {/* Body */}
      <p
        className="text-sm leading-relaxed"
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: "#000000",
          opacity: 0.75,
        }}
      >
        {item.body}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AiRecommendations() {
  const [data, setData] = useState<Recommendation[]>(DEFAULT_DATA);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  /**
   * Replace this with a real API call, e.g.:
   *   const res = await fetch("/api/recommendations?parcelId=...");
   *   const json = await res.json();
   *   setData(json);
   */
  async function fetchRecommendations() {
    setLoading(true);
    setVisible(false);

    await new Promise((r) => setTimeout(r, 600)); // simulate network

    // ↓ Swap the mock payload below for your real API response
    const mockApiResponse: Recommendation[] = [
      {
        rank: 1,
        score: 91,
        title: "Affordable Housing Development",
        body: "Median rents in this corridor have risen 34% over five years while average household income has declined 8%. A deed-restricted affordable housing project here would serve the 1,400 cost-burdened households within a half-mile radius and qualifies for Low-Income Housing Tax Credits in the current cycle.",
      },
      {
        rank: 2,
        score: 85,
        title: "Workforce Training Center",
        body: "Unemployment in this census tract is 3.1× the county median. A skills-training facility focused on healthcare and construction trades could place 200+ residents per year and is fundable through DOL Workforce Innovation & Opportunity Act grants.",
      },
      {
        rank: 3,
        score: 72,
        title: "Mixed-Use Retail + Green Space",
        body: "The nearest park is 1.1 miles away in a neighborhood with no personal vehicle access for 38% of residents. Activating street-level retail with a half-acre pocket park would improve walkability scores and support adjacent commercial recovery.",
      },
    ];

    setData(mockApiResponse);
    setLoading(false);
    setVisible(true);
  }

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Lora:wght@700&family=Outfit:wght@400;500&display=swap');
      `}</style>

      <div className=" bg-white flex items-start justify-center px-6 py-12">
        <div className="">
{/* 
          Header
          <div className="mb-8">
            
            <h1
              className="leading-tight"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#000000" }}
            >
              AI Recommendations — Math scored · AI explained
            </h1>
            <div
              className="mt-2 h-px w-16"
              style={{ backgroundColor: "#C4911A" }}
            />
          </div> */}

          {/* Cards */}
          <div className="flex flex-col gap-8">
            {data.map((item, i) => (
              <RankCard
                key={item.rank}
                item={item}
                visible={visible}
                delayIndex={i}
              />
            ))}
          </div>

          {/* Divider */}
          <div
            className="mt-10 mb-6 h-px w-full"
            style={{ backgroundColor: "#CCC9C9" }}
          />

          {/* Refresh button */}
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium transition-all duration-200 disabled:opacity-50"
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
                <svg
                  className="animate-spin h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
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
