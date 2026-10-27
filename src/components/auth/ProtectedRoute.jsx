// ============================================
// FILE: src/components/auth/ProtectedRoute.jsx
// PURPOSE: Protect private routes by authenticated role
// ============================================

import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { loading, isAuthenticated, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 dark:bg-slate-950">
        <div className="text-sm font-medium text-gray-500">Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length && !allowedRoles.includes(profile?.role)) {
    if (profile?.role === "captain") {
      return <Navigate to="/candidates" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
