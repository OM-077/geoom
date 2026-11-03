"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

// ── Types ────────────────────────────────────────────────────────────────────

interface ContentPage {
  id: string;
  title: string;
  url: string;
  score: number;
  graded_at: string;
}

interface GradeResult {
  overall: number;
  dimensions: {
    local_signals: number;
    keyword_relevance: number;
    answer_readiness: number;
    freshness: number;
  };
  issues: string[];
  working: string[];
  verdict: string;
}

interface SchemaStatus {
  local_business: boolean;
  faq: boolean;
  service: boolean;
}

interface Business {
  id: string;
  name: string;
  trade: string;
  city: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#FF7A00";
  return "#EF4444";
}

function scoreBg(score: number): string {
  if (score >= 80) return "rgba(34,197,94,0.15)";
  if (score >= 60) return "rgba(245,158,11,0.15)";
  if (score >= 40) return "rgba(255,122,0,0.15)";
  return "rgba(239,68,68,0.15)";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score, size = "sm" }: { score: number; size?: "sm" | "lg" }) {
  const color = scoreColor(score);
  const bg = scoreBg(score);
  if (size === "lg") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          borderRadius: 12,
          background: bg,
          border: `2px solid ${color}`,
          color,
          fontSize: 28,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
        }}
      >
        {score}
      </div>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 20,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        border: `1px solid ${color}33`,
        whiteSpace: "nowrap",
      }}
    >
      {score}
    </span>
  );
}

function DimensionBar({
  label,
  score,
  max,
}: {
  label: string;
  score: number;
  max: number;
}) {
  const pct = Math.round((score / max) * 100);
  const color = scoreColor(Math.round((score / max) * 100));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, color: "#8A9BB0" }}>{label}</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {score}/{max}
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 3,
            background: color,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  return (
    <div
      style={{
        position: "relative",
        background: "oklch(0.07 0.01 260)",
        border: "1px solid #222A35",
        borderRadius: 10,
        marginTop: 12,
      }}
    >
      <button
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "4px 12px",
          borderRadius: 6,
          background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${copied ? "#22C55E44" : "#222A35"}`,
          color: copied ? "#22C55E" : "#8A9BB0",
          fontSize: 12,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre
        style={{
          margin: 0,
          padding: "16px 16px 16px 16px",
          overflowX: "auto",
          fontSize: 12,
          lineHeight: 1.6,
          color: "#F0F4F8",
          fontFamily: "ui-monospace, 'Cascadia Code', monospace",
          maxHeight: 320,
          overflowY: "auto",
        }}
      >
        {code}
      </pre>
    </div>
  );
}

// ── Tab 1: My Pages ──────────────────────────────────────────────────────────

function MyPagesTab({
  pages,
  loading,
  onRegrade,
  onGoGrade,
}: {
  pages: ContentPage[];
  loading: boolean;
  onRegrade: (id: string) => void;
  onGoGrade: () => void;
}) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 72,
              borderRadius: 10,
              background: "oklch(0.12 0.015 260)",
              border: "1px solid #222A35",
              animation: "pulse 1.4s ease-in-out infinite",
              opacity: 0.6 - i * 0.1,
            }}
          />
        ))}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          background: "oklch(0.12 0.015 260)",
          border: "1px dashed #222A35",
          borderRadius: 12,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>📄</div>
        <p style={{ color: "#F0F4F8", fontWeight: 600, marginBottom: 6 }}>
          No pages graded yet
        </p>
        <p style={{ color: "#8A9BB0", fontSize: 14, marginBottom: 20 }}>
          Add your first page in the Grade tab.
        </p>
        <button onClick={onGoGrade} style={btnPrimary}>
          Grade My First Page →
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {pages.map((page) => (
        <div
          key={page.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 16px",
            background: "oklch(0.12 0.015 260)",
            border: "1px solid #222A35",
            borderRadius: 10,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontWeight: 600,
                color: "#F0F4F8",
                margin: 0,
                marginBottom: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {page.title}
            </p>
            <p
              style={{
                color: "#8A9BB0",
                fontSize: 12,
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {page.url}
            </p>
          </div>
          <ScoreBadge score={page.score} />
          <span style={{ color: "#8A9BB0", fontSize: 12, whiteSpace: "nowrap" }}>
            {formatDate(page.graded_at)}
          </span>
          <button
            onClick={() => onRegrade(page.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 7,
              background: "rgba(255,122,0,0.1)",
              border: "1px solid rgba(255,122,0,0.25)",
              color: "#FF7A00",
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Re-grade →
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Tab 2: Grade a Page ──────────────────────────────────────────────────────

function GradeTab() {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGrade = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/content/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), content: content.trim() }),
      });
      if (!res.ok) throw new Error("Failed to grade page");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Inputs */}
      <div style={card}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Page URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yoursite.com/plumber-phoenix"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Page Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your page text here (strip HTML)"
              style={{ ...inputStyle, height: 180, resize: "vertical" }}
            />
          </div>
          <button
            onClick={handleGrade}
            disabled={loading || !url.trim()}
            style={{
              ...btnPrimary,
              opacity: loading || !url.trim() ? 0.55 : 1,
              cursor: loading || !url.trim() ? "not-allowed" : "pointer",
              alignSelf: "flex-start",
            }}
          >
            {loading ? "Grading…" : "Grade This Page →"}
          </button>
          {error && (
            <p style={{ color: "#EF4444", fontSize: 14, margin: 0 }}>{error}</p>
          )}
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div style={card}>
          {/* Score */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <ScoreBadge score={result.overall} size="lg" />
            <div>
              <p style={{ color: "#8A9BB0", fontSize: 12, margin: 0, marginBottom: 2 }}>
                OVERALL SCORE
              </p>
              <p
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: scoreColor(result.overall),
                  margin: 0,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {result.overall}
                <span style={{ fontSize: 16, color: "#8A9BB0", fontWeight: 400 }}>/100</span>
              </p>
            </div>
          </div>

          {/* Dimension bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginBottom: 24,
              paddingBottom: 24,
              borderBottom: "1px solid #222A35",
            }}
          >
            <DimensionBar label="Local Signals" score={result.dimensions.local_signals} max={25} />
            <DimensionBar label="Keyword Relevance" score={result.dimensions.keyword_relevance} max={25} />
            <DimensionBar label="Answer Readiness" score={result.dimensions.answer_readiness} max={25} />
            <DimensionBar label="Freshness" score={result.dimensions.freshness} max={25} />
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                TOP ISSUES
              </p>
              <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {result.issues.slice(0, 3).map((issue, i) => (
                  <li key={i} style={{ color: "#F59E0B", fontSize: 14 }}>
                    {issue}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Working */}
          {result.working.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                WHAT'S WORKING
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.working.slice(0, 2).map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "#22C55E", flexShrink: 0 }}>✓</span>
                    <span style={{ color: "#F0F4F8", fontSize: 14 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verdict */}
          {result.verdict && (
            <p style={{ color: "#8A9BB0", fontSize: 13, fontStyle: "italic", margin: 0 }}>
              {result.verdict}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Templates ─────────────────────────────────────────────────────────

const TEMPLATES = [
  {
    icon: "📍",
    title: "Service + City Page",
    description:
      "e.g. Emergency Plumber in Phoenix — the highest-impact page type for AI citations",
    type: "service_city",
  },
  {
    icon: "❓",
    title: "FAQ Page",
    description:
      "Answer the exact questions people ask AI about your trade. Direct citation driver.",
    type: "faq",
  },
  {
    icon: "🏢",
    title: "LocalBusiness About Page",
    description:
      "Schema-optimized about page that tells AI engines exactly who you are and where you serve.",
    type: "about",
  },
];

function TemplatesTab({ business }: { business: Business | null }) {
  const [modal, setModal] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const generate = async (type: string, title: string) => {
    if (!business) return;
    setLoadingType(type);
    try {
      const prompt = `Generate a ${type} page template for ${business.name}, a ${business.trade} business in ${business.city}. Include schema markup where relevant.`;
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setModal({ title, content: data.content ?? data.result ?? "" });
    } catch {
      // surface error in modal
      setModal({ title, content: "Failed to generate template. Please try again." });
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {TEMPLATES.map((t) => (
          <div
            key={t.type}
            style={{
              ...card,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 28 }}>{t.icon}</div>
            <div>
              <p style={{ fontWeight: 700, color: "#F0F4F8", margin: 0, marginBottom: 6 }}>
                {t.title}
              </p>
              <p style={{ color: "#8A9BB0", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                {t.description}
              </p>
            </div>
            <button
              onClick={() => generate(t.type, t.title)}
              disabled={loadingType === t.type}
              style={{
                ...btnPrimary,
                marginTop: "auto",
                opacity: loadingType === t.type ? 0.6 : 1,
                cursor: loadingType === t.type ? "not-allowed" : "pointer",
              }}
            >
              {loadingType === t.type ? "Generating…" : "Generate Template →"}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "oklch(0.12 0.015 260)",
              border: "1px solid #222A35",
              borderRadius: 14,
              padding: 24,
              width: "100%",
              maxWidth: 640,
              maxHeight: "80vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontWeight: 700, color: "#F0F4F8", margin: 0 }}>{modal.title}</p>
              <button
                onClick={() => setModal(null)}
                style={{ background: "none", border: "none", color: "#8A9BB0", cursor: "pointer", fontSize: 20 }}
              >
                ×
              </button>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              <CodeBlock code={modal.content} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tab 4: Schema ─────────────────────────────────────────────────────────────

const SCHEMA_ITEMS = [
  {
    key: "local_business" as const,
    label: "LocalBusiness Schema",
    type: "LocalBusiness",
  },
  { key: "faq" as const, label: "FAQ Schema", type: "FAQPage" },
  { key: "service" as const, label: "Service Schema", type: "Service" },
];

function SchemaTab({
  status,
  business,
}: {
  status: SchemaStatus | null;
  business: Business | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const getJsonLd = (type: string): string => {
    const base = {
      "@context": "https://schema.org",
      "@type": type,
    };
    if (type === "LocalBusiness") {
      return JSON.stringify(
        {
          ...base,
          name: business?.name ?? "Your Business Name",
          "@type": ["LocalBusiness", business?.trade ?? "HomeAndConstructionBusiness"],
          address: {
            "@type": "PostalAddress",
            addressLocality: business?.city ?? "Your City",
            addressRegion: "AZ",
            addressCountry: "US",
          },
          areaServed: business?.city ?? "Your City",
        },
        null,
        2
      );
    }
    if (type === "FAQPage") {
      return JSON.stringify(
        {
          ...base,
          mainEntity: [
            {
              "@type": "Question",
              name: `How much does a ${business?.trade ?? "plumber"} cost in ${business?.city ?? "Phoenix"}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: "Prices vary by job. Contact us for a free estimate.",
              },
            },
          ],
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        ...base,
        serviceType: business?.trade ?? "Plumbing",
        provider: { "@type": "LocalBusiness", name: business?.name ?? "Your Business" },
        areaServed: business?.city ?? "Your City",
      },
      null,
      2
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {SCHEMA_ITEMS.map((item) => {
        const present = status ? status[item.key] : false;
        const isOpen = expanded === item.key;
        return (
          <div key={item.key} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: present ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  color: present ? "#22C55E" : "#EF4444",
                  border: `1px solid ${present ? "#22C55E33" : "#EF444433"}`,
                  flexShrink: 0,
                }}
              >
                {present ? "✓" : "✗"} {present ? "Detected" : "Missing"}
              </span>
              <span style={{ color: "#F0F4F8", fontWeight: 600, flex: 1 }}>
                {item.label}
              </span>
              <button
                onClick={() => setExpanded(isOpen ? null : item.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 7,
                  background: present
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,122,0,0.1)",
                  border: `1px solid ${present ? "#222A35" : "rgba(255,122,0,0.25)"}`,
                  color: present ? "#8A9BB0" : "#FF7A00",
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {present
                  ? isOpen
                    ? "Hide ↑"
                    : "View Example →"
                  : isOpen
                  ? "Hide ↑"
                  : "Generate Code →"}
              </button>
            </div>
            {isOpen && <CodeBlock code={getJsonLd(item.type)} />}
          </div>
        );
      })}

      {/* How-to card */}
      <div
        style={{
          ...card,
          background: "rgba(255,122,0,0.06)",
          border: "1px solid rgba(255,122,0,0.2)",
          marginTop: 8,
        }}
      >
        <p style={{ fontWeight: 700, color: "#FF7A00", margin: "0 0 12px", fontSize: 14 }}>
          How to add schema to your site
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Copy the JSON-LD code block above for the schema type you need.",
            'Paste it inside a <script type="application/ld+json"> tag in your page\'s <head>.',
            "Validate it at schema.org/validator, then re-run your audit here to confirm detection.",
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(255,122,0,0.2)",
                  color: "#FF7A00",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
              <span style={{ color: "#8A9BB0", fontSize: 13, lineHeight: 1.5 }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "oklch(0.12 0.015 260)",
  border: "1px solid #222A35",
  borderRadius: 12,
  padding: "16px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#8A9BB0",
  marginBottom: 8,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "oklch(0.09 0.01 260)",
  border: "1px solid #222A35",
  borderRadius: 8,
  color: "#F0F4F8",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  background: "#FF7A00",
  border: "none",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const TABS = ["My Pages", "Grade a Page", "Templates", "Schema"] as const;
type Tab = (typeof TABS)[number];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ContentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("My Pages");
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [schema, setSchema] = useState<SchemaStatus | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [bucketScore, setBucketScore] = useState<string>("—");

  // Auth guard — redirect if no session
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => {
        if (!r.ok) router.push("/login");
        return r.json();
      })
      .catch(() => router.push("/login"));
  }, [router]);

  // Fetch business + pages + schema
  useEffect(() => {
    fetch("/api/business/current")
      .then((r) => r.json())
      .then((b: Business) => {
        setBusiness(b);
        // pages
        fetch(`/api/content/pages?business_id=${b.id}`)
          .then((r) => r.json())
          .then((data: ContentPage[]) => {
            setPages(data);
            if (data.length > 0) {
              const avg = Math.round(
                data.reduce((s, p) => s + p.score, 0) / data.length
              );
              setBucketScore(`${Math.round(avg / 5)}/${20}`);
            }
          })
          .finally(() => setPagesLoading(false));
        // schema
        fetch(`/api/audit/schema?business_id=${b.id}`)
          .then((r) => r.json())
          .then(setSchema)
          .catch(() => null);
      })
      .catch(() => setPagesLoading(false));
  }, []);

  const handleRegrade = async (pageId: string) => {
    await fetch("/api/content/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_id: pageId }),
    });
    // Refresh list
    if (business) {
      const data: ContentPage[] = await fetch(
        `/api/content/pages?business_id=${business.id}`
      ).then((r) => r.json());
      setPages(data);
    }
  };

  const bucketColor = (() => {
    if (bucketScore === "—") return "#8A9BB0";
    const [n, d] = bucketScore.split("/").map(Number);
    const pct = (n / d) * 100;
    return scoreColor(pct);
  })();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "oklch(0.09 0.01 260)",
        color: "#F0F4F8",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Sidebar activeItem="Content" />

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, padding: "32px 28px", overflowY: "auto" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 28,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#F0F4F8", margin: 0, marginBottom: 4 }}>
              Content
            </h1>
            <p style={{ fontSize: 14, color: "#8A9BB0", margin: 0 }}>
              Pages that get you cited by AI engines
            </p>
          </div>
          {/* Bucket score badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "oklch(0.12 0.015 260)",
              border: `1px solid ${bucketColor}44`,
              borderRadius: 10,
            }}
          >
            <span style={{ fontSize: 12, color: "#8A9BB0", fontWeight: 600 }}>
              CONTENT SCORE
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: bucketColor,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {bucketScore}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            borderBottom: "1px solid #222A35",
            marginBottom: 24,
            overflowX: "auto",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 18px",
                background: "none",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab ? "#FF7A00" : "transparent"}`,
                color: activeTab === tab ? "#FF7A00" : "#8A9BB0",
                fontSize: 14,
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
                marginBottom: -1,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "My Pages" && (
          <MyPagesTab
            pages={pages}
            loading={pagesLoading}
            onRegrade={handleRegrade}
            onGoGrade={() => setActiveTab("Grade a Page")}
          />
        )}
        {activeTab === "Grade a Page" && <GradeTab />}
        {activeTab === "Templates" && <TemplatesTab business={business} />}
        {activeTab === "Schema" && (
          <SchemaTab status={schema} business={business} />
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        input::placeholder, textarea::placeholder { color: #4A5568; }
        input:focus, textarea:focus {
          border-color: rgba(255,122,0,0.5) !important;
          box-shadow: 0 0 0 3px rgba(255,122,0,0.08);
        }
        button:focus-visible {
          outline: 2px solid #FF7A00;
          outline-offset: 2px;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222A35; border-radius: 3px; }
      `}</style>
    </div>
  );
}
