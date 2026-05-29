import { CheckCircle2, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { formatCurrency } from "../lib/format";
import type { ClientCreditPackage } from "../lib/creditPackages";
import { listActiveCreditPackages } from "../lib/creditPackages";
import type { PaymentOrder } from "../lib/payments";
import { createPaymentOrder } from "../lib/payments";

// Fallback packages shown while loading or when Supabase is unavailable.
// Values match the seeded packages from migration 0014.
const FALLBACK_PACKAGES: ClientCreditPackage[] = [
  { id: "starter",  code: "starter",  name: "Starter",  description: null, credits: 10,  priceMnt: 9900,   badgeText: null,                  isFeatured: false, sortOrder: 10 },
  { id: "creator",  code: "creator",  name: "Creator",  description: null, credits: 25,  priceMnt: 22900,  badgeText: "Хамгийн тохиромжтой", isFeatured: true,  sortOrder: 20 },
  { id: "business", code: "business", name: "Business", description: null, credits: 60,  priceMnt: 49900,  badgeText: "Бизнес хэрэглээнд",   isFeatured: false, sortOrder: 30 },
  { id: "pro",      code: "pro",      name: "Pro",       description: null, credits: 150, priceMnt: 119000, badgeText: "Их хэрэглээнд",       isFeatured: false, sortOrder: 40 },
];

// ─── Order created modal ──────────────────────────────────────────────────────

function OrderModal({
  order,
  onClose,
  labels,
}: {
  order: PaymentOrder;
  onClose: () => void;
  labels: {
    title: string;
    close: string;
    package: string;
    credits: string;
    amount: string;
    orderId: string;
    status: string;
    notice: string;
  };
}) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => { closeBtnRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={labels.title}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 text-white"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6 shadow-2xl shadow-black/80">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
            <h2 className="text-lg font-semibold">{labels.title}</h2>
          </div>
          <button ref={closeBtnRef} type="button" aria-label={labels.close} onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 hover:border-white/20 hover:text-white transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3">
          {[
            [labels.package, order.packageName ?? "—"],
            [labels.credits, String(order.credits)],
            [labels.amount, formatCurrency(order.amountMnt)],
            [labels.status, order.status],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-white/42">{label}</dt>
              <dd className="text-sm font-medium text-white/86">{value}</dd>
            </div>
          ))}
          <div className="col-span-2 flex flex-col gap-0.5">
            <dt className="text-xs text-white/42">{labels.orderId}</dt>
            <dd className="break-all font-mono text-xs text-white/55">{order.id}</dd>
          </div>
        </dl>

        <p className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3 text-sm leading-6 text-amber-200/80">
          {labels.notice}
        </p>

        <button type="button" onClick={onClose}
          className="mt-5 w-full rounded-xl border border-white/10 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:text-white">
          {labels.close}
        </button>
      </div>
    </div>,
    document.body,
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function PricingPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState<ClientCreditPackage[]>(FALLBACK_PACKAGES);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<PaymentOrder | null>(null);

  useEffect(() => {
    listActiveCreditPackages()
      .then((data) => { if (data.length > 0) setPackages(data); })
      .catch(() => {});
  }, []);

  async function handleBuyCredits(pkg: ClientCreditPackage) {
    if (!user) {
      navigate("/login");
      return;
    }
    setCreatingId(pkg.id);
    setCreateError(null);
    try {
      const order = await createPaymentOrder(pkg.id);
      setCreatedOrder(order);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : t.pricing.orderFailed);
    } finally {
      setCreatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-white/58">
              {t.pricing.eyebrow}
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-normal text-white sm:text-6xl">
              {t.pricing.title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/62">
              {t.pricing.description}
            </p>
          </div>

          {createError && (
            <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-900/20 px-4 py-3 text-sm text-red-300">
              {createError}
            </div>
          )}

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((item) => {
              const isBuying = creatingId === item.id;
              return (
                <article
                  key={item.code}
                  className={`flex flex-col rounded-[1.75rem] border p-6 ${
                    item.isFeatured
                      ? "border-white/26 bg-white/[0.09] shadow-glow"
                      : "border-white/10 bg-white/[0.035]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-lg font-semibold text-white">{item.name}</p>
                    {item.badgeText && (
                      <span className="shrink-0 rounded-full border border-amber-400/25 bg-amber-400/[0.12] px-2 py-0.5 text-[10px] font-semibold text-amber-200/90">
                        {item.badgeText}
                      </span>
                    )}
                  </div>
                  <p className="mt-8 text-5xl font-semibold text-white">
                    {item.credits}
                  </p>
                  <p className="mt-2 text-sm text-white/52">{t.pricing.credits}</p>
                  <p className="mt-8 text-2xl font-semibold text-white">
                    {formatCurrency(item.priceMnt)}
                  </p>

                  <button
                    type="button"
                    disabled={creatingId !== null}
                    onClick={() => handleBuyCredits(item)}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition ${
                      item.isFeatured
                        ? "bg-white text-black hover:bg-white/90 disabled:opacity-60"
                        : "border border-white/15 text-white hover:bg-white/[0.06] disabled:opacity-50"
                    } disabled:cursor-not-allowed`}
                  >
                    {isBuying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {t.pricing.buyCredits}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />

      {createdOrder && (
        <OrderModal
          order={createdOrder}
          onClose={() => setCreatedOrder(null)}
          labels={{
            title: t.pricing.orderCreated,
            close: t.pricing.close,
            package: t.pricing.orderPackage,
            credits: t.pricing.credits,
            amount: t.pricing.orderAmount,
            orderId: t.pricing.orderId,
            status: t.pricing.orderStatus,
            notice: t.pricing.orderNotice,
          }}
        />
      )}
    </div>
  );
}
