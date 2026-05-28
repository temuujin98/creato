import { Link } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { BrandLogo } from "./BrandLogo";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M14.2 8.4V6.9c0-.7.5-.9.9-.9h2.3V2.2L14.2 2c-3.6 0-4.4 2.7-4.4 4.4v2H7v4.2h2.8V22h4.4v-9.4h3.1l.5-4.2h-3.6Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect
        width="16"
        height="16"
        x="4"
        y="4"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.8" cy="7.2" r="1" fill="currentColor" />
    </svg>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const navLinks = [
    { label: t.nav.image, to: "/products" },
    { label: t.footer.pricingCredit, to: "/pricing" },
    { label: t.nav.myCreations, to: "/my-images" },
  ];
  const accountLinks = [
    { label: t.nav.dashboard, to: "/dashboard" },
    { label: t.nav.wallet, to: "/dashboard" },
    { label: t.nav.settings, to: "/settings" },
  ];
  const socialLinks = [
    {
      icon: <FacebookIcon className="h-4 w-4" />,
      label: t.footer.facebook,
      to: "#",
    },
    {
      icon: <InstagramIcon className="h-4 w-4" />,
      label: t.footer.instagram,
      to: "#",
    },
  ];

  return (
    <footer className="border-t border-black/10 bg-white px-4 py-12 text-black dark:border-white/10 dark:bg-black dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 text-sm text-black/50 dark:text-white/50 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_0.7fr_0.7fr]">
        <div className="max-w-xl">
          <BrandLogo markClassName="h-8 w-8" />
          <p className="mt-4 leading-7">{t.footer.description}</p>
          <div className="mt-6 flex gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.to}
                aria-label={item.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/[0.025] text-black/65 transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white/65 dark:hover:border-primary/40 dark:hover:bg-primary/15 dark:hover:text-primary-300"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-neutral-950 dark:text-white">
            {t.footer.navigation}
          </p>
          <div className="mt-4 grid gap-3">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="w-fit transition hover:text-primary dark:hover:text-primary-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-neutral-950 dark:text-white">
            {t.footer.account}
          </p>
          <div className="mt-4 grid gap-3">
            {accountLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="w-fit transition hover:text-primary dark:hover:text-primary-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-neutral-950 dark:text-white">
            {t.footer.social}
          </p>
          <div className="mt-4 grid gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.to}
                className="flex w-fit items-center gap-2 transition hover:text-primary dark:hover:text-primary-300"
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-black/10 pt-6 text-sm text-black/40 dark:border-white/10 dark:text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <span>
          &copy; {year} creato. {t.footer.allRightsReserved}
        </span>
        <div className="flex gap-4">
          <button type="button" className="cursor-default" aria-disabled="true">
            {t.footer.terms}
          </button>
          <button type="button" className="cursor-default" aria-disabled="true">
            {t.footer.privacy}
          </button>
          <button type="button" className="cursor-default" aria-disabled="true">
            {t.footer.contact}
          </button>
        </div>
      </div>
    </footer>
  );
}