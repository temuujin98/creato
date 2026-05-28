import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  title: string;
};

export function AuthCard({ children, title }: AuthCardProps) {
  return (
    <section className="mx-auto grid min-h-screen max-w-7xl items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-neutral-950 p-6 shadow-glow sm:p-8">
        <h1 className="text-4xl font-semibold tracking-normal text-white">
          {title}
        </h1>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
