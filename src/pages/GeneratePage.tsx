import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CreditSummary } from "../components/generate/CreditSummary";
import { GenerateForm } from "../components/generate/GenerateForm";
import { OutputPreview } from "../components/generate/OutputPreview";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { categories } from "../data/categories";
import { getProductBySlug } from "../data/products";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import type { PublicAllowedModel } from "../lib/productAllowedModels";
import { listPublicProductAllowedModels } from "../lib/productAllowedModels";
import { getOrCreateWallet, type Wallet } from "../lib/wallet";

export function GeneratePage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<
    "idle" | "queued" | "processing" | "completed" | "failed"
  >("idle");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [selectedModelOptionId, setSelectedModelOptionId] = useState<
    string | null
  >(null);
  // Phase 27: DB-backed allowed models (loaded from product_allowed_models table)
  const [allowedDbModels, setAllowedDbModels] = useState<PublicAllowedModel[]>([]);
  const [selectedModelConfigId, setSelectedModelConfigId] = useState<string | null>(null);
  const { productSlug } = useParams();
  const { language, t } = useLanguage();
  const product = productSlug ? getProductBySlug(productSlug) : undefined;
  const category = product
    ? categories.find((item) => item.slug === product.categorySlug)
    : undefined;
  const defaultModelOptionId = useMemo(() => {
    if (!product?.modelOptions?.length) return null;
    return (
      product.modelOptions.find((option) => option.isDefault)?.id ??
      product.modelOptions[0].id
    );
  }, [product]);
  const selectedModelOption =
    product?.modelOptions?.find((option) => option.id === selectedModelOptionId) ??
    product?.modelOptions?.find((option) => option.id === defaultModelOptionId);

  // Effective credit cost: DB model override > DB model null (product default) > static model option > product default
  const selectedCreditCost = useMemo(() => {
    if (allowedDbModels.length > 0 && selectedModelConfigId) {
      const dbModel = allowedDbModels.find((m) => m.modelConfigId === selectedModelConfigId);
      // effectiveCreditCost is null means use product.creditCost
      return dbModel?.effectiveCreditCost ?? product?.creditCost ?? 0;
    }
    return selectedModelOption?.creditCost ?? product?.creditCost ?? 0;
  }, [allowedDbModels, selectedModelConfigId, selectedModelOption, product?.creditCost]);

  useEffect(() => {
    setSelectedModelOptionId(defaultModelOptionId);
  }, [defaultModelOptionId]);

  // Phase 27: load DB allowed models when product has a dbProductId
  useEffect(() => {
    if (!product?.dbProductId) return;
    listPublicProductAllowedModels(product.dbProductId)
      .then((models) => {
        if (!models.length) return;
        setAllowedDbModels(models);
        const defaultModel = models.find((m) => m.isDefault) ?? models[0];
        setSelectedModelConfigId(defaultModel?.modelConfigId ?? null);
      })
      .catch(() => {
        // On error, keep using static product.modelOptions (existing behavior)
      });
  }, [product?.dbProductId]);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setWallet(null);
      setWalletError(null);
      setWalletLoading(false);
      return undefined;
    }

    setWalletLoading(true);
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
      })
      .finally(() => {
        if (isMounted) {
          setWalletLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!product) {
    return (
      <div className="min-h-screen bg-ink text-white">
        <Navbar />
        <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <section className="mx-auto max-w-3xl rounded-[1.75rem] border border-white/10 bg-neutral-950 p-8 text-center">
            <p className="text-3xl font-semibold">{t.generate.notFoundTitle}</p>
            <p className="mt-4 text-white/58">{t.generate.notFoundDescription}</p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t.generate.backToProducts}
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <main className="px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-white/44">
            <Link to="/products" className="transition hover:text-white">
              {t.generate.breadcrumbProducts}
            </Link>
            <span>/</span>
            <Link
              to={`/products/${product.slug}`}
              className="transition hover:text-white"
            >
              {product.name[language]}
            </Link>
            <span>/</span>
            <span className="text-white/70">{t.generate.breadcrumbGenerate}</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase text-white/44">
                {category?.name[language] ?? product.categorySlug}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                {product.name[language]}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/62">
                {product.shortDescription[language]}
              </p>

              <div className="mt-10 grid gap-5">
                <GenerateForm
                  allowedDbModels={allowedDbModels}
                  language={language}
                  noAllowedModelsLabel={t.generate.noAllowedModels}
                  product={product}
                  selectedCreditCost={selectedCreditCost}
                  selectedModelConfigId={selectedModelConfigId}
                  selectedModelOptionId={selectedModelOption?.id ?? null}
                  userId={user?.id}
                  labels={{
                    buyCredits: t.nav.buyCredits,
                    edgeFunctionCallFailed: t.generate.edgeFunctionCallFailed,
                    clickToUpload: t.generate.clickToUpload,
                    create: t.generate.create,
                    createFailed: t.generate.createFailed,
                    creating: t.generate.creating,
                    credit: t.productsPage.credit,
                    creditRefundNotice: t.generate.creditRefundNotice,
                    credits: t.productsPage.credits,
                    dropzoneDescription: t.generate.dropzoneDescription,
                    dropzoneTitle: t.generate.dropzoneTitle,
                    failed: t.generate.failed,
                    fileTooLarge: t.generate.fileTooLarge,
                    filesReady: t.generate.filesReady,
                    generationCompleted: t.generate.generationCompleted,
                    generationFailed: t.generate.generationFailed,
                    generationProgress: t.generate.generationProgress,
                    insufficientCredits: t.generate.insufficientCredits,
                    invalidFileType: t.generate.invalidFileType,
                    loginRequired: t.generate.loginRequired,
                    maxFileSize: t.generate.maxFileSize,
                    maximumImageRequirement: t.generate.maximumImageRequirement,
                    minimumImageRequirement: t.generate.minimumImageRequirement,
                    modelBackendMappingLater: t.generate.modelBackendMappingLater,
                    modelInactive: t.generate.modelInactive,
                    modelNotAllowed: t.generate.modelNotAllowed,
                    modelNotConfigured: t.generate.modelNotConfigured,
                    modelOption: t.generate.modelOption,
                    providerNotConfigured: t.generate.providerNotConfigured,
                    unsupportedModelModality: t.generate.unsupportedModelModality,
                    optionsTitle: t.generate.optionsTitle,
                    productDbIdMissing: t.generate.productDbIdMissing,
                    readyToCreate: t.generate.readyToCreate,
                    realAiDisabled: t.generate.realAiDisabled,
                    remove: t.generate.remove,
                    refundAttempted: t.generate.refundAttempted,
                    required: t.generate.required,
                    requiredOptionsMissing: t.generate.requiredOptionsMissing,
                    requiredImages: t.generate.requiredImages,
                    reserveFailed: t.generate.reserveFailed,
                    providerRateLimit: t.generate.providerRateLimit,
                    providerFailureRefunded: t.generate.providerFailureRefunded,
                    processGenerationFailed: t.generate.processGenerationFailed,
                    retryingStatus: t.generate.retryingStatus,
                    safeErrorMessage: t.generate.safeErrorMessage,
                    selected: t.generate.selected,
                    selectModel: t.generate.selectModel,
                    statusAddedToQueue: t.generate.statusAddedToQueue,
                    statusCompleted: t.generate.statusCompleted,
                    statusCreditsRefunded: t.generate.statusCreditsRefunded,
                    statusCreditReserved: t.generate.statusCreditReserved,
                    statusFailed: t.generate.statusFailed,
                    statusPresetInputsSaved: t.generate.statusPresetInputsSaved,
                    statusProcessing: t.generate.statusProcessing,
                    statusQueueFailed: t.generate.statusQueueFailed,
                    signInToUpload: t.generate.signInToUpload,
                    supportedFormats: t.generate.supportedFormats,
                    textOnlyDescription: t.generate.textOnlyDescription,
                    textOnlyTitle: t.generate.textOnlyTitle,
                    tooManyFiles: t.generate.tooManyFiles,
                    uploadFailed: t.generate.uploadFailed,
                    uploadHelper: t.generate.uploadHelper,
                    uploadInProgress: t.generate.uploadInProgress,
                    uploadRequired: t.generate.uploadRequired,
                    uploadSuccess: t.generate.uploadSuccess,
                    uploadTitle: t.generate.uploadTitle,
                    uploaded: t.generate.uploaded,
                    uploading: t.generate.uploading,
                  }}
                  wallet={wallet}
                  walletError={walletError}
                  walletLoading={walletLoading}
                  onGenerationIdChange={setGenerationId}
                  onModelConfigChange={setSelectedModelConfigId}
                  onModelOptionChange={setSelectedModelOptionId}
                  onWalletChange={setWallet}
                  onStatusChange={setGenerationStatus}
                />
              </div>
            </div>

            <aside className="grid gap-5 lg:sticky lg:top-28">
              <section className="rounded-[1.75rem] border border-white/10 bg-neutral-950 p-6">
                <p className="text-lg font-semibold text-white">{t.generate.summary}</p>
                <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/34">
                  <img
                    src={product.imageUrl}
                    alt={product.name[language]}
                    className="aspect-[4/3] w-full object-cover opacity-90"
                  />
                </div>
                <p className="mt-4 text-sm leading-6 text-white/58">
                  {product.description[language]}
                </p>
              </section>

              <CreditSummary
                creditCost={selectedCreditCost}
                labels={{
                  creditCost: t.generate.creditCost,
                  creditNotice: t.generate.creditNotice,
                  creditSummary: t.generate.creditSummary,
                  afterReserve: t.generate.afterReserve,
                  availableCredits: t.generate.availableCredits,
                  insufficientCredits: t.generate.insufficientCredits,
                  loadingWallet: t.generate.loadingWallet,
                  readyToReserve: t.generate.readyToReserve,
                  reservedBalance: t.generate.reservedBalance,
                  walletUnavailable: t.generate.walletUnavailable,
                }}
                wallet={wallet}
                walletError={walletError}
                walletLoading={walletLoading}
              />

              <OutputPreview
                title={t.generate.outputPreview}
                emptyText={t.generate.outputEmpty}
                presetSlug={product.slug}
                status={generationStatus}
                pendingTitle={t.generate.aiBackendPending}
                pendingDescription={t.generate.workerNotConnected}
                completedTitle={t.generate.outputSaved}
                completedDescription={t.generate.outputPreviewNextPhase}
                downloadLabel={t.generate.downloadOutput}
                failedTitle={t.generate.generationFailed}
                failedDescription={t.generate.providerFailureRefunded}
                generatedAtLabel={t.generate.generatedAt}
                generationId={generationId}
                loadingOutputLabel={t.generate.loadingOutputImage}
                noOutputLabel={t.generate.noOutputFound}
                outputPreviewFailedLabel={t.generate.outputPreviewFailed}
                previewExpiresNote={t.generate.previewExpiresNote}
                signedUrlFailedLabel={t.generate.signedUrlFailed}
              />

            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
