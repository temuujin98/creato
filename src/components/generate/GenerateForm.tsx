import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Clock, LoaderCircle } from "lucide-react";
import type { Product } from "../../data/products";
import type { Language } from "../../i18n/translations";
import {
  createGenerationRecord,
  markGenerationProcessing,
  markGenerationQueued,
} from "../../lib/generations";
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
  aiGenerationNextPhase: string;
  clickToUpload: string;
  createFailed: string;
  createGenerationRecord: string;
  dropzoneDescription: string;
  dropzoneTitle: string;
  failed: string;
  fileTooLarge: string;
  filesReady: string;
  generationId: string;
  generationRecordCreated: string;
  generationPending: string;
  insufficientCredits: string;
  invalidFileType: string;
  loginRequired: string;
  maxFileSize: string;
  maximumImageRequirement: string;
  minimumImageRequirement: string;
  noAiGenerationNotice: string;
  noCreditDeductedNotice: string;
  optionsTitle: string;
  productDbIdMissing: string;
  readyToCreate: string;
  recordCreatedAfterReserve: string;
  remove: string;
  refundAttempted: string;
  required: string;
  requiredImages: string;
  requiredOptionsMissing: string;
  reserveAndCreate: string;
  reserveFailed: string;
  reserveSuccess: string;
  selected: string;
  statusAddedToQueue: string;
  statusAiBackendPending: string;
  statusCreditReserved: string;
  statusMovedToProcessing: string;
  statusProcessingPlaceholder: string;
  statusQueueFailed: string;
  statusRecordCreated: string;
  spendLaterNotice: string;
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
  onWalletChange?: (wallet: Wallet) => void;
  onStatusChange?: (status: "idle" | "queued" | "processing") => void;
  userId?: string;
  wallet: Wallet | null;
  walletError?: string | null;
  walletLoading?: boolean;
};

export function GenerateForm({
  labels,
  language,
  onWalletChange,
  onStatusChange,
  product,
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
    creditReserved: false,
    processing: false,
    queueFailed: false,
    queued: false,
    recordCreated: false,
  });

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
    if (wallet.balance < product.creditCost) return labels.insufficientCredits;
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
    (wallet?.balance ?? 0) >= product.creditCost &&
    uploadingCount === 0 &&
    hasRequiredUploads &&
    missingRequiredOptions.length === 0 &&
    !isCreating;

  async function handleCreateGeneration() {
    if (!userId || !product.dbProductId || !wallet || !canCreate) return;

    setCreateError(null);
    setCreatedGenerationId(null);
    setTimeline({
      creditReserved: false,
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
        amount: product.creditCost,
        idempotencyKey: reserveKey,
        reason: `Reserve for ${product.slug}`,
        userId,
        walletId: wallet.id,
      });
      didReserve = true;
      onWalletChange?.(reservedWallet);
      setTimeline((current) => ({ ...current, creditReserved: true }));

      const result = await createGenerationRecord({
        creditCost: product.creditCost,
        optionValues: values,
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
      setTimeline((current) => ({ ...current, recordCreated: true }));

      try {
        await markGenerationQueued(result.generationId, userId);
        setTimeline((current) => ({ ...current, queued: true }));
        onStatusChange?.("queued");
        await new Promise((resolve) => setTimeout(resolve, 450));
        await markGenerationProcessing(result.generationId, userId);
        setTimeline((current) => ({ ...current, processing: true }));
        onStatusChange?.("processing");
      } catch {
        setTimeline((current) => ({ ...current, queueFailed: true }));
        setCreateError(labels.statusQueueFailed);
      }
    } catch {
      if (didReserve) {
        try {
          const refundedWallet = await refundReservedCredits({
            amount: product.creditCost,
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
        <p className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/58">
          {labels.minimumImageRequirement}: {product.minImages}
        </p>
      ) : null}

      {failedCount > 0 && hasRequiredUploads ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/46">
          {labels.uploadFailed}
        </p>
      ) : null}

      {product.optionSchema && product.optionSchema.length > 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6">
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

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6">
        <p className="text-lg font-semibold text-white">
          {labels.createGenerationRecord}
        </p>
        <p className="mt-3 text-sm leading-6 text-white/52">{readyReason}</p>
        <div className="mt-4 grid gap-2 text-sm text-white/42">
          <p>{labels.noAiGenerationNotice}</p>
          <p>{labels.noCreditDeductedNotice}</p>
          <p>{labels.spendLaterNotice}</p>
        </div>
        <button
          type="button"
          disabled={!canCreate}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/18 disabled:text-white/42"
          onClick={handleCreateGeneration}
        >
          {isCreating ? labels.uploading : labels.reserveAndCreate}
        </button>

        {createdGenerationId ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="font-semibold text-white">
              {labels.recordCreatedAfterReserve}
            </p>
            <p className="mt-2 font-mono text-xs text-white/54">
              {labels.generationId}: {createdGenerationId}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/48">
              {labels.aiGenerationNextPhase}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/48">
              {labels.reserveSuccess}
            </p>
          </div>
        ) : null}

        {createError ? (
          <p className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/68">
            {createError}
          </p>
        ) : null}
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6">
        <p className="text-lg font-semibold text-white">{labels.generationPending}</p>
        <div className="mt-5 grid gap-3">
          <TimelineItem complete={timeline.creditReserved} label={labels.statusCreditReserved} />
          <TimelineItem complete={timeline.recordCreated} label={labels.statusRecordCreated} />
          <TimelineItem complete={timeline.queued} label={labels.statusAddedToQueue} />
          <TimelineItem
            complete={timeline.processing}
            icon="loader"
            label={labels.statusMovedToProcessing}
          />
          <TimelineItem
            complete={false}
            icon={timeline.queueFailed ? "alert" : "clock"}
            label={
              timeline.queueFailed
                ? labels.statusQueueFailed
                : labels.statusAiBackendPending
            }
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-white/42">
          {labels.statusProcessingPlaceholder}
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
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm">
      <Icon
        className={`h-4 w-4 ${
          complete ? "text-white" : "text-white/42"
        } ${icon === "loader" && !complete ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      <span className={complete ? "text-white" : "text-white/48"}>{label}</span>
    </div>
  );
}
