import { useLanguage } from "../../hooks/useLanguage";

export function FaqSection() {
  const { t } = useLanguage();

  return (
    <section id="faq" className="bg-black px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-white/54">{t.faq.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {t.faq.title}
          </h2>
        </div>
        <div className="mt-10 divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/[0.03]">
          {t.faq.items.map((item) => (
            <article key={item.question} className="p-6">
              <h3 className="text-lg font-semibold text-white">{item.question}</h3>
              <p className="mt-3 leading-7 text-white/60">{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
