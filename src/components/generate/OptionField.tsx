import type { ProductOptionSchema } from "../../data/products";
import type { Language } from "../../i18n/translations";

type OptionFieldProps = {
  field: ProductOptionSchema;
  language: Language;
  requiredLabel: string;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
};

const inputClass =
  "mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-white/34";

export function OptionField({
  field,
  language,
  onChange,
  requiredLabel,
  value,
}: OptionFieldProps) {
  const label = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-semibold text-white">{field.label[language]}</span>
      {field.required ? (
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/46">
          {requiredLabel}
        </span>
      ) : null}
    </div>
  );

  return (
    <label className="block rounded-[1.35rem] border border-white/10 bg-white/[0.025] p-4">
      {label}
      {field.helpText ? (
        <p className="mt-2 text-sm leading-6 text-white/48">
          {field.helpText[language]}
        </p>
      ) : null}
      <FieldInput field={field} language={language} value={value} onChange={onChange} />
    </label>
  );
}

function FieldInput({
  field,
  language,
  onChange,
  value,
}: Omit<OptionFieldProps, "requiredLabel">) {
  if (field.type === "textarea") {
    return (
      <textarea
        className={`${inputClass} min-h-28 resize-none`}
        placeholder={field.placeholder?.[language]}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        className={inputClass}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      >
        {field.choices?.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label[language]}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "radio" || field.type === "aspect-ratio") {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {field.choices?.map((choice) => (
          <button
            key={choice.value}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              value === choice.value
                ? "border-white bg-white text-black"
                : "border-white/12 bg-black/30 text-white/58 hover:text-white"
            }`}
            onClick={() => onChange(choice.value)}
          >
            {choice.label[language]}
          </button>
        ))}
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <input
        type="checkbox"
        className="mt-4 h-5 w-5 accent-white"
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }

  if (field.type === "color") {
    return (
      <input
        type="color"
        className="mt-3 h-12 w-20 rounded-xl border border-white/10 bg-black/40 p-1"
        value={String(value || "#ffffff")}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <input
      className={inputClass}
      type={field.type === "number" ? "number" : "text"}
      placeholder={field.placeholder?.[language]}
      value={String(value ?? "")}
      onChange={(event) =>
        onChange(field.type === "number" ? Number(event.target.value) : event.target.value)
      }
    />
  );
}
