import { Camera, CheckCircle2, Upload } from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import {
  createAvatarDisplayUrl,
  updateCurrentProfile,
  uploadAvatar,
  validateAvatarFile,
} from "../../lib/profile";

type Props = {
  onSaved?: () => void;
};

export function ProfileEditor({ onSaved }: Props) {
  const { profile, refreshProfile, user } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [avatarPath, setAvatarPath] = useState<string | null>(profile?.avatar_url ?? null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const email = profile?.email || user?.email || "";
  const initials = useMemo(() => {
    const source = (fullName || email || "C").trim();
    const [first, second] = source.includes("@")
      ? [source.charAt(0)]
      : source.split(/\s+/);
    return `${first?.charAt(0) || "C"}${second?.charAt(0) || ""}`.toUpperCase();
  }, [email, fullName]);

  // Sync from profile when it changes (e.g. after OAuth sign-in)
  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setAvatarPath(profile?.avatar_url ?? null);
  }, [profile?.avatar_url, profile?.full_name]);

  // Resolve avatar preview: selected file takes priority, then DB path
  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    async function resolveAvatar() {
      if (selectedFile) {
        objectUrl = URL.createObjectURL(selectedFile);
        if (mounted) setAvatarPreview(objectUrl);
        return;
      }
      const url = await createAvatarDisplayUrl(avatarPath);
      if (mounted) setAvatarPreview(url);
    }

    resolveAvatar().catch(() => {
      if (mounted) setAvatarPreview(null);
    });

    return () => {
      mounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [avatarPath, selectedFile]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setStatus("idle");
    setMessage("");
    if (!file) { setSelectedFile(null); return; }
    try {
      validateAvatarFile(file, t.settings.invalidAvatarFile);
      setSelectedFile(file);
    } catch (error) {
      setSelectedFile(null);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t.settings.invalidAvatarFile);
    }
  }

  async function handleSubmit() {
    if (!user) return;
    setSaving(true);
    setStatus("idle");
    setMessage("");
    try {
      let nextAvatarPath = avatarPath;
      if (selectedFile) {
        nextAvatarPath = await uploadAvatar(selectedFile, user.id);
      }
      await updateCurrentProfile({ avatarUrl: nextAvatarPath, fullName, userId: user.id });
      setSelectedFile(null);
      setAvatarPath(nextAvatarPath);
      await refreshProfile(); // updates AuthProvider → header avatar refreshes
      setStatus("success");
      setMessage(t.settings.profileUpdated);
      onSaved?.();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t.settings.failedToUpdateProfile);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Avatar row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Avatar preview */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black text-xl font-semibold text-white/80">
          {avatarPreview ? (
            <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>

        {/* Name / email info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{fullName || email || "creato"}</p>
          <p className="mt-0.5 truncate text-sm text-white/45">{email}</p>
          <p className="mt-2 text-xs text-white/35">{t.settings.avatarRequirements}</p>
        </div>

        {/* Upload button */}
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white">
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          {selectedFile ? t.settings.changeAvatar : t.settings.uploadAvatar}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarChange}
          />
        </label>
      </div>

      {/* Fields */}
      <div className="mt-6 grid gap-4">
        {/* Display name */}
        <label className="grid gap-2 text-sm font-medium text-white/60">
          {t.settings.displayName}
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-black px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary focus:ring-4 focus:ring-primary/20"
          />
        </label>

        {/* Email — read-only */}
        <label className="grid gap-2 text-sm font-medium text-white/40">
          {t.settings.emailAddress}
          <input
            readOnly
            value={email}
            className="h-11 cursor-not-allowed rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm text-white/35 outline-none"
          />
          <span className="text-xs text-white/30">{t.settings.emailCannotBeChanged}</span>
        </label>
      </div>

      {/* Feedback */}
      {message ? (
        <div
          className={`mt-4 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
            status === "success"
              ? "border-primary/20 bg-primary/8 text-violet-200"
              : "border-red-500/20 bg-red-500/8 text-red-300"
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <Camera className="h-4 w-4 shrink-0 text-red-400" aria-hidden="true" />
          )}
          {message}
        </div>
      ) : null}

      {/* Save */}
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={saving}
          onClick={handleSubmit}
        >
          {saving ? t.settings.saving : t.settings.saveChanges}
        </button>
      </div>
    </div>
  );
}
