import { useMemo, useState } from "react";
import { CategoryFilter } from "../components/products/CategoryFilter";
import { ProductGrid } from "../components/products/ProductGrid";
import { ProductSearch } from "../components/products/ProductSearch";
import { categories } from "../data/categories";
import { products } from "../data/products";
import { useLanguage } from "../hooks/useLanguage";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";

export function ProductsPage() {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.categorySlug === activeCategory;
      const searchable = [
        product.name[language],
        product.shortDescription[language],
        product.description[language],
        ...product.tags,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchable.includes(normalizedQuery);
    });
  }, [activeCategory, language, query]);

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_26rem] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase text-white/50">
                {t.productsPage.eyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                {t.productsPage.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-white/62">
                {t.productsPage.description}
              </p>
            </div>
            <ProductSearch
              placeholder={t.productsPage.searchPlaceholder}
              value={query}
              onChange={setQuery}
            />
          </div>

          <div className="mt-10">
            <CategoryFilter
              activeCategory={activeCategory}
              allLabel={t.productsPage.all}
              categories={sortedCategories}
              language={language}
              onChange={setActiveCategory}
            />
          </div>

          <div className="mt-8">
            <ProductGrid
              categories={sortedCategories}
              emptyDescription={t.productsPage.emptyDescription}
              emptyTitle={t.productsPage.emptyTitle}
              language={language}
              labels={{
                credit: t.productsPage.credit,
                credits: t.productsPage.credits,
                details: t.productsPage.details,
                featured: t.productsPage.featured,
                imageNotRequired: t.productsPage.imageNotRequired,
                imageRequired: t.productsPage.imageRequired,
                new: t.productsPage.new,
                popular: t.productsPage.popular,
              }}
              products={filteredProducts}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
