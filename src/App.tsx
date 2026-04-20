import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Spinner } from "./components/ui/Spinner";
import { ToastHost } from "./components/ui/ToastHost";
import { useAuth } from "./hooks/useAuth";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TripsPage = lazy(() => import("./pages/TripsPage"));
const TripDetailsPage = lazy(() => import("./pages/TripDetailsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function AppFallback() {
  return (
    <div className="screen-center">
      <Spinner label="Loading Smart Travel Planner..." />
    </div>
  );
}

export default function App() {
  const { isAuthenticated, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <AppFallback />;
  }

  return (
    <>
      <Suspense fallback={<AppFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/app/dashboard" replace />
              ) : (
                <LandingPage />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/app/dashboard" replace />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="trips" element={<TripsPage />} />
            <Route path="trips/:tripId" element={<TripDetailsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <ToastHost />
    </>
  );
}
