import { Link } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { pricingPackages } from "../data/pricing";
import { useLanguage } from "../hooks/useLanguage";
import { formatCurrency } from "../lib/format";

export function PricingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-white/58">
              {t.pricing.eyebrow}
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-normal text-white sm:text-6xl">
              {t.pricing.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/62">
              {t.pricing.description}
            </p>
            <p className="mt-8 inline-flex rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white">
              {t.pricing.unit}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pricingPackages.map((item) => (
              <article
                key={item.id}
                className={`rounded-[1.75rem] border p-6 ${
                  item.highlighted
                    ? "border-white/26 bg-white/[0.09] shadow-glow"
                    : "border-white/10 bg-white/[0.035]"
                }`}
              >
                <p className="text-lg font-semibold text-white">{item.name}</p>
                <p className="mt-8 text-5xl font-semibold text-white">
                  {item.credits}
                </p>
                <p className="mt-2 text-sm text-white/52">
                  {t.pricing.credits}
                </p>
                <p className="mt-8 text-2xl font-semibold text-white">
                  {formatCurrency(item.price)}
                </p>
              </article>
            ))}
          </div>

          <Link
            to="/"
            className="mt-10 inline-flex rounded-full border border-white/14 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/28 hover:bg-white/[0.08]"
          >
            {t.pricing.cta}
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
