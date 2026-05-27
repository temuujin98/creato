import { useLanguage } from "../../hooks/useLanguage";

export function WhyCreato() {
  const { t } = useLanguage();

  return (
    <section className="bg-black/72 px-4 py-20 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-white/54">{t.why.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {t.why.title}
          </h2>
        </div>
        <div className="grid gap-3">
          {t.why.items.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-black/58 p-5 text-white/70">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
