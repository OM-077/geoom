"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Design tokens — swap these class strings to match your design system */
/* ------------------------------------------------------------------ */
const ui = {
  page: "min-h-screen bg-neutral-50 text-neutral-900",
  card: "rounded-xl border border-neutral-200 bg-white p-6 shadow-sm",
  label: "text-xs font-semibold uppercase tracking-wider text-neutral-500",
  fieldLabel: "mb-1.5 block text-sm font-medium text-neutral-700",
  input:
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-60",
  btnPrimary:
    "inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  btnGhost:
    "inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
  btnDanger:
    "inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
};

/* ------------------------------ Types ------------------------------ */
type Plan = "pro" | "founding";

interface BusinessInfo {
  name: string;
  trade: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  address: string;
}

interface NotificationPrefs {
  weeklyScoreEmail: boolean;
  scoreDropAlerts: boolean;
  competitorMovedAlert: boolean;
  monthlyProgressReport: boolean;
}

interface ToastState {
  id: number;
  message: string;
  kind: "success" | "error";
}

const TRADES = [
  { value: "plumber", label: "Plumber" },
  { value: "hvac", label: "HVAC" },
  { value: "electrician", label: "Electrician" },
  { value: "roofer", label: "Roofer" },
  { value: "painter", label: "Painter" },
  { value: "landscaper", label: "Landscaper" },
  { value: "pest_control", label: "Pest control" },
  { value: "cleaning", label: "Cleaning" },
  { value: "general_contractor", label: "General contractor" },
  { value: "other", label: "Other" },
];

const EMPTY_BUSINESS: BusinessInfo = {
  name: "",
  trade: "",
  city: "",
  state: "",
  phone: "",
  website: "",
  address: "",
};

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  weeklyScoreEmail: true,
  scoreDropAlerts: true,
  competitorMovedAlert: true,
  monthlyProgressReport: true,
};

const NOTIFICATION_ROWS: {
  key: keyof NotificationPrefs;
  title: string;
  description: string;
}[] = [
  {
    key: "weeklyScoreEmail",
    title: "Monday weekly score email",
    description: "Your Geoom score and what changed, every Monday.",
  },
  {
    key: "scoreDropAlerts",
    title: "Score drop alerts",
    description: "Get notified when your score falls.",
  },
  {
    key: "competitorMovedAlert",
    title: "Competitor moved alert",
    description: "Know when a competitor passes you or closes the gap.",
  },
  {
    key: "monthlyProgressReport",
    title: "Monthly progress report",
    description: "A month-over-month summary of your progress.",
  },
];

const PLAN_BADGE: Record<Plan, string> = {
  
  pro: "GEOOM · $97/mo",
  founding: "FOUNDING · $499/yr",
};

/* ------------------------------ Page ------------------------------- */
export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [business, setBusiness] = useState<BusinessInfo>(EMPTY_BUSINESS);
  const [savingBusiness, setSavingBusiness] = useState(false);

  const [notifications, setNotifications] =
    useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS);

  const [plan, setPlan] = useState<Plan>("pro");

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pausing, setPausing] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (message: string, kind: ToastState["kind"] = "success") => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ id: Date.now(), message, kind });
      toastTimer.current = setTimeout(() => setToast(null), 3500);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  /* ---- Load settings + enforce auth (redirect on 401) ---- */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/login?next=/settings");
          return;
        }
        if (!res.ok) throw new Error("Failed to load settings");

        const data: {
          business?: Partial<BusinessInfo>;
          notifications?: Partial<NotificationPrefs>;
          plan?: Plan;
        } = await res.json();

        if (cancelled) return;
        setBusiness({ ...EMPTY_BUSINESS, ...data.business });
        setNotifications({ ...DEFAULT_NOTIFICATIONS, ...data.notifications });
        if (data.plan) setPlan(data.plan);
      } catch {
        if (!cancelled)
          setLoadError("We couldn't load your settings. Refresh to try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  /* ---- Business info ---- */
  const updateBusiness = (field: keyof BusinessInfo, value: string) =>
    setBusiness((prev) => ({ ...prev, [field]: value }));

  async function saveBusiness(e: React.FormEvent) {
    e.preventDefault();
    setSavingBusiness(true);
    try {
      const res = await fetch("/api/business/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(business),
      });
      if (res.status === 401) {
        router.replace("/login?next=/settings");
        return;
      }
      if (!res.ok) throw new Error();
      showToast("Changes saved");
    } catch {
      showToast("Couldn't save changes. Check your connection and try again.", "error");
    } finally {
      setSavingBusiness(false);
    }
  }

  /* ---- Notifications: autosave on toggle, revert on failure ---- */
  async function toggleNotification(key: keyof NotificationPrefs) {
    const previous = notifications;
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);

    try {
      const res = await fetch("/api/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.status === 401) {
        router.replace("/login?next=/settings");
        return;
      }
      if (!res.ok) throw new Error();
      showToast("Notification settings saved");
    } catch {
      setNotifications(previous);
      showToast("Couldn't update notifications. Try again.", "error");
    }
  }

  /* ---- Pause account (request goes to support) ---- */
  async function pauseAccount() {
    setPausing(true);
    try {
      const res = await fetch("/api/support/pause-request", { method: "POST" });
      if (!res.ok) throw new Error();
      setShowPauseModal(false);
      showToast("Pause request sent. Our team will be in touch shortly.");
    } catch {
      showToast("Couldn't send your request. Try again.", "error");
    } finally {
      setPausing(false);
    }
  }

  /* ------------------------------ Render ------------------------------ */
  if (loading) {
    return (
      <main className={ui.page}>
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100"
            />
          ))}
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className={ui.page}>
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div role="alert" className={`${ui.card} border-red-300 text-sm text-red-700`}>
            {loadError}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={ui.page}>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Manage your business details, notifications, and plan.
          </p>
        </header>

        {/* ---------------- SECTION 1: BUSINESS INFO ---------------- */}
        <section className={ui.card} aria-labelledby="business-info-label">
          <h2 id="business-info-label" className={ui.label}>
            Business info
          </h2>

          <form onSubmit={saveBusiness} className="mt-5 space-y-4">
            <Field label="Business name" htmlFor="name">
              <input
                id="name"
                type="text"
                className={ui.input}
                value={business.name}
                onChange={(e) => updateBusiness("name", e.target.value)}
                autoComplete="organization"
              />
            </Field>

            <Field label="Trade" htmlFor="trade">
              <select
                id="trade"
                className={ui.input}
                value={business.trade}
                onChange={(e) => updateBusiness("trade", e.target.value)}
              >
                <option value="" disabled>
                  Select your trade
                </option>
                {TRADES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" htmlFor="city">
                <input
                  id="city"
                  type="text"
                  className={ui.input}
                  value={business.city}
                  onChange={(e) => updateBusiness("city", e.target.value)}
                  autoComplete="address-level2"
                />
              </Field>
              <Field label="State" htmlFor="state">
                <input
                  id="state"
                  type="text"
                  className={ui.input}
                  value={business.state}
                  onChange={(e) => updateBusiness("state", e.target.value)}
                  autoComplete="address-level1"
                />
              </Field>
            </div>

            <Field label="Phone" htmlFor="phone">
              <input
                id="phone"
                type="text"
                inputMode="tel"
                className={ui.input}
                value={business.phone}
                onChange={(e) => updateBusiness("phone", e.target.value)}
                autoComplete="tel"
              />
            </Field>

            <Field label="Website" htmlFor="website">
              <input
                id="website"
                type="text"
                inputMode="url"
                placeholder="https://"
                className={ui.input}
                value={business.website}
                onChange={(e) => updateBusiness("website", e.target.value)}
                autoComplete="url"
              />
            </Field>

            <Field label="Address" htmlFor="address">
              <input
                id="address"
                type="text"
                className={ui.input}
                value={business.address}
                onChange={(e) => updateBusiness("address", e.target.value)}
                autoComplete="street-address"
              />
            </Field>

            <div className="pt-2">
              <button type="submit" className={ui.btnPrimary} disabled={savingBusiness}>
                {savingBusiness ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* ---------------- SECTION 2: NOTIFICATIONS ---------------- */}
        <section className={ui.card} aria-labelledby="notifications-label">
          <h2 id="notifications-label" className={ui.label}>
            Notifications
          </h2>

          <ul className="mt-2 divide-y divide-neutral-100">
            {NOTIFICATION_ROWS.map((row) => (
              <li key={row.key} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p id={`${row.key}-title`} className="text-sm font-medium">
                    {row.title}
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-500">{row.description}</p>
                </div>
                <Switch
                  checked={notifications[row.key]}
                  onChange={() => toggleNotification(row.key)}
                  labelledBy={`${row.key}-title`}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- SECTION 3: PLAN & BILLING ---------------- */}
        <section className={ui.card} aria-labelledby="plan-label">
          <h2 id="plan-label" className={ui.label}>
            Plan &amp; billing
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-neutral-900 px-3 py-1 text-xs font-bold tracking-wide text-white">
              {PLAN_BADGE[plan]}
            </span>

            {plan === "founding" && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                Founding Member — Rate locked forever ✓
              </span>
            )}
          </div>

          
            <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-sm font-semibold">Pro includes</p>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                {[
                  "Ask Geoom AI Copilot",
                  "Competitor deep analysis",
                  "Priority score updates",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/billing/upgrade" className={`${ui.btnPrimary} mt-5 w-full sm:w-auto`}>
                Upgrade to Geoom — $97/mo →
              </Link>
              <p className="mt-3 text-xs text-neutral-500">
                Upgrade activates on your next billing date
              </p>
            </div>
       
        </section>

        {/* ---------------- DANGER ZONE ---------------- */}
        <section
          className="rounded-xl border border-red-300 bg-white p-6"
          aria-labelledby="danger-label"
        >
          <h2 id="danger-label" className="text-xs font-semibold uppercase tracking-wider text-red-600">
            Danger zone
          </h2>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Pause account</p>
              <p className="mt-0.5 text-sm text-neutral-500">
                Temporarily pause your account. Our support team will handle your request.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPauseModal(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Pause Account
            </button>
          </div>
        </section>
      </div>

      {/* ---------------- Pause confirmation modal ---------------- */}
      {showPauseModal && (
        <PauseModal
          busy={pausing}
          onCancel={() => setShowPauseModal(false)}
          onConfirm={pauseAccount}
        />
      )}

      {/* ---------------- Toast ---------------- */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {toast && (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              toast.kind === "success" ? "bg-neutral-900" : "bg-red-600"
            }`}
          >
            <span aria-hidden="true">{toast.kind === "success" ? "✓" : "!"}</span>
            {toast.message}
          </div>
        )}
      </div>
    </main>
  );
}

/* --------------------------- Subcomponents --------------------------- */
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={ui.fieldLabel}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  labelledBy,
}: {
  checked: boolean;
  onChange: () => void;
  labelledBy: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ${
        checked ? "bg-green-600" : "bg-neutral-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function PauseModal({
  busy,
  onCancel,
  onConfirm,
}: {
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4"
      onClick={() => !busy && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="pause-title" className="text-lg font-semibold">
          Pause your account?
        </h3>
        <p className="mt-2 text-sm text-neutral-600">
          We&apos;ll send a pause request to our support team. They&apos;ll confirm with you
          before anything changes.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className={ui.btnGhost} onClick={onCancel} disabled={busy}>
            Keep account active
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={ui.btnDanger}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Sending…" : "Send pause request"}
          </button>
        </div>
      </div>
    </div>
  );
}
