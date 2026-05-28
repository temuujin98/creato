import { Gem } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useWallet } from "../../hooks/useWallet";

/**
 * Compact credit balance pill shown in the header when the user is signed in.
 * Clicking navigates to /pricing. Hides entirely if user is logged out.
 * Never throws — silently hides on error.
 */
export function WalletPill() {
  const { user } = useAuth();
  const { wallet, loading } = useWallet();

  if (!user) return null;

  // Still loading — render a skeleton-width placeholder so layout doesn't shift
  if (loading) {
    return (
      <div
        className="hidden h-8 w-16 animate-pulse rounded-full border border-white/10 bg-white/[0.04] sm:block"
        aria-hidden="true"
      />
    );
  }

  // Wallet not found yet (new user, RLS not ready, etc.) — hide silently
  if (!wallet) return null;

  const available = Math.max(0, wallet.balance - wallet.reserved_balance);

  return (
    <Link
      to="/pricing"
      className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-neutral-950 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:border-primary/40 hover:bg-white/5 hover:text-white sm:flex"
      aria-label={`${available} credits — buy more`}
    >
      <Gem className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
      <span className="tabular-nums">{available}</span>
    </Link>
  );
}
