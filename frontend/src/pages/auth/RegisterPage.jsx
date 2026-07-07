/**
 * RegisterPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Features:
 *  • React Hook Form + Zod (registerSchema)
 *  • Password strength meter (4-segment, live feedback)
 *  • Password requirements checklist (live)
 *  • Custom "accept terms" checkbox
 *  • Field-level + root-level error display
 *  • Loading state on submit button
 *  • Accessible labels, ARIA
 */

import { useForm } from 'react-hook-form'; import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, User, UserPlus, Check, X } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { registerSchema } from '@/utils/validators';
import { extractErrorMessage } from '@/utils/errorHandler';
import { Button, Input, Alert } from '@/components/ui';

/* ── Password strength helpers ───────────────────────────────── */
const REQUIREMENTS = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password) {
  if (!password) return 0;
  return REQUIREMENTS.filter((r) => r.test(password)).length;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = {
  bar: ['', 'bg-red-400', 'bg-amber-400', 'bg-teal-400', 'bg-green-500'],
  text: ['', 'text-red-500', 'text-amber-500', 'text-teal-500', 'text-green-600'],
};

function PasswordStrength({ password }) {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2">
      {/* Bars */}
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? STRENGTH_COLORS.bar[strength] : 'bg-slate-200 dark:bg-slate-700'
              }`}
          />
        ))}
      </div>
      <p className={`text-xs font-semibold ${STRENGTH_COLORS.text[strength]}`}
        aria-live="polite">
        Password strength: {STRENGTH_LABELS[strength]}
      </p>

      {/* Requirements checklist */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
        {REQUIREMENTS.map((req) => {
          const met = req.test(password);
          return (
            <li key={req.id} className={`flex items-center gap-1.5 text-[11px] ${met ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-600'}`}>
              {met
                ? <Check className="h-3 w-3 shrink-0" aria-hidden="true" />
                : <X className="h-3 w-3 shrink-0" aria-hidden="true" />}
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function RegisterPage() {
  const { register: registerUserAccount } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      await registerUserAccount({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created! Welcome aboard 🌱', { id: 'register-success' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('root', { message: extractErrorMessage(err) });
    }
  };

  return (
    <div className="slide-up">
      <div className="bg-emerald-900/40 backdrop-blur-md border border-emerald-700/40 rounded-3xl p-8 sm:p-10 shadow-lg shadow-emerald-950/50 text-white">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800/80 border border-emerald-600/50 shadow-inner mb-4">
            <UserPlus className="h-6 w-6 text-emerald-300" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-emerald-100/80">
            Join thousands tracking their carbon footprint
          </p>
        </div>

        {/* Server error */}
        {errors.root && (
          <Alert variant="error" className="mb-6" dismissible>
            {errors.root.message}
          </Alert>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-label="Create account form"
          className="space-y-5"
        >
          {/* Username */}
          <Input
            label="Username"
            id="reg-username"
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            autoFocus
            required
            leftIcon={<User className="h-4 w-4" />}
            hint="3–50 chars. Letters, numbers, dots, dashes, underscores."
            error={errors.username?.message}
            {...register('username')}
          />

          {/* Email */}
          <Input
            label="Email address"
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password + strength */}
          <div>
            <Input
              label="Password"
              id="reg-password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={password} />
          </div>

          {/* Confirm password */}
          <Input
            label="Confirm password"
            id="reg-confirm"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {/* Terms checkbox */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mt-0.5 h-4 w-4 rounded border-emerald-600/50 bg-emerald-950/50 text-emerald-500 focus:ring-emerald-500 cursor-pointer shrink-0"
                {...register('acceptTerms')}
              />
              <span className="text-sm text-emerald-100/80 leading-snug">
                I agree to the{' '}
                <Link
                  to="#"
                  className="font-semibold text-emerald-300 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link
                  to="#"
                  className="font-semibold text-emerald-300 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p role="alert" className="form-error mt-1.5">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 font-bold"
          >
            {isSubmitting ? 'Creating account…' : 'Create free account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-7 flex items-center gap-3" aria-hidden="true">
          <div className="flex-1 h-px bg-emerald-800/50" />
          <span className="text-xs text-emerald-500/80 font-medium">OR</span>
          <div className="flex-1 h-px bg-emerald-800/50" />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-emerald-100/80">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-emerald-300 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
