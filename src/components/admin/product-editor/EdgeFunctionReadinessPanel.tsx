import { CheckCircle2, CircleDashed, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../../../data/products";
import {
  getProductConfigReadiness,
  type ProductConfigReadiness,
} from "../../../lib/adminProductConfig";
import { useLanguage } from "../../../hooks/useLanguage";

type EdgeFunctionReadinessPanelProps = {
  product?: Product;
  productDbId?: string;
};

export function EdgeFunctionReadinessPanel({
  product,
  productDbId,
}: EdgeFunctionReadinessPanelProps) {
  const { t } = useLanguage();
  const editor = t.admin.editor;
  const [readiness, setReadiness] = useState<ProductConfigReadiness>({
    hasActiveModelConfig: false,
    hasActivePromptVersion: false,
    hasDbProductId: Boolean(productDbId),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshReadiness() {
    setLoading(true);
    setError(null);

    try {
      setReadiness(await getProductConfigReadiness(productDbId));
    } catch {
      setError(editor.adminRlsWarning);
      setReadiness({
        hasActiveModelConfig: false,
        hasActivePromptVersion: false,
        hasDbProductId: Boolean(productDbId),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshReadiness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productDbId]);

  const checklist = [
    {
      done: readiness.hasDbProductId,
      label: editor.readinessDbProductId,
    },
    {
      done: readiness.hasActivePromptVersion,
      label: readiness.hasActivePromptVersion
        ? editor.activePromptVersionExists
        : editor.activePromptVersionMissing,
    },
    {
      done: readiness.hasActiveModelConfig,
      label: readiness.hasActiveModelConfig
        ? editor.activeModelConfigExists
        : editor.activeModelConfigMissing,
    },
    {
      done: Boolean(product?.optionSchema?.length),
      label: editor.readinessUserOptions,
    },
    {
      done: Boolean(product),
      label: editor.readinessImageRequirements,
    },
    {
      done: true,
      label: editor.readinessStoragePolicy,
    },
    {
      done: true,
      label: editor.readinessWalletRpc,
    },
    {
      done: false,
      label: editor.readinessFunctionDeployed,
    },
  ];

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{editor.edgeReadiness}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            {editor.edgeReadinessDescription}
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void refreshReadiness()}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/62 transition hover:text-white disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {editor.refreshReadiness}
        </button>
      </div>

      {!productDbId ? (
        <p className="mt-5 rounded-2xl border border-dashed border-white/12 p-5 text-sm text-white/52">
          {editor.productDbIdMissing}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {checklist.map((item) => {
          const Icon = item.done ? CheckCircle2 : CircleDashed;

          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 p-4"
            >
              <Icon className="h-5 w-5 text-white/58" aria-hidden="true" />
              <span className="text-sm font-semibold text-white/72">{item.label}</span>
            </div>
          );
        })}
      </div>

      {error ? <p className="mt-4 text-sm text-white/70">{error}</p> : null}

      <p className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/58">
        {editor.edgeReadinessNote}
      </p>
    </section>
  );
}
