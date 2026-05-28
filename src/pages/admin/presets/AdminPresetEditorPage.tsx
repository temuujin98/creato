import { ArrowLeft, Save, WandSparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminNotice } from "../../../components/admin/AdminNotice";
import { StatusBadge } from "../../../components/admin/StatusBadge";
import { EdgeFunctionReadinessPanel } from "../../../components/admin/product-editor/EdgeFunctionReadinessPanel";
import { ModelRoutingPanel } from "../../../components/admin/product-editor/ModelRoutingPanel";
import { OptionMappingPanel } from "../../../components/admin/product-editor/OptionMappingPanel";
import { PromptVersionPanel } from "../../../components/admin/product-editor/PromptVersionPanel";
import { categories } from "../../../data/categories";
import { products, type Product } from "../../../data/products";
import { useLanguage } from "../../../hooks/useLanguage";

type ReadonlyFieldProps = {
  label: string;
  value: string | number;
};

function ReadonlyField({ label, value }: ReadonlyFieldProps) {
  return (
    <label className="grid gap-2 text-sm text-white/52">
      <span>{label}</span>
      <input
        disabled
        value={value}
        className="h-11 rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-white/74 outline-none"
        readOnly
      />
    </label>
  );
}

function EditorSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function getEditorProduct(id: string | undefined): Product | undefined {
  if (!id) {
    return undefined;
  }

  return products.find((product) => product.id === id);
}

const editorTabs = [
  "basic",
  "image",
  "options",
  "prompt",
  "model",
  "readiness",
] as const;

type EditorTab = (typeof editorTabs)[number];

export function AdminPresetEditorPage() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<EditorTab>("basic");
  const product = getEditorProduct(id);
  const isNew = !id;
  const category = product
    ? categories.find((item) => item.slug === product.categorySlug)
    : undefined;

  if (!isNew && !product) {
    return (
      <div className="mx-auto max-w-2xl rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-8 text-center">
        <StatusBadge label={t.admin.productsAdmin.notFound} />
        <h1 className="mt-5 text-3xl font-semibold text-white">
          {t.admin.productsAdmin.notFound}
        </h1>
        <Link
          to="/admin/products"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t.admin.common.backToProducts}
        </Link>
      </div>
    );
  }

  const title = isNew
    ? t.admin.common.newProduct
    : product?.name[language] ?? t.admin.common.newProduct;

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/54 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t.admin.common.backToProducts}
          </Link>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            {title}
          </h1>
          <div className="mt-4">
            <StatusBadge label={isNew ? t.admin.common.draft : t.admin.productsAdmin.statusActive} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/42"
          >
            <WandSparkles className="h-4 w-4" aria-hidden="true" />
            {t.admin.common.testGenerate}
          </button>
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-full bg-white/18 px-5 py-3 text-sm font-semibold text-white/42"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {t.admin.common.saveChanges}
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
        {editorTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? "bg-white text-black"
                : "border border-white/10 text-white/54 hover:border-white/20 hover:text-white"
            }`}
          >
            {t.admin.editor.tabs[tab]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5">
        {activeTab === "basic" ? (
          <EditorSection title={t.admin.editor.basicInfo}>
            <ReadonlyField label={t.admin.common.name} value={product?.name[language] ?? ""} />
            <ReadonlyField label={t.admin.editor.slug} value={product?.slug ?? ""} />
            <ReadonlyField label={t.admin.common.category} value={category?.name[language] ?? ""} />
            <ReadonlyField label={t.admin.common.creditCost} value={product?.creditCost ?? 0} />
            <div className="md:col-span-2">
              <ReadonlyField
                label={t.admin.editor.shortDescription}
                value={product?.shortDescription[language] ?? ""}
              />
            </div>
          </EditorSection>
        ) : null}

        {activeTab === "image" ? (
          <EditorSection title={t.admin.editor.imageSettings}>
            <ReadonlyField
              label={t.admin.editor.requiresImage}
              value={product?.requiresImage ? t.admin.common.yes : t.admin.common.no}
            />
            <ReadonlyField label={t.admin.editor.minImages} value={product?.minImages ?? 0} />
            <ReadonlyField label={t.admin.editor.maxImages} value={product?.maxImages ?? 0} />
            <ReadonlyField label={t.admin.editor.allowedTypes} value="PNG, JPG, WEBP" />
          </EditorSection>
        ) : null}

        {activeTab === "options" ? (
          <>
            <EditorSection title={t.admin.editor.userOptions}>
              <ReadonlyField
                label={t.admin.editor.enableOptions}
                value={product?.optionSchema?.length ? t.admin.common.yes : t.admin.common.no}
              />
              <div className="md:col-span-2">
                {product?.optionSchema?.length ? (
                  <div className="grid gap-3">
                    {product.optionSchema.map((option) => (
                      <div
                        key={option.key}
                        className="rounded-2xl border border-white/10 bg-black/30 p-4"
                      >
                        <p className="font-semibold text-white">{option.label[language]}</p>
                        <p className="mt-1 text-sm text-white/46">
                          {option.type} {option.required ? `- ${t.generate.required}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/12 p-5 text-sm text-white/42">
                    {t.admin.editor.noOptions}
                  </p>
                )}
              </div>
            </EditorSection>
            <OptionMappingPanel product={product} />
          </>
        ) : null}

        {activeTab === "prompt" ? (
          <>
            <PromptVersionPanel productDbId={product?.dbProductId} />
            <AdminNotice>{t.admin.editor.promptNotice}</AdminNotice>
          </>
        ) : null}

        {activeTab === "model" ? <ModelRoutingPanel productDbId={product?.dbProductId} /> : null}

        {activeTab === "readiness" ? (
          <EdgeFunctionReadinessPanel product={product} productDbId={product?.dbProductId} />
        ) : null}
      </div>
    </div>
  );
}
