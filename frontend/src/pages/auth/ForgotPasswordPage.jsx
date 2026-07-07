/**
 * ForgotPasswordPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Features:
 *  • React Hook Form + Zod (forgotPasswordSchema)
 *  • Two-state UI: form → success confirmation
 *  • Security-safe: always shows confirmation (no email leak)
 *  • Countdown auto-redirect back to login after success
 *  • Loading state, error handling
 *  • Resend link (re-submits the form silently)
 *  • "Back to sign in" link on both states
 */

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send, CheckCircle2, RefreshCw } from 'lucide-react';

import { requestPasswordReset } from '@/api/authApi';
import { forgotPasswordSchema } from '@/utils/validators';
import { extractErrorMessage } from '@/utils/errorHandler';
import { Button, Input, Alert } from '@/components/ui';

const REDIRECT_DELAY = 30; // seconds before auto-redirect to login

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  /* ── Countdown timer after success ──────────────────────── */
  useEffect(() => {
    if (!submitted) return;
    if (countdown <= 0) {
      navigate('/login', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [submitted, countdown, navigate]);

  /* ── Submit ──────────────────────────────────────────────── */
  const onSubmit = useCallback(async (data) => {
    try {
      // Backend stub — will 404 until the endpoint is implemented.
      // We always show the confirmation screen regardless (security).
      await requestPasswordReset({ email: data.email });
    } catch {
      // Intentionally swallow errors here — we never reveal whether
      // the email exists in our system.
    } finally {
      setSentEmail(data.email);
      setSubmitted(true);
      setCountdown(REDIRECT_DELAY);
    }
  }, []);

  /* ── Resend ──────────────────────────────────────────────── */
  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await requestPasswordReset({ email: sentEmail });
      toast.success('Reset email resent!', { id: 'resend' });
      setCountdown(REDIRECT_DELAY);
    } catch {
      // swallow — security
      toast.success('Reset email resent!', { id: 'resend' });
    } finally {
      setResending(false);
    }
  }, [sentEmail]);

  /* ── Success state ───────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="slide-up">
        <div className="card p-8 sm:p-10 shadow-lg text-center">

          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/40 dark:to-teal-900/40">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check your inbox</h1>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            If an account exists for{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">
              {sentEmail}
            </span>
            , you&apos;ll receive a password reset link shortly.
          </p>

          {/* Tips */}
          <div className="mt-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Tips</p>
            {[
              'Check your spam or junk folder',
              'The link expires in 30 minutes',
              'Use the same email you registered with',
            ].map((tip) => (
              <p key={tip} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
                {tip}
              </p>
            ))}
          </div>

          {/* Countdown */}
          <p className="mt-5 text-xs text-slate-400 dark:text-slate-500">
            Redirecting to sign in in{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
              {countdown}s
            </span>
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => navigate('/login', { replace: true })}
            >
              Back to sign in
            </Button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 hover:underline disabled:opacity-50 disabled:no-underline mx-auto transition-opacity"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} aria-hidden="true" />
              {resending ? 'Resending…' : "Didn't receive it? Resend"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form state ──────────────────────────────────────────── */
  return (
    <div className="slide-up">
      <div className="card p-8 sm:p-10 shadow-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/40 dark:to-teal-900/40 mb-4">
            <Mail className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Forgot password?</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {/* Server error (shouldn't normally appear — we swallow errors above) */}
        {errors.root && (
          <Alert variant="error" className="mb-6" dismissible>
            {errors.root.message}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Forgot password form"
          className="space-y-5"
        >
          <Input
            label="Email address"
            id="forgot-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            required
            leftIcon={<Mail className="h-4 w-4" />}
            hint="We'll send the reset link to this address."
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            leftIcon={!isSubmitting ? <Send className="h-4 w-4" /> : undefined}
            className="mt-2"
          >
            {isSubmitting ? 'Sending reset link…' : 'Send reset link'}
          </Button>
        </form>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
