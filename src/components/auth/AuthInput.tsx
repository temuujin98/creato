type AuthInputProps = {
  autoComplete?: string;
  disabled?: boolean;
  label: string;
  name?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  type?: string;
  value?: string;
};

export function AuthInput({
  autoComplete,
  disabled,
  label,
  name,
  onChange,
  required,
  type = "text",
  value,
}: AuthInputProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/70">{label}</span>
      <input
        autoComplete={autoComplete}
        disabled={disabled}
        name={name}
        onChange={(event) => onChange?.(event.target.value)}
        required={required}
        type={type}
        value={value}
        className="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        placeholder={label}
      />
    </label>
  );
}
