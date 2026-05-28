import { AdminNotice } from "../../../components/admin/AdminNotice";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { AdminTable } from "../../../components/admin/AdminTable";
import { StatusBadge } from "../../../components/admin/StatusBadge";
import { products } from "../../../data/products";
import { useLanguage } from "../../../hooks/useLanguage";

export function AdminGenerationsPage() {
  const { language, t } = useLanguage();
  const jobs = [
    {
      id: "gen_1001",
      user: "demo@creato.mn",
      product: products[0],
      status: t.admin.common.completed,
      provider: "Mock provider",
      credits: 1,
      createdAt: "2026-05-26 10:20",
    },
    {
      id: "gen_1002",
      user: "brand@creato.mn",
      product: products[1],
      status: t.admin.common.processing,
      provider: "Mock provider",
      credits: 2,
      createdAt: "2026-05-26 10:34",
    },
    {
      id: "gen_1003",
      user: "studio@creato.mn",
      product: products[4],
      status: t.admin.common.failed,
      provider: "Mock provider",
      credits: 1,
      createdAt: "2026-05-26 10:48",
    },
    {
      id: "gen_1004",
      user: "shop@creato.mn",
      product: products[7],
      status: t.admin.common.completed,
      provider: "Mock provider",
      credits: 2,
      createdAt: "2026-05-26 11:05",
    },
  ];

  const rows = jobs.map((job) => [
    <span className="font-mono text-white">{job.id}</span>,
    job.user,
    job.product.name[language],
    <StatusBadge label={job.status} />,
    job.provider,
    job.credits,
    job.createdAt,
    <span className="text-white/38">{t.admin.common.actions}</span>,
  ]);

  return (
    <div>
      <AdminPageHeader
        title={t.admin.generations.title}
        description={t.admin.generations.description}
      />
      <div className="mt-8">
        <AdminTable
          headers={[
            t.admin.generations.jobId,
            t.admin.generations.user,
            t.admin.generations.product,
            t.admin.common.status,
            t.admin.common.provider,
            t.admin.common.credits,
            t.admin.common.createdAt,
            t.admin.common.actions,
          ]}
          rows={rows}
        />
      </div>
      <div className="mt-6">
        <AdminNotice>{t.admin.generations.notice}</AdminNotice>
      </div>
    </div>
  );
}
