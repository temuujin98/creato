import {
  CheckCircle2,
  Cpu,
  Images,
  Loader2,
  RefreshCw,
  Star,
  Video,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminMetricCard } from "../../../components/admin/AdminMetricCard";
import { AdminNotice } from "../../../components/admin/AdminNotice";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { AdminTable } from "../../../components/admin/AdminTable";
import { useLanguage } from "../../../hooks/useLanguage";
import type { AiModelRegistry, ModelConnectionStatus, ModelModality, ModelStatus } from "../../../lib/modelRegistry";
import {
  listAdminModelConfigs,
  setDefaultModelConfig,
  setModelConfigActive,
} from "../../../lib/modelRegistry";
import { formatCurrency } from "../../../lib/format";
import { AdminModelConfigModal } from "./AdminModelConfigModal";

// ─── Small badge helpers ──────────────────────────────────────────────────────

function ModalityBadge({ modality, labels }: {
  modality: ModelModality;
  labels: { image: string; video: string; text: string; multimodal: string };
}) {
  const map: Record<ModelModality, { color: string; label: string }> = {
    image:      { color: "border-blue-400/20 bg-blue-400/10 text-blue-200",       label: labels.image },
    video:      { color: "border-purple-400/20 bg-purple-400/10 text-purple-200", label: labels.video },
    text:       { color: "border-green-400/20 bg-green-400/10 text-green-200",    label: labels.text },
    multimodal: { color: "border-amber-400/20 bg-amber-400/10 text-amber-200",    label: labels.multimodal },
  };
  const { color, label } = map[modality] ?? { color: "border-white/10 bg-white/[0.04] text-white/50", label: modality };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${color}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status, labels }: {
  status: ModelStatus;
  labels: { statusActive: string; statusInactive: string; statusTesting: string; statusDeprecated: string };
}) {
  const map: Record<ModelStatus, { color: string; label: string }> = {
    active:     { color: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",   label: labels.statusActive },
    inactive:   { color: "border-white/10 bg-white/[0.04] text-white/42",              label: labels.statusInactive },
    testing:    { color: "border-amber-400/20 bg-amber-400/10 text-amber-200",         label: labels.statusTesting },
    deprecated: { color: "border-red-400/20 bg-red-400/10 text-red-200/80",            label: labels.statusDeprecated },
  };
  const { color, label } = map[status] ?? { color: "border-white/10 bg-white/[0.04] text-white/50", label: status };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${color}`}>
      {label}
    </span>
  );
}

function ConnectionBadge({ conn, labels }: {
  conn: ModelConnectionStatus;
  labels: { connStatusConnected: string; connStatusNotConfigured: string; connStatusError: string; connStatusUnknown: string };
}) {
  const map: Record<ModelConnectionStatus, { color: string; label: string }> = {
    connected:      { color: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200", label: labels.connStatusConnected },
    not_configured: { color: "border-white/10 bg-white/[0.04] text-white/38",            label: labels.connStatusNotConfigured },
    error:          { color: "border-red-400/20 bg-red-400/10 text-red-200",              label: labels.connStatusError },
    unknown:        { color: "border-white/10 bg-white/[0.04] text-white/38",            label: labels.connStatusUnknown },
  };
  const { color, label } = map[conn] ?? { color: "border-white/10 bg-white/[0.04] text-white/50", label: conn };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${color}`}>
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminModelSettingsPage() {
  const { t } = useLanguage();
  const m = t.admin.models;

  const [models,      setModels]      = useState<AiModelRegistry[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [modalTarget, setModalTarget] = useState<AiModelRegistry | null | "create">(null);
  const [busyId,      setBusyId]      = useState<string | null>(null);
  const [feedback,    setFeedback]    = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4500);
    return () => clearTimeout(timer);
  }, [feedback]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setModels(await listAdminModelConfigs());
    } catch {
      setError(m.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleToggleActive(model: AiModelRegistry) {
    setBusyId(model.id);
    try {
      await setModelConfigActive(model.id, !model.isActive);
      setModels((prev) =>
        prev.map((md) => md.id === model.id ? { ...md, isActive: !model.isActive } : md),
      );
      setFeedback({ type: "success", message: model.isActive ? m.modelDisabled : m.modelActivated });
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : m.saveError });
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetDefault(model: AiModelRegistry) {
    setBusyId(model.id);
    try {
      await setDefaultModelConfig(model.id, model.modality);
      setModels((prev) =>
        prev.map((md) =>
          md.modality === model.modality
            ? { ...md, isDefault: md.id === model.id }
            : md,
        ),
      );
      setFeedback({ type: "success", message: m.defaultSet });
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : m.saveError });
    } finally {
      setBusyId(null);
    }
  }

  function handleSaved(saved: AiModelRegistry) {
    setModels((prev) => {
      const idx = prev.findIndex((md) => md.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      return [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder);
    });
    const isEdit = typeof modalTarget !== "string" && modalTarget !== null;
    setFeedback({ type: "success", message: isEdit ? m.modelUpdated : m.modelSaved });
    setModalTarget(null);
  }

  // Summary
  const active    = models.filter((md) => md.isActive);
  const images    = models.filter((md) => md.modality === "image" && md.isActive);
  const videos    = models.filter((md) => md.modality === "video");
  const premiums  = models.filter((md) => md.isPremium && md.isActive);
  const connected = models.filter((md) => md.connectionStatus === "connected");

  const summaryCards = [
    { label: m.total,          value: models.length,    icon: <Cpu className="h-5 w-5" /> },
    { label: m.activeModels,   value: active.length,    icon: <CheckCircle2 className="h-5 w-5" /> },
    { label: m.imageModels,    value: images.length,    icon: <Images className="h-5 w-5" /> },
    { label: m.videoModels,    value: videos.length,    icon: <Video className="h-5 w-5" /> },
    { label: m.premiumModels,  value: premiums.length,  icon: <Star className="h-5 w-5" /> },
    { label: m.connectedModels, value: connected.length, icon: <Zap className="h-5 w-5" /> },
  ];

  const tableHeaders = [
    m.model, m.type, m.statusSection, m.connection,
    m.default, m.premium, m.costEstimate, m.outputSettings,
    t.admin.common.active, t.admin.common.actions,
  ];

  const badgeLabels = {
    image:      m.image,
    video:      m.video,
    text:       m.text,
    multimodal: m.multimodal,
  };
  const statusLabels = {
    statusActive:     m.statusActive,
    statusInactive:   m.statusInactive,
    statusTesting:    m.statusTesting,
    statusDeprecated: m.statusDeprecated,
  };
  const connLabels = {
    connStatusConnected:      m.connStatusConnected,
    connStatusNotConfigured:  m.connStatusNotConfigured,
    connStatusError:          m.connStatusError,
    connStatusUnknown:        m.connStatusUnknown,
  };

  const rows = models.map((md) => {
    const isBusy = busyId === md.id;

    const costLine = md.costPerGenerationMnt != null
      ? formatCurrency(md.costPerGenerationMnt)
      : (md.estimatedCostNote ?? "—");

    const outputLine = `${md.defaultOutputCount}/${md.maxOutputs}`;

    return [
      // Model name + key
      <div>
        <p className="font-semibold text-white/86">{md.displayName}</p>
        <p className="font-mono text-xs text-white/38">{md.provider} / {md.modelKey}</p>
      </div>,
      <ModalityBadge modality={md.modality} labels={badgeLabels} />,
      <StatusBadge   status={md.status}     labels={statusLabels} />,
      <ConnectionBadge conn={md.connectionStatus} labels={connLabels} />,
      md.isDefault
        ? <Star className="h-4 w-4 text-amber-400" aria-label="Default" />
        : <span className="text-white/25">—</span>,
      md.isPremium
        ? <span className="text-[10px] font-bold uppercase tracking-wide text-amber-300">PRO</span>
        : <span className="text-white/25">—</span>,
      <span className="text-xs text-white/60">{costLine}</span>,
      <span className="font-mono text-xs text-white/50">{outputLine}</span>,
      md.isActive
        ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        : <XCircle className="h-4 w-4 text-white/28" />,
      // Actions
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 transition hover:border-white/20 hover:text-white"
          onClick={() => setModalTarget(md)}
        >
          {t.admin.common.edit}
        </button>
        {!md.isDefault && md.isActive && (
          <button
            type="button"
            disabled={isBusy}
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/60 transition hover:border-amber-400/30 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => handleSetDefault(md)}
          >
            {m.setAsDefault}
          </button>
        )}
        <button
          type="button"
          disabled={isBusy}
          className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition ${
            isBusy
              ? "border-white/[0.06] cursor-not-allowed text-white/25"
              : md.isActive
                ? "border-white/10 text-white/60 hover:border-red-400/25 hover:text-red-300"
                : "border-white/10 text-white/60 hover:border-emerald-400/25 hover:text-emerald-300"
          }`}
          onClick={() => handleToggleActive(md)}
        >
          {isBusy && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
          {md.isActive ? t.admin.credits.deactivate : t.admin.credits.activate}
        </button>
      </div>,
    ];
  });

  const modalLabels = {
    active:                t.admin.common.active,
    basicInfo:             m.basicInfo,
    cancel:                m.cancel,
    capabilities:          m.capabilities,
    connStatusConnected:   m.connStatusConnected,
    connStatusError:       m.connStatusError,
    connStatusNotConfigured: m.connStatusNotConfigured,
    connStatusUnknown:     m.connStatusUnknown,
    connectionStatus:      m.connectionStatus,
    connectionStatusNote:  m.connectionStatusNote,
    costEstimate:          m.costEstimate,
    costPerGeneration:     m.costPerGeneration,
    costPerInputImage:     m.costPerInputImage,
    costPerOutput:         m.costPerOutput,
    costSection:           m.costSection,
    createModel:           m.createModel,
    defaultAspectRatio:    m.defaultAspectRatio,
    defaultOutputCount:    m.defaultOutputCount,
    defaultOutputSize:     m.defaultOutputSize,
    displayName:           m.displayName,
    editModel:             m.editModel,
    estimatedCostNote:     m.estimatedCostNote,
    fieldDescription:      m.fieldDescription,
    image:                 m.image,
    isDefault:             m.isDefault,
    isPremium:             m.isPremium,
    livePreview:           m.livePreview,
    maxOutputs:            m.maxOutputs,
    modelKey:              m.modelKey,
    modality:              m.modality,
    multimodal:            m.multimodal,
    outputSection:         m.outputSection,
    provider:              m.provider,
    saveChanges:           t.admin.common.saveChanges,
    saveError:             m.saveError,
    sortOrder:             m.sortOrder,
    statusActive:          m.statusActive,
    statusDeprecated:      m.statusDeprecated,
    statusInactive:        m.statusInactive,
    statusSection:         m.statusSection,
    statusTesting:         m.statusTesting,
    supportsAspectRatio:   m.supportsAspectRatio,
    supportsImageInput:    m.supportsImageInput,
    supportsMultipleOutputs: m.supportsMultipleOutputs,
    supportsTextPrompt:    m.supportsTextPrompt,
    text:                  m.text,
    video:                 m.video,
  };

  const isModalOpen = modalTarget !== null;
  const editTarget  = modalTarget === "create" ? null : modalTarget;

  return (
    <div>
      <AdminPageHeader
        title={m.title}
        description={m.description}
        action={
          <button
            type="button"
            onClick={() => setModalTarget("create")}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/[0.1] hover:text-white"
          >
            <Cpu className="h-4 w-4" aria-hidden="true" />
            {m.createModel}
          </button>
        }
      />

      {/* Summary cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <AdminMetricCard key={card.label} {...card} />
        ))}
      </div>

      {/* Table */}
      <div className="mt-8">
        {loading && (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-white/40" aria-hidden="true" />
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-sm text-white/60">{error}</p>
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {m.retryLoad}
            </button>
          </div>
        )}
        {!loading && !error && models.length === 0 && (
          <div className="grid place-items-center py-16">
            <p className="text-sm text-white/42">{m.empty}</p>
          </div>
        )}
        {!loading && !error && models.length > 0 && (
          <AdminTable headers={tableHeaders} rows={rows} />
        )}
      </div>

      {/* Connection status note */}
      {!loading && !error && (
        <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.025] px-4 py-3 text-xs text-white/46">
          {m.connectionStatusNote}
        </div>
      )}

      <div className="mt-6">
        <AdminNotice>
          {"API keys must not be stored in the database. Use environment variables only."}
        </AdminNotice>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`fixed bottom-6 right-6 z-[900] flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-medium shadow-2xl shadow-black/60 ${
          feedback.type === "success"
            ? "border-emerald-400/25 bg-emerald-900/80 text-emerald-200"
            : "border-red-400/25 bg-red-900/80 text-red-200"
        }`}>
          {feedback.message}
          <button type="button" className="ml-1 text-white/40 hover:text-white" onClick={() => setFeedback(null)}>×</button>
        </div>
      )}

      {/* Create/Edit modal */}
      {isModalOpen && (
        <AdminModelConfigModal
          target={editTarget}
          labels={modalLabels}
          onClose={() => setModalTarget(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
