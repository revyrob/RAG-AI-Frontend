// ParcelCard.tsx
// Fonts needed in index.html:
// <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lora:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

interface Badge {
  label: string;
  variant: "heritage" | "food" | "grant" | "default";
}

interface Signal {
  label: string;
  value: string;
  urgent?: boolean;
}

interface ParcelCardProps {
  address: string;
  city?: string;
  facts: string;
  badges?: Badge[];
  signals?: Signal[];
  mapImageUrl?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

const BADGE_STYLES: Record<Badge["variant"], { bg: string; text: string; border: string; dot: string, icon?:string, padding:string, borderRadius:string }> = {
  heritage: {
    bg: "rgba(74, 196, 238, 0.49)",
    text: "#C4911A",
    border: "rgba(249,115,22,0.3)",
    dot: "#f97316",
    icon: "🏛️",
    padding: ".2rem .35rem",
    borderRadius: "5px"
  },
  food: {
    bg: "rgba(232,168,48,0.15)",
    text: "#e8a830",
    border: "rgba(232,168,48,0.3)",
    dot: "#e8a830",
    icon: "🏛️",
    padding: ".25rem",
    borderRadius: "5px"
  },
  grant: {
    bg: "rgba(74,222,128,0.12)",
    text: "#4ade80",
    border: "rgba(74,222,128,0.3)",
    dot: "#4ade80",
    icon: "🏛️",
    padding: ".25rem",
    borderRadius: "5px"
  },
  default: {
    bg: "rgba(255,255,255,0.08)",
    text: "rgba(255,255,255,0.7)",
    border: "rgba(255,255,255,0.15)",
    dot: "rgba(255,255,255,0.5)",
    icon: "🏛️",
    padding: ".2rem .35rem",
    borderRadius: "5px"
  },
};

function BadgeTag({ label, variant }: Badge) {
  const s = BADGE_STYLES[variant];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: "0.6rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {s.icon && s.icon.startsWith("/") ? (
        // PNG image
        <img
          src={s.icon}
          alt=""
          style={{ width: 12, height: 12, objectFit: "contain" }}
        />
      ) : s.icon ? (
        // Emoji
        <span style={{ fontSize: "0.75rem" }}>{s.icon}</span>
      ) : (
        // Default dot
        <span
          style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: s.dot, display: "inline-block" }}
        />
      )}
      {label}
    </span>
  );
}

// Placeholder map using OpenStreetMap static-style iframe embed
function MapPlaceholder({ address }: { address: string }) {
  // Use a static map image via OpenStreetMap tiles approximation
  // In production, swap with Mapbox/Google Static Maps API
  return (
    <div
      className="relative overflow-hidden flex-shrink-0"
      style={{
        width: 140,
        height: "100%",
        minHeight: 140,
        borderRadius: "0 12px 12px 0",
        background: "linear-gradient(135deg, #1a3a3a 0%, #0d2e2e 100%)",
      }}
    >
      {/* Map grid lines to simulate street map */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        viewBox="0 0 140 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Road grid */}
        <rect width="140" height="160" fill="#1a3d3d" />
        {/* Horizontal roads */}
        <line x1="0" y1="40" x2="140" y2="40" stroke="#2dd4bf" strokeWidth="3" opacity="0.4" />
        <line x1="0" y1="90" x2="140" y2="90" stroke="#2dd4bf" strokeWidth="2" opacity="0.25" />
        <line x1="0" y1="130" x2="140" y2="130" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.2" />
        {/* Vertical roads */}
        <line x1="35" y1="0" x2="35" y2="160" stroke="#2dd4bf" strokeWidth="3" opacity="0.4" />
        <line x1="90" y1="0" x2="90" y2="160" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.2" />
        {/* Parcel highlight */}
        <rect x="42" y="45" width="44" height="40" fill="#e8a830" opacity="0.35" rx="2" />
        <rect x="42" y="45" width="44" height="40" fill="none" stroke="#e8a830" strokeWidth="1.5" rx="2" opacity="0.8" />
        {/* Block fills */}
        <rect x="95" y="45" width="30" height="18" fill="rgba(255,255,255,0.05)" rx="1" />
        <rect x="95" y="68" width="30" height="16" fill="rgba(255,255,255,0.05)" rx="1" />
        <rect x="42" y="92" width="44" height="20" fill="rgba(255,255,255,0.04)" rx="1" />
        <rect x="6" y="45" width="24" height="38" fill="rgba(255,255,255,0.04)" rx="1" />
      </svg>

      {/* Compass / north indicator */}
      <div
        className="absolute top-2 right-2 flex items-center justify-center"
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.15)",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.5rem",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        N
      </div>

      {/* Pin */}
      <div
        className="absolute"
        style={{ top: "42%", left: "43%", transform: "translate(-50%,-50%)" }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50% 50% 50% 0",
            background: "#e8a830",
            transform: "rotate(-45deg)",
            boxShadow: "0 0 6px rgba(232,168,48,0.6)",
          }}
        />
      </div>
    </div>
  );
}

export default function ParcelCard({
  address = "1100 W Jeff Davis Ave",
  city = "Montgomery AL, 36104",
  facts = "2.6 acres · Vacant 12 yrs · Zoned C-1",
  badges = [
    { label: "Symbolic", variant: "heritage" },
  ],
  signals = [
    { label: "Food desert — nearest grocery", value: "2.8 mi" },
    { label: "Median income", value: "$22,400" },
    { label: "HUD CDBG OPEN —", value: "47 days left", urgent: true },
  ],
//   mapImageUrl,
  onClick,
  active = false,
  className = "",
}: ParcelCardProps) {
  return (
    <div
      onClick={onClick}
      className={`overflow-hidden flex cursor-pointer select-none ${className} max-w-75 flex justify-center align-middle`}
      style={{
        backgroundColor: "#0e3a47",
        border: active
          ? "1px solid rgba(232,168,48,0.5)"
          : "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        minHeight: 180,
        boxShadow: active
          ? "0 0 0 1px rgba(232,168,48,0.2), 0 16px 48px rgba(0,0,0,0.45)"
          : "0 8px 32px rgba(0,0,0,0.35)",
        transition: "all 0.22s ease",
      }}
    >
      {/* Left content */}
      <div className="flex flex-col flex-1 p-5 gap-2.5 min-w-0">
        {/* Badges row */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <BadgeTag key={i} {...b} />
            ))}
          </div>
        )}

        {/* Address */}
        <div>
          <h2
            className="text-white leading-tight"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
              letterSpacing: "-0.01em",
              color:"#ffffff"
            }}
          >
            {address}
          </h2>
        </div>

        {/* Facts + city */}
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.75rem",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.5,
          }}
        >
          <div>{facts}</div>
          <div>{city}</div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.08)",
            margin: "2px 0",
          }}
        />

        {/* Signals */}
        <ul className="flex flex-col gap-1.5">
          {signals.map((s, i) => (
            <li
              key={i}
              className="flex items-baseline gap-1"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.74rem",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  color: s.urgent ? "#4ade80" : "rgba(255,255,255,0.35)",
                  fontSize: "0.55rem",
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                ●
              </span>
              <span>
                {s.label}{" "}
                <span
                  style={{
                    color: s.urgent ? "#4ade80" : "rgba(255,255,255,0.88)",
                    fontWeight: 600,
                  }}
                >
                  {s.value}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right map */}
      <MapPlaceholder address={address} />
    </div>
  );
}
