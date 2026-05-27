type AdminNoticeProps = {
  children: string;
};

export function AdminNotice({ children }: AdminNoticeProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-white/52">
      {children}
    </div>
  );
}
