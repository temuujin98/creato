import { useLanguage } from "../hooks/useLanguage";
import { ProfileEditor } from "../components/profile/ProfileEditor";

export function SettingsPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-neutral-50 px-4 pb-16 pt-28 text-neutral-950 dark:bg-black dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {t.settings.editProfile}
          </p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
            {t.settings.profileSettings}
          </h1>
        </div>
        <section className="mt-8 rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-2xl shadow-black/5 dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/40 sm:p-6">
          <ProfileEditor />
        </section>
      </div>
    </main>
  );
}
