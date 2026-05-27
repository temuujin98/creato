import { CreditCard, Images, Package, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { QuickActionCard } from "../components/dashboard/QuickActionCard";
import { StatCard } from "../components/dashboard/StatCard";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { getOrCreateWallet, type Wallet } from "../lib/wallet";

export function DashboardPage() {
  const { profile, signOut, user } = useAuth();
  const { t } = useLanguage();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const displayName = profile?.full_name || user?.email || "creato";

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setWallet(null);
      return undefined;
    }

    getOrCreateWallet(user.id)
      .then((nextWallet) => {
        if (!isMounted) return;
        setWallet(nextWallet);
        setWalletError(null);
      })
      .catch((error: Error) => {
        if (!isMounted) return;
        setWallet(null);
        setWalletError(error.message);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const stats = [
    { label: t.dashboard.creditBalance, value: wallet?.balance ?? 0, icon: <CreditCard className="h-5 w-5" /> },
    { label: t.dashboard.reservedBalance, value: wallet?.reserved_balance ?? 0, icon: <CreditCard className="h-5 w-5" /> },
    { label: t.dashboard.generatedImages, value: 0, icon: <Images className="h-5 w-5" /> },
    { label: t.dashboard.favoriteProduct, value: "-", icon: <Sparkles className="h-5 w-5" /> },
    { label: t.dashboard.currentPlan, value: t.dashboard.trial, icon: <Package className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-semibold tracking-normal">
              {t.dashboard.title}
            </h1>
            <p className="mt-4 text-xl text-white/78">
              {t.dashboard.welcome} {displayName}
            </p>
            <p className="mt-5 text-lg leading-8 text-white/62">
              {t.dashboard.intro}
            </p>
            <button
              type="button"
              className="mt-6 rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/62 transition hover:border-white/24 hover:text-white"
              onClick={() => signOut()}
            >
              {t.dashboard.logout}
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <StatCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
          {walletError ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/52">
              {t.dashboard.walletSetupNotice}
            </p>
          ) : null}

          <div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <section>
              <h2 className="text-2xl font-semibold">{t.dashboard.quickActions}</h2>
              <div className="mt-5 grid gap-3">
                <QuickActionCard label={t.dashboard.browseProducts} to="/products" />
                <QuickActionCard label={t.dashboard.myImages} to="/my-images" />
                <QuickActionCard label={t.dashboard.buyCredits} to="/pricing" />
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6">
              <h2 className="text-2xl font-semibold">
                {t.dashboard.recentGeneration}
              </h2>
              <p className="mt-8 rounded-[1.25rem] border border-dashed border-white/14 bg-black/30 p-8 text-center text-white/48">
                {t.dashboard.emptyRecent}
              </p>
              <p className="mt-5 text-sm leading-6 text-white/42">
                {t.dashboard.backendNotice}
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
