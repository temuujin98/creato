import {
  CreditCard,
  Image,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { useTheme } from "../../hooks/useTheme";
import { BrandLogo } from "./BrandLogo";
import { LanguageMenu } from "./LanguageMenu";
import { UserMenu } from "./UserMenu";
import { WalletPill } from "./WalletPill";

export function Navbar() {
  const { profile, signOut, user } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  // TODO: Re-enable theme toggle when light mode polish is complete.
  const showThemeToggle = false;
  const iconButtonClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-neutral-950 text-white/80 transition hover:bg-white/10 hover:text-white";
  const accountLabel = profile?.full_name || user?.email || "";
  const navItems = useMemo(
    () => [
      {
        hidden: false,
        key: "image-presets",
        label: t.nav.image,
        to: "/products",
      },
      {
        hidden: true,
        key: "video-presets",
        label: t.nav.videoPresets,
        to: "/video",
      },
    ],
    [t.nav.image, t.nav.videoPresets],
  );
  const accountItems = [
    {
      icon: <LayoutDashboard className="h-4 w-4" aria-hidden="true" />,
      label: t.nav.dashboard,
      to: "/dashboard",
    },
    {
      icon: <Image className="h-4 w-4" aria-hidden="true" />,
      label: t.nav.myCreations,
      to: "/my-images",
    },
    {
      icon: <Wallet className="h-4 w-4" aria-hidden="true" />,
      label: t.nav.wallet,
      to: "/dashboard",
    },
    {
      icon: <CreditCard className="h-4 w-4" aria-hidden="true" />,
      label: t.nav.buyCredits,
      to: "/pricing",
    },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-black text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0"
          aria-label="creato home"
        >
          <BrandLogo showIcon={false} />
        </Link>

        <div className="hidden items-center justify-center gap-7 text-sm text-neutral-600 dark:text-white/68 lg:flex">
          {navItems
            .filter((item) => !item.hidden)
            .map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className="rounded-full px-3 py-2 transition hover:bg-black/5 hover:text-neutral-950 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ))}
        </div>

        <div className="flex items-center gap-2">
          {showThemeToggle ? (
            <button
              type="button"
              className={iconButtonClass}
              aria-label={theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
              title={theme === "dark" ? t.nav.lightMode : t.nav.darkMode}
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          ) : null}

          <LanguageMenu />
          <WalletPill />

          {user ? (
            <UserMenu />
          ) : (
            <Link
              to="/login"
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-neutral-600 transition hover:text-neutral-950 dark:text-white/58 dark:hover:text-white sm:inline-flex"
              title={t.nav.signIn}
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              {t.nav.signIn}
            </Link>
          )}

          <button
            type="button"
            className={`${iconButtonClass} lg:hidden`}
            aria-label={isOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {isOpen ? (
        <div className="border-t border-black/10 bg-white px-4 py-4 shadow-2xl shadow-black/10 dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/60 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {navItems
              .filter((item) => !item.hidden)
              .map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className="rounded-2xl border border-black/10 bg-black/[0.025] px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/72"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

            {user ? (
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-2 dark:border-white/10 dark:bg-white/[0.025]">
                <div className="px-2 py-2 text-xs text-neutral-500 dark:text-white/42">
                  {accountLabel}
                </div>
                {accountItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-neutral-700 dark:text-white/62"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/settings"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm text-neutral-700 dark:text-white/62"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  {t.nav.settings}
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm text-neutral-700 dark:text-white/62"
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-left text-sm text-neutral-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/58"
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
