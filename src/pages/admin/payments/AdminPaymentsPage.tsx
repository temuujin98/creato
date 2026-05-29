import {
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  ReceiptText,
  X,
  XCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminMetricCard } from "../../../components/admin/AdminMetricCard";
import { AdminNotice } from "../../../components/admin/AdminNotice";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { AdminTable } from "../../../components/admin/AdminTable";
import { AdminConfirmModal } from "../generations/AdminConfirmModal";
import { useLanguage } from "../../../hooks/useLanguage";
import { formatCurrency } from "../../../lib/format";
import {
  getPaymentProviderMeta,
  listPaymentProviderMeta,
} from "../../../lib/paymentProviders/registry";
import type {
  AdminPayment,
  AdminPaymentSummary,
  AdminPaymentsFilters,
  PaymentStatus,
} from "../../../lib/adminPayments";
import {
  adminCancelPayment,
  adminMarkPaymentPaid,
  getAdminPaymentSummary,
  listAdminPayments,
} from "../../../lib/adminPayments";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  "all", "pending", "paid", "failed", "canceled", "expired", "refunded",
] as const;

const PROVIDER_OPTIONS = ["all", "manual", "qpay", "bonum", "pocket", "storepay"] as const;

const RANGE_OPTIONS = [
  { value: "all", labelKey: "rangeAll" },
  { value: "today", labelKey: "rangeToday" },
  { value: "7d", labelKey: "range7d" },
  { value: "30d", labelKey: "range30d" },
] as const;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const colors: Record<PaymentStatus, string> = {
    pending:  "border-amber-400/25 bg-amber-400/10 text-amber-200",
    paid:     "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    failed:   "border-red-400/25 bg-red-400/10 text-red-300",
    canceled: "border-white/15 bg-white/[0.04] text-white/50",
    expired:  "border-orange-400/25 bg-orange-400/10 text-orange-300",
    refunded: "border-blue-400/25 bg-blue-400/10 text-blue-300",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "border-white/10 text-white/50"}`}>
      {status}
    </span>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function DetailModal({
  payment,
  onClose,
  onMarkPaid,
  onCancel,
  busyAction,
  labels,
}: {
  payment: AdminPayment;
  onClose: () => void;
  onMarkPaid: (id: string) => void;
  onCancel: (id: string) => void;
  busyAction: "paid" | "cancel" | null;
  labels: {
    detailTitle: string;
    close: string;
    markPaid: string;
    cancelPayment: string;
    markPaidNotAllowed: string;
    cancelNotAllowed: string;
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

  const canMarkPaid = payment.status === "pending" && payment.creditedAt === null;
  const canCancel   = !["paid", "refunded"].includes(payment.status) && payment.creditedAt === null;

  const field = (label: string, value: string) => (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-sm text-white/80 break-all">{value}</dd>
    </div>
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={labels.detailTitle}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 text-white"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6 shadow-2xl shadow-black/80 overflow-y-auto max-h-[90dvh]">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{labels.detailTitle}</h2>
          <button ref={closeBtnRef} type="button" aria-label={labels.close} onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 hover:border-white/20 hover:text-white transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field("ID", payment.id)}
          {field("Status", payment.status)}
          {field("User ID", payment.userId)}
          {field("Email", payment.userEmail ?? "—")}
          {field("Name", payment.userName ?? "—")}
          {field("Package", payment.packageName ?? "—")}
          {field("Code", payment.packageCode ?? "—")}
          {field("Credits", String(payment.credits ?? "—"))}
          {field("Amount", formatCurrency(payment.amountMnt))}
          {field("Currency", payment.currency)}
          {(() => {
            const meta = getPaymentProviderMeta(payment.provider);
            return field("Provider", `${meta.displayName} (${meta.status})`);
          })()}
          {field("Provider ref", payment.providerReference ?? "—")}
          {field("Created", formatDate(payment.createdAt))}
          {field("Updated", formatDate(payment.updatedAt))}
          {field("Paid at", formatDate(payment.paidAt))}
          {field("Credited at", formatDate(payment.creditedAt))}
          {field("Expires at", formatDate(payment.expiresAt))}
        </dl>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={!canCancel || busyAction !== null}
            title={!canCancel ? labels.cancelNotAllowed : undefined}
            className={`rounded-xl border px-4 py-2 text-sm transition ${
              canCancel && busyAction === null
                ? "border-white/10 text-white/70 hover:border-white/20 hover:text-white"
                : "border-white/[0.06] text-white/25 cursor-not-allowed"
            }`}
            onClick={() => onCancel(payment.id)}
          >
            {busyAction === "cancel" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : labels.cancelPayment}
          </button>

          <button
            type="button"
            disabled={!canMarkPaid || busyAction !== null}
            title={!canMarkPaid ? labels.markPaidNotAllowed : undefined}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              canMarkPaid && busyAction === null
                ? "border-emerald-400/30 bg-emerald-900/30 text-emerald-200 hover:bg-emerald-900/50"
                : "border-white/[0.06] text-white/25 cursor-not-allowed"
            }`}
            onClick={() => onMarkPaid(payment.id)}
          >
            {busyAction === "paid" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : labels.markPaid}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminPaymentsPage() {
  const { t } = useLanguage();
  const p = t.admin.payments;

  const [summary, setSummary] = useState<AdminPaymentSummary | null>(null);
  const [items, setItems] = useState<AdminPayment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState<"all" | "today" | "7d" | "30d">("all");

  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);

  type PendingAction = { id: string; action: "paid" | "cancel" };
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [executing, setExecuting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadSummary = useCallback(() => {
    getAdminPaymentSummary(rangeFilter).then(setSummary).catch(() => {});
  }, [rangeFilter]);

  const loadList = useCallback(
    async (currentPage: number) => {
      setLoadingList(true);
      setListError(null);
      try {
        const filters: AdminPaymentsFilters = {
          status: statusFilter,
          provider: providerFilter,
          range: rangeFilter,
          page: currentPage,
          pageSize: PAGE_SIZE,
        };
        const result = await listAdminPayments(filters);
        setItems(result.items);
        setTotalCount(result.totalCount);
      } catch {
        setListError(p.loadError);
      } finally {
        setLoadingList(false);
      }
    },
    [statusFilter, providerFilter, rangeFilter, p.loadError],
  );

  useEffect(() => {
    setPage(0);
    loadList(0);
  }, [loadList]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(timer);
  }, [feedback]);

  async function executeAction(id: string, action: "paid" | "cancel") {
    setExecuting(true);
    try {
      if (action === "paid") {
        await adminMarkPaymentPaid(id);
        setFeedback({ type: "success", message: p.markPaidSuccess });
      } else {
        await adminCancelPayment(id);
        setFeedback({ type: "success", message: p.cancelSuccess });
      }
      loadList(page);
      loadSummary();
      setSelectedPayment(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setFeedback({
        type: "error",
        message: (action === "paid" ? p.markPaidError : p.cancelError) + (msg ? `: ${msg}` : ""),
      });
    } finally {
      setExecuting(false);
      setPendingAction(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const filtered = search.trim()
    ? items.filter((item) => {
        const q = search.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          (item.userEmail ?? "").toLowerCase().includes(q) ||
          (item.userName ?? "").toLowerCase().includes(q) ||
          (item.packageCode ?? "").toLowerCase().includes(q) ||
          (item.packageName ?? "").toLowerCase().includes(q) ||
          (item.providerReference ?? "").toLowerCase().includes(q)
        );
      })
    : items;

  const summaryCards = [
    { label: p.totalPayments, value: summary?.total ?? 0, icon: <ReceiptText className="h-5 w-5" /> },
    { label: p.pendingPayments, value: summary?.pending ?? 0, icon: <Loader2 className="h-5 w-5" /> },
    { label: p.paidPayments, value: summary?.paid ?? 0, icon: <CheckCircle2 className="h-5 w-5" /> },
    { label: p.failedCanceled, value: summary?.failedOrCanceled ?? 0, icon: <XCircle className="h-5 w-5" /> },
    { label: p.totalPaidAmount, value: formatCurrency(summary?.totalPaidAmountMnt ?? 0), icon: <CreditCard className="h-5 w-5" /> },
    { label: p.creditsSold, value: summary?.creditsSold ?? 0, icon: <CreditCard className="h-5 w-5" /> },
  ];

  const tableHeaders = [
    t.admin.common.createdAt,
    p.user,
    p.package,
    p.credits,
    p.amount,
    p.provider,
    t.admin.common.status,
    p.paidAt,
    t.admin.common.actions,
  ];

  const rows = filtered.map((item) => [
    <span className="whitespace-nowrap text-xs text-white/60">{formatDate(item.createdAt)}</span>,
    <div className="min-w-0">
      <p className="truncate text-sm text-white/86 max-w-[11rem]">{item.userEmail ?? item.userId.slice(0, 8)}</p>
      {item.userName && <p className="truncate text-xs text-white/42 max-w-[11rem]">{item.userName}</p>}
    </div>,
    <div className="min-w-0">
      <p className="text-sm text-white/80">{item.packageName ?? "—"}</p>
      <p className="text-xs text-white/40">{item.packageCode ?? ""}</p>
    </div>,
    <span className="font-mono text-sm text-white/80">{item.credits ?? "—"}</span>,
    <span className="whitespace-nowrap font-mono text-sm text-white/80">{formatCurrency(item.amountMnt)}</span>,
    <span className="text-xs text-white/55">{item.provider}</span>,
    <StatusBadge status={item.status} />,
    <span className="whitespace-nowrap text-xs text-white/55">{formatDate(item.paidAt)}</span>,
    <div className="flex items-center gap-2">
      <button type="button"
        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
        onClick={() => setSelectedPayment(item)}>
        {p.viewDetails}
      </button>
      <button
        type="button"
        disabled={item.status !== "pending" || item.creditedAt !== null || executing}
        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
          item.status === "pending" && item.creditedAt === null && !executing
            ? "border-emerald-400/25 text-emerald-300 hover:bg-emerald-900/30"
            : "border-white/[0.06] text-white/25 cursor-not-allowed"
        }`}
        onClick={() => setPendingAction({ id: item.id, action: "paid" })}>
        {p.markPaid}
      </button>
      <button
        type="button"
        disabled={["paid", "refunded"].includes(item.status) || item.creditedAt !== null || executing}
        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
          !["paid", "refunded"].includes(item.status) && item.creditedAt === null && !executing
            ? "border-white/10 text-white/70 hover:border-white/20 hover:text-white"
            : "border-white/[0.06] text-white/25 cursor-not-allowed"
        }`}
        onClick={() => setPendingAction({ id: item.id, action: "cancel" })}>
        {p.cancel}
      </button>
    </div>,
  ]);

  return (
    <div>
      <AdminPageHeader title={p.title} description={p.description} />

      {/* Summary cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <AdminMetricCard key={card.label} {...card} />
        ))}
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={p.searchPlaceholder}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/20 focus:bg-white/[0.07] w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 outline-none transition focus:border-white/20 cursor-pointer"
        >
          <option value="all">{p.statusAll}</option>
          {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 outline-none transition focus:border-white/20 cursor-pointer"
        >
          <option value="all">{p.providerAll}</option>
          {PROVIDER_OPTIONS.filter((pr) => pr !== "all").map((pr) => (
            <option key={pr} value={pr}>{pr}</option>
          ))}
        </select>

        <select
          value={rangeFilter}
          onChange={(e) => setRangeFilter(e.target.value as typeof rangeFilter)}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 outline-none transition focus:border-white/20 cursor-pointer"
        >
          {RANGE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {p[r.labelKey as keyof typeof p] as string}
            </option>
          ))}
        </select>

        <button type="button"
          className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
          onClick={() => loadList(page)}>
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="mt-6">
        {loadingList && (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-white/40" />
          </div>
        )}

        {!loadingList && listError && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-sm text-white/60">{listError}</p>
            <button type="button"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
              onClick={() => loadList(page)}>
              {p.retryLoad}
            </button>
          </div>
        )}

        {!loadingList && !listError && filtered.length === 0 && (
          <div className="grid place-items-center py-16">
            <p className="text-sm text-white/42">{p.empty}</p>
          </div>
        )}

        {!loadingList && !listError && filtered.length > 0 && (
          <AdminTable headers={tableHeaders} rows={rows} />
        )}
      </div>

      {/* Pagination */}
      {!loadingList && !listError && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-white/50">
          <span>
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} / {totalCount}
          </span>
          <div className="flex gap-2">
            <button type="button" disabled={page === 0}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => { setPage(page - 1); loadList(page - 1); }}>←</button>
            <button type="button" disabled={page >= totalPages - 1}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => { setPage(page + 1); loadList(page + 1); }}>→</button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <AdminNotice>{p.notice}</AdminNotice>
      </div>

      {/* Provider readiness */}
      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5">
        <p className="text-xs font-semibold uppercase text-white/42">{p.providerReadiness}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {listPaymentProviderMeta().map((meta) => (
            <span
              key={meta.key}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                meta.status === "manual_only"
                  ? "border-amber-400/25 bg-amber-400/10 text-amber-200"
                  : meta.status === "active"
                    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                    : meta.status === "testing"
                      ? "border-blue-400/25 bg-blue-400/10 text-blue-200"
                      : "border-white/10 bg-white/[0.03] text-white/40"
              }`}
            >
              {meta.displayName}: {meta.status.replace("_", " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selectedPayment && (
        <DetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onMarkPaid={(id) => { setSelectedPayment(null); setPendingAction({ id, action: "paid" }); }}
          onCancel={(id) => { setSelectedPayment(null); setPendingAction({ id, action: "cancel" }); }}
          busyAction={pendingAction?.id === selectedPayment.id ? pendingAction.action : null}
          labels={{
            detailTitle: p.detailTitle,
            close: p.close,
            markPaid: p.markPaid,
            cancelPayment: p.cancel,
            markPaidNotAllowed: p.markPaidNotAllowed,
            cancelNotAllowed: p.cancelNotAllowed,
          }}
        />
      )}

      {/* Confirm modals */}
      {pendingAction && (
        <AdminConfirmModal
          title={pendingAction.action === "paid" ? p.markPaidTitle : p.cancelTitle}
          body={pendingAction.action === "paid" ? p.markPaidBody : p.cancelBody}
          confirmLabel={pendingAction.action === "paid" ? p.markPaid : p.cancel}
          cancelLabel={p.cancelAction}
          loading={executing}
          onConfirm={() => executeAction(pendingAction.id, pendingAction.action)}
          onCancel={() => { if (!executing) setPendingAction(null); }}
        />
      )}

      {/* Feedback banner */}
      {feedback && (
        <div className={`fixed bottom-6 right-6 z-[900] flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-medium shadow-2xl shadow-black/60 transition ${
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
