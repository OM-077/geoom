import type { Metadata } from "next";
import Link from "next/link";
// ⚠️ Swap for your own DB client (see getLeaderboard below).
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

/* Public page — no auth. Cache rendered output for an hour. */
export const revalidate = 3600;

/* ------------------------------------------------------------------ */
/* Design tokens — swap these to match your dark design system         */
/* ------------------------------------------------------------------ */
const ui = {
  page: "min-h-screen bg-[#0b0b0d] text-neutral-100",
  surface: "bg-white/[0.04]",
  border: "border-white/10",
  muted: "text-neutral-400",
  amber: "text-amber-400",
  btnAmber:
    "inline-flex items-center justify-center rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d]",
};

/* ------------------------------ Types ------------------------------ */
interface LeaderboardRow {
  id: string | number;
  business_name: string;
  rank: number;
  score: number;
  rating: number | null;
  review_count: number | null;
  claimed: boolean;
}

type Params = Promise<{ city: string; trade: string }>;

/* ------------------------------ Helpers ---------------------------- */
/** "los-angeles" / "los%20angeles" / "pest_control" → "los angeles" / "pest control" */
function normalize(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    /* keep raw slug if malformed */
  }
  return decoded.replace(/[-_+]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTrade(normalized: string): string {
  return normalized === "hvac" ? "HVAC" : normalized;
}

/** Unclaimed businesses are masked: "Valley Plumbing Co" → "Valley ****" */
function displayName(row: LeaderboardRow): string {
  if (row.claimed) return row.business_name;
  const first = row.business_name.trim().split(/\s+/)[0] ?? "";
  return `${first} ****`;
}

/** OKLCH score color: green (strong) → amber (mid) → red (weak). */
function scoreColor(score: number): string {
  if (score >= 70) return "oklch(0.78 0.17 150)";
  if (score >= 40) return "oklch(0.82 0.16 80)";
  return "oklch(0.68 0.2 25)";
}

function claimHref(row: LeaderboardRow, city: string, trade: string): string {
  const qs = new URLSearchParams({
    ref: "leaderboard",
    name: row.business_name,
    city,
    trade,
  });
  return `/audit?${qs.toString()}`;
}

/* ------------------------------ Data ------------------------------- */
async function getLeaderboard(city: string, trade: string): Promise<LeaderboardRow[]> {
  try {
    const { data, error } = await supabase
      .from('leaderboard_cache')
      .select('*')
      .ilike('city', city)
      .ilike('trade', trade)
      .order('rank', { ascending: true })
      .limit(20)
    if (error) throw error
    return (data ?? []) as unknown as LeaderboardRow[]
  } catch (err) {
    console.error('leaderboard_cache query failed', err)
    return []
  }
}

/* ----------------------------- Metadata ---------------------------- */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { city: rawCity, trade: rawTrade } = await params;
  const city = titleCase(normalize(rawCity));
  const trade = formatTrade(normalize(rawTrade));

  const title = `Top ${trade} contractors in ${city} — AI Visibility Ranking | Geoom`;
  const description = `See which ${trade} contractors in ${city} show up on ChatGPT, Siri, and Google AI. Free AI visibility scores.`;

  const og = new URLSearchParams({
    name: `${city} ${trade}`, // encodes as "City+trade"
    score: "0",
    trade,
    city,
  });
  const ogImage = `/api/social-card?${og.toString()}`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: ogImage }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

/* ------------------------------ Page ------------------------------- */
export default async function LeaderboardPage({ params }: { params: Params }) {
  const { city: rawCity, trade: rawTrade } = await params;
  const cityKey = normalize(rawCity);
  const tradeKey = normalize(rawTrade);
  const city = titleCase(cityKey);
  const trade = formatTrade(tradeKey);

  const rows = await getLeaderboard(cityKey, tradeKey);

  return (
    <div className={ui.page}>
      {/* ---------------- HEADER ---------------- */}
      <header className={`border-b ${ui.border}`}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${ui.muted} hover:text-neutral-200`}
          >
            Geoom
          </Link>
          <Link href="/audit" className={ui.btnAmber}>
            Get Your Free Score →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16">
        {/* ---------------- HERO ---------------- */}
        <section className="pb-8 pt-12">
          <span
            className={`inline-block rounded-full border ${ui.border} ${ui.surface} px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${ui.muted}`}
          >
            AI Visibility Ranking
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Top {trade} contractors in {city}
          </h1>
          <p className={`mt-3 max-w-xl text-base ${ui.muted}`}>
            Ranked by Geoom Score — how visible each business is on ChatGPT, Siri, and Google AI
          </p>
        </section>

        {/* ---------------- TABLE / EMPTY STATE ---------------- */}
        {rows.length === 0 ? (
          <section
            className={`rounded-xl border ${ui.border} ${ui.surface} px-6 py-12 text-center`}
          >
            <p className="text-lg font-semibold">
              Scanning {trade} contractors in {city}...
            </p>
            <p className={`mt-2 text-sm ${ui.muted}`}>Check back in 24 hours.</p>
            <Link href="/audit" className={`${ui.btnAmber} mt-6`}>
              Get scanned first →
            </Link>
          </section>
        ) : (
          <section aria-label={`Ranking of ${trade} contractors in ${city}`}>
            <ol className={`overflow-hidden rounded-xl border ${ui.border}`}>
              {rows.map((row, i) => {
                const color = scoreColor(row.score);
                const isTop3 = row.rank <= 3;
                const rankClass =
                  row.rank === 1
                    ? `${ui.amber} font-bold`
                    : row.rank <= 3
                    ? "font-bold text-white"
                    : `${ui.muted} font-medium`;

                return (
                  <li
                    key={row.id}
                    className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-l-2 px-4 py-4 sm:flex-nowrap ${
                      i % 2 === 0 ? ui.surface : "bg-transparent"
                    }`}
                    style={{ borderLeftColor: isTop3 ? color : "transparent" }}
                  >
                    {/* Rank */}
                    <span className={`w-9 shrink-0 text-lg tabular-nums ${rankClass}`}>
                      #{row.rank}
                    </span>

                    {/* Name + meta */}
                    <div className="min-w-0 flex-1 basis-40">
                      <p
                        className={`truncate text-sm ${
                          row.claimed ? "font-bold text-white" : ui.muted
                        }`}
                      >
                        {displayName(row)}
                      </p>
                      {row.rating != null && (
                        <p className={`mt-0.5 text-xs ${ui.muted}`}>
                          {row.rating.toFixed(1)} ★ · {row.review_count ?? 0}
                        </p>
                      )}
                    </div>

                    {/* Score */}
                    <span
                      className="w-12 shrink-0 rounded-md border px-2 py-1 text-center text-sm font-bold tabular-nums"
                      style={{
                        color,
                        borderColor: `color-mix(in oklch, ${color} 40%, transparent)`,
                        backgroundColor: `color-mix(in oklch, ${color} 12%, transparent)`,
                      }}
                      aria-label={`Geoom score ${row.score}`}
                    >
                      {row.score}
                    </span>

                    {/* Status + claim link */}
                    <div className="flex shrink-0 items-center gap-3">
                      {row.claimed ? (
                        <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-green-400">
                          Claimed
                        </span>
                      ) : (
                        <>
                          <span
                            className={`rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${ui.muted}`}
                          >
                            Unclaimed
                          </span>
                          <Link
                            href={claimHref(row, city, trade)}
                            className={`whitespace-nowrap text-xs font-semibold ${ui.amber} hover:underline`}
                          >
                            Is this you? →
                          </Link>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* ---------------- CLAIM CTA ---------------- */}
        <section className="mt-8 rounded-xl border border-amber-400/60 bg-amber-400/[0.04] p-6 text-center">
          <h2 className="text-lg font-semibold">Don&apos;t see your business here?</h2>
          <p className={`mt-1 text-sm ${ui.muted}`}>
            Run a free scan and see where you rank.
          </p>
          <Link href="/audit" className={`${ui.btnAmber} mt-5`}>
            Scan My Business Free →
          </Link>
        </section>

        {/* ---------------- HOW SCORES WORK (closed by default) ---------------- */}
        <details className={`group mt-6 rounded-xl border ${ui.border} ${ui.surface}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 [&::-webkit-details-marker]:hidden">
            How is this score calculated?
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className={`h-4 w-4 transition-transform group-open:rotate-180 ${ui.muted}`}
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
                clipRule="evenodd"
              />
            </svg>
          </summary>
          <p className={`px-5 pb-5 text-sm leading-relaxed ${ui.muted}`}>
            Geoom scores contractors across 6 factors AI engines check: business entity
            verification, schema markup, review quality, citation consistency across 8
            directories, local content pages, and freshness signals. Score is 0–100.
          </p>
        </details>
      </main>
    </div>
  );
}
