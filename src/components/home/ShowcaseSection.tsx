import { showcaseItems } from "../../data/showcase";
import { useLanguage } from "../../hooks/useLanguage";

export function ShowcaseSection() {
  const { language, t } = useLanguage();

  return (
    <section id="showcase" className="bg-black/82 px-4 py-20 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-white/54">{t.showcase.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {t.showcase.title}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {showcaseItems.slice(0, 4).map((item, index) => (
            <article
              key={item.id}
              className="group aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-3"
            >
              <div className="relative h-full overflow-hidden rounded-2xl bg-black">
                <img
                  src={item.image}
                  alt={item.alt[language]}
                  className="h-full w-full object-cover opacity-[0.86] transition group-hover:scale-[1.025]"
                />
              </div>
              <div className="mt-4 flex items-center justify-between px-1">
                <span className="text-xs text-white/42">0{index + 1}</span>
                <h3 className="text-lg font-semibold text-white">
                  {item.title[language]}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
