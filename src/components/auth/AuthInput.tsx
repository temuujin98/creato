type AuthInputProps = {
  autoComplete?: string;
  label: string;
  name?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  type?: string;
  value?: string;
};

export function AuthInput({
  autoComplete,
  label,
  name,
  onChange,
  required,
  type = "text",
  value,
}: AuthInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-white/62">{label}</span>
      <input
        autoComplete={autoComplete}
        name={name}
        onChange={(event) => onChange?.(event.target.value)}
        required={required}
        type={type}
        value={value}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/42 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/34"
        placeholder={label}
      />
    </label>
  );
}
