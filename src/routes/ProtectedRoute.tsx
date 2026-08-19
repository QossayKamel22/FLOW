import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/common/LoadingScreen";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  if (initializing) return <LoadingScreen />;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
