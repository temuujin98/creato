import { CreditCard } from "lucide-react";
import { AdminNotice } from "../../components/admin/AdminNotice";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminTable } from "../../components/admin/AdminTable";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { creditUnitPrice, pricingPackages } from "../../data/pricing";
import { useLanguage } from "../../hooks/useLanguage";
import { formatCurrency } from "../../lib/format";

export function AdminCreditPackagesPage() {
  const { t } = useLanguage();
  const rows = pricingPackages.map((item) => [
    <span className="font-semibold text-white">{item.name}</span>,
    item.credits,
    formatCurrency(item.price),
    formatCurrency(Math.round(item.price / item.credits)),
    <StatusBadge label={t.admin.common.active} />,
  ]);

  return (
    <div>
      <AdminPageHeader
        title={t.admin.credits.title}
        description={t.admin.credits.description}
        action={
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-full bg-white/18 px-5 py-3 text-sm font-semibold text-white/42"
          >
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            {t.admin.common.addPackage}
          </button>
        }
      />
      <div className="mt-8">
        <AdminTable
          headers={[
            t.admin.common.name,
            t.admin.common.credits,
            t.admin.common.price,
            t.admin.credits.average,
            t.admin.common.status,
          ]}
          rows={rows}
        />
      </div>
      <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.025] p-4 text-sm text-white/54">
        1 credit = {formatCurrency(creditUnitPrice)}
      </div>
      <div className="mt-6">
        <AdminNotice>{t.admin.credits.notice}</AdminNotice>
      </div>
    </div>
  );
}
