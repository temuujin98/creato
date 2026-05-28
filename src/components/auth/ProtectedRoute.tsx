import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
};

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { loading, profile, profileError, user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink px-4 text-center text-white">
        <div className="grid justify-items-center gap-4">
          <LoaderCircle className="h-7 w-7 animate-spin text-white/80" aria-hidden="true" />
          <p className="text-sm font-medium text-white/58">{t.auth.pleaseWait}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin) {
    const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";

    if (!isAdmin) {
      return (
        <div className="grid min-h-screen place-items-center bg-ink px-4 text-center text-white">
          <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.035] p-8">
            <p className="text-3xl font-semibold">{t.auth.adminRequired}</p>
            <p className="mt-4 leading-7 text-white/54">
              {profileError ?? t.auth.adminRequiredDescription}
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
}
