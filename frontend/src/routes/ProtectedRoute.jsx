/**
 * ProtectedRoute.jsx
 * ─────────────────────────────────────────────────────────────
 * Guards routes that require authentication.
 *
 * Behaviour:
 *  1. While auth state is hydrating from storage → show full-page
 *     spinner to avoid a flash of unauthenticated UI.
 *  2. Not logged in → redirect to /login, preserving the intended
 *     destination in location.state.from so the login page can
 *     redirect back after a successful sign-in.
 *  3. Logged in but wrong role → redirect to /dashboard.
 *  4. All checks pass → render children.
 *
 * @param {{ children: ReactNode, requiredRole?: string }} props
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Spinner     from '@/components/ui/Spinner';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, isInitialising, user } = useAuth();
  const location = useLocation();

  // Still reading from storage — avoid premature redirect
  if (isInitialising) {
    return <Spinner fullPage label="Authenticating…" />;
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/"
        state={{ from: location }}
        replace
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
