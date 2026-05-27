import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthInput } from "../components/auth/AuthInput";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";

export function RegisterPage() {
  const { configError, signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!fullName || !email || !password || !confirmPassword) {
      setError(t.auth.missingFields);
      return;
    }

    if (password.length < 6) {
      setError(t.auth.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch);
      return;
    }

    if (configError) {
      setError(t.auth.missingConfig);
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(email, password, fullName);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.profileWarning) {
      setMessage(result.profileWarning);
    }

    if (result.needsEmailConfirmation) {
      setMessage(t.auth.registerConfirmation);
      return;
    }

    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <Navbar />
      <main>
        <AuthCard
          title={t.auth.registerTitle}
          notice={t.auth.registerNotice}
        >
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <AuthInput
              autoComplete="name"
              label={t.auth.name}
              name="name"
              onChange={setFullName}
              required
              value={fullName}
            />
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
              autoComplete="new-password"
              label={t.auth.password}
              name="password"
              onChange={setPassword}
              required
              type="password"
              value={password}
            />
            <AuthInput
              autoComplete="new-password"
              label={t.auth.confirmPassword}
              name="confirmPassword"
              onChange={setConfirmPassword}
              required
              type="password"
              value={confirmPassword}
            />
            {error ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-white/72">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-sm text-white/72">
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 rounded-full bg-white text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/24 disabled:text-white/42"
            >
              {isSubmitting ? t.auth.loading : t.auth.registerButton}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-white/48">
            {t.auth.toLoginPrefix}{" "}
            <Link to="/login" className="font-semibold text-white hover:underline">
              {t.auth.toLoginLink}
            </Link>
          </p>
        </AuthCard>
      </main>
      <Footer />
    </div>
  );
}
