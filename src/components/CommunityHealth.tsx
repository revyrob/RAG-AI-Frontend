import { Heart } from "lucide-react";
import { useEffect } from "react";


interface HealthSignal {
  label: string;
  value: string;
  isHighlight?: boolean;
}

const signals: HealthSignal[] = [
  { label: "Safety", value: "41%" },
  { label: "Flood Rating", value: "41%" },
  { label: "Nearest grocery store", value: "2.8 mi", isHighlight: true },
  { label: "Median household income", value: "$22,400", isHighlight: true },
];

const monoFont = "'IBM Plex Mono', monospace";
const bodyFont = "'Outfit', sans-serif";

export default function CommunityHealth() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Outfit:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div
        className="bg-white rounded-2xl shadow-md overflow-hidden"
        style={{ width: "320px", fontFamily: bodyFont }}
      >
        {/* Header bar */}
        <div
          className="px-5 pt-4 pb-1"
          style={{ borderBottom: "none" }}
        >
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "#9b8fc7", letterSpacing: "0.12em", fontFamily: monoFont }}
          >
            Health Equity
          </p>
        </div>

        {/* Title row */}
        <div className="flex items-center gap-2 px-5 pt-2 pb-4">
          <Heart
            size={16}
            fill="#7c6bb0"
            stroke="#7c6bb0"
            strokeWidth={1.5}
          />
          <h2
            className="text-sm font-bold tracking-widest uppercase"
            style={{ color: "#2d2440", letterSpacing: "0.13em", fontFamily: monoFont }}
          >
            Community Health Signals
          </h2>
        </div>

        {/* Signal rows */}
        <div className="px-5 pb-4 flex flex-col gap-1">
          {signals.map((signal, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 px-4 rounded-xl"
              style={{ backgroundColor: "#f5f3fb" }}
            >
              <span
                className="text-sm"
                style={{ color: "#3d3352", fontFamily: bodyFont }}
              >
                {signal.label}
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "#2d2440", fontFamily: monoFont }}
              >
                {signal.value}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-5 mb-4" style={{ borderTop: "1px solid #e8e4f3" }} />

        {/* Quote */}
        <div className="px-5 pb-6">
          <p
            className="text-sm leading-relaxed italic"
            style={{
              color: "#4a4060",
              fontFamily: bodyFont,
              fontSize: "0.82rem",
            }}
          >
            "These health indicators directly inform recommendation priority.
            Where childhood health risk is elevated, RISE weights food access
            and green infrastructure above commercial development."
          </p>
        </div>
      </div>
    </div>
  );
}
