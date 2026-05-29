import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AdminCreditPackage, CreditPackageInput } from "../../../lib/creditPackages";
import {
  ANCHOR_PRICE_PER_CREDIT,
  createCreditPackage,
  updateCreditPackage,
} from "../../../lib/creditPackages";
import { formatCurrency } from "../../../lib/format";

type Labels = {
  average: string;
  badgeText: string;
  cancel: string;
  createPackage: string;
  discount: string;
  editPackage: string;
  fieldCode: string;
  fieldDescription: string;
  livePreview: string;
  name: string;
  priceMnt: string;
  saveError: string;
  saveChanges: string;
  sortOrder: string;
  status: string;
  featured: string;
  active: string;
  credits: string;
};

type Props = {
  labels: Labels;
  onClose: () => void;
  onSaved: (pkg: AdminCreditPackage) => void;
  target: AdminCreditPackage | null; // null = create mode
};

type FormErrors = Partial<Record<keyof CreditPackageInput, string>>;

const CODE_RE = /^[a-z0-9-]+$/;

export function AdminCreditPackageModal({ labels, onClose, onSaved, target }: Props) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const [name,        setName]        = useState(target?.name        ?? "");
  const [code,        setCode]        = useState(target?.code        ?? "");
  const [description, setDescription] = useState(target?.description ?? "");
  const [credits,     setCredits]     = useState(String(target?.credits ?? ""));
  const [priceMnt,    setPriceMnt]    = useState(String(target?.priceMnt ?? ""));
  const [badgeText,   setBadgeText]   = useState(target?.badgeText   ?? "");
  const [sortOrder,   setSortOrder]   = useState(String(target?.sortOrder ?? 0));
  const [isActive,    setIsActive]    = useState(target?.isActive    ?? true);
  const [isFeatured,  setIsFeatured]  = useState(target?.isFeatured  ?? false);
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState<string | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !saving) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [saving, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Auto-fill code from name in create mode
  useEffect(() => {
    if (!target && name && !code) {
      setCode(name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  }, [name, target]); // eslint-disable-line react-hooks/exhaustive-deps

  const creditsNum  = Number(credits)  || 0;
  const priceMntNum = Number(priceMnt) || 0;

  const avg = useMemo(
    () => (creditsNum > 0 ? Math.round(priceMntNum / creditsNum) : 0),
    [creditsNum, priceMntNum],
  );

  const discount = useMemo(
    () =>
      avg > 0
        ? Math.round(((ANCHOR_PRICE_PER_CREDIT - avg) / ANCHOR_PRICE_PER_CREDIT) * 100)
        : 0,
    [avg],
  );

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!name.trim())                            errs.name     = "Required";
    if (!code.trim())                            errs.code     = "Required";
    else if (!CODE_RE.test(code.trim()))         errs.code     = "Lowercase letters, numbers and hyphens only";
    if (!credits || creditsNum <= 0)             errs.credits  = "Must be > 0";
    if (priceMnt === "" || priceMntNum < 0)      errs.priceMnt = "Must be ≥ 0";
    if (isNaN(Number(sortOrder)))                errs.sortOrder = "Must be a number";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);

    const input: CreditPackageInput = {
      badgeText:   badgeText.trim() || null,
      code:        code.toLowerCase().trim(),
      credits:     creditsNum,
      description: description.trim() || null,
      isActive,
      isFeatured,
      name:        name.trim(),
      priceMnt:    priceMntNum,
      sortOrder:   Number(sortOrder),
    };

    try {
      const saved = target
        ? await updateCreditPackage(target.id, input)
        : await createCreditPackage(input);
      onSaved(saved);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : labels.saveError);
    } finally {
      setSaving(false);
    }
  }

  const isEdit = Boolean(target);

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      aria-label={isEdit ? labels.editPackage : labels.createPackage}
      className="fixed inset-0 z-[1100] flex items-end justify-center p-3 text-white sm:items-center sm:p-6"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={saving ? undefined : onClose}
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-950 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <p className="text-sm font-semibold text-white/86">
            {isEdit ? labels.editPackage : labels.createPackage}
          </p>
          {!saving && (
            <button
              ref={closeRef}
              type="button"
              aria-label={labels.cancel}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-4.5rem-4rem)] overflow-y-auto p-5 sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                {labels.name} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Creator"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
              />
              {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name}</p>}
            </div>

            {/* Code */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                {labels.fieldCode} *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toLowerCase())}
                placeholder="creator"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 font-mono text-sm text-white placeholder-white/25 outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
              />
              {errors.code && <p className="mt-1 text-xs text-red-300">{errors.code}</p>}
            </div>

            {/* Credits */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                {labels.credits} *
              </label>
              <input
                type="number"
                min={1}
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="25"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
              />
              {errors.credits && <p className="mt-1 text-xs text-red-300">{errors.credits}</p>}
            </div>

            {/* Price MNT */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                {labels.priceMnt} *
              </label>
              <input
                type="number"
                min={0}
                value={priceMnt}
                onChange={(e) => setPriceMnt(e.target.value)}
                placeholder="22900"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
              />
              {errors.priceMnt && <p className="mt-1 text-xs text-red-300">{errors.priceMnt}</p>}
            </div>

            {/* Badge text */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                {labels.badgeText}
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Хамгийн тохиромжтой"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
              />
            </div>

            {/* Sort order */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                {labels.sortOrder}
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="20"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/20 focus:bg-white/[0.07]"
              />
              {errors.sortOrder && (
                <p className="mt-1 text-xs text-red-300">{errors.sortOrder}</p>
              )}
            </div>
          </div>

          {/* Description (full width) */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-white/50 mb-1.5">
              {labels.fieldDescription}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/20 focus:bg-white/[0.07] resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-3">
              <span className="relative inline-block h-5 w-9">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <span className="block h-5 w-9 rounded-full border border-white/10 bg-white/[0.06] transition peer-checked:border-emerald-500/40 peer-checked:bg-emerald-500/20" />
                <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white/30 transition peer-checked:translate-x-4 peer-checked:bg-emerald-400" />
              </span>
              <span className="text-sm text-white/72">{labels.active}</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <span className="relative inline-block h-5 w-9">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <span className="block h-5 w-9 rounded-full border border-white/10 bg-white/[0.06] transition peer-checked:border-amber-500/40 peer-checked:bg-amber-500/20" />
                <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white/30 transition peer-checked:translate-x-4 peer-checked:bg-amber-400" />
              </span>
              <span className="text-sm text-white/72">{labels.featured}</span>
            </label>
          </div>

          {/* Live preview */}
          {creditsNum > 0 && priceMntNum > 0 && (
            <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.025] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/38">
                {labels.livePreview}
              </p>
              <div className="mt-3 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-white/42">{labels.average}</p>
                  <p className="mt-0.5 font-semibold text-white/86">
                    {formatCurrency(avg)} / credit
                  </p>
                </div>
                <div>
                  <p className="text-white/42">{labels.discount}</p>
                  <p className={`mt-0.5 font-semibold ${discount > 0 ? "text-emerald-300" : "text-white/50"}`}>
                    {discount > 0 ? `${discount}%` : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {saveError && (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200/90">
              {saveError}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] px-5 py-4">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/62 transition hover:border-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {labels.cancel}
          </button>
          <button
            type="submit"
            form=""
            disabled={saving}
            onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {labels.saveChanges}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
