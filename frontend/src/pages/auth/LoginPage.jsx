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
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { loginSchema } from '@/utils/validators';
import { extractErrorMessage } from '@/utils/errorHandler';
import { getRememberedEmail, hasRememberedEmail } from '@/utils/storage';
import { Button, Input, Alert } from '@/components/ui';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const from = location.state?.from?.pathname;
  const sessionExpired = params.get('reason') === 'session_expired';

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: getRememberedEmail(),
      password: '',
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
      const loggedUser = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      toast.success('Welcome back! 👋', { id: 'login-success' });
      const home = loggedUser?.role === 'ADMIN' ? '/admin'
        : loggedUser?.role === 'ORG_ADMIN' ? '/organisation' : '/dashboard';
      navigate(from && from !== '/' ? from : home, { replace: true });
    } catch (err) {
      setError('root', { message: extractErrorMessage(err) });
    }
  };

  return (
    <div className="slide-up relative">
      {/* ── Card ─────────────────────────────────────────────── */}
      <div className="bg-[#0F2E22]/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] text-[#F3EFE4] relative overflow-hidden group">

        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7FBF8C]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Header */}
        <div className="mb-10 text-center">

          <h1 className="text-3xl font-black text-[#F3EFE4] tracking-tight">{t('auth.welcomeBack')}</h1>
          <p className="mt-2 text-sm text-[#9FAFA5] font-medium">
            {t('auth.signInToAccount')}
          </p>
        </div>

        {/* Session expired banner */}
        {sessionExpired && (
          <Alert variant="warning" className="mb-6 border-amber-500/30 bg-amber-500/10 text-amber-200">
            {t('auth.sessionExpired')}
          </Alert>
        )}

        {/* Root / server error */}
        {errors.root && (
          <Alert variant="error" className="mb-6 border-red-500/30 bg-red-500/10 text-red-200" dismissible>
            {errors.root.message}
          </Alert>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Sign in form"
          className="space-y-6"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <Input
              label={t('auth.emailOrUsername')}
              id="login-email"
              type="text"
              placeholder={t('auth.emailOrUsernamePlaceholder')}
              autoComplete="email"
              autoFocus
              required
              leftIcon={<Mail className="h-4.5 w-4.5 text-emerald-600" />}
              error={errors.email?.message}
              className="!bg-white border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/20 text-slate-900 placeholder-slate-400 !rounded-xl font-medium shadow-sm"
              {...register('email')}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="login-password"
                className="form-label !mb-0 text-[#F3EFE4] font-medium"
              >
                {t('auth.password')}
                <span className="ml-0.5 text-[#7FBF8C]" aria-hidden="true">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#7FBF8C] hover:text-[#94D1A0] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FBF8C] rounded transition-colors"
                tabIndex={0}
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <Input
              id="login-password"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              autoComplete="current-password"
              required
              leftIcon={<Lock className="h-4.5 w-4.5 text-emerald-600" />}
              error={errors.password?.message}
              className="!bg-white border-slate-200 focus:border-green-600 focus:ring-2 focus:ring-green-500/20 text-slate-900 placeholder-slate-400 !rounded-xl font-medium shadow-sm"
              {...register('password')}
            />
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-3 cursor-pointer group select-none pt-2">
            <div className="flex items-center justify-center h-5">
              <input
                type="checkbox"
                id="rememberMe"
                className="peer h-4 w-4 rounded border-[#1E4432] bg-[#06140F]/50 text-[#7FBF8C] focus:ring-[#7FBF8C]/50 focus:ring-offset-0 cursor-pointer transition-all"
                {...register('rememberMe')}
              />
            </div>
            <span className="text-sm font-medium text-[#9FAFA5] group-hover:text-[#F3EFE4] transition-colors leading-5">
              {t('auth.rememberMe')}
            </span>
          </label>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            rightIcon={!isSubmitting ? <ArrowRight className="h-5 w-5" /> : undefined}
            className="mt-4 bg-[#7FBF8C] hover:bg-[#94D1A0] text-[#06140F] font-black shadow-[0_0_20px_rgba(127,191,140,0.25)] hover:shadow-[0_0_30px_rgba(127,191,140,0.4)] transition-all duration-300 py-3.5 text-base"
          >
            {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4" aria-hidden="true">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1E4432] to-transparent" />
          <span className="text-xs text-[#5B7A67] font-bold uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#1E4432] to-transparent" />
        </div>

        {/* Google Sign In */}
        <div className="mb-8 flex justify-center">
          <GoogleLoginButton />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-[#9FAFA5] font-medium">
          {t('auth.dontHaveAccount')}{' '}
          <Link
            to="/register"
            className="font-bold text-[#7FBF8C] hover:text-[#94D1A0] transition-all"
          >
            {t('auth.createOneFree')}
          </Link>
        </p>
      </div>
    </div>
  );
}
