import { categories } from "../../data/categories";
import { products } from "../../data/products";
import { useLanguage } from "../../hooks/useLanguage";

export function FeaturedCategories() {
  const { language, t } = useLanguage();

  return (
    <section className="border-y border-white/10 bg-black px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-white/54">{t.categories.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              {t.categories.title}
            </h2>
          </div>
          <p className="max-w-xl text-white/60">
            {t.categories.description}
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <article key={category.id} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
              <p className="text-xs uppercase text-white/40">
                {products.filter((product) => product.categorySlug === category.slug).length} {t.categories.productCount}
              </p>
              <h3 className="mt-5 text-xl font-semibold text-white">
                {category.name[language]}
              </h3>
              <p className="mt-4 leading-7 text-white/58">
                {category.description[language]}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
