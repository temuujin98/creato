import type { ReactNode } from "react";

type AdminMetricCardProps = {
  icon?: ReactNode;
  label: string;
  value: string | number;
};

export function AdminMetricCard({ icon, label, value }: AdminMetricCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
      {icon ? <div className="text-white/46">{icon}</div> : null}
      <p className="mt-4 text-sm text-white/46">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </article>
  );
}
