import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  action?: ReactNode;
  description: string;
  title: string;
};

export function AdminPageHeader({
  action,
  description,
  title,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-white/58">{description}</p>
      </div>
      {action}
    </div>
  );
}
