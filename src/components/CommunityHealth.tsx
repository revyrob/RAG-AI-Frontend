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
    <div className="flex flex-col pl-6 py-12">
      
      <div
        className=" "
        style={{ width: "320px", fontFamily: bodyFont }}
      >
        {/* Header bar */}
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
              Community Health Signals
            </h2>
          </div>

          {/* ── Divider ── */}
          <div
            className="mb-4 h-px"
            style={{ backgroundColor: "#CCC9C9",  transition: "opacity 0.4s ease", transitionDelay: "140ms" }}
          />

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
