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
      navigate('/', { replace: true });
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
      <div className="slide-up relative">
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] text-white relative overflow-hidden group text-center max-w-md mx-auto">
          {/* Ambient Top Glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] relative">
              <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full" />
              <CheckCircle2 className="h-8 w-8 text-emerald-400 relative z-10" aria-hidden="true" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Check your inbox</h1>

          <p className="mt-3 text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            If an account exists for{' '}
            <span className="font-semibold text-emerald-400 break-all">
              {sentEmail}
            </span>
            , you&apos;ll receive a password reset link shortly.
          </p>

          {/* Tips */}
          <div className="mt-6 rounded-xl bg-black/20 border border-white/10 p-5 text-left space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tips</p>
            {[
              'Check your spam or junk folder',
              'The link expires in 30 minutes',
              'Use the same email you registered with',
            ].map((tip) => (
              <p key={tip} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                {tip}
              </p>
            ))}
          </div>

          {/* Countdown */}
          <p className="mt-6 text-sm text-slate-500">
            Redirecting to sign in in{' '}
            <span className="font-semibold text-emerald-400 tabular-nums">
              {countdown}s
            </span>
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-4">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => navigate('/', { replace: true })}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black"
            >
              Back to sign in
            </Button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-emerald-400 hover:underline disabled:opacity-50 disabled:no-underline mx-auto transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} aria-hidden="true" />
              {resending ? 'Resending…' : "Didn't receive it? Resend"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Form state ──────────────────────────────────────────── */
  return (
    <div className="slide-up relative">
      <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] text-white relative overflow-hidden group max-w-md mx-auto">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-6 relative group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full" />
            <Mail className="h-7 w-7 text-emerald-400 relative z-10" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Forgot password?</h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {/* Server error (shouldn't normally appear — we swallow errors above) */}
        {errors.root && (
          <Alert variant="error" className="mb-6 border-red-500/30 bg-red-500/10 text-red-200" dismissible>
            {errors.root.message}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Forgot password form"
          className="space-y-6"
        >
          <div className="space-y-1.5">
            <Input
              label="Email address"
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              required
              leftIcon={<Mail className="h-4.5 w-4.5 text-emerald-400/70" />}
              hint="We'll send the reset link to this address."
              error={errors.email?.message}
              className="bg-black/20 border-white/10 focus:border-emerald-500/50 text-white placeholder-slate-500"
              {...register('email')}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            leftIcon={!isSubmitting ? <Send className="h-5 w-5" /> : undefined}
            className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 py-3.5 text-base"
          >
            {isSubmitting ? 'Sending reset link…' : 'Send reset link'}
          </Button>
        </form>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
