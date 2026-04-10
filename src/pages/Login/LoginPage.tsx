import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    // TODO: replace this block with Supabase auth
    // const { error } = await supabase.auth.signInWithPassword({ email, password })
    // if (error) { setError(error.message); setLoading(false); return; }

    // Stub: accept any credentials for now
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    onLogin();
    navigate("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0e3a47",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        background:
          "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,255,255,0.03) 0%, transparent 60%), #0e3a47",
      }}
    >
      {/* Brand block */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            fontWeight: 400,
            color: "#ffffff",
            letterSpacing: "0.02em",
            lineHeight: 1.1,
          }}
        >
          Montgomery
        </div>
        <div
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: "clamp(2rem, 5vw, 2.75rem)",
            color: "#c9a227",
            letterSpacing: "0.1em",
            lineHeight: 1.1,
            marginBottom: "0.6rem",
          }}
        >
          RISE
        </div>
        <div
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: "italic",
            fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)",
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.04em",
          }}
        >
          Revitalization Intelligence &amp; Smart Empowerment
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(201,162,39,0.25)",
          borderRadius: "10px",
          padding: "2rem",
          backdropFilter: "blur(4px)",
        }}
      >
        <h2
          style={{
            fontFamily: "'Lora', Georgia, serif",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#ffffff",
            marginBottom: "1.5rem",
            textAlign: "center",
            letterSpacing: "0.03em",
          }}
        >
          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label
              htmlFor="email"
              style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.04em",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@montgomery.gov"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                padding: "0.6rem 0.85rem",
                color: "#ffffff",
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.88rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#c9a227")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label
              htmlFor="password"
              style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.04em",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                padding: "0.6rem 0.85rem",
                color: "#ffffff",
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.88rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#c9a227")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: "0.78rem",
                color: "#f87171",
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "0.7rem",
              backgroundColor: loading ? "rgba(201,162,39,0.5)" : "#c9a227",
              color: "#0e3a47",
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "0.9rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s, opacity 0.2s",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>

      {/* Footer note */}
      <p
        style={{
          marginTop: "2rem",
          fontFamily: "'Lora', Georgia, serif",
          fontStyle: "italic",
          fontSize: "0.72rem",
          color: "rgba(255,255,255,0.3)",
          textAlign: "center",
        }}
      >
        City of Montgomery — authorized personnel only
      </p>
    </div>
  );
}
