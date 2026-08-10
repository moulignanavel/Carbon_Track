/**
 * ResetPasswordPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Features:
 *  • React Hook Form + Zod for matching passwords
 *  • Submits token from URL to backend to set new password
 *  • High-end premium dark glassmorphic UI
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

import { resetPassword } from '@/api/authApi';
import { extractErrorMessage } from '@/utils/errorHandler';
import { Button, Input, Alert } from '@/components/ui';

// Custom schema for matching passwords
const resetSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    if (!token) {
      setError('root', { message: t('authPage.missingToken', { defaultValue: 'Reset token is missing from the URL.' }) });
      return;
    }

    try {
      await resetPassword({ token, password: data.newPassword });
      setSuccess(true);
      toast.success(t('authPage.passwordResetComplete', { defaultValue: 'Password reset successfully!' }));
    } catch (err) {
      setError('root', { message: extractErrorMessage(err) });
    }
  };

  /* ── Success state ───────────────────────────────────────── */
  if (success) {
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

          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
            {t('authPage.passwordResetComplete', { defaultValue: 'Password Reset Complete' })}
          </h1>

          <p className="mt-3 text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            {t('authPage.passwordResetDesc', { defaultValue: 'Your password has been securely updated. You can now use your new password to sign in to your account.' })}
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-4">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => navigate('/', { replace: true })}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black"
            >
              {t('authPage.goToSignIn', { defaultValue: 'Go to sign in' })}
            </Button>
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
            <Lock className="h-7 w-7 text-emerald-400 relative z-10" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
            {t('authPage.setNewPassword', { defaultValue: 'Set New Password' })}
          </h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            {t('authPage.setNewPasswordSubtitle', { defaultValue: 'Please enter your new password below.' })}
          </p>
        </div>

        {/* Missing token error */}
        {!token && (
          <Alert variant="error" className="mb-6 border-red-500/30 bg-red-500/10 text-red-200">
            {t('authPage.missingToken', { defaultValue: 'Missing reset token. Please use the link provided in your email.' })}
          </Alert>
        )}

        {/* Server error */}
        {errors.root && (
          <Alert variant="error" className="mb-6 border-red-500/30 bg-red-500/10 text-red-200" dismissible>
            {errors.root.message}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Reset password form"
          className="space-y-6"
        >
          <div className="space-y-1.5">
            <Input
              label={t('authPage.newPassword', { defaultValue: 'New Password' })}
              id="new-password"
              type="password"
              placeholder={t('authPage.newPasswordPlaceholder', { defaultValue: 'Enter new password' })}
              autoFocus
              required
              disabled={!token || isSubmitting}
              leftIcon={<Lock className="h-4.5 w-4.5 text-emerald-400/70" />}
              error={errors.newPassword?.message}
              className="bg-black/20 border-white/10 focus:border-emerald-500/50 text-white placeholder-slate-500"
              {...register('newPassword')}
            />
          </div>

          <div className="space-y-1.5">
            <Input
              label={t('authPage.confirmPassword', { defaultValue: 'Confirm Password' })}
              id="confirm-password"
              type="password"
              placeholder={t('authPage.confirmPasswordPlaceholder', { defaultValue: 'Confirm new password' })}
              required
              disabled={!token || isSubmitting}
              leftIcon={<Lock className="h-4.5 w-4.5 text-emerald-400/70" />}
              error={errors.confirmPassword?.message}
              className="bg-black/20 border-white/10 focus:border-emerald-500/50 text-white placeholder-slate-500"
              {...register('confirmPassword')}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!token}
            isLoading={isSubmitting}
            rightIcon={!isSubmitting ? <ArrowRight className="h-5 w-5" /> : undefined}
            className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 py-3.5 text-base"
          >
            {isSubmitting 
              ? t('authPage.updatingPassword', { defaultValue: 'Updating password…' }) 
              : t('authPage.resetPassword', { defaultValue: 'Reset password' })}
          </Button>
        </form>
      </div>
    </div>
  );
}

