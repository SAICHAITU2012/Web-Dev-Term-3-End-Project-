import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  formatAuthErrorMessage,
  readAuthErrorFromHash,
} from "../utils/authErrors";

const authHighlights = [
  {
    title: "Smart Budget Guardrails",
    body: "Keep planned and actual spend visible before bookings drift past the trip ceiling.",
  },
  {
    title: "One Timeline, Zero Chaos",
    body: "Flights, stays, activities, and buffer time live in a single editable itinerary flow.",
  },
  {
    title: "Document Readiness",
    body: "Passport, visa, insurance, and booking references stay attached to each trip workspace.",
  },
];

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="google-icon" viewBox="0 0 24 24">
      <path
        d="M21.8 12.23c0-.74-.06-1.3-.2-1.88H12v3.55h5.64c-.11.88-.72 2.21-2.08 3.1l-.02.12 3.03 2.35.21.02c1.94-1.79 3.02-4.42 3.02-7.26Z"
        fill="#4285F4"
      />
      <path
        d="M11.99 22c2.76 0 5.08-.91 6.77-2.48l-3.22-2.49c-.86.6-2.02 1.02-3.55 1.02-2.71 0-5.01-1.79-5.83-4.25l-.11.01-3.15 2.45-.04.11A10.23 10.23 0 0 0 11.99 22Z"
        fill="#34A853"
      />
      <path
        d="M6.17 13.8A6.15 6.15 0 0 1 5.83 12c0-.62.11-1.23.32-1.8l-.01-.12-3.19-2.49-.11.05A10.03 10.03 0 0 0 1.75 12c0 1.61.39 3.13 1.09 4.47l3.33-2.67Z"
        fill="#FBBC05"
      />
      <path
        d="M11.99 5.95c1.93 0 3.23.83 3.97 1.52l2.9-2.83C17.06 2.98 14.74 2 11.99 2a10.23 10.23 0 0 0-9.13 5.63l3.31 2.56c.83-2.47 3.13-4.24 5.82-4.24Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, loginAsDemo, loginWithGoogle, isSupabaseMode } =
    useAuth();
  const { pushToast } = useToast();
  const { isRunning, run } = useAsyncAction();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginForm, setLoginForm] = useState({
    email: "demo@smarttravelplanner.app",
    password: "demo12345",
  });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const redirectTarget =
    (location.state as { from?: string } | null)?.from ?? "/app/dashboard";
  const authTitle = useMemo(
    () =>
      mode === "login"
        ? "Access your travel command center"
        : "Create your travel planning account",
    [mode],
  );

  useEffect(() => {
    const hashError = readAuthErrorFromHash();

    if (!hashError) {
      return;
    }

    pushToast({
      title: "Authentication setup needed",
      description: hashError,
      tone: "error",
    });

    window.history.replaceState(
      null,
      document.title,
      `${window.location.pathname}${window.location.search}`,
    );
  }, [pushToast]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await run(async () => {
      try {
        await login(loginForm);
        pushToast({
          title: "Welcome back",
          description: "Your travel workspace is ready.",
          tone: "success",
        });
        navigate(redirectTarget, { replace: true });
      } catch (error) {
        pushToast({
          title: "Login failed",
          description:
            error instanceof Error
              ? formatAuthErrorMessage(error.message)
              : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await run(async () => {
      try {
        await signup(signupForm);
        pushToast({
          title: "Account created",
          description:
            "Your planner account is ready. If Supabase email confirmation is enabled, verify your inbox before signing in again.",
          tone: "success",
        });
        navigate("/app/dashboard", { replace: true });
      } catch (error) {
        pushToast({
          title: "Signup failed",
          description:
            error instanceof Error
              ? formatAuthErrorMessage(error.message)
              : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  async function handleGoogleLogin() {
    await run(async () => {
      try {
        await loginWithGoogle(redirectTarget);
      } catch (error) {
        pushToast({
          title: "Google sign-in failed",
          description:
            error instanceof Error
              ? formatAuthErrorMessage(error.message)
              : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  async function handleDemoAccess() {
    await run(async () => {
      try {
        await loginAsDemo();
        pushToast({
          title: "Demo workspace opened",
          description:
            "You are now exploring the planner with seeded sample trips and local persistence.",
          tone: "info",
        });
        navigate("/app/dashboard", { replace: true });
      } catch (error) {
        pushToast({
          title: "Demo login failed",
          description:
            error instanceof Error
              ? formatAuthErrorMessage(error.message)
              : "Please try again.",
          tone: "error",
        });
      }
    });
  }

  return (
    <div className="auth-shell">
      <div className="auth-copy auth-copy-premium">
        <div className="auth-copy-header">
          <span className="brand-tag">Authentication + Protected Routes</span>
          <h1>Plan smarter trips with one trusted, beautiful workspace.</h1>
          <p>
            Sign in to manage budgets, itineraries, and travel documents in one
            place. This flow supports email auth, Google OAuth, protected
            routes, and local demo mode for portfolio walkthroughs.
          </p>
        </div>

        <div className="auth-spotlight-grid">
          <article className="auth-spotlight-card auth-spotlight-primary">
            <span className="eyebrow">Trip snapshot</span>
            <h2>Bali Workation</h2>
            <p>8 days · 2 travelers · document readiness 3/4</p>
            <div className="auth-spotlight-metrics">
              <div>
                <span>Budget</span>
                <strong>$1,600</strong>
              </div>
              <div>
                <span>Booked</span>
                <strong>$1,020</strong>
              </div>
              <div>
                <span>Next action</span>
                <strong>Visa upload</strong>
              </div>
            </div>
          </article>

          <article className="auth-spotlight-card auth-spotlight-secondary">
            <span className="eyebrow">Why this app works</span>
            <div className="auth-mini-list">
              {authHighlights.map((item) => (
                <div key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="auth-copy-footer">
          <Link className="button button-ghost" to="/">
            Back to project overview
          </Link>
          <div className="auth-trust-row">
            <span>Responsive UI</span>
            <span>Supabase Auth</span>
            <span>Vercel Ready</span>
          </div>
        </div>
      </div>

      <Card className="auth-card auth-card-premium">
        <div className="auth-card-glow" />
        <div className="auth-card-header">
          <span className="eyebrow">
            {isSupabaseMode ? "Live backend connected" : "Demo mode available"}
          </span>
          <h2>{authTitle}</h2>
          <p className="auth-intro">
            {mode === "login"
              ? "Pick the fastest sign-in method and get back to your travel planner."
              : "Create an account to store trip plans, budgets, and documents securely."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`tab-button ${mode === "login" ? "tab-active" : ""}`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`tab-button ${mode === "signup" ? "tab-active" : ""}`}
            onClick={() => setMode("signup")}
            type="button"
          >
            Sign up
          </button>
        </div>

        {isSupabaseMode ? (
          <>
            <Button
              variant="secondary"
              fullWidth
              className="social-button"
              onClick={handleGoogleLogin}
              disabled={isRunning}
              type="button"
            >
              <GoogleIcon />
              {isRunning ? "Redirecting..." : "Continue with Google"}
            </Button>

            <div className="auth-divider">
              <span>or continue with email</span>
            </div>
          </>
        ) : null}

        {mode === "login" ? (
          <form className="modal-form auth-form-stack" onSubmit={handleLogin}>
            <Input
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              required
            />
            <Input
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              required
            />
            <Button type="submit" fullWidth disabled={isRunning}>
              {isRunning ? "Signing in..." : "Login with email"}
            </Button>
          </form>
        ) : (
          <form className="modal-form auth-form-stack" onSubmit={handleSignup}>
            <Input
              label="Full name"
              value={signupForm.fullName}
              onChange={(event) =>
                setSignupForm((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
              required
            />
            <Input
              label="Email"
              type="email"
              value={signupForm.email}
              onChange={(event) =>
                setSignupForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              required
            />
            <Input
              label="Password"
              type="password"
              value={signupForm.password}
              onChange={(event) =>
                setSignupForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              hint="Use at least 8 characters in your final submitted version."
              required
            />
            <Button type="submit" fullWidth disabled={isRunning}>
              {isRunning ? "Creating account..." : "Create account"}
            </Button>
          </form>
        )}

        <Button
          variant="secondary"
          fullWidth
          className="demo-button"
          onClick={handleDemoAccess}
          disabled={isRunning}
        >
          Continue with demo account
        </Button>

        <div className="demo-note demo-note-rich">
          <div>
            <strong>Demo credentials</strong>
            <p>Email: demo@smarttravelplanner.app</p>
            <p>Password: demo12345</p>
          </div>
          <div className="demo-note-meta">
            <span>Safe for walkthroughs</span>
            <span>Seeded sample trip included</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
