import {
  CreditCard,
  Loader2,
  Package,
  RefreshCw,
  Star,
  TrendingDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminMetricCard } from "../../../components/admin/AdminMetricCard";
import { AdminNotice } from "../../../components/admin/AdminNotice";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { AdminTable } from "../../../components/admin/AdminTable";
import { useLanguage } from "../../../hooks/useLanguage";
import type { AdminCreditPackage } from "../../../lib/creditPackages";
import {
  ANCHOR_PRICE_PER_CREDIT,
  avgPerCredit,
  discountPct,
  listAdminCreditPackages,
  setCreditPackageActive,
} from "../../../lib/creditPackages";
import { formatCurrency } from "../../../lib/format";
import { AdminCreditPackageModal } from "./AdminCreditPackageModal";

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        active
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-red-400/20 bg-red-400/10 text-red-200/80"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function AdminCreditPackagesPage() {
  const { t } = useLanguage();
  const c = t.admin.credits;

  const [packages,    setPackages]    = useState<AdminCreditPackage[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [modalTarget, setModalTarget] = useState<AdminCreditPackage | null | "create">(null);
  const [busyId,      setBusyId]      = useState<string | null>(null);
  const [feedback,    setFeedback]    = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-dismiss feedback
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(t);
  }, [feedback]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminCreditPackages();
      setPackages(data);
    } catch {
      setError(c.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleToggleActive(pkg: AdminCreditPackage) {
    setBusyId(pkg.id);
    try {
      await setCreditPackageActive(pkg.id, !pkg.isActive);
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, isActive: !p.isActive } : p)),
      );
      setFeedback({
        type: "success",
        message: pkg.isActive ? c.packageDisabled : c.packageActivated,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : c.saveError,
      });
    } finally {
      setBusyId(null);
    }
  }

  function handleSaved(saved: AdminCreditPackage) {
    setPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      return [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder);
    });
    const isEdit = typeof modalTarget !== "string" && modalTarget !== null;
    setFeedback({ type: "success", message: isEdit ? c.packageUpdated : c.packageSaved });
    setModalTarget(null);
  }

  // Summary computations
  const activePkgs   = packages.filter((p) => p.isActive);
  const totalCredits = activePkgs.reduce((s, p) => s + p.credits, 0);
  const lowestAvg    = activePkgs.length
    ? Math.min(...activePkgs.map((p) => avgPerCredit(p)))
    : 0;

  const summaryCards = [
    {
      label: c.activePackages,
      value: activePkgs.length,
      icon: <Package className="h-5 w-5" />,
    },
    {
      label: c.totalCredits,
      value: totalCredits,
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      label: c.lowestAverage,
      value: lowestAvg ? formatCurrency(lowestAvg) : "—",
      icon: <TrendingDown className="h-5 w-5" />,
    },
    {
      label: c.anchorPrice,
      value: `${formatCurrency(ANCHOR_PRICE_PER_CREDIT)} / credit`,
      icon: <Star className="h-5 w-5" />,
    },
  ];

  const tableHeaders = [
    t.admin.common.name,
    t.admin.common.credits,
    t.admin.common.price,
    c.average,
    c.discount,
    t.admin.common.featured,
    t.admin.common.status,
    t.admin.common.sortOrder,
    t.admin.common.actions,
  ];

  const rows = packages.map((pkg) => {
    const avg      = avgPerCredit(pkg);
    const disc     = discountPct(pkg);
    const isBusy   = busyId === pkg.id;

    return [
      // Package name + code
      <div>
        <p className="font-semibold text-white/90">{pkg.name}</p>
        <p className="font-mono text-xs text-white/38">{pkg.code}</p>
        {pkg.badgeText && (
          <span className="mt-1 inline-block rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-200/90">
            {pkg.badgeText}
          </span>
        )}
      </div>,
      // Credits
      <span className="font-mono text-sm text-white/80">{pkg.credits}</span>,
      // Price
      <span className="text-sm text-white/80">{formatCurrency(pkg.priceMnt)}</span>,
      // Average
      <span className="text-sm text-white/70">{formatCurrency(avg)}</span>,
      // Discount
      <span className={`text-sm font-semibold ${disc > 0 ? "text-emerald-300" : "text-white/38"}`}>
        {disc > 0 ? `${disc}%` : "—"}
      </span>,
      // Featured
      pkg.isFeatured ? (
        <Star className="h-4 w-4 text-amber-400" aria-label="Featured" />
      ) : (
        <span className="text-white/25">—</span>
      ),
      // Status
      <StatusChip active={pkg.isActive} />,
      // Sort
      <span className="font-mono text-xs text-white/42">{pkg.sortOrder}</span>,
      // Actions
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
          onClick={() => setModalTarget(pkg)}
        >
          {t.admin.common.edit}
        </button>
        <button
          type="button"
          disabled={isBusy}
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs transition ${
            isBusy
              ? "border-white/[0.06] text-white/25 cursor-not-allowed"
              : pkg.isActive
                ? "border-white/10 text-white/60 hover:border-red-400/25 hover:text-red-300"
                : "border-white/10 text-white/60 hover:border-emerald-400/25 hover:text-emerald-300"
          }`}
          onClick={() => handleToggleActive(pkg)}
        >
          {isBusy && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
          {pkg.isActive ? c.deactivate : c.activate}
        </button>
      </div>,
    ];
  });

  const modalLabels = {
    active:        t.admin.common.active,
    average:       c.average,
    badgeText:     c.badgeText,
    cancel:        c.cancel,
    createPackage: c.createPackage,
    credits:       t.admin.common.credits,
    discount:      c.discount,
    editPackage:   c.editPackage,
    featured:      t.admin.common.featured,
    fieldCode:     c.fieldCode,
    fieldDescription: c.fieldDescription,
    livePreview:   c.livePreview,
    name:          t.admin.common.name,
    priceMnt:      c.priceMnt,
    saveChanges:   t.admin.common.saveChanges,
    saveError:     c.saveError,
    sortOrder:     t.admin.common.sortOrder,
    status:        t.admin.common.status,
  };

  const isModalOpen = modalTarget !== null;
  const editTarget  = modalTarget === "create" ? null : modalTarget;

  return (
    <div>
      <AdminPageHeader
        title={c.title}
        description={c.description}
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/[0.1] hover:text-white"
            onClick={() => setModalTarget("create")}
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            {c.createPackage}
          </button>
        }
      />

      {/* Summary cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <AdminMetricCard key={card.label} {...card} />
        ))}
      </div>

      {/* Table */}
      <div className="mt-8">
        {loading && (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-white/40" aria-hidden="true" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-sm text-white/60">{error}</p>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
              onClick={load}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {c.retryLoad}
            </button>
          </div>
        )}

        {!loading && !error && packages.length === 0 && (
          <div className="grid place-items-center py-16">
            <p className="text-sm text-white/42">{c.empty}</p>
          </div>
        )}

        {!loading && !error && packages.length > 0 && (
          <AdminTable headers={tableHeaders} rows={rows} />
        )}
      </div>

      {/* Anchor price reference */}
      {!loading && !error && packages.length > 0 && (
        <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.025] px-4 py-3 text-xs text-white/46">
          {c.anchorPrice}: {formatCurrency(ANCHOR_PRICE_PER_CREDIT)} / credit — {c.discount}{" "}
          = ((990 - avg) / 990) × 100
        </div>
      )}

      <div className="mt-6">
        <AdminNotice>{c.notice}</AdminNotice>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`fixed bottom-6 right-6 z-[900] flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-medium shadow-2xl shadow-black/60 ${
            feedback.type === "success"
              ? "border-emerald-400/25 bg-emerald-900/80 text-emerald-200"
              : "border-red-400/25 bg-red-900/80 text-red-200"
          }`}
        >
          {feedback.message}
          <button
            type="button"
            className="ml-1 text-white/40 hover:text-white"
            onClick={() => setFeedback(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Create/Edit modal */}
      {isModalOpen && (
        <AdminCreditPackageModal
          target={editTarget}
          labels={modalLabels}
          onClose={() => setModalTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
