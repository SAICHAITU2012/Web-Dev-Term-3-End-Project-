import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { Button } from "../ui/Button";

const navigation = [
  { label: "Dashboard", path: "/app/dashboard" },
  { label: "Trips", path: "/app/trips" },
  { label: "Profile", path: "/app/profile" },
];

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { pushToast } = useToast();
  const { isRunning, run } = useAsyncAction();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await run(async () => {
      await logout();
      pushToast({
        title: "Signed out",
        description: "Your planner session has been closed safely.",
        tone: "info",
      });
      navigate("/login", { replace: true });
    });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand-block">
          <span className="brand-tag">Travel OS</span>
          <h1>Smart Travel Planner</h1>
          <p>Budget, itinerary, and travel documents in one calm workspace.</p>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item-active" : ""}`
              }
              to={item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <strong>{user?.fullName ?? "Traveler"}</strong>
            <span>{user?.email}</span>
          </div>
          <Button
            variant="secondary"
            onClick={handleLogout}
            disabled={isRunning}
          >
            {isRunning ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-only"
              onClick={() => setMobileOpen((current) => !current)}
              type="button"
            >
              Menu
            </button>
            <span className="eyebrow">
              {user?.authMode === "demo" ? "Demo mode enabled" : "Live Supabase mode"}
            </span>
            <h2>
              {location.pathname.includes("/trips/")
                ? "Trip workspace"
                : location.pathname.replace("/app/", "").replace(/^./, (value) =>
                    value.toUpperCase(),
                  )}
            </h2>
          </div>

          <div className="topbar-meta">
            <span>{new Date().toLocaleDateString("en-US", { dateStyle: "full" })}</span>
            <span className={`mode-pill mode-pill-${user?.authMode ?? "demo"}`}>
              {user?.authMode === "demo" ? "Local demo" : "Supabase"}
            </span>
          </div>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
