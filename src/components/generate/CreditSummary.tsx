import { Sparkles } from "lucide-react";
import type { Wallet } from "../../lib/wallet";

type CreditSummaryProps = {
  creditCost: number;
  labels: {
    afterReserve: string;
    availableCredits: string;
    creditCost: string;
    creditNotice: string;
    creditSummary: string;
    insufficientCredits: string;
    loadingWallet: string;
    readyToReserve: string;
    reservedBalance: string;
    walletUnavailable: string;
  };
  wallet: Wallet | null;
  walletError?: string | null;
  walletLoading?: boolean;
};

export function CreditSummary({
  creditCost,
  labels,
  wallet,
  walletError,
  walletLoading,
}: CreditSummaryProps) {
  const afterReserve = wallet ? Math.max(wallet.balance - creditCost, 0) : 0;
  const status = (() => {
    if (walletLoading) return labels.loadingWallet;
    if (walletError || !wallet) return labels.walletUnavailable;
    if (wallet.balance < creditCost) return labels.insufficientCredits;
    return labels.readyToReserve;
  })();

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary-300" aria-hidden="true" />
        <p className="text-lg font-semibold text-white">{labels.creditSummary}</p>
      </div>
      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
          <span className="text-white/52">{labels.creditCost}</span>
          <span className="font-semibold text-white">{creditCost}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
          <span className="text-white/52">{labels.availableCredits}</span>
          <span className="font-semibold text-white">{wallet?.balance ?? 0}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
          <span className="text-white/52">{labels.reservedBalance}</span>
          <span className="font-semibold text-white">
            {wallet?.reserved_balance ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
          <span className="text-white/52">{labels.afterReserve}</span>
          <span className="font-semibold text-white">{afterReserve}</span>
        </div>
        <p className="text-white/62">{status}</p>
        {walletError ? (
          <p className="leading-6 text-white/42">{walletError}</p>
        ) : null}
        <p className="leading-6 text-white/42">{labels.creditNotice}</p>
      </div>
    </section>
  );
}
