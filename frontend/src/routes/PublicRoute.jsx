/**
 * PublicRoute.jsx
 * ─────────────────────────────────────────────────────────────
 * Guards routes that should only be visible to unauthenticated
 * users (login, register, forgot-password).
 *
 * An already-authenticated user visiting /login is redirected to
 * /dashboard (or wherever they were going before the redirect).
 *
 * @param {{ children: ReactNode }} props
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Spinner     from '@/components/ui/Spinner';

export default function PublicRoute({ children }) {
  const { isLoggedIn, isInitialising } = useAuth();
  const location = useLocation();

  if (isInitialising) {
    return <Spinner fullPage label="Loading…" />;
  }

  if (isLoggedIn) {
    // Send them to where they were trying to go, or fall back to dashboard
    const destination = location.state?.from?.pathname ?? '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
}
