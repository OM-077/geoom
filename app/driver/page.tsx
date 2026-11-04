"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink, ArrowRight } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Bucket = "CITATIONS" | "CONTENT" | "REVIEWS" | "ENTITY" | "SCHEMA" | "FRESHNESS";

interface Task {
  id: string;
  title: string;
  bucket: Bucket;
  estimatedGain: number;
  timeEstimate: string;
  description: string;
  deepLink: string;
  completed: boolean;
}

interface WeekData {
  weekNumber: number;
  tasks: Task[];
  allDone: boolean;
}

// ── Mock data (replace with lib/progress-report/generator.ts) ─────────────────

const MOCK_WEEKS: WeekData[] = Array.from({ length: 12 }, (_, i) => {
  const weekNumber = i + 1;
  const buckets: Bucket[] = ["CITATIONS", "CONTENT", "REVIEWS", "ENTITY", "SCHEMA", "FRESHNESS"];
  const tasks: Task[] = [
    {
      id: `w${weekNumber}-t1`,
      title: weekNumber === 1 ? "Add structured data markup to homepage" : `Week ${weekNumber} task one`,
      bucket: buckets[i % 6],
      estimatedGain: 8 + (i % 5),
      timeEstimate: "~10 min",
      description:
        "Add JSON-LD structured data to your homepage so AI models can extract your business name, address, services, and hours directly from your site without guessing. Use schema.org/LocalBusiness as the primary type.",
      deepLink: `/tools/schema-builder?week=${weekNumber}`,
      completed: weekNumber < 3 || (weekNumber === 3 && i % 3 === 0),
    },
    {
      id: `w${weekNumber}-t2`,
      title: weekNumber === 1 ? "Submit to three contractor directories" : `Week ${weekNumber} task two`,
      bucket: buckets[(i + 2) % 6],
      estimatedGain: 6 + (i % 4),
      timeEstimate: "~20 min",
      description:
        "AI models cite information from authoritative directories. Submit your business to HomeAdvisor, Angi, and Houzz this week. Make sure your NAP (name, address, phone) exactly matches what's on your website.",
      deepLink: `/tools/directory-submitter?week=${weekNumber}`,
      completed: weekNumber < 3,
    },
    {
      id: `w${weekNumber}-t3`,
      title: weekNumber === 1 ? "Request reviews from last 5 clients" : `Week ${weekNumber} task three`,
      bucket: buckets[(i + 4) % 6],
      estimatedGain: 11 + (i % 3),
      timeEstimate: "~15 min",
      description:
        "Google reviews are heavily weighted by AI models when answering 'who is the best contractor near me.' Use our review request template to reach your last 5 clients by text message.",
      deepLink: `/tools/review-templates?week=${weekNumber}`,
      completed: weekNumber < 2,
    },
  ];
  return { weekNumber, tasks, allDone: tasks.every((t) => t.completed) };
});

const MOCK_ONGOING_TASKS: Task[] = [
  {
    id: "ongoing-1",
    title: "Add a fresh project to your portfolio each month",
    bucket: "FRESHNESS",
    estimatedGain: 4,
    timeEstimate: "~30 min",
    description:
      "AI models downrank stale content. Add one completed project per month with photos, a brief description, and the city/neighbourhood where you worked. This keeps your content fresh indefinitely.",
    deepLink: "/tools/portfolio-builder",
    completed: false,
  },
  {
    id: "ongoing-2",
    title: "Reply to every new review within 48 hours",
    bucket: "REVIEWS",
    estimatedGain: 3,
    timeEstimate: "~5 min",
    description:
      "Response velocity is a signal of business activity. AI models value businesses that engage with customers. Set a phone reminder to check for new reviews twice a week.",
    deepLink: "/tools/review-monitor",
    completed: false,
  },
];

// ── Bucket colors ─────────────────────────────────────────────────────────────

const BUCKET_STYLES: Record<Bucket, { bg: string; text: string; border: string }> = {
  CITATIONS:  { bg: "rgba(59,130,246,0.12)",  text: "oklch(0.65 0.18 240)",  border: "rgba(59,130,246,0.3)"  },
  CONTENT:    { bg: "rgba(139,92,246,0.12)",  text: "oklch(0.65 0.18 300)",  border: "rgba(139,92,246,0.3)" },
  REVIEWS:    { bg: "rgba(34,197,94,0.12)",   text: "oklch(0.80 0.20 145)",  border: "rgba(34,197,94,0.3)"  },
  ENTITY:     { bg: "rgba(245,158,11,0.12)",  text: "oklch(0.70 0.18 55)",   border: "rgba(245,158,11,0.3)" },
  SCHEMA:     { bg: "rgba(20,184,166,0.12)",  text: "oklch(0.70 0.18 200)",  border: "rgba(20,184,166,0.3)" },
  FRESHNESS:  { bg: "rgba(255,122,0,0.10)",   text: "#FF7A00",               border: "rgba(255,122,0,0.3)"  },
};

// ── Components ─────────────────────────────────────────────────────────────────

function BucketBadge({ bucket }: { bucket: Bucket }) {
  const s = BUCKET_STYLES[bucket];
  return (
    <span
      style={{
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.05em",
        padding: "2px 7px",
        whiteSpace: "nowrap",
      }}
    >
      {bucket}
    </span>
  );
}

function TaskCard({
  task,
  onToggle,
  forceExpand,
}: {
  task: Task;
  onToggle: (id: string) => void;
  forceExpand?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (forceExpand) setExpanded(true);
  }, [forceExpand]);

  return (
    <div
      style={{
        background: task.completed ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 10,
        marginBottom: 8,
        overflow: "hidden",
        opacity: task.completed ? 0.65 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
            color: task.completed ? "#22c55e" : "rgba(255,255,255,0.4)",
            display: "flex",
          }}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        {/* Title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#fff",
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.title}
            </span>
            <BucketBadge bucket={task.bucket} />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
              Estimated gain: <span style={{ color: "rgba(255,255,255,0.55)" }}>+{task.estimatedGain} pts</span>
            </span>
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.07)",
                borderRadius: 4,
                padding: "1px 6px",
              }}
            >
              {task.timeEstimate}
            </span>
          </div>
        </div>

        {/* Expand arrow */}
        <span style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div
          style={{
            padding: "0 16px 16px 48px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: 12,
          }}
        >
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", lineHeight: 1.6, marginBottom: 12 }}>
            {task.description}
          </p>
          <a
            href={task.deepLink}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.4)",
              color: "#f59e0b",
              borderRadius: 6,
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.15)")}
          >
            Fix This <ExternalLink size={13} />
          </a>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function FixPlanPage() {
  const router = useRouter();

  // Auth guard (replace with your actual auth check)
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("geoom_token") : null;
    setAuthed(!!token);
  }, []);

  const [weeks, setWeeks] = useState<WeekData[]>(MOCK_WEEKS);
  const [ongoingTasks, setOngoingTasks] = useState<Task[]>(MOCK_ONGOING_TASKS);
  const [selectedWeek, setSelectedWeek] = useState<number | "ongoing">(3); // current week
  const CURRENT_WEEK = 3;
  const totalDone = weeks.flatMap((w) => w.tasks).filter((t) => t.completed).length;
  const totalTasks = weeks.flatMap((w) => w.tasks).length;
  const tabRowRef = useRef<HTMLDivElement>(null);
  const [expandFirst, setExpandFirst] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (authed === false) router.replace("/login");
  }, [authed, router]);

  if (authed === null) return null;
  if (!authed) return null;

  // Current week's tasks
  const currentWeekData =
    selectedWeek === "ongoing"
      ? null
      : weeks.find((w) => w.weekNumber === selectedWeek)!;

  const activeTasks = selectedWeek === "ongoing" ? ongoingTasks : currentWeekData?.tasks ?? [];
  const doneTasks = activeTasks.filter((t) => t.completed).length;
  const allDoneThisWeek = activeTasks.length > 0 && doneTasks === activeTasks.length;
  const noneDoneThisWeek = doneTasks === 0;

  async function handleToggle(taskId: string) {
    if (selectedWeek === "ongoing") {
      setOngoingTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
      );
      return;
    }
    // Optimistic update
    setWeeks((prev) =>
      prev.map((w) =>
        w.weekNumber === selectedWeek
          ? {
              ...w,
              tasks: w.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
              get allDone() {
                return this.tasks.every((t) => t.completed);
              },
            }
          : w
      )
    );
    // API call
    try {
      await fetch("/api/driver/complete-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: "current",
          weekNumber: selectedWeek,
          taskId,
        }),
      });
    } catch {
      // Revert on error if needed
    }
  }

  // ── Progress bar segments
  const segments = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d10",
        color: "#fff",
        fontFamily: "'Inter', system-ui, sans-serif",
        display: "flex",
      }}
    >
      {/* Sidebar nav (same design system stub) */}
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
        {["Dashboard", "Fix Plan", "Score", "Reports", "Settings"].map((item) => (
          <button
            key={item}
            style={{
              textAlign: "left",
              background: item === "Fix Plan" ? "rgba(245,158,11,0.12)" : "none",
              border: item === "Fix Plan" ? "1px solid rgba(245,158,11,0.25)" : "1px solid transparent",
              borderRadius: 7,
              padding: "9px 12px",
              fontSize: 14,
              fontWeight: item === "Fix Plan" ? 600 : 400,
              color: item === "Fix Plan" ? "#f59e0b" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "40px 36px", maxWidth: 820 }}>
        {/* ── Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Your Fix Plan</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", margin: "6px 0 0" }}>
              12-week roadmap to peak AI visibility
            </p>
          </div>
          {/* Progress pill */}
          <div
            style={{
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 20,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "#f59e0b",
              whiteSpace: "nowrap",
            }}
          >
            Week {CURRENT_WEEK} · {totalDone} of {totalTasks} tasks done
          </div>
        </div>

        {/* ── Progress bar */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
            {segments.map((n) => {
              const isPast = n < CURRENT_WEEK;
              const isCurrent = n === CURRENT_WEEK;
              const weekDone = weeks.find((w) => w.weekNumber === n)?.allDone ?? false;
              return (
                <div
                  key={n}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: isCurrent
                      ? "#f59e0b"
                      : isPast && weekDone
                      ? "#22c55e"
                      : isPast
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(255,255,255,0.08)",
                    transition: "background 0.2s",
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Week {CURRENT_WEEK} of 12</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{totalDone} tasks completed</span>
          </div>
        </div>

        {/* ── Week tabs */}
        <div
          ref={tabRowRef}
          style={{
            display: "flex",
            gap: 4,
            overflowX: "auto",
            paddingBottom: 2,
            marginBottom: 24,
            scrollbarWidth: "none",
          }}
        >
          {segments.map((n) => {
            const isCurrent = n === CURRENT_WEEK;
            const isSelected = selectedWeek === n;
            const isPast = n < CURRENT_WEEK;
            const weekDone = weeks.find((w) => w.weekNumber === n)?.allDone ?? false;
            return (
              <button
                key={n}
                onClick={() => { setSelectedWeek(n); setExpandFirst(false); }}
                style={{
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  borderBottom: isSelected ? "2px solid #f59e0b" : "2px solid transparent",
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected
                    ? "#fff"
                    : isPast
                    ? "rgba(255,255,255,0.45)"
                    : "rgba(255,255,255,0.28)",
                  cursor: n <= CURRENT_WEEK ? "pointer" : "default",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                Week {n}
                {isPast && weekDone && <span style={{ marginLeft: 4, fontSize: 11 }}>✓</span>}
              </button>
            );
          })}
          {/* Ongoing tab */}
          <button
            onClick={() => { setSelectedWeek("ongoing"); setExpandFirst(false); }}
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              borderBottom: selectedWeek === "ongoing" ? "2px solid #f59e0b" : "2px solid transparent",
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: selectedWeek === "ongoing" ? 600 : 400,
              color: selectedWeek === "ongoing" ? "#fff" : "rgba(255,255,255,0.28)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}
          >
            Ongoing ∞
          </button>
        </div>

        {/* ── Motivation / completion cards */}
        {selectedWeek !== "ongoing" && noneDoneThisWeek && selectedWeek === CURRENT_WEEK && (
          <div
            style={{
              background: "rgba(245,158,11,0.07)",
              border: "1px solid rgba(245,158,11,0.35)",
              borderRadius: 10,
              padding: "18px 20px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px", color: "#fff" }}>
                You haven&apos;t started Week {selectedWeek} yet.
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", margin: 0 }}>
                Contractors who complete Week 1 tasks improve their score by an average of +12 points.
              </p>
            </div>
            <button
              onClick={() => setExpandFirst(true)}
              style={{
                background: "#f59e0b",
                border: "none",
                borderRadius: 7,
                padding: "9px 16px",
                fontSize: 13,
                fontWeight: 600,
                color: "#000",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Start with Task 1 <ArrowRight size={14} />
            </button>
          </div>
        )}

        {selectedWeek !== "ongoing" && allDoneThisWeek && (
          <div
            style={{
              background: "rgba(34,197,94,0.07)",
              border: "1px solid rgba(34,197,94,0.35)",
              borderRadius: 10,
              padding: "18px 20px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px", color: "#22c55e" }}>
                Week {selectedWeek} complete ✓
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.48)", margin: 0 }}>
                Your score will update in the next 24 hours.
              </p>
            </div>
            {typeof selectedWeek === "number" && selectedWeek < 12 && (
              <button
                onClick={() => { setSelectedWeek(selectedWeek + 1); setExpandFirst(false); }}
                style={{
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.4)",
                  borderRadius: 7,
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#22c55e",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Go to Week {selectedWeek + 1} <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* ── Ongoing bar label */}
        {selectedWeek === "ongoing" && (
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "100%",
                height: 4,
                borderRadius: 2,
                background: "linear-gradient(90deg, #f59e0b 0%, rgba(245,158,11,0.2) 100%)",
              }}
            />
            <span style={{ whiteSpace: "nowrap" }}>Ongoing — compounding forever</span>
          </div>
        )}

        {/* ── Task cards */}
        <div>
          {activeTasks.map((task, idx) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
              forceExpand={expandFirst && idx === 0}
            />
          ))}
          {activeTasks.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No tasks for this week.</p>
          )}
        </div>
      </main>
    </div>
  );
}
