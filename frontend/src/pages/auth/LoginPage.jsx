/**
 * LoginPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Features:
 *  • React Hook Form + Zod (loginSchema)
 *  • Remember Me  — persists email & uses localStorage token storage
 *  • "Forgot password?" link
 *  • Redirect-back  — returns user to the page they were on
 *  • Session-expired banner from ?reason=session_expired
 *  • Field-level + root-level error display
 *  • Loading state on submit button
 *  • Accessible labels, ARIA live regions
 */

import { useEffect } from 'react';
import { useForm }   from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

import { useAuth }             from '@/context/AuthContext';
import { loginSchema }         from '@/utils/validators';
import { extractErrorMessage } from '@/utils/errorHandler';
import { getRememberedEmail, hasRememberedEmail } from '@/utils/storage';
import { Button, Input, Alert } from '@/components/ui';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

export default function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const [params]     = useSearchParams();

  const from = location.state?.from?.pathname ?? '/dashboard';
  const sessionExpired = params.get('reason') === 'session_expired';

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting, touchedFields },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email:      getRememberedEmail(),
      password:   '',
      rememberMe: hasRememberedEmail(),
    },
  });

  // Pre-fill email from remembered storage
  useEffect(() => {
    const remembered = getRememberedEmail();
    if (remembered) setValue('email', remembered);
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      await login({
        email:      data.email,
        password:   data.password,
        rememberMe: data.rememberMe,
      });
      toast.success('Welcome back! 👋', { id: 'login-success' });
      navigate(from, { replace: true });
    } catch (err) {
      setError('root', { message: extractErrorMessage(err) });
    }
  };

  return (
    <div className="slide-up">
      {/* ── Card ─────────────────────────────────────────────── */}
      <div className="card p-8 sm:p-10 shadow-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/40 dark:to-teal-900/40 mb-4">
            <LogIn className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Sign in to your CarbonTrack account
          </p>
        </div>

        {/* Session expired banner */}
        {sessionExpired && (
          <Alert variant="warning" className="mb-6">
            Your session expired. Please sign in again.
          </Alert>
        )}

        {/* Root / server error */}
        {errors.root && (
          <Alert variant="error" className="mb-6" dismissible>
            {errors.root.message}
          </Alert>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Sign in form"
          className="space-y-5"
        >
          {/* Email */}
          <Input
            label="Email address"
            id="login-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            required
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="form-label !mb-0"
              >
                Password
                <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-green-600 dark:text-green-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
                tabIndex={0}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              id="rememberMe"
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-green-600 focus:ring-green-500 dark:bg-slate-900 cursor-pointer"
              {...register('rememberMe')}
            />
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
              Remember me for 30 days
            </span>
          </label>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            rightIcon={!isSubmitting ? <ArrowRight className="h-4 w-4" /> : undefined}
            className="mt-2"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-7 flex items-center gap-3" aria-hidden="true">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">OR</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Google Sign In */}
        <div className="mb-7">
          <GoogleLoginButton />
        </div>

        {/* Divider */}
        <div className="my-7 flex items-center gap-3" aria-hidden="true">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">OR</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-green-600 dark:text-green-400 hover:underline"
          >
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  );
}
