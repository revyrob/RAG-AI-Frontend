import { useEffect, useState } from "react";

interface HeaderProps {
  className?: string;
}

export default function Header({ className = "" }: HeaderProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <header
      className={`relative w-full overflow-hidden ${className}`}
      style={{ backgroundColor: "#0e3a47" }}
    >
      {/* Subtle background texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 0% 50%, rgba(255,255,255,0.03) 0%, transparent 60%), radial-gradient(ellipse 40% 60% at 100% 0%, rgba(200,165,30,0.06) 0%, transparent 55%)",
        }}
      />

      <div
        className="relative z-10 pt-8 pb-8"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          paddingTop: "1rem",
          paddingBottom: "2rem"
        }}
      >
        {/* Logo block */}
        <div className="mb-1">
          <div
            className="font-bold text-white leading-tight tracking-wide"
            style={{
              fontFamily: "'Lora', sans-serif",
              fontSize: "clamp(1.4rem, 2.5vw, 1.75rem)",
              fontWeight: 400,
              color: "#ffffff",
              textAlign:"left",
              marginLeft:"2rem",
              marginBottom:".25rem"
            }}
          >
            Montgomery
          </div>

          <div
            style={{
              fontFamily: "'Lora',  sans-serif",
              fontSize: "clamp(1.4rem, 2.5vw, 1.75rem)",
              color: "#c9a227",
              letterSpacing: "0.08em",
              lineHeight: 1,
              marginTop: "-2px",
              textAlign:"left",
              marginLeft:"2rem",
               marginBottom:".75rem"
            }}
          >
            RISE
          </div>
        </div>

        {/* Tagline */}
        <div
          className="mb-5"
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(0.7rem, 1.2vw, 0.82rem)",
            color: "#FFF8F8",
            letterSpacing: "0.03em",
              textAlign:"left",
              marginLeft:"2rem",
              marginBottom:".75rem"
          }}
        >
          Revitalization Intelligence &amp; Smart Empowerment
        </div>

        {/* Divider */}
        <div
          className="mb-5 w-full"
          style={{
            height: "1px",
            background:
              "linear-gradient(to right, rgba(201,162,39,0.4), rgba(255,255,255,0.08) 60%, transparent)",
            marginLeft:"2rem",
            marginBottom:".75rem"
          }}
        />

        {/* Description */}
        <p
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(0.72rem, 1.1vw, 0.8rem)",
            color: "#FFF8F8",
            lineHeight: 1.7,
            letterSpacing: "0.01em",
              textAlign:"left",
              marginLeft:"2rem",
             
          }}
        >
          RISE uses AI to tell Montgomery&apos;s city planners what abandoned land should become —
          scored by economic need, civil rights heritage, live grant funding, real-time events,
          and community health data. Every other tool tells you what a parcel{" "}
          <em>was worth</em>. RISE tells you what it&apos;s worth <em>right now</em>.
        </p>
      </div>
    </header>
  );
}
