import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthProfile = {
  email: string | null;
  full_name: string | null;
  id: string;
  role: "user" | "admin" | "super_admin";
};

export type AuthResult = {
  error?: string;
  needsEmailConfirmation?: boolean;
  profileWarning?: string;
};

export type AuthContextValue = {
  configError: string | null;
  loading: boolean;
  profile: AuthProfile | null;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<AuthResult>;
  user: User | null;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
