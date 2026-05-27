import type { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
};

export function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
      <div className="text-white/48">{icon}</div>
      <p className="mt-5 text-sm text-white/46">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </article>
  );
}
