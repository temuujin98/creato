import {
  CreditCard,
  Image,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { languages } from "../../i18n/translations";

function getInitials(nameOrEmail: string) {
  const source = nameOrEmail.trim();
  if (!source) return "C";

  const [first, second] = source.includes("@")
    ? [source.charAt(0) || "C"]
    : source.split(/\s+/);

  return `${first?.charAt(0) || "C"}${second?.charAt(0) || ""}`.toUpperCase();
}

export function Navbar() {
  const { profile, signOut, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const accountLabel = profile?.full_name || user?.email || "";
  const avatarUrl =
    (profile as { avatar_url?: string } | null)?.avatar_url ||
    (user?.user_metadata?.avatar_url as string | undefined);
  const initials = getInitials(accountLabel);
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

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAccountOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-white/10 bg-black/85 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0 text-xl font-semibold tracking-normal text-white"
        >
          creato
        </Link>

        <div className="hidden items-center justify-center gap-7 text-sm text-white/68 lg:flex">
          {navItems
            .filter((item) => !item.hidden)
            .map((item) => (
              <Link
                key={item.key}
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
            <div className="relative z-[120] hidden sm:block" ref={accountRef}>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-neutral-950 text-sm font-semibold text-white/90 shadow-lg shadow-black/30 transition hover:border-white/25 hover:bg-neutral-900"
                aria-label={t.nav.accountMenu}
                aria-expanded={isAccountOpen}
                onClick={() => setIsAccountOpen((current) => !current)}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initials
                )}
              </button>

              {isAccountOpen ? (
                <div className="absolute right-0 top-full z-[999] mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-black p-2 shadow-2xl shadow-black/70">
                  <div className="flex items-center gap-3 border-b border-white/10 px-3 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black text-sm font-semibold text-white/90">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white/90">
                        {accountLabel}
                      </p>
                      <p className="mt-1 text-xs text-white/50">
                        {t.nav.accountMenu}
                      </p>
                    </div>
                  </div>
                  <div className="py-2">
                    {accountItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white [&_svg]:text-white/60 [&_svg]:transition hover:[&_svg]:text-white"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/30 [&_svg]:text-white/30"
                      disabled
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      {t.nav.settings}
                      <span className="ml-auto rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/42">
                        {t.nav.comingSoon}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white [&_svg]:text-white/60 [&_svg]:transition hover:[&_svg]:text-white"
                      onClick={() => {
                        setIsAccountOpen(false);
                        signOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      {t.nav.logout}
                    </button>
                  </div>
                </div>
              ) : null}
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
            {navItems
              .filter((item) => !item.hidden)
              .map((item) => (
                <Link
                  key={item.key}
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
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-2">
                <div className="px-2 py-2 text-xs text-white/42">
                  {accountLabel}
                </div>
                {accountItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-white/62"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm text-white/38"
                  disabled
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  {t.nav.settings}
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm text-white/62"
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
