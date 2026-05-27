import { useLanguage } from "../../hooks/useLanguage";

export function FinalCta() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-black px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase text-white/54">{t.finalCta.eyebrow}</p>
        <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
          {t.finalCta.title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/62">
          {t.finalCta.description}
        </p>
        <a
          href="#products"
          className="mt-9 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-bone"
        >
          {t.finalCta.cta}
        </a>
      </div>
    </section>
  );
}
