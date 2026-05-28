import type { FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthInput } from "../components/auth/AuthInput";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { supabase } from "../lib/supabase";

// Minimal icons — brand color only in the tiny SVG mark, not in borders/backgrounds
function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="#1877F2" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export function LoginPage() {
  const { configError, signIn } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!email || !password) { setError(t.auth.missingFields); return; }
    if (configError) { setError(t.auth.missingConfig); return; }
    setIsSubmitting(true);
    const result = await signIn(email, password);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error === "Invalid email or password." ? t.auth.invalidLogin : result.error);
      return;
    }
    navigate(redirectTo, { replace: true });
  }

  async function handleOAuth(provider: "google" | "facebook") {
    setError(null);
    if (!supabase) { setError(t.auth.missingConfig); return; }
    setOauthLoading(provider);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (oauthError) {
      setError(t.auth.oauthProviderNotEnabled);
      setOauthLoading(null);
    }
  }

  const isAnyLoading = isSubmitting || oauthLoading !== null;

  // System-matched: dark bg, neutral border, no brand coloring on the container
  const socialBtnClass =
    "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-black px-4 text-sm font-medium text-white/80 outline-none transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-55";

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <main>
        <AuthCard title={t.auth.loginTitle}>
          {/* Social login */}
          <div className="grid gap-3">
            <button
              type="button"
              disabled={isAnyLoading}
              onClick={() => handleOAuth("google")}
              className={socialBtnClass}
            >
              {oauthLoading === "google" ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-white/60" aria-hidden="true" />
              ) : (
                <GoogleIcon />
              )}
              {t.auth.continueWithGoogle}
            </button>

            <button
              type="button"
              disabled={isAnyLoading}
              onClick={() => handleOAuth("facebook")}
              className={socialBtnClass}
            >
              {oauthLoading === "facebook" ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-white/60" aria-hidden="true" />
              ) : (
                <FacebookIcon />
              )}
              {t.auth.continueWithFacebook}
            </button>
          </div>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-white/30">
              {t.auth.or}
            </span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* Email / password form */}
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <AuthInput
              autoComplete="email"
              disabled={isAnyLoading}
              label={t.auth.email}
              name="email"
              onChange={setEmail}
              required
              type="email"
              value={email}
            />
            <AuthInput
              autoComplete="current-password"
              disabled={isAnyLoading}
              label={t.auth.password}
              name="password"
              onChange={setPassword}
              required
              type="password"
              value={password}
            />
            {error ? (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isAnyLoading}
              className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {t.auth.signingIn}
                </>
              ) : (
                t.auth.loginButton
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/48">
            {t.auth.toRegisterPrefix}{" "}
            <Link to="/register" className="font-semibold text-white hover:underline">
              {t.auth.toRegisterLink}
            </Link>
          </p>
        </AuthCard>
      </main>
      <Footer />
    </div>
  );
}
