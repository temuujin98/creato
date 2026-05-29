import type { MyCreationsFilterStatus } from "../../lib/myCreations";

type CreationFilterOption = {
  count: number;
  label: string;
  value: Extract<MyCreationsFilterStatus, "all" | "completed" | "processing" | "failed">;
};

type Props = {
  activeFilter: CreationFilterOption["value"];
  filters: CreationFilterOption[];
  onChange: (filter: CreationFilterOption["value"]) => void;
};

export function CreationFilters({ activeFilter, filters, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => {
        const active = filter.value === activeFilter;

        return (
          <button
            key={filter.value}
            type="button"
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/20 hover:bg-white/[0.07] hover:text-white/90"
            }`}
            onClick={() => onChange(filter.value)}
          >
            <span>{filter.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                active ? "bg-white/20 text-white" : "bg-white/[0.08] text-white/50"
              }`}
            >
              {filter.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
