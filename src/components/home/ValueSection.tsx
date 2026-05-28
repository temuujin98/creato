import { Image, Layers, WandSparkles } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

const valueIcons = [WandSparkles, Layers, Image];

export function ValueSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-white/54">{t.value.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {t.value.title}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {t.value.items.map((value, index) => {
            const Icon = valueIcons[index] ?? WandSparkles;

            return (
            <article key={value.title} className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
              <Icon className="mb-6 h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-white">{value.title}</h3>
              <p className="mt-4 leading-7 text-white/62">{value.description}</p>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
