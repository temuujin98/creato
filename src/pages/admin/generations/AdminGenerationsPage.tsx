import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Images,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminMetricCard } from "../../../components/admin/AdminMetricCard";
import { AdminNotice } from "../../../components/admin/AdminNotice";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { AdminTable } from "../../../components/admin/AdminTable";
import { CreationStatusBadge } from "../../../components/my-creations/CreationStatusBadge";
import { useLanguage } from "../../../hooks/useLanguage";
import type {
  AdminGeneration,
  AdminGenerationStatus,
  AdminGenerationSummary,
  AdminGenerationsFilters,
} from "../../../lib/adminGenerations";
import {
  getAdminGenerationSummary,
  listAdminGenerations,
} from "../../../lib/adminGenerations";
import { AdminGenerationDetailModal } from "./AdminGenerationDetailModal";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  "all",
  "created",
  "credit_reserved",
  "queued",
  "processing",
  "completed",
  "credit_spent",
  "failed",
  "credit_refunded",
  "canceled",
] as const;

const PROVIDER_OPTIONS = ["all", "gemini", "openai"] as const;
const RANGE_OPTIONS = ["all", "today", "week", "month"] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminGenerationsPage() {
  const { t } = useLanguage();
  const g = t.admin.generations;

  const [summary, setSummary] = useState<AdminGenerationSummary | null>(null);
  const [items, setItems] = useState<AdminGeneration[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState<"all" | "today" | "week" | "month">("all");

  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  function statusLabel(status: AdminGenerationStatus): string {
    const map: Record<string, string> = {
      created: t.admin.common.processing,
      credit_reserved: t.admin.common.processing,
      queued: t.admin.common.processing,
      processing: t.admin.common.processing,
      completed: t.admin.common.completed,
      credit_spent: t.admin.common.completed,
      failed: t.admin.common.failed,
      credit_refunded: t.admin.common.failed,
      canceled: t.admin.common.failed,
    };
    return map[status] ?? status;
  }

  const loadList = useCallback(
    async (currentPage: number) => {
      setLoadingList(true);
      setListError(null);
      try {
        const filters: AdminGenerationsFilters = {
          status: statusFilter,
          provider: providerFilter,
          range: rangeFilter,
          page: currentPage,
          pageSize: PAGE_SIZE,
        };
        const result = await listAdminGenerations(filters);
        setItems(result.items);
        setTotalCount(result.totalCount);
      } catch {
        setListError(g.loadError);
      } finally {
        setLoadingList(false);
      }
    },
    [statusFilter, providerFilter, rangeFilter, g.loadError],
  );

  useEffect(() => {
    setPage(0);
    loadList(0);
  }, [loadList]);

  useEffect(() => {
    getAdminGenerationSummary()
      .then(setSummary)
      .catch(() => {/* summary is optional */});
  }, []);

  function handlePageChange(next: number) {
    setPage(next);
    loadList(next);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Client-side search filter applied over the current page
  const filtered = search.trim()
    ? items.filter((item) => {
        const q = search.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          (item.userEmail ?? "").toLowerCase().includes(q) ||
          (item.userName ?? "").toLowerCase().includes(q) ||
          (item.productSlug ?? "").toLowerCase().includes(q)
        );
      })
    : items;

  const summaryCards = [
    {
      label: g.total,
      value: summary?.total ?? 0,
      icon: <Images className="h-5 w-5" />,
    },
    {
      label: t.admin.common.completed,
      value: summary?.completed ?? 0,
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      label: t.admin.common.processing,
      value: summary?.processing ?? 0,
      icon: <Loader2 className="h-5 w-5" />,
    },
    {
      label: t.admin.common.failed,
      value: summary?.failed ?? 0,
      icon: <XCircle className="h-5 w-5" />,
    },
    {
      label: g.creditsUsed,
      value: summary?.creditsUsed ?? 0,
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      label: g.estimatedCost,
      value: "—",
      icon: <AlertCircle className="h-5 w-5" />,
    },
  ];

  const tableHeaders = [
    t.admin.common.createdAt,
    g.colPreview,
    g.user,
    g.product,
    t.admin.common.status,
    g.colModel,
    t.admin.common.credits,
    g.colRetries,
    t.admin.common.actions,
  ];

  const rows = filtered.map((item) => [
    <span className="whitespace-nowrap text-white/60 text-xs">{formatDate(item.createdAt)}</span>,
    item.productThumbnail ? (
      <img
        src={item.productThumbnail}
        alt=""
        className="h-10 w-10 rounded-xl object-cover opacity-70"
      />
    ) : (
      <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
    ),
    <div className="min-w-0">
      <p className="truncate text-sm text-white/86 max-w-[12rem]">
        {item.userEmail ?? item.userId.slice(0, 8)}
      </p>
      {item.userName ? (
        <p className="truncate text-xs text-white/42 max-w-[12rem]">{item.userName}</p>
      ) : null}
    </div>,
    <span className="text-sm text-white/70">{item.productSlug ?? item.productId.slice(0, 8)}</span>,
    <CreationStatusBadge status={item.status} label={statusLabel(item.status)} />,
    <span className="text-xs text-white/55">
      {[item.provider, item.model].filter(Boolean).join(" / ") || "—"}
    </span>,
    <span className="font-mono text-sm text-white/80">{item.creditCost}</span>,
    <span className="font-mono text-sm text-white/55">{item.retryCount}</span>,
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
        onClick={() => setSelectedId(item.id)}
      >
        {g.viewDetails}
      </button>
      <button
        type="button"
        disabled
        className="rounded-lg border border-white/[0.06] px-2.5 py-1 text-xs text-white/25 cursor-not-allowed"
        title="Backend required"
      >
        {g.retryJob}
      </button>
      <button
        type="button"
        disabled
        className="rounded-lg border border-white/[0.06] px-2.5 py-1 text-xs text-white/25 cursor-not-allowed"
        title="Backend required"
      >
        {g.refundCredit}
      </button>
    </div>,
  ]);

  const detailLabels = {
    close: g.close,
    detailTitle: g.detailTitle,
    fieldCompletedAt: g.fieldCompletedAt,
    fieldErrorCode: g.fieldErrorCode,
    fieldErrorMessage: g.fieldErrorMessage,
    fieldId: g.fieldId,
    fieldInputCount: g.fieldInputCount,
    fieldModel: g.colModel,
    fieldOutputCount: g.fieldOutputCount,
    fieldProductId: g.fieldProductId,
    fieldProductSlug: g.fieldProductSlug,
    fieldRetryCount: g.fieldRetryCount,
    fieldStartedAt: g.fieldStartedAt,
    fieldStatus: t.admin.common.status,
    fieldUserEmail: g.fieldUserEmail,
    fieldUserId: g.fieldUserId,
    fieldUserName: g.fieldUserName,
    loadError: g.loadError,
    outputsEmpty: g.outputsEmpty,
    outputsLabel: g.outputsLabel,
    outputsLoading: g.outputsLoading,
    retryLoad: g.retryLoad,
  };

  return (
    <div>
      <AdminPageHeader title={g.title} description={g.description} />

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
          placeholder={g.searchPlaceholder}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/20 focus:bg-white/[0.07] w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 outline-none transition focus:border-white/20 cursor-pointer"
        >
          <option value="all">{g.statusAll}</option>
          {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 outline-none transition focus:border-white/20 cursor-pointer"
        >
          <option value="all">{g.providerAll}</option>
          {PROVIDER_OPTIONS.filter((p) => p !== "all").map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={rangeFilter}
          onChange={(e) =>
            setRangeFilter(e.target.value as typeof rangeFilter)
          }
          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 outline-none transition focus:border-white/20 cursor-pointer"
        >
          {RANGE_OPTIONS.map((r) => {
            const label =
              r === "all"
                ? g.rangeAll
                : r === "today"
                  ? g.rangeToday
                  : r === "week"
                    ? g.rangeWeek
                    : g.rangeMonth;
            return (
              <option key={r} value={r}>
                {label}
              </option>
            );
          })}
        </select>

        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
          onClick={() => loadList(page)}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="mt-6">
        {loadingList && (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-white/40" aria-hidden="true" />
          </div>
        )}

        {!loadingList && listError && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-sm text-white/60">{listError}</p>
            <button
              type="button"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
              onClick={() => loadList(page)}
            >
              {g.retryLoad}
            </button>
          </div>
        )}

        {!loadingList && !listError && filtered.length === 0 && (
          <div className="grid place-items-center py-16">
            <p className="text-sm text-white/42">{g.empty}</p>
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
            {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, totalCount)} / {totalCount}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => handlePageChange(page - 1)}
            >
              ←
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => handlePageChange(page + 1)}
            >
              →
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <AdminNotice>{g.notice}</AdminNotice>
      </div>

      {/* Detail modal */}
      {selectedId && (
        <AdminGenerationDetailModal
          generationId={selectedId}
          labels={detailLabels}
          onClose={() => setSelectedId(null)}
          statusLabel={statusLabel}
        />
      )}
    </div>
  );
}
