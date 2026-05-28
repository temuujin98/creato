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

export function LoginPage() {
  const { configError, signIn } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(t.auth.missingFields);
      return;
    }

    if (configError) {
      setError(t.auth.missingConfig);
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (result.error) {
      setError(
        result.error === "Invalid email or password."
          ? t.auth.invalidLogin
          : result.error,
      );
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <main>
        <AuthCard
          title={t.auth.loginTitle}
          notice={t.auth.loginNotice}
        >
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <AuthInput
              autoComplete="email"
              label={t.auth.email}
              name="email"
              onChange={setEmail}
              required
              type="email"
              value={email}
            />
            <AuthInput
              autoComplete="current-password"
              label={t.auth.password}
              name="password"
              onChange={setPassword}
              required
              type="password"
              value={password}
            />
            {error ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-white/72">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 rounded-full bg-white text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/24 disabled:text-white/42"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {t.auth.signingIn}
                </span>
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
