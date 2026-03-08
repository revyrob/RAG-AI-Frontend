
import {useState, useRef, useEffect} from "react";
// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "rise" | "user";
  text: string;
}

interface ChatProps {
  /** Parcel address fed into the bot's opening message */
  address?: string;
  initialMessage: string;
  /** Called when user submits a message — hook up to your API */
  onSendMessage?: (message: string, history: ChatMessage[]) => Promise<string>;
}

// ── Palette / tokens ──────────────────────────────────────────────────────────

const C = {
  bg40:     "rgba(6,65,85,0.40)",   // #064155 @ 40%
  bg70:     "rgba(6,65,85,0.70)",   // #064155 @ 70%
  gold70:   "rgba(196,145,26,0.70)",// #C4911A @ 70%
  gold:     "#C4911A",              // full gold
  white:    "#ffffff",
  white60:  "rgba(255,255,255,0.60)",
  white30:  "rgba(255,255,255,0.30)",
  border:   "rgba(196,145,26,0.25)",
};

const FONT_MONO  = "'IBM Plex Mono', monospace";
const FONT_BODY  = "'Outfit', sans-serif";

// ── RISE avatar icon ──────────────────────────────────────────────────────────
// Swap `iconChar` or replace with an <img> to customise the bot icon.

function RiseAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width:          size,
        height:         size,
        borderRadius:   "50%",
        background:     `linear-gradient(135deg, ${C.gold} 0%, rgba(196,145,26,0.6) 100%)`,
        border:         `1.5px solid ${C.gold}`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
        boxShadow:      `0 0 10px rgba(196,145,26,0.35)`,
        fontFamily:     FONT_MONO,
        fontSize:       size * 0.38,
        fontWeight:     700,
        color:          "#0a2a35",
        letterSpacing:  "-0.02em",
      }}
    >
      R
    </div>
  );
}

function UserAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width:          size,
        height:         size,
        borderRadius:   "50%",
        background:     C.bg70,
        border:         `1.5px solid ${C.white30}`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
        fontFamily:     FONT_MONO,
        fontSize:       size * 0.38,
        fontWeight:     700,
        color:          C.white,
      }}
    >
      U
    </div>
  );
}

// ── Single chat bubble ────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: ChatMessage }) {
  const isRise = message.role === "rise";

  return (
    <div
      className="flex gap-2.5"
      style={{
        flexDirection: isRise ? "row" : "row-reverse",
        alignItems:    "flex-start",
        animation:     "fadeSlideIn 0.22s ease both",
      }}
    >
      {isRise ? <RiseAvatar /> : <UserAvatar />}

      <div
        style={{
          maxWidth:     "78%",
          padding:      "10px 14px",
          borderRadius: isRise ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
          background:   isRise ? C.bg70 : C.gold70,
          border:       `1px solid ${isRise ? "rgba(255,255,255,0.08)" : "rgba(196,145,26,0.5)"}`,
          fontFamily:   FONT_BODY,
          fontSize:     "0.78rem",
          lineHeight:   1.65,
          color:        C.white,
          boxShadow:    "0 2px 12px rgba(0,0,0,0.2)",
        }}
      >
        {message.text}
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2.5" style={{ alignItems: "flex-start" }}>
      <RiseAvatar />
      <div
        style={{
          padding:      "10px 16px",
          borderRadius: "4px 12px 12px 12px",
          background:   C.bg70,
          border:       `1px solid rgba(255,255,255,0.08)`,
          display:      "flex",
          gap:          5,
          alignItems:   "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width:            7,
              height:           7,
              borderRadius:     "50%",
              background:       C.gold,
              display:          "inline-block",
              animation:        `typingBounce 1.1s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Suggestion chips ──────────────────────────────────────────────────────────

function SuggestionChips({
  chips,
  onSelect,
}: {
  chips: string[];
  onSelect: (c: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" style={{ padding: "4px 0 2px" }}>
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          style={{
            fontFamily:    FONT_BODY,
            fontSize:      "0.72rem",
            color:         "#0a2a35",
            background:    "#d6eef8",
            border:        "1.5px solid #3b9fd1",
            borderRadius:  20,
            padding:       "5px 14px",
            cursor:        "pointer",
            transition:    "all 0.15s ease",
            whiteSpace:    "nowrap",
            fontWeight:    500,
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "#b8e0f5";
            b.style.borderColor = "#1a7ab5";
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.background = "#d6eef8";
            b.style.borderColor = "#3b9fd1";
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

// ── Input bar ─────────────────────────────────────────────────────────────────

function InputBar({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div
      style={{
        display:      "flex",
        gap:          8,
        padding:      "10px 12px",
        background:   "rgba(255,255,255,0.04)",
        borderTop:    `1px solid ${C.border}`,
        borderRadius: "0 0 12px 12px",
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="e.g. Why not a park here?"
        disabled={disabled}
        style={{
          flex:         1,
          background:   "#ffffff",
          border:       "2px solid #3b9fd1",
          borderRadius: 6,
          padding:      "10px 14px",
          fontFamily:   FONT_BODY,
          fontSize:     "0.78rem",
          color:        "#1a1a1a",
          outline:      "none",
          transition:   "border 0.15s",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#1a7ab5"; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = "#3b9fd1"; }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        style={{
          fontFamily:    FONT_MONO,
          fontSize:      "0.72rem",
          fontWeight:    700,
          letterSpacing: "0.05em",
          color:         disabled || !value.trim() ? "rgba(255,255,255,0.5)" : "#ffffff",
          background:    disabled || !value.trim() ? "rgba(196,145,26,0.4)" : C.gold,
          border:        "none",
          borderRadius:  6,
          padding:       "10px 20px",
          cursor:        disabled || !value.trim() ? "not-allowed" : "pointer",
          transition:    "all 0.15s ease",
          whiteSpace:    "nowrap",
          boxShadow:     disabled || !value.trim() ? "none" : "0 2px 8px rgba(196,145,26,0.4)",
        }}
      >
        Ask RISE
      </button>
    </div>
  );
}

// ── Default mock responder (replace with real API call) ───────────────────────

async function mockRespond(message: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
  return `RISE has received your question: "${message}". Connect this component to your API via the onSendMessage prop to get live responses.`;
}

// ── Default suggestion chips ──────────────────────────────────────────────────

const DEFAULT_CHIPS = [
  "Why not just build a park here?",
  "What makes this heritage-boosted?",
  "How much would the market cost?",
  "Which grant fits best?",
];

// ── CSS keyframes injected once ───────────────────────────────────────────────

const KEYFRAMES = `
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30%            { transform: translateY(-5px); opacity: 1; }
}
`;

function InjectStyles() {
  useEffect(() => {
    if (document.getElementById("rise-chat-styles")) return;
    const style = document.createElement("style");
    style.id = "rise-chat-styles";
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
  }, []);
  return null;
}

// ── AiRecommendations (main export) ──────────────────────────────────────────

export default function Chat({
  address = "101 Catoma St, Montgomery AL 36104",
  onSendMessage,
}: ChatProps) {
  const getOpeningMessage = (addr: string): ChatMessage => ({
  id:   "opening",
  role: "rise",
  text: `I'm analyzing ${addr}. Ask me anything — about the recommendations, the data signals, the grant urgency, or what this neighborhood really needs.`,
});

 const [messages, setMessages] = useState<ChatMessage[]>([getOpeningMessage(address)]);
  const [typing,   setTyping]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
  setMessages([getOpeningMessage(address)]);
}, [address]);

  async function handleSend(text: string) {
    const userMsg: ChatMessage = {
      id:   Date.now().toString(),
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const responder = onSendMessage
        ? (msg: string) => onSendMessage(msg, [...messages, userMsg])
        : mockRespond;

      const reply = await responder(text);
      const riseMsg: ChatMessage = {
        id:   (Date.now() + 1).toString(),
        role: "rise",
        text: reply,
      };
      setMessages((prev) => [...prev, riseMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "rise", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      <InjectStyles />
      <div
        style={{
          display:       "flex",
          flexDirection: "column",
          height:        "100%",
          background:    C.bg40,
          borderRadius:  12,
          border:        `1px solid ${C.border}`,
          overflow:      "hidden",
        }}
      >
        {/* ── Message list ── */}
        <div
          style={{
            flex:           1,
            overflowY:      "auto",
            padding:        "16px 14px",
            display:        "flex",
            flexDirection:  "column",
            gap:            14,
            scrollbarWidth: "thin",
            scrollbarColor: `${C.gold70} transparent`,
          }}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {typing && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>

        {/* ── Suggestion chips ── */}
        <div style={{ padding: "0 14px 8px" }}>
          <SuggestionChips chips={DEFAULT_CHIPS} onSelect={handleSend} />
        </div>

        {/* ── Input bar ── */}
        <InputBar onSend={handleSend} disabled={typing} />
      </div>
    </>
  );
}
