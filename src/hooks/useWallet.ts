import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getWallet, type Wallet } from "../lib/wallet";

type WalletState = {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
};

/**
 * Reads the current user's wallet (read-only, no create side-effect).
 * Returns null if user is not signed in or wallet hasn't been set up yet.
 */
export function useWallet(): WalletState {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setWallet(null);
      setLoading(false);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);

    getWallet(user.id)
      .then((result) => {
        if (!mounted) return;
        setWallet(result);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setWallet(null);
        setError(null); // silent — header should never break
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  return { wallet, loading, error };
}
