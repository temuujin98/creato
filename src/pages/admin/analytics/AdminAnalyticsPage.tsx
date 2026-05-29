import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Images,
  Loader2,
  RefreshCw,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminMetricCard } from "../../../components/admin/AdminMetricCard";
import { AdminNotice } from "../../../components/admin/AdminNotice";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { AdminTable } from "../../../components/admin/AdminTable";
import { useLanguage } from "../../../hooks/useLanguage";
import type {
  AnalyticsRange,
  AnalyticsSummary,
  ModelUsageRow,
  ProviderUsageRow,
  TopProductRow,
} from "../../../lib/adminAnalytics";
import {
  getAdminAnalyticsModelUsage,
  getAdminAnalyticsProviderUsage,
  getAdminAnalyticsTopProducts,
  getAdminAnalyticsSummary,
} from "../../../lib/adminAnalytics";

function fmtMnt(v: number): string {
  if (v === 0) return "0₮";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M₮`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K₮`;
  return `${v}₮`;
}

function pct(v: number): string {
  return `${v}%`;
}

export function AdminAnalyticsPage() {
  const { t } = useLanguage();
  const a = t.admin.analytics;

  const [range, setRange] = useState<AnalyticsRange>("7d");

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [providers, setProviders] = useState<ProviderUsageRow[]>([]);
  const [models, setModels] = useState<ModelUsageRow[]>([]);
  const [products, setProducts] = useState<TopProductRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (r: AnalyticsRange) => {
      setLoading(true);
      setError(null);
      try {
        const [s, prov, mod, prod] = await Promise.all([
          getAdminAnalyticsSummary(r),
          getAdminAnalyticsProviderUsage(r),
          getAdminAnalyticsModelUsage(r),
          getAdminAnalyticsTopProducts(r),
        ]);
        setSummary(s);
        setProviders(prov);
        setModels(mod);
        setProducts(prod);
      } catch {
        setError(a.loadError);
      } finally {
        setLoading(false);
      }
    },
    [a.loadError],
  );

  useEffect(() => {
    load(range);
  }, [load, range]);

  const rangeOptions: { value: AnalyticsRange; label: string }[] = [
    { value: "today", label: a.rangeToday },
    { value: "7d", label: a.range7d },
    { value: "30d", label: a.range30d },
    { value: "all", label: a.rangeAll },
  ];

  const primaryCards = summary
    ? [
        {
          label: a.totalGenerations,
          value: summary.totalGenerations,
          icon: <Images className="h-5 w-5" />,
        },
        {
          label: a.successRate,
          value: pct(summary.successRate),
          icon: <CheckCircle2 className="h-5 w-5" />,
        },
        {
          label: a.failedGenerations,
          value: summary.failedGenerations,
          icon: <XCircle className="h-5 w-5" />,
        },
        {
          label: a.netCredits,
          value: summary.netCredits,
          icon: <CreditCard className="h-5 w-5" />,
        },
        {
          label: a.estimatedProviderCost,
          value: fmtMnt(summary.estimatedProviderCostMnt),
          icon: <AlertCircle className="h-5 w-5" />,
        },
        {
          label: a.estimatedGrossProfit,
          value: fmtMnt(summary.estimatedGrossProfitMnt),
          icon: <TrendingUp className="h-5 w-5" />,
        },
      ]
    : [];

  const secondaryCards = summary
    ? [
        {
          label: a.creditsUsed,
          value: summary.creditsUsed,
          icon: <CreditCard className="h-5 w-5" />,
        },
        {
          label: a.creditsRefunded,
          value: summary.creditsRefunded,
          icon: <CreditCard className="h-5 w-5" />,
        },
        {
          label: a.retryCount,
          value: `${summary.retryCount} (${pct(summary.retryRate)})`,
          icon: <RefreshCw className="h-5 w-5" />,
        },
        {
          label: a.estimatedRevenue,
          value: fmtMnt(summary.revenueEstimateMnt),
          icon: <TrendingUp className="h-5 w-5" />,
        },
        {
          label: a.processingGenerations,
          value: summary.processingGenerations,
          icon: <Loader2 className="h-5 w-5" />,
        },
        {
          label: a.refundedGenerations,
          value: summary.refundedGenerations,
          icon: <Zap className="h-5 w-5" />,
        },
      ]
    : [];

  const providerHeaders = [
    a.provider,
    a.generations,
    a.completed,
    a.failed,
    a.creditsUsed,
    a.estimatedCost,
    a.successRateCol,
  ];

  const providerRows = providers.map((p) => [
    <span className="font-mono text-sm text-white/80">{p.provider}</span>,
    <span className="font-mono text-sm text-white/70">{p.generations}</span>,
    <span className="font-mono text-sm text-emerald-400/80">{p.completed}</span>,
    <span className="font-mono text-sm text-red-400/80">{p.failed}</span>,
    <span className="font-mono text-sm text-white/60">{p.credits}</span>,
    <span className="font-mono text-sm text-white/60">
      {p.estimatedCostMnt > 0 ? fmtMnt(p.estimatedCostMnt) : "—"}
    </span>,
    <span className="font-mono text-sm text-white/70">{pct(p.successRate)}</span>,
  ]);

  const modelHeaders = [
    a.model,
    a.provider,
    a.generations,
    a.completed,
    a.failed,
    a.creditsUsed,
    a.estimatedCost,
    a.successRateCol,
  ];

  const modelRows = models.map((m) => [
    <span className="max-w-[16rem] truncate font-mono text-xs text-white/80">{m.model}</span>,
    <span className="text-xs text-white/55">{m.provider}</span>,
    <span className="font-mono text-sm text-white/70">{m.generations}</span>,
    <span className="font-mono text-sm text-emerald-400/80">{m.completed}</span>,
    <span className="font-mono text-sm text-red-400/80">{m.failed}</span>,
    <span className="font-mono text-sm text-white/60">{m.credits}</span>,
    <span className="font-mono text-sm text-white/60">
      {m.estimatedCostMnt > 0 ? fmtMnt(m.estimatedCostMnt) : "—"}
    </span>,
    <span className="font-mono text-sm text-white/70">{pct(m.successRate)}</span>,
  ]);

  const productHeaders = [
    a.product,
    a.generations,
    a.completed,
    a.failed,
    a.creditsUsed,
    a.successRateCol,
  ];

  const productRows = products.map((p) => [
    <span className="text-sm text-white/80">{p.productSlug ?? p.productId.slice(0, 8)}</span>,
    <span className="font-mono text-sm text-white/70">{p.generations}</span>,
    <span className="font-mono text-sm text-emerald-400/80">{p.completed}</span>,
    <span className="font-mono text-sm text-red-400/80">{p.failed}</span>,
    <span className="font-mono text-sm text-white/60">{p.creditsUsed}</span>,
    <span className="font-mono text-sm text-white/70">{pct(p.successRate)}</span>,
  ]);

  const hasData = summary && summary.totalGenerations > 0;

  return (
    <div>
      <AdminPageHeader title={a.title} description={a.description} />

      {/* Filter bar */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as AnalyticsRange)}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white/80 outline-none transition focus:border-white/20 cursor-pointer"
        >
          {rangeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          onClick={() => load(range)}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-12 grid place-items-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-white/40" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-12 flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-white/60">{error}</p>
          <button
            type="button"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
            onClick={() => load(range)}
          >
            {a.retryLoad}
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && summary && !hasData && (
        <div className="mt-12 grid place-items-center py-16">
          <BarChart3 className="mb-4 h-10 w-10 text-white/20" />
          <p className="text-sm text-white/42">{a.empty}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && hasData && (
        <>
          {/* Primary cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {primaryCards.map((card) => (
              <AdminMetricCard key={card.label} {...card} />
            ))}
          </div>

          {/* Secondary cards */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {secondaryCards.map((card) => (
              <AdminMetricCard key={card.label} {...card} />
            ))}
          </div>

          {/* Cost/revenue notes */}
          <div className="mt-6 flex flex-col gap-2">
            {summary.costIsPartial && (
              <AdminNotice>{a.costIncompleteNote}</AdminNotice>
            )}
            <AdminNotice>{a.revenueAnchorNote}</AdminNotice>
          </div>

          {/* Provider usage */}
          {providers.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-base font-semibold text-white/80">{a.providerUsage}</h2>
              <AdminTable headers={providerHeaders} rows={providerRows} />
            </section>
          )}

          {/* Model usage */}
          {models.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-base font-semibold text-white/80">{a.modelUsage}</h2>
              <AdminTable headers={modelHeaders} rows={modelRows} />
            </section>
          )}

          {/* Top products */}
          {products.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-base font-semibold text-white/80">{a.topProducts}</h2>
              <AdminTable headers={productHeaders} rows={productRows} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
