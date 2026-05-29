import { Loader2, RefreshCw, ShieldAlert, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import type { AiModelRegistry } from "../../../lib/modelRegistry";
import { listAdminModelConfigs } from "../../../lib/modelRegistry";
import type { AdminAllowedModel, ProductAllowedModelUpdate } from "../../../lib/productAllowedModels";
import {
  listAdminProductAllowedModels,
  updateProductAllowedModels,
} from "../../../lib/productAllowedModels";

type Props = {
  productDbId?: string;
};

type RowState = {
  modelConfigId: string;
  displayName: string;
  provider: string;
  modelKey: string;
  modality: string;
  globalIsActive: boolean;
  globalStatus: string;
  isAllowed: boolean;
  isDefault: boolean;
  creditCostOverride: string;
  sortOrder: string;
  adminNote: string;
  existingId?: string;
};

function buildRows(
  global: AiModelRegistry[],
  allowed: AdminAllowedModel[],
): RowState[] {
  return global.map((gm) => {
    const existing = allowed.find((a) => a.modelConfigId === gm.id);
    return {
      modelConfigId:      gm.id,
      displayName:        gm.displayName,
      provider:           gm.provider,
      modelKey:           gm.modelKey,
      modality:           gm.modality,
      globalIsActive:     gm.isActive,
      globalStatus:       gm.status,
      isAllowed:          existing?.isActive ?? false,
      isDefault:          existing?.isDefault ?? false,
      creditCostOverride: existing?.creditCostOverride != null ? String(existing.creditCostOverride) : "",
      sortOrder:          String(existing?.sortOrder ?? gm.sortOrder),
      adminNote:          existing?.adminNote ?? "",
      existingId:         existing?.id,
    };
  });
}

export function ProductAllowedModelsSection({ productDbId }: Props) {
  const { t } = useLanguage();
  const ed = t.admin.editor;

  const [rows,    setRows]    = useState<RowState[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    if (!productDbId) { setRows([]); return; }
    setLoading(true);
    setError(null);
    try {
      const [global, allowed] = await Promise.all([
        listAdminModelConfigs(),
        listAdminProductAllowedModels(productDbId),
      ]);
      setRows(buildRows(global, allowed));
    } catch {
      setError(ed.allowedModelsSaveFailed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [productDbId]); // eslint-disable-line react-hooks/exhaustive-deps

  function setField<K extends keyof RowState>(idx: number, key: K, value: RowState[K]) {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [key]: value };
      // If setting isDefault=true, clear others
      if (key === "isDefault" && value === true) {
        return next.map((r, i) => i === idx ? r : { ...r, isDefault: false });
      }
      // If disabling, clear default
      if (key === "isAllowed" && value === false) {
        next[idx] = { ...next[idx], isDefault: false };
      }
      return next;
    });
  }

  async function handleSave() {
    if (!productDbId) return;
    const allowedRows = rows.filter((r) => r.isAllowed);
    if (allowedRows.length === 0) {
      setError(ed.selectAtLeastOneModel);
      return;
    }
    const hasDefault = allowedRows.some((r) => r.isDefault);
    if (!hasDefault) {
      setError(ed.selectOneDefault);
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updates: ProductAllowedModelUpdate[] = rows.map((r) => ({
        modelConfigId:      r.modelConfigId,
        isActive:           r.isAllowed,
        isDefault:          r.isDefault,
        creditCostOverride: r.creditCostOverride !== "" ? Number(r.creditCostOverride) : null,
        sortOrder:          Number(r.sortOrder) || 0,
        adminNote:          r.adminNote || null,
      }));
      await updateProductAllowedModels(productDbId, updates);
      setSuccess(ed.allowedModelsSaved);
      await load();
    } catch {
      setError(ed.allowedModelsSaveFailed);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "h-9 rounded-xl border border-white/10 bg-black/40 px-2 text-xs text-white outline-none transition focus:border-white/25";

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{ed.allowedModels}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-white/50">{ed.allowedModelsDesc}</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:text-white"
          onClick={() => void load()}
          disabled={loading || saving}
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {!productDbId && (
        <p className="mt-5 rounded-2xl border border-dashed border-white/12 p-4 text-sm text-white/42">
          {t.admin.editor.productDbIdMissing}
        </p>
      )}

      {productDbId && loading && (
        <div className="mt-5 grid place-items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" aria-hidden="true" />
        </div>
      )}

      {productDbId && !loading && rows.length === 0 && (
        <p className="mt-5 rounded-2xl border border-dashed border-white/12 p-4 text-sm text-white/42">
          {ed.allowedModelsNone}
        </p>
      )}

      {productDbId && !loading && rows.length > 0 && (
        <div className="mt-5 space-y-2">
          {/* Header row */}
          <div className="grid grid-cols-[1.5rem_1fr_5rem_5rem_7rem_5rem] items-center gap-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-white/38">
            <span title={ed.allowToggle}>✓</span>
            <span>Model</span>
            <span>{ed.setAllowedDefault}</span>
            <span>{ed.creditOverride}</span>
            <span>Sort</span>
            <span></span>
          </div>

          {rows.map((row, idx) => {
            const isGlobalOk = row.globalIsActive && ["active", "testing"].includes(row.globalStatus);
            return (
              <div
                key={row.modelConfigId}
                className={`grid grid-cols-[1.5rem_1fr_5rem_5rem_7rem_5rem] items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm transition ${
                  row.isAllowed
                    ? "border-white/15 bg-white/[0.04]"
                    : "border-white/[0.06] bg-transparent opacity-50"
                }`}
              >
                {/* Allow toggle */}
                <input
                  type="checkbox"
                  checked={row.isAllowed}
                  disabled={!isGlobalOk}
                  onChange={(e) => setField(idx, "isAllowed", e.target.checked)}
                  className="h-3.5 w-3.5 accent-white cursor-pointer"
                />

                {/* Model info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white/86 text-xs">{row.displayName}</span>
                    <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] text-white/42 uppercase">
                      {row.modality}
                    </span>
                    {!isGlobalOk && (
                      <span className="flex items-center gap-1 text-[9px] text-amber-300/80">
                        <ShieldAlert className="h-2.5 w-2.5" />
                        {ed.globalInactive}
                      </span>
                    )}
                    {row.isDefault && row.isAllowed && (
                      <Star className="h-3 w-3 text-amber-400" aria-hidden="true" />
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-white/30 mt-0.5 truncate">
                    {row.provider}/{row.modelKey}
                  </p>
                </div>

                {/* Default radio */}
                <div className="flex justify-center">
                  <input
                    type="radio"
                    checked={row.isDefault}
                    disabled={!row.isAllowed}
                    onChange={() => setField(idx, "isDefault", true)}
                    className="h-3.5 w-3.5 accent-white cursor-pointer"
                    title={ed.setAllowedDefault}
                  />
                </div>

                {/* Credit cost override */}
                <input
                  type="number"
                  min={0}
                  value={row.creditCostOverride}
                  placeholder="—"
                  disabled={!row.isAllowed}
                  onChange={(e) => setField(idx, "creditCostOverride", e.target.value)}
                  className={inputCls}
                  title={ed.creditOverride}
                />

                {/* Sort order */}
                <input
                  type="number"
                  value={row.sortOrder}
                  disabled={!row.isAllowed}
                  onChange={(e) => setField(idx, "sortOrder", e.target.value)}
                  className={inputCls}
                />

                {/* Spacer */}
                <div />
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-300/80">{error}</p>
      )}
      {success && (
        <p className="mt-3 text-sm text-emerald-300/80">{success}</p>
      )}

      {productDbId && !loading && (
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            disabled={saving || loading}
            onClick={() => void handleSave()}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin inline" /> : null}
            {" "}{t.admin.common.saveChanges}
          </button>
        </div>
      )}
    </section>
  );
}
