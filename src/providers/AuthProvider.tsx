import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigError } from "../lib/supabase";
import {
  AuthContext,
  type AuthProfile,
  type AuthResult,
} from "./auth-context";

const authInitTimeoutMs = 8000;

function readableAuthError(message: string | undefined) {
  if (!message) return "Authentication failed. Please try again.";
  if (message.toLowerCase().includes("invalid login credentials")) return "Invalid email or password.";
  return message;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeoutId));
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!supabase) {
      setProfile(null);
      setProfileError(supabaseConfigError);
      return;
    }
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      setProfile(null);
      setProfileError(readableAuthError(userError.message));
      return;
    }
    const currentUser = userData.user;
    if (!currentUser) {
      setProfile(null);
      setProfileError(null);
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,avatar_url")
      .eq("id", currentUser.id)
      .maybeSingle();
    if (error) {
      setProfile(null);
      setProfileError(readableAuthError(error.message));
      return;
    }
    setProfile((data as AuthProfile | null) ?? null);
    setProfileError(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!supabase) { setLoading(false); return undefined; }
    const client = supabase;

    async function ensureProfileRow(currentUser: User) {
      if (!supabase) return;
      const metadata = currentUser.user_metadata as Record<string, string | undefined> | undefined;
      const fullName = metadata?.full_name ?? metadata?.name ?? null;
      const avatarUrl = metadata?.avatar_url ?? metadata?.picture ?? null;
      await supabase.from("profiles").upsert(
        {
          id: currentUser.id,
          email: currentUser.email ?? null,
          full_name: fullName,
          avatar_url: avatarUrl,
          role: "user",
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
    }

    async function syncProfile(currentUser: User) {
      try {
        await ensureProfileRow(currentUser);
        await refreshProfile();
      } catch (error) {
        if (!mounted) return;
        setProfile(null);
        setProfileError(
          readableAuthError(
            error instanceof Error ? error.message : "Profile could not be loaded.",
          ),
        );
      }
    }

    async function initializeAuth() {
      try {
        const { data, error } = await withTimeout(
          client.auth.getSession(),
          authInitTimeoutMs,
          "Authentication took too long to respond.",
        );

        if (!mounted) return;

        if (error) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setProfileError(readableAuthError(error.message));
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          void syncProfile(data.session.user);
        } else {
          setProfile(null);
          setProfileError(null);
        }
      } catch (error) {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setProfile(null);
        setProfileError(
          readableAuthError(
            error instanceof Error ? error.message : "Authentication could not be resolved.",
          ),
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void initializeAuth();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        void syncProfile(nextSession.user);
      } else {
        setProfile(null);
        setProfileError(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { error: supabaseConfigError ?? "Supabase is not configured." };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: readableAuthError(error.message) };
      await refreshProfile();
      return {};
    },
    [refreshProfile],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string): Promise<AuthResult> => {
      if (!supabase) return { error: supabaseConfigError ?? "Supabase is not configured." };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: readableAuthError(error.message) };
      if (data.user) {
        const { error: profileSyncError } = await supabase.from("profiles").upsert({
          email: data.user.email,
          full_name: fullName,
          id: data.user.id,
          role: "user",
        });
        if (profileSyncError) {
          setProfileError(readableAuthError(profileSyncError.message));
          return {
            needsEmailConfirmation: !data.session,
            profileWarning: "Account created, but profile sync is not ready yet.",
          };
        }
      }
      if (data.session) await refreshProfile();
      return { needsEmailConfirmation: !data.session };
    },
    [refreshProfile],
  );

  const signOut = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return { error: supabaseConfigError ?? "Supabase is not configured." };
    const { error } = await supabase.auth.signOut();
    if (error) return { error: readableAuthError(error.message) };
    setSession(null);
    setUser(null);
    setProfile(null);
    setProfileError(null);
    return {};
  }, []);

  const value = useMemo(
    () => ({ configError: supabaseConfigError, loading, profile, profileError, refreshProfile, session, signIn, signOut, signUp, user }),
    [loading, profile, profileError, refreshProfile, session, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
