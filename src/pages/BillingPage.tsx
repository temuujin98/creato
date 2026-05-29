import {
  CheckCircle2,
  CreditCard,
  Loader2,
  ReceiptText,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { useLanguage } from "../hooks/useLanguage";
import { useWallet } from "../hooks/useWallet";
import { formatCurrency } from "../lib/format";
import type { PaymentOrder, PaymentStatus } from "../lib/payments";
import { cancelOwnPaymentOrder, listUserPayments } from "../lib/payments";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<PaymentStatus, string> = {
  pending:  "border-amber-400/30 bg-amber-400/10 text-amber-200",
  paid:     "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  failed:   "border-red-400/30 bg-red-400/10 text-red-300",
  canceled: "border-white/15 bg-white/[0.04] text-white/50",
  expired:  "border-orange-400/30 bg-orange-400/10 text-orange-300",
  refunded: "border-violet-400/30 bg-violet-400/10 text-violet-300",
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "border-white/10 text-white/50"}`}>
      {status}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
      <div className="text-white/46">{icon}</div>
      <p className="mt-4 text-sm text-white/46">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </article>
  );
}

// ─── Confirm cancel modal ─────────────────────────────────────────────────────

function ConfirmModal({
  title,
  body,
  confirmLabel,
  cancelLabel,
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => { cancelRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && !loading) onCancel(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [loading, onCancel]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1100] flex items-center justify-center p-4 text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={loading ? undefined : onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6 shadow-2xl shadow-black/80">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" ref={cancelRef} disabled={loading} onClick={onCancel}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/62 transition hover:border-white/20 hover:text-white disabled:opacity-40">
            {cancelLabel}
          </button>
          <button type="button" disabled={loading} onClick={onConfirm}
            className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-900/30 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-900/50 disabled:opacity-60">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function DetailModal({
  order,
  onClose,
  onCancel,
  canceling,
  labels,
}: {
  order: PaymentOrder;
  onClose: () => void;
  onCancel: (id: string) => void;
  canceling: boolean;
  labels: {
    title: string;
    close: string;
    cancel: string;
    cancelNotAllowed: string;
    foundationNotice: string;
  };
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => { closeBtnRef.current?.focus(); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const canCancel = order.status === "pending" && order.creditedAt === null;

  function fmt(v: string | null) {
    if (!v) return "—";
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(v));
  }

  const fields: [string, string][] = [
    ["Package", order.packageName ?? "—"],
    ["Code", order.packageCode ?? "—"],
    ["Credits", String(order.credits)],
    ["Amount", formatCurrency(order.amountMnt)],
    ["Currency", order.currency],
    ["Provider", order.provider],
    ["Status", order.status],
    ["Created", fmt(order.createdAt)],
    ["Expires", fmt(order.expiresAt)],
    ["Paid at", fmt(order.paidAt)],
    ["Credited at", fmt(order.creditedAt)],
  ];

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={labels.title}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-y-auto max-h-[90dvh] rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6 shadow-2xl shadow-black/80">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{labels.title}</h2>
          <button ref={closeBtnRef} type="button" aria-label={labels.close} onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 hover:border-white/20 hover:text-white transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-2">
          <StatusBadge status={order.status} />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3">
          {fields.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-white/40">{label}</dt>
              <dd className="text-sm text-white/80">{value}</dd>
            </div>
          ))}
          <div className="col-span-2 flex flex-col gap-0.5">
            <dt className="text-xs text-white/40">Order ID</dt>
            <dd className="break-all font-mono text-xs text-white/50">{order.id}</dd>
          </div>
        </dl>

        <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-xs leading-5 text-amber-200/80">
          {labels.foundationNotice}
        </p>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/62 transition hover:border-white/20 hover:text-white">
            {labels.close}
          </button>
          <button
            type="button"
            disabled={!canCancel || canceling}
            title={!canCancel ? labels.cancelNotAllowed : undefined}
            onClick={() => onCancel(order.id)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
              canCancel && !canceling
                ? "border-red-400/30 bg-red-900/20 text-red-300 hover:bg-red-900/40"
                : "border-white/[0.06] text-white/25 cursor-not-allowed"
            }`}
          >
            {canceling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {labels.cancel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function formatDate(v: string | null) {
  if (!v) return "—";
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(v));
}

export function BillingPage() {
  const { t } = useLanguage();
  const b = t.billing;
  const { wallet } = useWallet();

  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PaymentOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUserPayments();
      setOrders(data);
    } catch {
      setError(b.loadError);
    } finally {
      setLoading(false);
    }
  }, [b.loadError]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  async function handleCancel(paymentId: string) {
    setCanceling(true);
    try {
      await cancelOwnPaymentOrder(paymentId);
      setFeedback({ type: "success", message: b.cancelSuccess });
      setCancelTarget(null);
      setSelected(null);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setFeedback({ type: "error", message: b.cancelError + (msg ? `: ${msg}` : "") });
    } finally {
      setCanceling(false);
    }
  }

  const paid    = orders.filter((o) => o.status === "paid");
  const pending = orders.filter((o) => o.status === "pending");
  const totalPaid = paid.reduce((s, o) => s + o.amountMnt, 0);

  const stats = [
    { label: b.currentCredits, value: wallet?.balance ?? "—", icon: <CreditCard className="h-5 w-5" /> },
    { label: b.pendingPayments, value: pending.length, icon: <Loader2 className="h-5 w-5" /> },
    { label: b.paidPayments, value: paid.length, icon: <CheckCircle2 className="h-5 w-5" /> },
    { label: b.totalPaidAmount, value: formatCurrency(totalPaid), icon: <ReceiptText className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">{b.title}</h1>
              <p className="mt-4 text-lg leading-8 text-white/58">{b.subtitle}</p>
            </div>
            <Link
              to="/pricing"
              className="shrink-0 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              {b.buyCredits}
            </Link>
          </div>

          {/* Summary cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Payment history */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{b.paymentHistory}</h2>
              <button type="button" onClick={load}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:border-white/20 hover:text-white">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>

            {loading && (
              <div className="mt-8 grid place-items-center py-12">
                <Loader2 className="h-7 w-7 animate-spin text-white/40" />
              </div>
            )}

            {!loading && error && (
              <div className="mt-8 flex flex-col items-center gap-4 py-12 text-center">
                <XCircle className="h-8 w-8 text-white/30" />
                <p className="text-sm text-white/60">{error}</p>
                <button type="button" onClick={load}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white">
                  {b.retryLoad}
                </button>
              </div>
            )}

            {!loading && !error && orders.length === 0 && (
              <div className="mt-8 flex flex-col items-center gap-4 py-16 text-center">
                <ReceiptText className="h-10 w-10 text-white/20" />
                <p className="text-sm text-white/42">{b.empty}</p>
                <Link to="/pricing"
                  className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:text-white">
                  {b.buyCredits}
                </Link>
              </div>
            )}

            {!loading && !error && orders.length > 0 && (
              <div className="mt-4 overflow-x-auto rounded-[1.5rem] border border-white/10 bg-white/[0.025]">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase text-white/42">
                    <tr>
                      {[b.colDate, b.colPackage, b.colCredits, b.colAmount, b.colStatus, b.colExpires, t.admin.common.actions].map((h) => (
                        <th key={h} className="px-4 py-4 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8 text-white/66">
                    {orders.map((order) => {
                      const canCancel = order.status === "pending" && order.creditedAt === null;
                      return (
                        <tr key={order.id} className="transition hover:bg-white/[0.025]">
                          <td className="px-4 py-4 align-middle whitespace-nowrap text-xs text-white/55">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <p className="text-sm text-white/80">{order.packageName ?? "—"}</p>
                            <p className="text-xs text-white/40">{order.packageCode ?? ""}</p>
                          </td>
                          <td className="px-4 py-4 align-middle font-mono text-sm text-white/80">
                            {order.credits}
                          </td>
                          <td className="px-4 py-4 align-middle whitespace-nowrap font-mono text-sm text-white/80">
                            {formatCurrency(order.amountMnt)}
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-4 align-middle whitespace-nowrap text-xs text-white/50">
                            {formatDate(order.expiresAt)}
                          </td>
                          <td className="px-4 py-4 align-middle">
                            <div className="flex items-center gap-2">
                              <button type="button"
                                className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
                                onClick={() => setSelected(order)}>
                                {b.viewDetails}
                              </button>
                              <button
                                type="button"
                                disabled={!canCancel}
                                title={!canCancel ? b.cancelNotAllowed : undefined}
                                className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                                  canCancel
                                    ? "border-red-400/25 text-red-300 hover:bg-red-900/20"
                                    : "border-white/[0.06] text-white/25 cursor-not-allowed"
                                }`}
                                onClick={() => setCancelTarget(order.id)}
                              >
                                {b.cancel}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notice */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/52">
            {b.notice}
          </div>

        </section>
      </main>
      <Footer />

      {/* Detail modal */}
      {selected && (
        <DetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onCancel={(id) => { setSelected(null); setCancelTarget(id); }}
          canceling={canceling}
          labels={{
            title: b.detailTitle,
            close: b.close,
            cancel: b.cancel,
            cancelNotAllowed: b.cancelNotAllowed,
            foundationNotice: b.foundationNotice,
          }}
        />
      )}

      {/* Cancel confirm modal */}
      {cancelTarget && (
        <ConfirmModal
          title={b.cancelTitle}
          body={b.cancelBody}
          confirmLabel={b.cancel}
          cancelLabel={b.cancelAction}
          loading={canceling}
          onConfirm={() => handleCancel(cancelTarget)}
          onCancel={() => { if (!canceling) setCancelTarget(null); }}
        />
      )}

      {/* Feedback banner */}
      {feedback && (
        <div className={`fixed bottom-6 right-6 z-[900] flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-medium shadow-2xl shadow-black/60 ${
          feedback.type === "success"
            ? "border-emerald-400/25 bg-emerald-900/80 text-emerald-200"
            : "border-red-400/25 bg-red-900/80 text-red-200"
        }`}>
          {feedback.message}
          <button type="button" className="ml-1 text-white/40 hover:text-white" onClick={() => setFeedback(null)}>×</button>
        </div>
      )}
    </div>
  );
}
