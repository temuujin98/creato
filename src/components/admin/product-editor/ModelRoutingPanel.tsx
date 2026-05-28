import { LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import {
  listModelConfigs,
  setActiveModelConfig,
  upsertModelConfig,
  type ModelConfig,
} from "../../../lib/adminProductConfig";
import { useLanguage } from "../../../hooks/useLanguage";

type ModelRoutingPanelProps = {
  productDbId?: string;
};

const inputClass =
  "h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-white/30";

export function ModelRoutingPanel({ productDbId }: ModelRoutingPanelProps) {
  const { t } = useLanguage();
  const editor = t.admin.editor;
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [publicOptionId, setPublicOptionId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [primaryProvider, setPrimaryProvider] = useState<"gemini" | "openai">("gemini");
  const [primaryModel, setPrimaryModel] = useState("");
  const [fallbackProvider, setFallbackProvider] = useState<"" | "gemini" | "openai">("");
  const [fallbackModel, setFallbackModel] = useState("");
  const [outputSize, setOutputSize] = useState("");
  const [outputCount, setOutputCount] = useState(1);
  const [retryLimit, setRetryLimit] = useState(1);
  const [cleanupEnabled, setCleanupEnabled] = useState(false);
  const [estimatedCostMnt, setEstimatedCostMnt] = useState("");
  const [creditCostOverride, setCreditCostOverride] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  async function loadConfigs() {
    if (!productDbId) {
      setConfigs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setConfigs(await listModelConfigs(productDbId));
    } catch {
      setError(editor.adminRlsWarning);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productDbId]);

  function editConfig(config: ModelConfig) {
    setEditingId(config.id);
    setPublicOptionId(config.public_option_id ?? "");
    setDisplayName(config.display_name ?? "");
    setPrimaryProvider(config.primary_provider);
    setPrimaryModel(config.primary_model);
    setFallbackProvider(config.fallback_provider ?? "");
    setFallbackModel(config.fallback_model ?? "");
    setOutputSize(config.output_size ?? "");
    setOutputCount(config.output_count);
    setRetryLimit(config.retry_limit);
    setCleanupEnabled(config.cleanup_enabled);
    setEstimatedCostMnt(config.estimated_cost_mnt?.toString() ?? "");
    setCreditCostOverride(config.credit_cost_override?.toString() ?? "");
    setIsActive(config.is_active);
    setIsDefault(config.is_default);
  }

  function resetForm() {
    setEditingId(undefined);
    setPublicOptionId("");
    setDisplayName("");
    setPrimaryProvider("gemini");
    setPrimaryModel("");
    setFallbackProvider("");
    setFallbackModel("");
    setOutputSize("");
    setOutputCount(1);
    setRetryLimit(1);
    setCleanupEnabled(false);
    setEstimatedCostMnt("");
    setCreditCostOverride("");
    setIsActive(true);
    setIsDefault(false);
  }

  async function handleSave() {
    if (!productDbId) {
      setError(editor.productDbIdMissing);
      return;
    }

    if (!primaryModel.trim()) {
      setError(editor.primaryModelRequired);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await upsertModelConfig({
        cleanupEnabled,
        creditCostOverride: creditCostOverride ? Number(creditCostOverride) : null,
        displayName,
        estimatedCostMnt: estimatedCostMnt ? Number(estimatedCostMnt) : null,
        fallbackModel,
        fallbackProvider: fallbackProvider || null,
        id: editingId,
        isActive,
        isDefault,
        outputCount,
        outputSize,
        primaryModel,
        primaryProvider,
        productId: productDbId,
        publicOptionId,
        retryLimit,
      });

      setSuccess(editor.modelConfigSaved);
      resetForm();
      await loadConfigs();
    } catch {
      setError(editor.modelConfigSaveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function handleSetActive(modelConfigId: string) {
    if (!productDbId) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await setActiveModelConfig(productDbId, modelConfigId);
      setSuccess(editor.modelConfigSaved);
      await loadConfigs();
    } catch {
      setError(editor.modelConfigSaveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{editor.modelRouting}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            {editor.modelRoutingDescription}
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/50">
          {editor.backendOnly}
        </span>
      </div>

      {!productDbId ? (
        <p className="mt-5 rounded-2xl border border-dashed border-white/12 p-5 text-sm text-white/52">
          {editor.productDbIdMissing}
        </p>
      ) : (
        <>
          <div className="mt-5 grid gap-3">
            {loading ? (
              <p className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white/52">
                {editor.loadingModelConfigs}
              </p>
            ) : configs.length ? (
              configs.map((config) => (
                <div
                  key={config.id}
                  className="rounded-2xl border border-white/10 bg-black/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {config.display_name || config.public_option_id || editor.newConfig}
                      </p>
                      <p className="mt-1 text-sm text-white/52">
                        {editor.publicOptionId}: {config.public_option_id ?? editor.none}
                      </p>
                      <p className="mt-1 text-sm text-white/52">
                        {editor.creditCostOverride}:{" "}
                        {config.credit_cost_override ?? editor.none}
                      </p>
                      <p className="mt-1 text-sm text-white/52">
                        {editor.primaryProvider}: {config.primary_provider}
                      </p>
                      <p className="mt-1 text-sm text-white/52">
                        {editor.fallbackProvider}:{" "}
                        {config.fallback_provider ? editor.yesConfigured : t.admin.common.no}
                      </p>
                      <p className="mt-1 text-sm text-white/52">
                        {editor.outputCount}: {config.output_count} · {editor.cleanupEnabled}:{" "}
                        {config.cleanup_enabled ? editor.yesConfigured : t.admin.common.no}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/58">
                        {config.is_active ? editor.active : editor.inactive}
                      </span>
                      {config.is_default ? (
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/58">
                          {editor.defaultConfig}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => editConfig(config)}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/70 disabled:opacity-50"
                      >
                        {t.admin.common.edit}
                      </button>
                      {!config.is_default ? (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void handleSetActive(config.id)}
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black disabled:opacity-50"
                        >
                          {editor.setActive}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/12 p-5 text-sm text-white/42">
                {editor.noModelConfigs}
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.publicOptionId}</span>
              <input
                className={inputClass}
                value={publicOptionId}
                onChange={(event) => setPublicOptionId(event.target.value)}
                placeholder="fast, premium"
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.displayName}</span>
              <input
                className={inputClass}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Fast"
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.primaryProvider}</span>
              <select
                className={inputClass}
                value={primaryProvider}
                onChange={(event) => setPrimaryProvider(event.target.value as "gemini" | "openai")}
              >
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.primaryModel}</span>
              <input
                className={inputClass}
                value={primaryModel}
                onChange={(event) => setPrimaryModel(event.target.value)}
                placeholder={editor.primaryModelPlaceholder}
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.fallbackProvider}</span>
              <select
                className={inputClass}
                value={fallbackProvider}
                onChange={(event) =>
                  setFallbackProvider(event.target.value as "" | "gemini" | "openai")
                }
              >
                <option value="">{editor.none}</option>
                <option value="gemini">Gemini</option>
                <option value="openai">OpenAI</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.fallbackModel}</span>
              <input
                className={inputClass}
                value={fallbackModel}
                onChange={(event) => setFallbackModel(event.target.value)}
                placeholder={editor.fallbackModelPlaceholder}
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.outputSize}</span>
              <input
                className={inputClass}
                value={outputSize}
                onChange={(event) => setOutputSize(event.target.value)}
                placeholder="1024x1024"
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.outputCount}</span>
              <input
                className={inputClass}
                value={outputCount}
                onChange={(event) => setOutputCount(Number(event.target.value))}
                type="number"
                min="1"
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.retryLimit}</span>
              <input
                className={inputClass}
                value={retryLimit}
                onChange={(event) => setRetryLimit(Number(event.target.value))}
                type="number"
                min="0"
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.estimatedCostMnt}</span>
              <input
                className={inputClass}
                value={estimatedCostMnt}
                onChange={(event) => setEstimatedCostMnt(event.target.value)}
                type="number"
                min="0"
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.creditCostOverride}</span>
              <input
                className={inputClass}
                value={creditCostOverride}
                onChange={(event) => setCreditCostOverride(event.target.value)}
                type="number"
                min="1"
              />
            </label>

            <label className="flex h-11 items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white/60">
              <span>{editor.cleanupEnabled}</span>
              <input
                type="checkbox"
                checked={cleanupEnabled}
                onChange={(event) => setCleanupEnabled(event.target.checked)}
                className="h-4 w-4 accent-white"
              />
            </label>

            <label className="flex h-11 items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white/60">
              <span>{editor.activeConfig}</span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 accent-white"
              />
            </label>

            <label className="flex h-11 items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white/60">
              <span>{editor.defaultConfig}</span>
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(event) => setIsDefault(event.target.checked)}
                className="h-4 w-4 accent-white"
              />
            </label>

          </div>
        </>
      )}

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
        <div className="flex gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 text-white/58" aria-hidden="true" />
          <p className="text-sm leading-6 text-white/58">{editor.apiKeyWarning}</p>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-white/70">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-white/70">{success}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!productDbId || saving}
          onClick={() => void handleSave()}
          className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:bg-white/16 disabled:text-white/42"
        >
          {saving ? editor.saving : editor.saveModelConfig}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={resetForm}
          className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:text-white disabled:opacity-50"
        >
          {editor.newConfig}
        </button>
      </div>
    </section>
  );
}
