import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type QuickActionCardProps = {
  label: string;
  to: string;
};

export function QuickActionCard({ label, to }: QuickActionCardProps) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 text-white transition hover:border-white/22 hover:bg-white/[0.055]"
    >
      <span className="font-semibold">{label}</span>
      <ArrowRight
        className="h-4 w-4 text-white/46 transition group-hover:translate-x-1 group-hover:text-white"
        aria-hidden="true"
      />
    </Link>
  );
}
