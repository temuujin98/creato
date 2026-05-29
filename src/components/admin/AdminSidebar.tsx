import {
  ArrowLeft,
  BarChart3,
  CreditCard,
  Cpu,
  FolderTree,
  Images,
  LayoutDashboard,
  Package,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";

const linkClass =
  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition";

export function AdminSidebar() {
  const { t } = useLanguage();
  const items = [
    { label: t.admin.sidebar.dashboard, to: "/admin", icon: LayoutDashboard, end: true },
    { label: t.admin.sidebar.categories, to: "/admin/categories", icon: FolderTree },
    { label: t.admin.sidebar.products, to: "/admin/products", icon: Package },
    { label: t.admin.sidebar.creditPackages, to: "/admin/credit-packages", icon: CreditCard },
    { label: t.admin.sidebar.generations, to: "/admin/generations", icon: Images },
    { label: t.admin.sidebar.modelSettings, to: "/admin/model-settings", icon: Cpu },
    { label: t.admin.sidebar.analytics, to: "/admin/analytics", icon: BarChart3 },
  ];

  return (
    <aside className="border-b border-white/10 bg-black/72 p-4 lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between lg:block">
        <p className="text-xl font-semibold text-white">creato</p>
        <span className="text-xs uppercase text-white/38 lg:mt-1 lg:block">admin</span>
      </div>

      <nav className="mt-5 flex gap-2 overflow-x-auto lg:grid lg:gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${linkClass} ${
                  isActive
                    ? "bg-white text-black"
                    : "shrink-0 text-white/62 hover:bg-white/[0.05] hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <NavLink
        to="/"
        className="mt-4 hidden items-center gap-3 rounded-2xl border border-white/10 px-3 py-2.5 text-sm text-white/54 transition hover:text-white lg:flex"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t.admin.sidebar.backToSite}
      </NavLink>
    </aside>
  );
}
