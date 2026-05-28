import { Link } from "react-router-dom";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { AdminTable } from "../../../components/admin/AdminTable";
import { StatusBadge } from "../../../components/admin/StatusBadge";
import { categories } from "../../../data/categories";
import { products } from "../../../data/products";
import { useLanguage } from "../../../hooks/useLanguage";

export function AdminPresetsPage() {
  const { language, t } = useLanguage();
  const rows = products.map((product) => {
    const category = categories.find((item) => item.slug === product.categorySlug);
    const flags: string[] = [];
    if (product.isFeatured) flags.push(t.admin.common.featured);
    if (product.isPopular) flags.push(t.admin.common.popular);
    if (product.isNew) flags.push(t.admin.common.newProduct);

    return [
      <span className="font-semibold text-white">{product.name[language]}</span>,
      category?.name[language] ?? product.categorySlug,
      product.creditCost,
      product.requiresImage ? t.admin.common.yes : t.admin.common.no,
      <div className="flex flex-wrap gap-1">{flags.map((flag) => <StatusBadge key={flag} label={flag} />)}</div>,
      <StatusBadge label={t.admin.productsAdmin.statusActive} />,
      <Link className="font-semibold text-white hover:underline" to={`/admin/products/${product.id}`}>{t.admin.common.edit}</Link>,
    ];
  });

  return (
    <div>
      <AdminPageHeader
        title={t.admin.productsAdmin.title}
        description={t.admin.productsAdmin.description}
        action={
          <Link to="/admin/products/new" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
            {t.admin.common.addProduct}
          </Link>
        }
      />
      <div className="mt-8">
        <AdminTable
          headers={[
            t.admin.common.name,
            t.admin.common.category,
            t.admin.common.creditCost,
            t.admin.common.imageRequirement,
            t.admin.common.flags,
            t.admin.common.status,
            t.admin.common.actions,
          ]}
          rows={rows}
        />
      </div>
    </div>
  );
}
