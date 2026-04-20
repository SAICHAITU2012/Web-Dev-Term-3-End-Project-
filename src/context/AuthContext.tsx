import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PlannerUser } from "../types";
import { authService } from "../services/authService";

type AuthContextValue = {
  user: PlannerUser | null;
  isAuthenticated: boolean;
  bootstrapping: boolean;
  isSupabaseMode: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  signup: (input: {
    email: string;
    password: string;
    fullName: string;
  }) => Promise<void>;
  loginWithGoogle: (redirectPath?: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlannerUser | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let active = true;

    authService
      .getInitialUser()
      .then((nextUser) => {
        if (!active) {
          return;
        }

        setUser(nextUser);
      })
      .finally(() => {
        if (active) {
          setBootstrapping(false);
        }
      });

    const unsubscribe = authService.onAuthChange((nextUser) => {
      if (active) {
        setUser(nextUser);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      bootstrapping,
      isSupabaseMode: authService.isSupabaseConfigured,
      async login(input) {
        const nextUser = await authService.login(input);
        setUser(nextUser);
      },
      async signup(input) {
        const nextUser = await authService.signup(input);
        setUser(nextUser);
      },
      async loginWithGoogle(redirectPath) {
        await authService.loginWithGoogle(redirectPath);
      },
      async loginAsDemo() {
        const nextUser = await authService.loginAsDemo();
        setUser(nextUser);
      },
      async logout() {
        await authService.logout();
        setUser(null);
      },
    }),
    [bootstrapping, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
