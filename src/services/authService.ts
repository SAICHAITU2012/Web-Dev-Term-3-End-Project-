import type { PlannerUser } from "../types";
import {
  clearDemoSession,
  createDemoSession,
  getDemoSession,
  loginDemoAccount,
  signupDemoAccount,
} from "./localStore";
import { isSupabaseConfigured, supabase } from "./supabase";

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured for this project.");
  }

  return supabase;
}

function normalizeSupabaseUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): PlannerUser {
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "Traveler";

  return {
    id: user.id,
    email: user.email ?? "",
    fullName,
    authMode: "supabase",
  };
}

export const authService = {
  isSupabaseConfigured,

  async getInitialUser() {
    if (isSupabaseConfigured) {
      const client = ensureSupabase();
      const {
        data: { session },
      } = await client.auth.getSession();
      return session?.user ? normalizeSupabaseUser(session.user) : null;
    }

    return getDemoSession();
  },

  onAuthChange(callback: (user: PlannerUser | null) => void) {
    if (!isSupabaseConfigured) {
      return () => undefined;
    }

    const client = ensureSupabase();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? normalizeSupabaseUser(session.user) : null);
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  async login(input: { email: string; password: string }) {
    if (isSupabaseConfigured) {
      const client = ensureSupabase();
      const { data, error } = await client.auth.signInWithPassword(input);

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Unable to start your session right now.");
      }

      return normalizeSupabaseUser(data.user);
    }

    return loginDemoAccount(input);
  },

  async signup(input: { email: string; password: string; fullName: string }) {
    if (isSupabaseConfigured) {
      const client = ensureSupabase();
      const { data, error } = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("We could not create your account.");
      }

      return normalizeSupabaseUser(data.user);
    }

    return signupDemoAccount(input);
  },

  async loginWithGoogle(redirectPath = "/app/dashboard") {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Google sign-in needs a live Supabase project with OAuth enabled.",
      );
    }

    const client = ensureSupabase();
    const redirectTo = new URL(redirectPath, window.location.origin).toString();
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
      },
    });

    if (error) {
      throw error;
    }
  },

  async loginAsDemo() {
    return createDemoSession();
  },

  async logout() {
    if (isSupabaseConfigured) {
      const client = ensureSupabase();
      const { error } = await client.auth.signOut();

      if (error) {
        throw error;
      }

      return;
    }

    clearDemoSession();
  },
};
