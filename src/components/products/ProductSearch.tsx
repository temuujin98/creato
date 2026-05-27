import { Search } from "lucide-react";

type ProductSearchProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function ProductSearch({
  placeholder,
  value,
  onChange,
}: ProductSearchProps) {
  return (
    <label className="relative block w-full">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38"
        aria-hidden="true"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-full border border-white/12 bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-white/30 focus:bg-white/[0.055]"
      />
    </label>
  );
}
