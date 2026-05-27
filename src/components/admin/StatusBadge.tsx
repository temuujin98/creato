type StatusBadgeProps = {
  label: string;
};

export function StatusBadge({ label }: StatusBadgeProps) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/64">
      {label}
    </span>
  );
}
