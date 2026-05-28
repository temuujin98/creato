import { CreditCard, Images, ShieldAlert, Users, XCircle } from "lucide-react";
import { AdminMetricCard } from "../../../components/admin/AdminMetricCard";
import { AdminNotice } from "../../../components/admin/AdminNotice";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { useLanguage } from "../../../hooks/useLanguage";

export function AdminDashboardPage() {
  const { t } = useLanguage();
  const metrics = [
    { label: t.admin.dashboard.totalUsers, value: 0, icon: <Users className="h-5 w-5" /> },
    { label: t.admin.dashboard.creditsSold, value: 0, icon: <CreditCard className="h-5 w-5" /> },
    { label: t.admin.dashboard.creditsUsed, value: 0, icon: <CreditCard className="h-5 w-5" /> },
    { label: t.admin.dashboard.totalGenerations, value: 0, icon: <Images className="h-5 w-5" /> },
    { label: t.admin.dashboard.failedGenerations, value: 0, icon: <XCircle className="h-5 w-5" /> },
    { label: t.admin.dashboard.estimatedRevenue, value: "0₮", icon: <CreditCard className="h-5 w-5" /> },
  ];

  return (
    <div>
      <AdminPageHeader title={t.admin.dashboard.title} description={t.admin.dashboard.description} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <AdminMetricCard key={metric.label} {...metric} />
        ))}
      </div>
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {[t.admin.dashboard.topProducts, t.admin.dashboard.recentJobs].map((title) => (
          <section key={title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-8 rounded-2xl border border-dashed border-white/12 p-8 text-center text-white/42">
              {t.admin.dashboard.placeholder}
            </p>
          </section>
        ))}
      </div>
      <div className="mt-6 grid gap-3">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm leading-6 text-amber-200/80">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
          <span>{t.admin.dashboard.realAiNotice}</span>
        </div>
        <AdminNotice>{t.admin.dashboard.notice}</AdminNotice>
      </div>
    </div>
  );
}
