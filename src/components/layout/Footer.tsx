import { Link } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";

export function Footer() {
  const { t } = useLanguage();
  const navLinks = [
    { label: t.nav.product, to: "/products" },
    { label: t.nav.pricing, to: "/pricing" },
    { label: t.nav.showcase, to: "/#showcase" },
    { label: t.nav.faq, to: "/#faq" },
  ];
  const legalItems = [t.footer.terms, t.footer.privacy, t.footer.contact];

  return (
    <footer className="border-t border-white/10 bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 text-sm text-white/54 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div className="max-w-xl">
          <p className="text-2xl font-semibold tracking-normal text-white">creato</p>
          <p className="mt-4 leading-7">{t.footer.description}</p>
        </div>

        <div>
          <p className="font-semibold text-white">{t.footer.navigate}</p>
          <div className="mt-4 grid gap-3">
            {navLinks.map((item) => (
              <Link key={item.to} to={item.to} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold text-white">{t.footer.company}</p>
          <div className="mt-4 grid gap-3">
            {legalItems.map((item) => (
              <button
                key={item}
                type="button"
                className="w-fit cursor-default text-left text-white/44"
                aria-disabled="true"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/38">
        {t.footer.copyright}
      </div>
    </footer>
  );
}
