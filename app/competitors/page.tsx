"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ArrowRight, Info } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface BucketScores {
  entity: number;
  citations: number;
  reviews: number;
  content: number;
  schema: number;
  freshness: number;
}

interface Competitor {
  id: string;
  rank: number;
  name: string;
  claimed: boolean;
  score: number;
  reviewRating: number;
  reviewCount: number;
  buckets: BucketScores;
  isYou?: boolean;
}

interface PageData {
  trade: string;
  city: string;
  yourRank: number;
  updatedHoursAgo: number;
  competitors: Competitor[];
}

// ── Mock data (replace with lib/competitor-tracker.ts) ────────────────────────

const MOCK: PageData = {
  trade: "Roofing",
  city: "Austin",
  yourRank: 4,
  updatedHoursAgo: 3,
  competitors: [
    {
      id: "c1", rank: 1, name: "Apex Roofing Solutions", claimed: true,
      score: 81, reviewRating: 4.9, reviewCount: 214,
      buckets: { entity: 18, citations: 18, reviews: 19, content: 12, schema: 9, freshness: 5 },
    },
    {
      id: "c2", rank: 2, name: "TruRoof Austin", claimed: true,
      score: 74, reviewRating: 4.7, reviewCount: 98,
      buckets: { entity: 16, citations: 15, reviews: 17, content: 11, schema: 8, freshness: 7 },
    },
    {
      id: "c3", rank: 3, name: "Valley ****", claimed: false,
      score: 68, reviewRating: 4.5, reviewCount: 63,
      buckets: { entity: 14, citations: 13, reviews: 14, content: 9, schema: 11, freshness: 7 },
    },
    {
      id: "you", rank: 4, name: "Peak Roofing Co.", claimed: true,
      score: 47, reviewRating: 4.3, reviewCount: 31, isYou: true,
      buckets: { entity: 9, citations: 7, reviews: 10, content: 8, schema: 7, freshness: 6 },
    },
    {
      id: "c5", rank: 5, name: "Summit ****", claimed: false,
      score: 41, reviewRating: 4.1, reviewCount: 18,
      buckets: { entity: 8, citations: 9, reviews: 8, content: 7, schema: 6, freshness: 3 },
    },
    {
      id: "c6", rank: 6, name: "HomeShield Roofing", claimed: true,
      score: 35, reviewRating: 3.9, reviewCount: 11,
      buckets: { entity: 7, citations: 6, reviews: 7, content: 6, schema: 5, freshness: 4 },
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function estCalls(score: number) {
  return Math.round(score * 2 * 4 * 0.04);
}

function scoreColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 45) return "#f59e0b";
  return "#ef4444";
}

const BUCKET_MAX: Record<keyof BucketScores, number> = {
  entity: 20, citations: 20, reviews: 20, content: 15, schema: 10, freshness: 10,
};

const BUCKET_LABEL: Record<keyof BucketScores, string> = {
  entity: "Entity", citations: "Citations", reviews: "Reviews",
  content: "Content", schema: "Schema", freshness: "Freshness",
};

const BUCKET_COLOR: Record<keyof BucketScores, string> = {
  entity: "oklch(0.70 0.18 55)",
  citations: "oklch(0.65 0.18 240)",
  reviews: "oklch(0.80 0.20 145)",
  content: "oklch(0.65 0.18 300)",
  schema: "oklch(0.70 0.18 200)",
  freshness: "#FF7A00",
};

const FIX_LINKS: Record<keyof BucketScores, string> = {
  citations: "/fix-plan?bucket=citations",
  reviews: "/fix-plan?bucket=reviews",
  entity: "/fix-plan?bucket=entity",
  content: "/fix-plan?bucket=content",
  schema: "/fix-plan?bucket=schema",
  freshness: "/fix-plan?bucket=freshness",
};

const FIX_HINTS: Record<keyof BucketScores, string> = {
  citations: "Claim 3 more business directories",
  reviews: "Request reviews from recent clients",
  entity: "Complete your Google Business Profile",
  content: "Add service pages with GEO-optimised copy",
  schema: "Add JSON-LD schema to your homepage",
  freshness: "Publish a project update this week",
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 42,
        padding: "3px 9px",
        borderRadius: 6,
        background: `${color}18`,
        border: `1px solid ${color}44`,
        color,
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      {score}
    </span>
  );
}

function MiniBar({
  label, value, max, color,
}: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", width: 60, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: color }} />
      </div>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", width: 28, textAlign: "right", flexShrink: 0 }}>
        {value}/{max}
      </span>
    </div>
  );
}

function BucketBreakdown({ buckets }: { buckets: BucketScores }) {
  return (
    <div style={{ padding: "12px 16px 14px 52px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 7 }}>
      {(Object.keys(BUCKET_MAX) as (keyof BucketScores)[]).map((k) => (
        <MiniBar key={k} label={BUCKET_LABEL[k]} value={buckets[k]} max={BUCKET_MAX[k]} color={BUCKET_COLOR[k]} />
      ))}
    </div>
  );
}

function GapBadge({ gap }: { gap: number }) {
  if (gap === 0) return <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>—</span>;
  const ahead = gap > 0;
  const color = ahead ? "#ef4444" : "#22c55e";
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color }}>
      {ahead ? `+${gap} ahead` : `${gap} behind`}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CompetitorsPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("geoom_token") : null;
    setAuthed(!!token);
  }, []);
  useEffect(() => {
    if (authed === false) router.replace("/login");
  }, [authed, router]);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const data = MOCK;

  if (authed === null || authed === false) return null;

  const you = data.competitors.find((c) => c.isYou)!;
  const top = data.competitors[0];
  const avgScore = Math.round(
    data.competitors.filter((c) => !c.isYou).reduce((s, c) => s + c.score, 0) /
    (data.competitors.length - 1)
  );

  // Top 3 bucket gaps vs #1
  const gaps = (Object.keys(BUCKET_MAX) as (keyof BucketScores)[])
    .map((k) => ({ bucket: k, yours: you.buckets[k], theirs: top.buckets[k], max: BUCKET_MAX[k], diff: top.buckets[k] - you.buckets[k] }))
    .filter((g) => g.diff > 0)
    .sort((a, b) => b.diff - a.diff)
    .slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d10", color: "#fff", fontFamily: "'Inter', system-ui, sans-serif", display: "flex" }}>

      {/* ── Sidebar nav */}
      <nav style={{ width: 220, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)", padding: "28px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ marginBottom: 28, paddingLeft: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", color: "#fff" }}>
            geo<span style={{ color: "#f59e0b" }}>om</span>
          </span>
        </div>
        {["Dashboard", "Fix Plan", "Score", "Ask Geoom", "Competitors", "Reports", "Settings"].map((item) => (
          <button
            key={item}
            style={{
              textAlign: "left",
              background: item === "Competitors" ? "rgba(245,158,11,0.12)" : "none",
              border: item === "Competitors" ? "1px solid rgba(245,158,11,0.25)" : "1px solid transparent",
              borderRadius: 7, padding: "9px 12px", fontSize: 14,
              fontWeight: item === "Competitors" ? 600 : 400,
              color: item === "Competitors" ? "#f59e0b" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* ── Main */}
      <main style={{ flex: 1, overflowY: "auto", padding: "40px 36px", maxWidth: 900 }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 5px" }}>Competitors</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
              Top {data.trade} contractors in {data.city} ranked by AI visibility
            </p>
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", paddingTop: 6, whiteSpace: "nowrap" }}>
            Last updated: {data.updatedHoursAgo}h ago
          </span>
        </div>

        {/* ── Your position card */}
        <div
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.35)",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(245,158,11,0.7)", letterSpacing: "0.06em", margin: "0 0 4px", textTransform: "uppercase" }}>
                Your Position
              </p>
              <p style={{ fontSize: 22, fontWeight: 800, margin: "0 0 2px", color: "#fff" }}>
                Ranked <span style={{ color: "#f59e0b" }}>#{data.yourRank}</span> in {data.city}
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                +{top.score - you.score} points to reach the top spot
              </p>
            </div>
            <div style={{ display: "flex", gap: 28 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "0 0 4px" }}>Your score</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: scoreColor(you.score), margin: 0 }}>{you.score}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", margin: 0 }}>/ 100</p>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)", alignSelf: "stretch" }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "0 0 4px" }}>Avg competitor</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: scoreColor(avgScore), margin: 0 }}>{avgScore}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", margin: 0 }}>/ 100</p>
              </div>
              <div style={{ width: 1, background: "rgba(255,255,255,0.08)", alignSelf: "stretch" }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "0 0 4px" }}>#1 score</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: scoreColor(top.score), margin: 0 }}>{top.score}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", margin: 0 }}>/ 100</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Competitor table */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr 80px 160px 90px 110px",
              padding: "10px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              gap: 8,
            }}
          >
            {["Rank", "Business", "Score", "Reviews", "Est. Calls", "Gap to You"].map((col) => (
              <span key={col} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.04em" }}>
                {col}
              </span>
            ))}
          </div>

          {/* Rows */}
          {data.competitors.map((c) => {
            const gap = c.isYou ? 0 : c.score - you.score;
            const isExpanded = expanded === c.id;

            return (
              <div
                key={c.id}
                style={{
                  borderLeft: c.isYou ? "3px solid #f59e0b" : "3px solid transparent",
                  background: c.isYou ? "rgba(245,158,11,0.05)" : isExpanded ? "rgba(255,255,255,0.03)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onClick={() => setExpanded(isExpanded ? null : c.id)}
                onMouseEnter={(e) => {
                  if (!c.isYou && !isExpanded)
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (!c.isYou && !isExpanded)
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr 80px 160px 90px 110px",
                    padding: "14px 20px",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {/* Rank */}
                  <span style={{
                    fontSize: c.rank === 1 ? 15 : 14,
                    fontWeight: c.rank === 1 ? 800 : 500,
                    color: c.rank === 1 ? "#f59e0b" : "rgba(255,255,255,0.35)",
                  }}>
                    #{c.rank}
                  </span>

                  {/* Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{
                      fontSize: 14, fontWeight: c.isYou ? 700 : 500,
                      color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {c.name}
                    </span>
                    {c.isYou && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, background: "rgba(245,158,11,0.15)",
                        border: "1px solid rgba(245,158,11,0.4)", color: "#f59e0b",
                        borderRadius: 4, padding: "1px 6px", flexShrink: 0,
                      }}>
                        YOU
                      </span>
                    )}
                    {!c.claimed && (
                      <span style={{
                        fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.25)",
                        background: "rgba(255,255,255,0.05)", borderRadius: 4, padding: "1px 6px", flexShrink: 0,
                      }}>
                        unclaimed
                      </span>
                    )}
                  </div>

                  {/* Score */}
                  <div><ScoreBadge score={c.score} /></div>

                  {/* Reviews */}
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                    <span style={{ color: "#f59e0b" }}>{"★".repeat(1)}</span>{" "}
                    {c.reviewRating} · {c.reviewCount.toLocaleString()} reviews
                  </span>

                  {/* Est calls */}
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                    ~{estCalls(c.score)}/mo
                  </span>

                  {/* Gap */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <GapBadge gap={gap} />
                    <span style={{ color: "rgba(255,255,255,0.25)" }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </div>
                </div>

                {/* Expanded breakdown */}
                {isExpanded && <BucketBreakdown buckets={c.buckets} />}
              </div>
            );
          })}
        </div>

        {/* ── What they have that you don't */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px", color: "#fff" }}>
            What <span style={{ color: "#f59e0b" }}>#{top.rank} {top.name}</span> has that you don't
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {gaps.map((g) => (
              <div
                key={g.bucket}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 9,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                      background: `${BUCKET_COLOR[g.bucket]}18`,
                      border: `1px solid ${BUCKET_COLOR[g.bucket]}44`,
                      color: BUCKET_COLOR[g.bucket],
                    }}
                  >
                    {BUCKET_LABEL[g.bucket].toUpperCase()}
                  </span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>
                    #{top.rank} has{" "}
                    <span style={{ fontWeight: 700, color: "#fff" }}>{g.theirs}/{g.max}</span>
                    {"  ·  "}You have{" "}
                    <span style={{ fontWeight: 700, color: scoreColor(Math.round((g.yours / g.max) * 100)) }}>
                      {g.yours}/{g.max}
                    </span>
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
                    → {FIX_HINTS[g.bucket]}
                  </span>
                </div>
                <a
                  href={FIX_LINKS[g.bucket]}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
                    color: "#f59e0b", borderRadius: 6, padding: "6px 13px",
                    fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.22)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.12)")}
                >
                  Fix This <ArrowRight size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── How data is collected */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setInfoOpen((o) => !o)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(255,255,255,0.02)", border: "none", cursor: "pointer",
              padding: "14px 20px", color: "rgba(255,255,255,0.45)", fontSize: 13,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Info size={14} />
              How is this data collected?
            </span>
            {infoOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {infoOpen && (
            <div style={{ padding: "14px 20px 18px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.65, margin: 0, maxWidth: 640 }}>
                Competitor rankings are built by pulling public listing data from Google Places, aggregating review
                counts, ratings, and website structured data. Geoom's scoring engine evaluates each business across
                six AI-visibility buckets — Entity, Citations, Reviews, Content, Schema, and Freshness — using the
                same methodology applied to your own score. Unclaimed businesses are anonymised. Data refreshes
                every 24 hours. Estimated monthly calls are modelled from score against regional conversion benchmarks
                and are indicative only.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
