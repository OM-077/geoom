"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, Zap } from "lucide-react";
import UpgradeGate from "@/components/shared/UpgradeGate";

// ── Types ──────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant" | "upgrade";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
}

interface Business {
  id: string;
  name: string;
  score: number;
  weakestBucket: string;
  pricing_tier: "pro" | "founding";
}

// ── Mock business data (replace with real fetch) ───────────────────────────────

const MOCK_BUSINESS: Business = {
  id: "biz_001",
  name: "Peak Roofing Co.",
  score: 47,
  weakestBucket: "CITATIONS",
  pricing_tier: "pro",
};

const SUGGESTED_QUESTIONS = [
  "Why am I not showing up on ChatGPT?",
  "What's my highest impact fix right now?",
  "How do I get more reviews that help AI?",
  "What does my competitor have that I don't?",
];

// ── Typing indicator ───────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "14px 16px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.4)",
            display: "inline-block",
            animation: "geoom-bounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes geoom-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Timestamp ──────────────────────────────────────────────────────────────────

function Stamp({ date }: { date: Date }) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return (
    <span
      style={{
        fontSize: 10,
        color: "rgba(255,255,255,0.25)",
        display: "block",
        marginTop: 4,
      }}
    >
      {h}:{m}
    </span>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const isUpgrade = msg.role === "upgrade";

  if (isUpgrade) {
    return (
      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
        <div
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 10,
            padding: "14px 18px",
            maxWidth: 420,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b", margin: "0 0 4px" }}>
            Monthly limit reached
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 12px" }}>
            Upgrade to Pro for unlimited AI copilot questions.
          </p>
          <a
            href="/upgrade"
            style={{
              display: "inline-block",
              background: "#f59e0b",
              color: "#000",
              borderRadius: 6,
              padding: "7px 16px",
              fontSize: 12,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        margin: "6px 0",
      }}
    >
      <div
        style={{
          maxWidth: "78%",
          background: isUser ? "#f59e0b" : "rgba(255,255,255,0.07)",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.09)",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          padding: "11px 15px",
          color: isUser ? "#000" : "#fff",
          fontSize: 14,
          lineHeight: 1.55,
          fontWeight: isUser ? 500 : 400,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {msg.content}
      </div>
      <Stamp date={msg.timestamp} />
    </div>
  );
}

// ── Context bar ────────────────────────────────────────────────────────────────

function ContextBar({ business }: { business: Business }) {
  const bucketColors: Record<string, string> = {
    CITATIONS: "oklch(0.65 0.18 240)",
    CONTENT: "oklch(0.65 0.18 300)",
    REVIEWS: "oklch(0.80 0.20 145)",
    ENTITY: "oklch(0.70 0.18 55)",
    SCHEMA: "oklch(0.70 0.18 200)",
    FRESHNESS: "#FF7A00",
  };
  const color = bucketColors[business.weakestBucket] ?? "rgba(255,255,255,0.5)";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 16,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Talking about:</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{business.name}</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>·</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        Score{" "}
        <span style={{ color: "#f59e0b", fontWeight: 700 }}>{business.score}</span>
        <span style={{ color: "rgba(255,255,255,0.35)" }}>/100</span>
      </span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>·</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        Weakest:{" "}
        <span style={{ color, fontWeight: 700 }}>{business.weakestBucket}</span>
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AskGeoomPage() {
  const router = useRouter();

  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("geoom_token") : null;
    setAuthed(!!token);
  }, []);
  useEffect(() => {
    if (authed === false) router.replace("/login");
  }, [authed, router]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const business = MOCK_BUSINESS;
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = messages.length === 0;

  // Auto-scroll on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  }

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      setLoading(true);

      try {
        const res = await fetch("/api/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            context: {
              businessName: business.name,
              currentScore: business.score,
              weakestBucket: business.weakestBucket,
            },
          }),
        });

        if (res.status === 403) {
          setMessages((prev) => [
            ...prev,
            { id: `upgrade-${Date.now()}`, role: "upgrade", content: "", timestamp: new Date() },
          ]);
          return;
        }

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: data.reply ?? "Something went wrong. Please try again.",
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Couldn't reach the server. Check your connection and try again.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, business]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (authed === null || authed === false) return null;

  return (
    <UpgradeGate
      feature="Ask Geoom AI Copilot"
      requiredTier="pro"
      userTier={business.pricing_tier}
      description={`Get instant answers to any GEO question. Why am I not showing up? What should I fix next? Ask anything about your AI visibility.`}
    >
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d10",
          color: "#fff",
          fontFamily: "'Inter', system-ui, sans-serif",
          display: "flex",
        }}
      >
        {/* ── Sidebar nav */}
        <nav
          style={{
            width: 220,
            flexShrink: 0,
            borderRight: "1px solid rgba(255,255,255,0.07)",
            padding: "28px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ marginBottom: 28, paddingLeft: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", color: "#fff" }}>
              geo<span style={{ color: "#f59e0b" }}>om</span>
            </span>
          </div>
          {["Dashboard", "Fix Plan", "Score", "Ask Geoom", "Reports", "Settings"].map((item) => (
            <button
              key={item}
              style={{
                textAlign: "left",
                background: item === "Ask Geoom" ? "rgba(245,158,11,0.12)" : "none",
                border: item === "Ask Geoom" ? "1px solid rgba(245,158,11,0.25)" : "1px solid transparent",
                borderRadius: 7,
                padding: "9px 12px",
                fontSize: 14,
                fontWeight: item === "Ask Geoom" ? 600 : 400,
                color: item === "Ask Geoom" ? "#f59e0b" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* ── Chat column */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflow: "hidden",
            maxWidth: 740,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "28px 32px 0",
              flexShrink: 0,
            }}
          >
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Ask Geoom</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", margin: "0 0 20px" }}>
              Your AI visibility copilot
            </p>
            <ContextBar business={business} />
          </div>

          {/* Message list */}
          <div
            ref={listRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 32px 16px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.08) transparent",
            }}
          >
            {/* Empty state */}
            {isEmpty && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 320,
                  gap: 12,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    marginBottom: 4,
                  }}
                >
                  <Zap size={28} color="#f59e0b" fill="rgba(245,158,11,0.3)" />
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                  Ask me anything about your AI visibility
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.38)",
                    margin: 0,
                    maxWidth: 340,
                    lineHeight: 1.55,
                  }}
                >
                  I know your score, your weakest buckets, and exactly what to fix.
                </p>

                {/* Suggested questions */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "center",
                    marginTop: 20,
                    maxWidth: 520,
                  }}
                >
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 20,
                        padding: "9px 16px",
                        fontSize: 13,
                        color: "rgba(255,255,255,0.7)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        textAlign: "left",
                        lineHeight: 1.3,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(245,158,11,0.1)";
                        e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "16px 16px 16px 4px",
                    overflow: "hidden",
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* ── Input bar */}
          <div
            style={{
              padding: "12px 32px 24px",
              flexShrink: 0,
              borderTop: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 14,
                padding: "10px 10px 10px 16px",
                transition: "border-color 0.15s",
              }}
              onFocusCapture={(e) =>
                ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(245,158,11,0.4)")
              }
              onBlurCapture={(e) =>
                ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)")
              }
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about your AI visibility..."
                rows={1}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: 14,
                  lineHeight: 1.5,
                  resize: "none",
                  fontFamily: "inherit",
                  padding: 0,
                  minHeight: 24,
                  maxHeight: 140,
                  caretColor: "#f59e0b",
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: input.trim() && !loading ? "#f59e0b" : "rgba(245,158,11,0.2)",
                  border: "none",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
                aria-label="Send message"
              >
                <ArrowUp size={16} color={input.trim() && !loading ? "#000" : "rgba(245,158,11,0.5)"} strokeWidth={2.5} />
              </button>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: "8px 0 0", textAlign: "center" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </main>
      </div>
    </UpgradeGate>
  );
}
