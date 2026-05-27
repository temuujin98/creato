import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  notice: string;
  title: string;
};

export function AuthCard({ children, notice, title }: AuthCardProps) {
  return (
    <section className="mx-auto grid min-h-screen max-w-7xl items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-glow sm:p-8">
        <h1 className="text-4xl font-semibold tracking-normal text-white">
          {title}
        </h1>
        <div className="mt-8">{children}</div>
        <p className="mt-6 rounded-2xl border border-white/10 bg-black/32 p-4 text-sm leading-6 text-white/46">
          {notice}
        </p>
      </div>
    </section>
  );
}
