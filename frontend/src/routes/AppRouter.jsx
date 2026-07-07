/**
 * AppRouter.jsx
 * ─────────────────────────────────────────────────────────────
 * Full application route tree with lazy loading.
 *
 *   /                       → redirect → /dashboard
 *   /login                  → LoginPage          (public only)
 *   /register               → RegisterPage       (public only)
 *   /forgot-password        → ForgotPasswordPage (public only)
 *   /dashboard              → DashboardPage      (auth required)
 *   /activities             → ActivitiesPage     (auth required)
 *   /goals                  → GoalsPage          (auth required)
 *   /reports                → ReportsPage        (auth required)
 *   /settings               → SettingsPage       (auth required)
 *   /admin                  → AdminPage          (ADMIN role only)
 *   *                       → NotFound (404)
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Spinner        from '@/components/ui/Spinner';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute    from './PublicRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AuthLayout      from '@/components/layout/AuthLayout';
import NotFound        from '@/components/errors/NotFound';

/* ── Lazy page bundles ───────────────────────────────────────── */
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage       = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const DashboardPage      = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ActivitiesPage     = lazy(() => import('@/pages/activities/ActivitiesPage'));
const GoalsPage          = lazy(() => import('@/pages/goals/GoalsPage'));
const ReportsPage        = lazy(() => import('@/pages/reports/ReportsPage'));
const RecommendationsPage = lazy(() => import('@/pages/recommendations/RecommendationsPage'));
const CommunityLeaderboardPage = lazy(() => import('@/pages/community/CommunityLeaderboardPage'));
const OrganisationDashboardPage = lazy(() => import('@/pages/admin/OrganisationDashboardPage'));
const SettingsPage       = lazy(() => import('@/pages/settings/SettingsPage'));
const AdminPage          = lazy(() => import('@/pages/admin/AdminPage'));
const LandingPage        = lazy(() => import('@/pages/landing/LandingPage'));

function PageFallback() {
  return <Spinner fullPage label="Loading page…" />;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Root */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Public-only auth routes ───────────────────────── */}
        <Route
          element={
            <PublicRoute>
              <AuthLayout />
            </PublicRoute>
          }
        >
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/register"         element={<RegisterPage />} />
          <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
        </Route>

        {/* ── Protected app routes ──────────────────────────── */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard"       element={<DashboardPage />} />
          <Route path="/activities"      element={<ActivitiesPage />} />
          <Route path="/goals"           element={<GoalsPage />} />
          <Route path="/reports"         element={<ReportsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/community"       element={<CommunityLeaderboardPage />} />
          <Route path="/settings"        element={<SettingsPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organisation"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <OrganisationDashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
