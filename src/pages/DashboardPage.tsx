import { CreditCard, Image, Package, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { QuickActionCard } from "../components/dashboard/QuickActionCard";
import { RecentCreationsSection } from "../components/dashboard/RecentCreationsSection";
import { StatCard } from "../components/dashboard/StatCard";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { getOrCreateWallet, type Wallet } from "../lib/wallet";

export function DashboardPage() {
  const { profile, user } = useAuth();
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
    { label: t.dashboard.generatedImages, value: 0, icon: <Image className="h-5 w-5" /> },
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
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="flex items-center gap-3 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  {t.dashboard.costSafeTitle}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/50">
                  {t.dashboard.costSafeNotice}
                </p>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6">
              <RecentCreationsSection />
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
