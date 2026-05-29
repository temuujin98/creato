import { Images } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  buttonLabel: string;
  description?: string;
  title: string;
  to?: string;
};

export function CreationEmptyState({
  buttonLabel,
  description,
  title,
  to = "/products",
}: Props) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-neutral-950 px-6 py-16 text-center shadow-2xl shadow-black/30">
      <Images className="mx-auto h-10 w-10 text-white/50" aria-hidden="true" />
      <p className="mt-5 text-2xl font-semibold text-white/90">{title}</p>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-white/50">{description}</p>
      ) : null}
      <Link
        to={to}
        className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-500"
      >
        {buttonLabel}
      </Link>
    </section>
  );
}
