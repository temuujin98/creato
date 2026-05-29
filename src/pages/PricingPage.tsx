import { useEffect, useState } from "react";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import type { ClientCreditPackage } from "../lib/creditPackages";
import { listActiveCreditPackages } from "../lib/creditPackages";
import { useLanguage } from "../hooks/useLanguage";
import { formatCurrency } from "../lib/format";

// Fallback packages shown while loading or when Supabase is unavailable.
// Values match the seeded packages from migration 0014.
const FALLBACK_PACKAGES: ClientCreditPackage[] = [
  { id: "starter",  code: "starter",  name: "Starter",  description: null, credits: 10,  priceMnt: 9900,   badgeText: null,                  isFeatured: false, sortOrder: 10 },
  { id: "creator",  code: "creator",  name: "Creator",  description: null, credits: 25,  priceMnt: 22900,  badgeText: "Хамгийн тохиромжтой", isFeatured: true,  sortOrder: 20 },
  { id: "business", code: "business", name: "Business", description: null, credits: 60,  priceMnt: 49900,  badgeText: "Бизнес хэрэглээнд",   isFeatured: false, sortOrder: 30 },
  { id: "pro",      code: "pro",      name: "Pro",       description: null, credits: 150, priceMnt: 119000, badgeText: "Их хэрэглээнд",       isFeatured: false, sortOrder: 40 },
];

export function PricingPage() {
  const { t } = useLanguage();
  const [packages, setPackages] = useState<ClientCreditPackage[]>(FALLBACK_PACKAGES);

  useEffect(() => {
    listActiveCreditPackages()
      .then((data) => {
        if (data.length > 0) setPackages(data);
      })
      .catch(() => {
        // Keep fallback packages on fetch error
      });
  }, []);

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
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((item) => (
              <article
                key={item.code}
                className={`rounded-[1.75rem] border p-6 ${
                  item.isFeatured
                    ? "border-white/26 bg-white/[0.09] shadow-glow"
                    : "border-white/10 bg-white/[0.035]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-lg font-semibold text-white">{item.name}</p>
                  {item.badgeText && (
                    <span className="shrink-0 rounded-full border border-amber-400/25 bg-amber-400/[0.12] px-2 py-0.5 text-[10px] font-semibold text-amber-200/90">
                      {item.badgeText}
                    </span>
                  )}
                </div>
                <p className="mt-8 text-5xl font-semibold text-white">
                  {item.credits}
                </p>
                <p className="mt-2 text-sm text-white/52">
                  {t.pricing.credits}
                </p>
                <p className="mt-8 text-2xl font-semibold text-white">
                  {formatCurrency(item.priceMnt)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
