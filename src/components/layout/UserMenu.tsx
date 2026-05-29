import {
  Image,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ProfileModal } from "../profile/ProfileModal";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { createAvatarDisplayUrl } from "../../lib/profile";

function getInitials(nameOrEmail: string) {
  const source = nameOrEmail.trim();
  if (!source) return "C";
  const [first, second] = source.includes("@")
    ? [source.charAt(0) || "C"]
    : source.split(/\s+/);
  return `${first?.charAt(0) || "C"}${second?.charAt(0) || ""}`.toUpperCase();
}

export function UserMenu() {
  const { profile, signOut, user } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const accountLabel = profile?.full_name || user?.email || "";
  const avatarUrl =
    profile?.avatar_url ||
    (user?.user_metadata?.avatar_url as string | undefined);
  const initials = getInitials(accountLabel);

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
  ];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    let mounted = true;
    createAvatarDisplayUrl(avatarUrl ?? null)
      .then((url) => { if (mounted) setAvatarSrc(url); })
      .catch(() => { if (mounted) setAvatarSrc(null); });
    return () => { mounted = false; };
  }, [avatarUrl]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!user) return null;

  // Consistent dark-only item style (no dark: prefix needed — always dark)
  const itemClass =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/90 transition hover:bg-white/[0.07] hover:text-white [&_svg]:text-white/50 [&_svg]:transition hover:[&_svg]:text-white/80";

  return (
    <div className="relative z-[120] hidden sm:block" ref={menuRef}>
      {/* Avatar button */}
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-neutral-950 text-sm font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        aria-label={t.nav.accountMenu}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          initials
        )}
      </button>

      {/* Dropdown */}
      {isOpen ? (
        <div className="absolute right-0 top-full z-[999] mt-2.5 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-neutral-950 p-1.5 shadow-2xl shadow-black/70">
          {/* Identity header */}
          <div className="flex items-center gap-3 border-b border-white/[0.08] px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-black text-sm font-semibold text-white/80">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/90">{accountLabel}</p>
              <p className="mt-0.5 truncate text-xs text-white/50">{user.email}</p>
            </div>
          </div>

          <div className="py-1">
            {/* Nav items */}
            {accountItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={itemClass}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-1 mx-2 border-t border-white/[0.08]" />

            {/* Personal information */}
            <button
              type="button"
              className={`w-full ${itemClass}`}
              onClick={() => { setIsOpen(false); setIsProfileModalOpen(true); }}
            >
              <User className="h-4 w-4" aria-hidden="true" />
              {t.nav.personalInfo}
            </button>

            {/* Settings — disabled / soon */}
            <div className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/50 [&_svg]:text-white/50">
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span>{t.nav.settings}</span>
              <span className="ml-auto rounded-full border border-white/10 bg-white/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/50">
                {t.nav.comingSoon}
              </span>
            </div>

            {/* Divider */}
            <div className="my-1 mx-2 border-t border-white/[0.08]" />

            {/* Logout */}
            <button
              type="button"
              className={`w-full ${itemClass} text-red-400/80 hover:text-red-300 [&_svg]:text-red-400/60`}
              onClick={() => { setIsOpen(false); signOut(); }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t.nav.logout}
            </button>
          </div>
        </div>
      ) : null}

      {/* Profile modal (portal to body) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
