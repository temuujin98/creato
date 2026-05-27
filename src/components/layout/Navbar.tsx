import { Images, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { languages } from "../../i18n/translations";

export function Navbar() {
  const { profile, signOut, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const accountLabel = profile?.full_name || user?.email || "";
  const navItems = [
    { label: t.nav.product, to: "/products" },
    { label: t.nav.howItWorks, to: "/#how-it-works" },
    { label: t.nav.pricing, to: "/pricing" },
    { label: t.nav.showcase, to: "/#showcase" },
    { label: t.nav.faq, to: "/#faq" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/62 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0 text-xl font-semibold tracking-normal text-white"
        >
          creato
        </Link>

        <div className="hidden items-center justify-center gap-7 text-sm text-white/68 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden h-10 items-center rounded-full border border-white/15 bg-white/[0.05] p-1 sm:flex">
            {languages.map((item) => (
              <button
                key={item}
                type="button"
                className={`h-8 rounded-full px-3 text-xs font-semibold transition ${
                  item === language
                    ? "bg-white text-black"
                    : "text-white/58 hover:text-white"
                }`}
                onClick={() => setLanguage(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-white/58 transition hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                {t.nav.dashboard}
              </Link>
              <Link
                to="/my-images"
                className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-white/58 transition hover:text-white xl:inline-flex"
              >
                <Images className="h-4 w-4" aria-hidden="true" />
                {t.nav.myImages}
              </Link>
              {accountLabel ? (
                <span className="hidden max-w-36 truncate text-xs text-white/38 xl:inline">
                  {accountLabel}
                </span>
              ) : null}
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-white/58 transition hover:text-white"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {t.nav.logout}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-white/58 transition hover:text-white sm:inline-flex"
              title={t.nav.signIn}
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {t.nav.signIn}
            </Link>
          )}

          <button
            type="button"
            className="h-10 rounded-full border border-white/15 bg-white/[0.05] px-3 text-sm font-semibold text-white lg:hidden"
            onClick={() => setIsOpen((current) => !current)}
          >
            {t.nav.menu}
          </button>
        </div>
      </nav>

      {isOpen ? (
        <div className="border-t border-white/10 bg-black/94 px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/72"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.035] p-1">
              {languages.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    item === language
                      ? "bg-white text-black"
                      : "text-white/58 hover:text-white"
                  }`}
                  onClick={() => setLanguage(item)}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm text-white/58"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  {t.nav.dashboard}
                </Link>
                <Link
                  to="/my-images"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm text-white/58"
                  onClick={() => setIsOpen(false)}
                >
                  <Images className="h-4 w-4" aria-hidden="true" />
                  {t.nav.myImages}
                </Link>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm text-white/58"
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm text-white/58"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                {t.nav.signIn}
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
