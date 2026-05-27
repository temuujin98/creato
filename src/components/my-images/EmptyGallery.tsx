import { Images } from "lucide-react";
import { Link } from "react-router-dom";

type EmptyGalleryProps = {
  buttonLabel: string;
  notice: string;
  title: string;
};

export function EmptyGallery({ buttonLabel, notice, title }: EmptyGalleryProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-16 text-center">
      <Images className="mx-auto h-10 w-10 text-white/42" aria-hidden="true" />
      <p className="mt-5 text-2xl font-semibold text-white">{title}</p>
      <p className="mx-auto mt-3 max-w-xl leading-7 text-white/52">{notice}</p>
      <Link
        to="/products"
        className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-bone"
      >
        {buttonLabel}
      </Link>
    </section>
  );
}
