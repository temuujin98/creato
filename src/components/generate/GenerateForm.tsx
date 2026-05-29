import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle, Clock, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../data/products";
import type { Language } from "../../i18n/translations";
import {
  createGenerationRecord,
  getGenerationStatus,
  markGenerationProcessing,
  markGenerationQueued,
  type GenerationStatus,
} from "../../lib/generations";
import { processGeneration } from "../../lib/processGeneration";
import {
  refundReservedCredits,
  reserveCredits,
  type Wallet,
} from "../../lib/wallet";
import { OptionField } from "./OptionField";
import {
  UploadDropzone,
  type UploadedInputFile,
} from "./UploadDropzone";

type GenerateFormLabels = {
  buyCredits: string;
  edgeFunctionCallFailed: string;
  clickToUpload: string;
  create: string;
  createFailed: string;
  creating: string;
  credit: string;
  creditRefundNotice: string;
  credits: string;
  dropzoneDescription: string;
  dropzoneTitle: string;
  failed: string;
  fileTooLarge: string;
  filesReady: string;
  generationCompleted: string;
  generationFailed: string;
  generationProgress: string;
  insufficientCredits: string;
  invalidFileType: string;
  loginRequired: string;
  maxFileSize: string;
  maximumImageRequirement: string;
  minimumImageRequirement: string;
  modelBackendMappingLater: string;
  modelOption: string;
  optionsTitle: string;
  productDbIdMissing: string;
  readyToCreate: string;
  realAiDisabled: string;
  remove: string;
  refundAttempted: string;
  required: string;
  requiredImages: string;
  requiredOptionsMissing: string;
  reserveFailed: string;
  providerRateLimit: string;
  providerFailureRefunded: string;
  processGenerationFailed: string;
  retryingStatus: string;
  safeErrorMessage: string;
  selected: string;
  selectModel: string;
  statusAddedToQueue: string;
  statusCompleted: string;
  statusCreditsRefunded: string;
  statusCreditReserved: string;
  statusFailed: string;
  statusPresetInputsSaved: string;
  statusProcessing: string;
  statusQueueFailed: string;
  signInToUpload: string;
  supportedFormats: string;
  textOnlyDescription: string;
  textOnlyTitle: string;
  tooManyFiles: string;
  uploadFailed: string;
  uploadHelper: string;
  uploadInProgress: string;
  uploadRequired: string;
  uploadSuccess: string;
  uploadTitle: string;
  uploaded: string;
  uploading: string;
};

type GenerateFormProps = {
  labels: GenerateFormLabels;
  language: Language;
  product: Product;
  selectedCreditCost: number;
  selectedModelOptionId: string | null;
  onModelOptionChange?: (modelOptionId: string) => void;
  onGenerationIdChange?: (generationId: string | null) => void;
  onWalletChange?: (wallet: Wallet) => void;
  onStatusChange?: (
    status: "idle" | "queued" | "processing" | "completed" | "failed",
  ) => void;
  userId?: string;
  wallet: Wallet | null;
  walletError?: string | null;
  walletLoading?: boolean;
};

export function GenerateForm({
  labels,
  language,
  onWalletChange,
  onGenerationIdChange,
  onStatusChange,
  product,
  selectedCreditCost,
  selectedModelOptionId,
  onModelOptionChange,
  userId,
  wallet,
  walletError,
  walletLoading,
}: GenerateFormProps) {
  const initialValues = useMemo(() => {
    return Object.fromEntries(
      (product.optionSchema ?? []).map((field) => [
        field.key,
        field.defaultValue ?? (field.type === "checkbox" ? false : ""),
      ]),
    );
  }, [product.optionSchema]);

  const [values, setValues] = useState<Record<string, string | number | boolean>>(
    initialValues,
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedInputFile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createdGenerationId, setCreatedGenerationId] = useState<string | null>(
    null,
  );
  const [createError, setCreateError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState({
    aiBackendCalled: false,
    completed: false,
    creditReserved: false,
    failed: false,
    processing: false,
    queueFailed: false,
    queued: false,
    recordCreated: false,
  });
  const mountedRef = useRef(true);

  function getSafeGenerationError(errorCode?: string | null, errorMessage?: string | null) {
    if (errorCode === "provider_rate_limit") {
      return `${labels.providerRateLimit} ${labels.providerFailureRefunded}`;
    }

    if (errorCode === "real_ai_disabled") {
      return labels.realAiDisabled;
    }

    if (errorMessage) {
      return `${errorMessage} ${labels.providerFailureRefunded}`;
    }

    return labels.processGenerationFailed;
  }

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const uploadedReadyFiles = uploadedFiles.filter(
    (file) => file.status === "uploaded" && file.storagePath,
  );
  const uploadedCount = uploadedReadyFiles.length;
  const uploadingCount = uploadedFiles.filter(
    (file) => file.status === "uploading",
  ).length;
  const failedCount = uploadedFiles.filter(
    (file) => file.status === "failed",
  ).length;
  const missingRequiredOptions = (product.optionSchema ?? []).filter((field) => {
    if (!field.required) return false;
    const value = values[field.key];

    if (typeof value === "boolean") return !value;
    if (typeof value === "number") return Number.isNaN(value);
    return !String(value ?? "").trim();
  });
  const hasRequiredUploads =
    !product.requiresImage ||
    (uploadedCount >= product.minImages && uploadedCount <= product.maxImages);
  const needsMoreImages =
    product.requiresImage && uploadedCount < product.minImages;
  const readyReason = (() => {
    if (!userId) return labels.loginRequired;
    if (!product.dbProductId) return labels.productDbIdMissing;
    if (walletLoading) return labels.uploading;
    if (walletError || !wallet) return labels.reserveFailed;
    if (wallet.balance < selectedCreditCost) return labels.insufficientCredits;
    if (uploadingCount > 0) return labels.uploadInProgress;
    if (!hasRequiredUploads) return labels.uploadRequired;
    if (missingRequiredOptions.length > 0) return labels.requiredOptionsMissing;
    return labels.readyToCreate;
  })();
  const canCreate =
    Boolean(userId) &&
    Boolean(product.dbProductId) &&
    Boolean(wallet) &&
    !walletError &&
    !walletLoading &&
    (wallet?.balance ?? 0) >= selectedCreditCost &&
    uploadingCount === 0 &&
    hasRequiredUploads &&
    missingRequiredOptions.length === 0 &&
    !createdGenerationId &&
    !isCreating;

  async function pollGenerationUntilTerminal(generationId: string) {
    const terminalStatuses = new Set<GenerationStatus>([
      "completed",
      "failed",
      "credit_spent",
      "credit_refunded",
      "canceled",
    ]);

    for (let attempt = 0; attempt < 24; attempt += 1) {
      const statusRecord = await getGenerationStatus(generationId);

      if (!mountedRef.current) return statusRecord;

      if (statusRecord.status === "completed" || statusRecord.status === "credit_spent") {
        setTimeline((current) => ({ ...current, completed: true }));
        onStatusChange?.("completed");
        return statusRecord;
      }

      if (
        statusRecord.status === "failed" ||
        statusRecord.status === "credit_refunded" ||
        statusRecord.status === "canceled"
      ) {
        setTimeline((current) => ({ ...current, failed: true }));
        onStatusChange?.("failed");
        return statusRecord;
      }

      if (statusRecord.status === "processing") {
        setTimeline((current) => ({ ...current, processing: true }));
        onStatusChange?.("processing");
      }

      if (statusRecord.status === "queued") {
        setTimeline((current) => ({ ...current, queued: true }));
        onStatusChange?.("queued");
      }

      if (terminalStatuses.has(statusRecord.status)) return statusRecord;
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    return null;
  }

  async function handleCreateGeneration() {
    if (!userId || !product.dbProductId || !wallet || !canCreate) return;

    setCreateError(null);
    setCreatedGenerationId(null);
    onGenerationIdChange?.(null);
    setTimeline({
      aiBackendCalled: false,
      completed: false,
      creditReserved: false,
      failed: false,
      processing: false,
      queueFailed: false,
      queued: false,
      recordCreated: false,
    });
    onStatusChange?.("idle");
    setIsCreating(true);
    const reserveKey = `reserve:${userId}:${product.dbProductId}:${crypto.randomUUID()}`;
    let didReserve = false;

    try {
      const reservedWallet = await reserveCredits({
        amount: selectedCreditCost,
        idempotencyKey: reserveKey,
        reason: `Reserve for ${product.slug}`,
        userId,
        walletId: wallet.id,
      });
      didReserve = true;
      onWalletChange?.(reservedWallet);
      setTimeline((current) => ({ ...current, creditReserved: true }));

      const result = await createGenerationRecord({
        // TODO: Backend validates model_option against model_configs.public_option_id and trusted credit cost.
        creditCost: selectedCreditCost,
        optionValues: selectedModelOptionId
          ? { ...values, model_option: selectedModelOptionId }
          : values,
        productId: product.dbProductId,
        uploadedFiles: uploadedReadyFiles.map((item) => ({
          fileName: item.file.name,
          mimeType: item.file.type,
          size: item.file.size,
          storagePath: item.storagePath!,
        })),
        userId,
      });
      setCreatedGenerationId(result.generationId);
      onGenerationIdChange?.(result.generationId);
      setTimeline((current) => ({ ...current, recordCreated: true }));

      let didCallEdgeFunction = false;

      try {
        await markGenerationQueued(result.generationId, userId);
        setTimeline((current) => ({ ...current, queued: true }));
        onStatusChange?.("queued");
        await new Promise((resolve) => setTimeout(resolve, 450));
        await markGenerationProcessing(result.generationId, userId);
        setTimeline((current) => ({ ...current, processing: true }));
        onStatusChange?.("processing");

        didCallEdgeFunction = true;
        setTimeline((current) => ({ ...current, aiBackendCalled: true }));
        const processResponse = await processGeneration(result.generationId);

        const terminalStatus = await pollGenerationUntilTerminal(result.generationId);

        if (processResponse.ok || terminalStatus?.status === "completed") {
          setTimeline((current) => ({ ...current, completed: true }));
          onStatusChange?.("completed");
        } else if (
          terminalStatus?.status === "failed" ||
          terminalStatus?.status === "credit_refunded" ||
          terminalStatus?.status === "canceled"
        ) {
          setTimeline((current) => ({ ...current, failed: true }));
          onStatusChange?.("failed");
          setCreateError(
            getSafeGenerationError(
              terminalStatus.error_code,
              terminalStatus.error_message,
            ),
          );
        } else if (!processResponse.ok) {
          setCreateError(
            processResponse.status === "real_ai_disabled" ||
              processResponse.error === "real_ai_disabled"
              ? labels.realAiDisabled
              : processResponse.error === "provider_rate_limit"
                ? `${labels.providerRateLimit} ${labels.providerFailureRefunded}`
                : processResponse.message || labels.processGenerationFailed,
          );
        }
      } catch {
        setTimeline((current) => ({
          ...current,
          failed: didCallEdgeFunction,
          queueFailed: !didCallEdgeFunction,
        }));
        onStatusChange?.("failed");
        setCreateError(
          didCallEdgeFunction
            ? labels.edgeFunctionCallFailed
            : labels.statusQueueFailed,
        );
      }
    } catch {
      if (didReserve) {
        try {
          const refundedWallet = await refundReservedCredits({
            amount: selectedCreditCost,
            idempotencyKey: `refund:${userId}:${product.dbProductId}:${crypto.randomUUID()}`,
            reason: `Refund reserve for failed record creation: ${product.slug}`,
            userId,
            walletId: wallet.id,
          });
          onWalletChange?.(refundedWallet);
          setCreateError(labels.refundAttempted);
        } catch {
          setCreateError(labels.createFailed);
        }
      } else {
        setCreateError(labels.reserveFailed);
      }
    } finally {
      setIsCreating(false);
    }
  }

  const showLoginAction = !userId;
  const showBuyCreditsAction =
    Boolean(userId) &&
    wallet !== null &&
    !walletError &&
    wallet.balance < selectedCreditCost;
  const progressMessage = (() => {
    if (createError) return createError;
    if (timeline.completed) return labels.generationCompleted;
    if (timeline.failed || timeline.queueFailed) return labels.generationFailed;
    if (timeline.processing) return labels.statusProcessing;
    if (timeline.queued) return labels.statusAddedToQueue;
    if (timeline.recordCreated) return labels.statusPresetInputsSaved;
    if (timeline.creditReserved) return labels.statusCreditReserved;
    return readyReason;
  })();

  return (
    <>
      <UploadDropzone
        files={uploadedFiles}
        labels={labels}
        onFilesChange={setUploadedFiles}
        product={product}
        userId={userId}
      />

      {needsMoreImages ? (
        <p className="rounded-2xl border border-white/10 bg-neutral-950 p-4 text-sm text-white/58">
          {labels.minimumImageRequirement}: {product.minImages}
        </p>
      ) : null}

      {failedCount > 0 && hasRequiredUploads ? (
        <p className="rounded-2xl border border-white/10 bg-neutral-950 p-4 text-sm text-white/46">
          {labels.uploadFailed}
        </p>
      ) : null}

      {product.modelOptions && product.modelOptions.length > 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-white">
                {labels.modelOption}
              </p>
              <p className="mt-2 text-sm text-white/48">{labels.selectModel}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {product.modelOptions.map((option) => {
              const isSelected = option.id === selectedModelOptionId;

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/35"
                        : "border-white/10 bg-black/30 hover:border-white/25 hover:bg-white/[0.05]"
                  }`}
                  onClick={() => onModelOptionChange?.(option.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">
                      {option.name[language]}
                    </p>
                    {option.badge ? (
                        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary-300">
                        {option.badge[language]}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/54">
                    {option.description[language]}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-white/80">
                    {option.creditCost}{" "}
                    {option.creditCost === 1 ? labels.credit : labels.credits}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-white/34">
            {labels.modelBackendMappingLater}
          </p>
        </section>
      ) : null}

      {product.optionSchema && product.optionSchema.length > 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6">
          <p className="text-lg font-semibold text-white">{labels.optionsTitle}</p>
          <div className="mt-5 grid gap-4">
            {product.optionSchema.map((field) => (
              <OptionField
                key={field.key}
                field={field}
                language={language}
                requiredLabel={labels.required}
                value={values[field.key] ?? ""}
                onChange={(value) =>
                  setValues((current) => ({ ...current, [field.key]: value }))
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6">
        <p className="text-lg font-semibold text-white">
          {labels.generationProgress}
        </p>
        <p className="mt-3 text-sm leading-6 text-white/58">{progressMessage}</p>

        {showLoginAction ? (
          <Link
            to="/login"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary/45 hover:bg-primary/10"
          >
            {labels.loginRequired}
          </Link>
        ) : null}

        {showBuyCreditsAction ? (
          <Link
            to="/pricing"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary-200 transition hover:bg-primary/15"
          >
            {labels.buyCredits}
          </Link>
        ) : null}

        <button
          type="button"
          disabled={!canCreate}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/38"
          onClick={handleCreateGeneration}
        >
          {isCreating ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isCreating ? labels.creating : labels.create}
        </button>

        {createError ? (
          <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
            {createError}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3">
          <TimelineItem complete={timeline.creditReserved} label={labels.statusCreditReserved} />
          <TimelineItem complete={timeline.recordCreated} label={labels.statusPresetInputsSaved} />
          <TimelineItem complete={timeline.queued} label={labels.statusAddedToQueue} />
          <TimelineItem
            complete={timeline.processing}
            icon="loader"
            label={labels.statusProcessing}
          />
          <TimelineItem
            complete={timeline.completed}
            icon={
              timeline.queueFailed || timeline.failed
                ? "alert"
                : timeline.completed
                  ? undefined
                  : "clock"
            }
            label={
              timeline.queueFailed
                ? labels.statusQueueFailed
                : timeline.failed
                  ? labels.statusCreditsRefunded
                  : timeline.completed
                    ? labels.statusCompleted
                    : labels.statusFailed
            }
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-white/42">
          {labels.creditRefundNotice}
        </p>
      </section>
    </>
  );
}

function TimelineItem({
  complete,
  icon,
  label,
}: {
  complete: boolean;
  icon?: "alert" | "clock" | "loader";
  label: string;
}) {
  const Icon = (() => {
    if (complete) return CheckCircle;
    if (icon === "alert") return AlertCircle;
    if (icon === "loader") return LoaderCircle;
    return Clock;
  })();

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm">
      <Icon
        className={`h-4 w-4 ${
          complete ? "text-primary-300" : "text-white/42"
        } ${icon === "loader" && !complete ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      <span className={complete ? "text-white" : "text-white/48"}>{label}</span>
    </div>
  );
}
