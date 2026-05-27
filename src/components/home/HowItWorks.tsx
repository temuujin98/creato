import { useLanguage } from "../../hooks/useLanguage";

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how-it-works" className="bg-black/72 px-4 py-20 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-white/54">{t.howItWorks.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {t.howItWorks.title}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {t.howItWorks.steps.map((step, index) => (
            <article key={step} className="rounded-3xl border border-white/10 bg-black/58 p-6">
              <span className="text-sm text-white/42">0{index + 1}</span>
              <h3 className="mt-8 text-xl font-semibold text-white">{step}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
