import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock, Mail, ArrowRight, User } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { loginSchema } from '@/utils/validators';
import { extractErrorMessage } from '@/utils/errorHandler';
import { Button, Input, Alert } from '@/components/ui';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      const authUser = await login(data);
      if (authUser?.role !== 'ADMIN') {
        toast.error('Access Denied: This portal is strictly restricted to Administrators.');
        setError('root', { message: 'Access Denied: You do not have Administrator permissions.' });
        return;
      }

      toast.success(`Welcome back, System Admin ${authUser.username}!`);
      navigate('/admin', { replace: true });
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError('root', { message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6 fade-in">
        {/* Admin Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl shadow-purple-500/30 ring-4 ring-purple-500/20">
            <ShieldCheck className="h-9 w-9 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
              {t('adminPage.portalLogin', { defaultValue: 'Admin Portal Login' })}
            </h1>
            <p className="text-xs text-purple-300/80 mt-1 font-medium">
              {t('adminPage.authSubtitle', { defaultValue: 'CarbonTrack Restricted Administrator Authentication' })}
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/50 space-y-5">
          {errors.root && (
            <Alert variant="danger" className="bg-red-950/50 border-red-800/80 text-red-200 text-xs">
              {errors.root.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {t('adminPage.adminEmail', { defaultValue: 'Admin Email Address' })}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-purple-400" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  error={errors.email?.message}
                  className="pl-10 bg-slate-950/60 border-purple-500/30 text-white placeholder-slate-500 focus:border-purple-400 focus:ring-purple-400 text-sm py-2.5"
                  {...register('email')}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {t('adminPage.adminPassword', { defaultValue: 'Admin Password' })}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-purple-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  className="pl-10 bg-slate-950/60 border-purple-500/30 text-white placeholder-slate-500 focus:border-purple-400 focus:ring-purple-400 text-sm py-2.5"
                  {...register('password')}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 text-sm mt-2"
            >
              {isSubmitting ? (
                t('adminPage.authenticating', { defaultValue: 'Authenticating Admin...' })
              ) : (
                <>
                  <span>{t('adminPage.signInAdmin', { defaultValue: 'Sign In as Admin' })}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('adminPage.standardLogin', { defaultValue: 'Standard User Login' })}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

