import { useNavigate, NavLink } from "react-router-dom";

interface HeaderProps {
  className?: string;
  onLogout?: () => void;
}

const navItems = [
  { to: "/city-map",     label: "CITY MAP" },
  { to: "/parcel-score", label: "PARCEL SCORE" },
  { to: "/311-signals",  label: "311 SIGNALS" },
  { to: "/config",       label: "CONFIG" },
];

export default function Header({ className = "", onLogout }: HeaderProps) {
  const navigate = useNavigate();

  function handleLogout() {
    // TODO: replace with supabase.auth.signOut()
    onLogout?.();
    navigate("/login");
  }

  return (
    <header
      className={className}
      style={{
        width: "100%",
        backgroundColor: "#f8f4eb",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        padding: "0 2rem",
        height: "52px",
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "'Lora', Georgia, serif",
          fontSize: "1.3rem",
          fontWeight: 700,
          color: "#1a1a1a",
          letterSpacing: "0.05em",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        RI<span style={{ fontStyle: "italic", color: "#c9a227" }}>S</span>E
      </div>

      {/* Nav — centered */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              padding: "0.3rem 1rem",
              borderRadius: "5px",
              textDecoration: "none",
              color: isActive ? "#1a1a1a" : "#666",
              border: isActive ? "1.5px solid #c9a227" : "1.5px solid transparent",
              fontWeight: isActive ? 600 : 400,
              transition: "color 0.15s, border-color 0.15s",
              whiteSpace: "nowrap",
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        style={{
          flexShrink: 0,
          fontFamily: "'Lora', Georgia, serif",
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          color: "#999",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.3rem 0",
          transition: "color 0.15s",
        }}
        onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = "#c9a227")}
        onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = "#999")}
      >
        SIGN OUT
      </button>
    </header>
  );
}
