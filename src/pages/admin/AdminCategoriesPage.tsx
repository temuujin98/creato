import { categories } from "../../data/categories";
import { products } from "../../data/products";
import { AdminNotice } from "../../components/admin/AdminNotice";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminTable } from "../../components/admin/AdminTable";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { useLanguage } from "../../hooks/useLanguage";

export function AdminCategoriesPage() {
  const { language, t } = useLanguage();
  const rows = categories.map((category) => [
    <span className="font-semibold text-white">{category.name[language]}</span>,
    category.slug,
    category.sortOrder,
    <StatusBadge label={t.admin.common.active} />,
    products.filter((product) => product.categorySlug === category.slug).length,
    <span className="text-white/38">{t.admin.common.actions}</span>,
  ]);

  return (
    <div>
      <AdminPageHeader
        title={t.admin.categories.title}
        description={t.admin.categories.description}
        action={
          <button disabled className="rounded-full bg-white/18 px-5 py-3 text-sm font-semibold text-white/42">
            {t.admin.common.addCategory}
          </button>
        }
      />
      <div className="mt-8">
        <AdminTable
          headers={[
            t.admin.common.name,
            t.admin.editor.slug,
            t.admin.common.sortOrder,
            t.admin.common.status,
            t.admin.categories.productCount,
            t.admin.common.actions,
          ]}
          rows={rows}
        />
      </div>
      <div className="mt-6">
        <AdminNotice>{t.admin.categories.notice}</AdminNotice>
      </div>
    </div>
  );
}
