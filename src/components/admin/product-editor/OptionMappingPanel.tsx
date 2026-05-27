import type { Product } from "../../../data/products";
import { useLanguage } from "../../../hooks/useLanguage";

type OptionMappingPanelProps = {
  product?: Product;
};

export function OptionMappingPanel({ product }: OptionMappingPanelProps) {
  const { language, t } = useLanguage();
  const editor = t.admin.editor;

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5">
      <div>
        <h2 className="text-xl font-semibold text-white">{editor.optionMapping}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
          {editor.optionMappingDescription}
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        {product?.optionSchema?.length ? (
          product.optionSchema.map((option) => (
            <div key={option.key} className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-start">
                <div>
                  <p className="text-sm text-white/42">{editor.optionKey}</p>
                  <p className="mt-1 font-semibold text-white">{option.key}</p>
                </div>
                <div>
                  <p className="text-sm text-white/42">{editor.visibleLabel}</p>
                  <p className="mt-1 font-semibold text-white">{option.label[language]}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/52">
                  {option.type} {option.required ? `- ${t.generate.required}` : ""}
                </span>
              </div>

              <label className="mt-4 grid gap-2 text-sm text-white/52">
                <span>{editor.promptMappingPlaceholder}</span>
                <textarea
                  className="min-h-24 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/24 focus:border-white/30"
                  placeholder={editor.promptMappingTextareaPlaceholder}
                />
              </label>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-white/12 p-5 text-sm text-white/42">
            {editor.noOptions}
          </p>
        )}
      </div>

      <p className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/58">
        {editor.promptMappingSchemaNote}
      </p>

      <button
        disabled
        className="mt-5 rounded-full bg-white/16 px-5 py-3 text-sm font-semibold text-white/42"
      >
        {editor.saveMock}
      </button>
    </section>
  );
}
