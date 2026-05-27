import { products } from "../../data/products";
import { useLanguage } from "../../hooks/useLanguage";

export function FeaturedProducts() {
  const { language, t } = useLanguage();

  return (
    <section id="products" className="bg-black px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase text-electric">{t.products.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {t.products.title}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <article key={product.id} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
              <div className="flex flex-wrap gap-2 text-xs text-white/50">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  {t.products.category}: {product.categorySlug}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  {product.requiresImage ? t.products.imagesLater : t.products.noImageRequired}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  {product.optionPreview?.length ? t.products.optionsLater : t.products.simpleFlow}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-white">
                {product.name[language]}
              </h3>
              <p className="mt-4 leading-7 text-white/62">
                {product.description[language]}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
