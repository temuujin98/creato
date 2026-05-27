import { ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createPromptVersion,
  listPromptVersions,
  setActivePromptVersion,
  type PromptVersion,
} from "../../../lib/adminProductConfig";
import { useLanguage } from "../../../hooks/useLanguage";

type PromptVersionPanelProps = {
  productDbId?: string;
};

const textareaClass =
  "min-h-28 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-white/30";
const inputClass =
  "h-11 rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none focus:border-white/30";

export function PromptVersionPanel({ productDbId }: PromptVersionPanelProps) {
  const { t } = useLanguage();
  const editor = t.admin.editor;
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [version, setVersion] = useState(1);
  const [basePrompt, setBasePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [promptSuffix, setPromptSuffix] = useState("");
  const [qualityPrompt, setQualityPrompt] = useState("");
  const [artifactCleanupPrompt, setArtifactCleanupPrompt] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [setActiveAfterSave, setSetActiveAfterSave] = useState(true);

  const nextVersion = useMemo(
    () => Math.max(0, ...versions.map((item) => item.version)) + 1,
    [versions],
  );

  async function loadVersions() {
    if (!productDbId) {
      setVersions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await listPromptVersions(productDbId);
      setVersions(data);
      setVersion(Math.max(0, ...data.map((item) => item.version)) + 1);
    } catch {
      setError(editor.adminRlsWarning);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productDbId]);

  async function handleSave() {
    if (!productDbId) {
      setError(editor.productDbIdMissing);
      return;
    }

    if (!basePrompt.trim()) {
      setError(editor.basePromptRequired);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await createPromptVersion({
        artifactCleanupPrompt,
        basePrompt,
        internalNote,
        negativePrompt,
        productId: productDbId,
        promptSuffix,
        qualityPrompt,
        version,
      });

      if (setActiveAfterSave) {
        await setActivePromptVersion(productDbId, created.id);
      }

      setSuccess(editor.promptVersionSaved);
      setBasePrompt("");
      setNegativePrompt("");
      setPromptSuffix("");
      setQualityPrompt("");
      setArtifactCleanupPrompt("");
      setInternalNote("");
      await loadVersions();
    } catch {
      setError(editor.promptVersionSaveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function handleSetActive(promptVersionId: string) {
    if (!productDbId) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await setActivePromptVersion(productDbId, promptVersionId);
      setSuccess(editor.promptVersionSaved);
      await loadVersions();
    } catch {
      setError(editor.promptVersionSaveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{editor.promptVersions}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            {editor.promptVersionDescription}
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/50">
          {editor.adminOnly}
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
                {editor.loadingPromptVersions}
              </p>
            ) : versions.length ? (
              versions.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/35 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {editor.promptVersion} {item.version}
                      </p>
                      <p className="mt-1 text-xs text-white/42">{item.created_at}</p>
                      <p className="mt-2 text-sm text-white/52">
                        {item.internal_note || editor.noInternalNote}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/58">
                        {item.is_active ? editor.active : editor.inactive}
                      </span>
                      {!item.is_active ? (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void handleSetActive(item.id)}
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
                {editor.noPromptVersions}
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.promptVersionNumber}</span>
              <input
                value={version || nextVersion}
                onChange={(event) => setVersion(Number(event.target.value))}
                type="number"
                min="1"
                className={inputClass}
              />
            </label>

            <label className="flex h-11 items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 text-sm text-white/60">
              <span>{editor.activeVersion}</span>
              <input
                type="checkbox"
                checked={setActiveAfterSave}
                onChange={(event) => setSetActiveAfterSave(event.target.checked)}
                className="h-4 w-4 accent-white"
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52 md:col-span-2">
              <span>{editor.basePrompt}</span>
              <textarea
                className={textareaClass}
                value={basePrompt}
                onChange={(event) => setBasePrompt(event.target.value)}
                placeholder={editor.promptPlaceholder}
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52 md:col-span-2">
              <span>{editor.negativePrompt}</span>
              <textarea
                className={textareaClass}
                value={negativePrompt}
                onChange={(event) => setNegativePrompt(event.target.value)}
                placeholder={editor.promptPlaceholder}
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.promptSuffix}</span>
              <textarea
                className={textareaClass}
                value={promptSuffix}
                onChange={(event) => setPromptSuffix(event.target.value)}
                placeholder={editor.promptPlaceholder}
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.qualityPrompt}</span>
              <textarea
                className={textareaClass}
                value={qualityPrompt}
                onChange={(event) => setQualityPrompt(event.target.value)}
                placeholder={editor.promptPlaceholder}
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.artifactCleanupPrompt}</span>
              <textarea
                className={textareaClass}
                value={artifactCleanupPrompt}
                onChange={(event) => setArtifactCleanupPrompt(event.target.value)}
                placeholder={editor.promptPlaceholder}
              />
            </label>

            <label className="grid gap-2 text-sm text-white/52">
              <span>{editor.internalAdminNote}</span>
              <textarea
                className={textareaClass}
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                placeholder={editor.internalNotePlaceholder}
              />
            </label>
          </div>
        </>
      )}

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-white/58" aria-hidden="true" />
          <p className="text-sm leading-6 text-white/58">{editor.promptSecurityNote}</p>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-white/70">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-white/70">{success}</p> : null}

      <button
        type="button"
        disabled={!productDbId || saving}
        onClick={() => void handleSave()}
        className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:bg-white/16 disabled:text-white/42"
      >
        {saving ? editor.saving : editor.savePromptVersion}
      </button>
    </section>
  );
}
