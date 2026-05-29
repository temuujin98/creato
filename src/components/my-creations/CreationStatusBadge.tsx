import type { MyCreationStatus } from "../../lib/myCreations";

type Props = {
  label: string;
  status: MyCreationStatus;
};

function getStatusClass(status: MyCreationStatus) {
  if (status === "completed" || status === "credit_spent") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  if (
    status === "failed" ||
    status === "credit_refunded" ||
    status === "canceled"
  ) {
    return "border-red-400/20 bg-red-400/10 text-red-200";
  }

  if (status === "queued") {
    return "border-white/10 bg-white/[0.08] text-white/60";
  }

  return "border-primary/25 bg-primary/15 text-primary-200";
}

export function CreationStatusBadge({ label, status }: Props) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClass(status)}`}
    >
      {label}
    </span>
  );
}
