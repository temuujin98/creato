import { Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type {
  AiModelRegistry,
  AiModelRegistryInput,
  ModelConnectionStatus,
  ModelModality,
  ModelStatus,
} from "../../../lib/modelRegistry";
import {
  createModelConfig,
  updateModelConfig,
} from "../../../lib/modelRegistry";
import { formatCurrency } from "../../../lib/format";

type Labels = {
  basicInfo: string;
  cancel: string;
  capabilities: string;
  connStatusConnected: string;
  connStatusError: string;
  connStatusNotConfigured: string;
  connStatusUnknown: string;
  connectionStatus: string;
  connectionStatusNote: string;
  costPerGeneration: string;
  costPerInputImage: string;
  costPerOutput: string;
  costSection: string;
  createModel: string;
  defaultAspectRatio: string;
  defaultOutputCount: string;
  defaultOutputSize: string;
  displayName: string;
  editModel: string;
  estimatedCostNote: string;
  fieldDescription: string;
  image: string;
  isDefault: string;
  isPremium: string;
  livePreview: string;
  maxOutputs: string;
  modelKey: string;
  modality: string;
  multimodal: string;
  outputSection: string;
  provider: string;
  saveChanges: string;
  saveError: string;
  sortOrder: string;
  statusActive: string;
  statusDeprecated: string;
  statusInactive: string;
  statusSection: string;
  statusTesting: string;
  supportsAspectRatio: string;
  supportsImageInput: string;
  supportsMultipleOutputs: string;
  supportsTextPrompt: string;
  text: string;
  video: string;
  active: string;
  costEstimate: string;
};

type Props = {
  labels: Labels;
  onClose: () => void;
  onSaved: (model: AiModelRegistry) => void;
  target: AiModelRegistry | null;
};

const KEY_RE = /^[a-z0-9-]+$/;

const MODALITIES: { value: ModelModality; label: (l: Labels) => string }[] = [
  { value: "image",      label: (l) => l.image },
  { value: "video",      label: (l) => l.video },
  { value: "text",       label: (l) => l.text },
  { value: "multimodal", label: (l) => l.multimodal },
];

const STATUSES: { value: ModelStatus; label: (l: Labels) => string }[] = [
  { value: "active",     label: (l) => l.statusActive },
  { value: "inactive",   label: (l) => l.statusInactive },
  { value: "testing",    label: (l) => l.statusTesting },
  { value: "deprecated", label: (l) => l.statusDeprecated },
];

const CONN_STATUSES: { value: ModelConnectionStatus; label: (l: Labels) => string }[] = [
  { value: "connected",      label: (l) => l.connStatusConnected },
  { value: "not_configured", label: (l) => l.connStatusNotConfigured },
  { value: "error",          label: (l) => l.connStatusError },
  { value: "unknown",        label: (l) => l.connStatusUnknown },
];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/20 focus:bg-white/[0.07]";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/50">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/38">{label}</p>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span className="relative inline-block h-5 w-9">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <span className="block h-5 w-9 rounded-full border border-white/10 bg-white/[0.06] transition peer-checked:border-white/20 peer-checked:bg-white/20" />
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white/30 transition peer-checked:translate-x-4 peer-checked:bg-white" />
      </span>
      <span className="text-sm text-white/72">{label}</span>
    </label>
  );
}

export function AdminModelConfigModal({ labels, onClose, onSaved, target }: Props) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Basic
  const [provider,     setProvider]     = useState(target?.provider     ?? "");
  const [modelKey,     setModelKey]     = useState(target?.modelKey     ?? "");
  const [displayName,  setDisplayName]  = useState(target?.displayName  ?? "");
  const [description,  setDescription]  = useState(target?.description  ?? "");
  const [modality,     setModality]     = useState<ModelModality>(target?.modality ?? "image");

  // Status
  const [status,           setStatus]           = useState<ModelStatus>(target?.status ?? "active");
  const [connectionStatus, setConnectionStatus] = useState<ModelConnectionStatus>(target?.connectionStatus ?? "unknown");
  const [isActive,         setIsActive]         = useState(target?.isActive  ?? true);
  const [isDefault,        setIsDefault]        = useState(target?.isDefault ?? false);
  const [isPremium,        setIsPremium]        = useState(target?.isPremium ?? false);

  // Capabilities
  const [supportsImageInput,      setSupportsImageInput]      = useState(target?.supportsImageInput      ?? false);
  const [supportsTextPrompt,      setSupportsTextPrompt]      = useState(target?.supportsTextPrompt      ?? true);
  const [supportsAspectRatio,     setSupportsAspectRatio]     = useState(target?.supportsAspectRatio     ?? true);
  const [supportsMultipleOutputs, setSupportsMultipleOutputs] = useState(target?.supportsMultipleOutputs ?? false);

  // Output
  const [maxOutputs,         setMaxOutputs]         = useState(String(target?.maxOutputs         ?? 1));
  const [defaultOutputCount, setDefaultOutputCount] = useState(String(target?.defaultOutputCount ?? 1));
  const [defaultAspectRatio, setDefaultAspectRatio] = useState(target?.defaultAspectRatio ?? "");
  const [defaultOutputSize,  setDefaultOutputSize]  = useState(target?.defaultOutputSize  ?? "");

  // Cost
  const [costPerGeneration,  setCostPerGeneration]  = useState(target?.costPerGenerationMnt  != null ? String(target.costPerGenerationMnt)  : "");
  const [costPerInputImage,  setCostPerInputImage]  = useState(target?.costPerInputImageMnt  != null ? String(target.costPerInputImageMnt)  : "");
  const [costPerOutput,      setCostPerOutput]      = useState(target?.costPerOutputMnt      != null ? String(target.costPerOutputMnt)      : "");
  const [estimatedCostNote,  setEstimatedCostNote]  = useState(target?.estimatedCostNote     ?? "");

  // Misc
  const [sortOrder, setSortOrder] = useState(String(target?.sortOrder ?? 0));

  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape" && !saving) onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [saving, onClose]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const maxOut  = Number(maxOutputs)         || 1;
  const defOut  = Number(defaultOutputCount) || 1;
  const genCost = costPerGeneration !== "" ? Number(costPerGeneration) : null;
  const outCost = costPerOutput     !== "" ? Number(costPerOutput)     : null;

  // Live cost preview
  const estimatedTotal =
    genCost != null && outCost != null
      ? genCost + outCost * defOut
      : genCost != null
        ? genCost
        : null;

  function validate() {
    const e: Record<string, string> = {};
    if (!provider.trim())     e.provider     = "Required";
    if (!modelKey.trim())     e.modelKey     = "Required";
    else if (!KEY_RE.test(modelKey.trim())) e.modelKey = "Lowercase letters, numbers and hyphens only";
    if (!displayName.trim())  e.displayName  = "Required";
    if (maxOut <= 0)          e.maxOutputs   = "Must be > 0";
    if (defOut <= 0)          e.defaultOutputCount = "Must be > 0";
    if (defOut > maxOut)      e.defaultOutputCount = `Must be ≤ max (${maxOut})`;
    if (costPerGeneration !== "" && Number(costPerGeneration) < 0) e.costPerGeneration = "Must be ≥ 0";
    if (costPerInputImage !== "" && Number(costPerInputImage) < 0) e.costPerInputImage = "Must be ≥ 0";
    if (costPerOutput     !== "" && Number(costPerOutput)     < 0) e.costPerOutput     = "Must be ≥ 0";
    return e;
  }

  async function handleSubmit() {
    setSaveError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);

    const input: AiModelRegistryInput = {
      connectionStatus,
      costPerGenerationMnt:  costPerGeneration !== "" ? Number(costPerGeneration) : null,
      costPerInputImageMnt:  costPerInputImage !== "" ? Number(costPerInputImage) : null,
      costPerOutputMnt:      costPerOutput     !== "" ? Number(costPerOutput)     : null,
      defaultAspectRatio:    defaultAspectRatio.trim() || null,
      defaultOutputCount:    defOut,
      defaultOutputSize:     defaultOutputSize.trim() || null,
      description:           description.trim() || null,
      displayName:           displayName.trim(),
      estimatedCostNote:     estimatedCostNote.trim() || null,
      isActive,
      isDefault,
      isPremium,
      maxOutputs:            maxOut,
      modelKey:              modelKey.toLowerCase().trim(),
      modality,
      provider:              provider.toLowerCase().trim(),
      sortOrder:             Number(sortOrder) || 0,
      status,
      supportsAspectRatio,
      supportsImageInput,
      supportsMultipleOutputs,
      supportsTextPrompt,
    };

    try {
      const saved = target
        ? await updateModelConfig(target.id, input)
        : await createModelConfig(input);
      onSaved(saved);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : labels.saveError);
    } finally {
      setSaving(false);
    }
  }

  const isEdit = Boolean(target);
  const sel = `${inputCls} appearance-none cursor-pointer`;

  return createPortal(
    <div
      aria-modal="true"
      role="dialog"
      aria-label={isEdit ? labels.editModel : labels.createModel}
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
            {isEdit ? labels.editModel : labels.createModel}
          </p>
          {!saving && (
            <button
              ref={closeRef}
              type="button"
              aria-label={labels.cancel}
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Scrollable body */}
        <div className="max-h-[calc(92vh-8.5rem)] space-y-6 overflow-y-auto p-5 sm:p-6">
          {/* Basic info */}
          <section>
            <SectionHeading label={labels.basicInfo} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`${labels.provider} *`} error={errors.provider}>
                <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)}
                  placeholder="gemini" className={inputCls} />
              </Field>
              <Field label={`${labels.modelKey} *`} error={errors.modelKey}>
                <input type="text" value={modelKey} onChange={(e) => setModelKey(e.target.value.toLowerCase())}
                  placeholder="gemini-image" className={`${inputCls} font-mono`} />
              </Field>
              <Field label={`${labels.displayName} *`} error={errors.displayName}>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Gemini Image" className={inputCls} />
              </Field>
              <Field label={labels.modality}>
                <select value={modality} onChange={(e) => setModality(e.target.value as ModelModality)} className={sel}>
                  {MODALITIES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label(labels)}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label={labels.fieldDescription}>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={2} placeholder="..." className={`${inputCls} mt-4 resize-none`} />
            </Field>
          </section>

          {/* Status */}
          <section>
            <SectionHeading label={labels.statusSection} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={labels.statusSection}>
                <select value={status} onChange={(e) => setStatus(e.target.value as ModelStatus)} className={sel}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label(labels)}</option>
                  ))}
                </select>
              </Field>
              <Field label={labels.connectionStatus}>
                <select value={connectionStatus}
                  onChange={(e) => setConnectionStatus(e.target.value as ModelConnectionStatus)}
                  className={sel}>
                  {CONN_STATUSES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label(labels)}</option>
                  ))}
                </select>
              </Field>
            </div>
            <p className="mt-2 text-xs text-white/38">{labels.connectionStatusNote}</p>
            <div className="mt-4 flex flex-wrap gap-6">
              <Toggle checked={isActive}   onChange={setIsActive}   label={labels.active}    />
              <Toggle checked={isDefault}  onChange={setIsDefault}  label={labels.isDefault} />
              <Toggle checked={isPremium}  onChange={setIsPremium}  label={labels.isPremium} />
            </div>
          </section>

          {/* Capabilities */}
          <section>
            <SectionHeading label={labels.capabilities} />
            <div className="flex flex-wrap gap-6">
              <Toggle checked={supportsImageInput}      onChange={setSupportsImageInput}      label={labels.supportsImageInput}      />
              <Toggle checked={supportsTextPrompt}      onChange={setSupportsTextPrompt}      label={labels.supportsTextPrompt}      />
              <Toggle checked={supportsAspectRatio}     onChange={setSupportsAspectRatio}     label={labels.supportsAspectRatio}     />
              <Toggle checked={supportsMultipleOutputs} onChange={setSupportsMultipleOutputs} label={labels.supportsMultipleOutputs} />
            </div>
          </section>

          {/* Output settings */}
          <section>
            <SectionHeading label={labels.outputSection} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={labels.maxOutputs} error={errors.maxOutputs}>
                <input type="number" min={1} value={maxOutputs} onChange={(e) => setMaxOutputs(e.target.value)} className={inputCls} />
              </Field>
              <Field label={labels.defaultOutputCount} error={errors.defaultOutputCount}>
                <input type="number" min={1} max={maxOut} value={defaultOutputCount}
                  onChange={(e) => setDefaultOutputCount(e.target.value)} className={inputCls} />
              </Field>
              <Field label={labels.defaultAspectRatio}>
                <input type="text" value={defaultAspectRatio} onChange={(e) => setDefaultAspectRatio(e.target.value)}
                  placeholder="1:1" className={inputCls} />
              </Field>
              <Field label={labels.defaultOutputSize}>
                <input type="text" value={defaultOutputSize} onChange={(e) => setDefaultOutputSize(e.target.value)}
                  placeholder="1024x1024" className={inputCls} />
              </Field>
            </div>
          </section>

          {/* Cost settings */}
          <section>
            <SectionHeading label={labels.costSection} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={labels.costPerGeneration} error={errors.costPerGeneration}>
                <input type="number" min={0} value={costPerGeneration}
                  onChange={(e) => setCostPerGeneration(e.target.value)} placeholder="241" className={inputCls} />
              </Field>
              <Field label={labels.costPerInputImage} error={errors.costPerInputImage}>
                <input type="number" min={0} value={costPerInputImage}
                  onChange={(e) => setCostPerInputImage(e.target.value)} className={inputCls} />
              </Field>
              <Field label={labels.costPerOutput} error={errors.costPerOutput}>
                <input type="number" min={0} value={costPerOutput}
                  onChange={(e) => setCostPerOutput(e.target.value)} className={inputCls} />
              </Field>
              <Field label={labels.sortOrder}>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <Field label={labels.estimatedCostNote}>
              <input type="text" value={estimatedCostNote} onChange={(e) => setEstimatedCostNote(e.target.value)}
                className={`${inputCls} mt-3`} />
            </Field>
          </section>

          {/* Live preview */}
          {(estimatedTotal != null || genCost != null) && (
            <section>
              <SectionHeading label={labels.livePreview} />
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-white/42">{labels.costEstimate}</p>
                    <p className="mt-0.5 font-semibold text-white/86">
                      {estimatedTotal != null ? formatCurrency(estimatedTotal) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/42">{labels.provider} / {labels.modelKey}</p>
                    <p className="mt-0.5 font-mono text-xs text-white/70">
                      {provider || "—"} / {modelKey || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {saveError && (
            <p className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200/90">
              {saveError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] px-5 py-4">
          <button type="button" disabled={saving} onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/62 transition hover:border-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
            {labels.cancel}
          </button>
          <button type="button" disabled={saving} onClick={handleSubmit}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {labels.saveChanges}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
