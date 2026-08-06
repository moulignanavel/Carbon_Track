import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, EyeOff, ImagePlus, KeyRound, Save, ShieldCheck, UserRound, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { changeOrganisationPassword, updateOrganisationAdminProfile } from '@/api/organisationApi';
import EcoLottie from '@/components/organisation/EcoLottie';
import { useAuth } from '@/context/AuthContext';

const successAnimation = () => import('@/assets/animations/eco-success.json');
const control = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800';
const card = 'rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-4';
const emptyProfile = { name: '', email: '', phone: '', jobTitle: '', role: '', organisation: '', photo: '' };
const normalize = (value) => ({ ...emptyProfile, ...(value || {}) });
const safeMessage = (error, fallback) => error?.response?.data?.error || error?.response?.data?.message || fallback;
const initials = (name) =>
  String(name || 'Organisation Admin')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'OA';

function Success({ label }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-100 bg-white p-3.5 text-center shadow-2xl dark:border-emerald-900 dark:bg-slate-900" role="status">
      <EcoLottie animationData={successAnimation} loop={false} className="mx-auto h-14 w-14" fallback={<ShieldCheck className="h-14 w-14 p-2 text-emerald-600" />} reducedMotionFallback={<ShieldCheck className="h-14 w-14 p-2 text-emerald-600" />} />
      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{label}</p>
    </motion.div>
  );
}
function Field({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      <input {...props} className={`${control} ${error ? 'border-rose-500' : ''}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${props.name}-error` : undefined} />
      {error && (
        <span id={`${props.name}-error`} className="mt-1 block text-[11px] text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}

function ProfileForm({ value, onReload }) {
  const initial = useMemo(() => normalize(value), [value]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const fileRef = useRef(null);
  const { updateUser } = useAuth();
  useEffect(() => {
    setForm(initial);
  }, [initial]);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  useEffect(() => {
    const warn = (event) => {
      if (dirty && editing) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, editing]);
  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: '' }));
  };
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid work email';
    if (form.phone && !/^[+()\-\s\d]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number';
    setErrors(next);
    return !Object.keys(next).length;
  };
  const photo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Choose a PNG, JPEG or WebP profile photo');
      event.target.value = '';
      return;
    }
    if (file.size > 500 * 1024) {
      toast.error('Profile photo must be 500 KB or smaller');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, photo: String(reader.result) }));
    reader.onerror = () => toast.error('Unable to read the selected photo');
    reader.readAsDataURL(file);
  };
  const cancel = () => {
    if (dirty && !window.confirm('Discard unsaved profile changes?')) return;
    setForm(initial);
    setErrors({});
    setEditing(false);
    if (fileRef.current) fileRef.current.value = '';
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving || !validate()) return;
    setSaving(true);
    try {
      const saved = await updateOrganisationAdminProfile({ fullName: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), jobTitle: form.jobTitle.trim(), avatarUrl: form.photo });
      setForm(normalize(saved));
      updateUser({ username: saved.name, avatarUrl: saved.photo });
      await onReload(true);
      setEditing(false);
      toast.success('Profile updated');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2200);
    } catch (error) {
      toast.error(safeMessage(error, 'Unable to update profile'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={submit} className={card}>
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          {form.photo ? (
            <img src={form.photo} alt="Profile" className="h-20 w-20 rounded-xl object-cover ring-2 ring-emerald-50 dark:ring-emerald-950" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-xl bg-emerald-100 text-xl font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{initials(form.name)}</div>
          )}
          {editing && (
            <label className="absolute -bottom-1.5 -right-1.5 grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-emerald-700 text-white shadow-md" title="Choose profile photo">
              <ImagePlus className="h-4 w-4" />
              <input ref={fileRef} type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" onChange={photo} />
            </label>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-bold text-slate-950 dark:text-white">{form.name || 'Organisation administrator'}</h2>
          <p className="truncate text-xs text-slate-500">{form.email || 'No work email available'}</p>
          <p className="mt-1 text-[10px] text-slate-400">PNG, JPEG or WebP · maximum 500 KB</p>
        </div>
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800">
            Edit profile
          </button>
        )}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Full name" name="name" value={form.name} onChange={change} disabled={!editing} error={errors.name} required />
        <Field label="Work email" name="email" type="email" value={form.email} onChange={change} disabled={!editing} error={errors.email} required />
        <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={change} disabled={!editing} error={errors.phone} />
        <Field label="Job title" name="jobTitle" value={form.jobTitle} onChange={change} disabled={!editing} />
        <Field label="Role" name="role" value={form.role === 'ORG_ADMIN' ? 'Organisation Administrator' : form.role} disabled />
        <Field label="Organisation" name="organisation" value={form.organisation} disabled />
      </div>
      {editing && (
        <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button type="button" onClick={cancel} disabled={saving} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
          <button type="submit" disabled={!dirty || saving} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}
      {success && <Success label="Profile saved" />}
    </form>
  );
}

function PasswordForm() {
  const blank = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [form, setForm] = useState(blank);
  const [visible, setVisible] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const rules = [
    ['length', 'At least 8 characters', form.newPassword.length >= 8],
    ['upper', 'One uppercase letter', /[A-Z]/.test(form.newPassword)],
    ['lower', 'One lowercase letter', /[a-z]/.test(form.newPassword)],
    ['number', 'One number', /\d/.test(form.newPassword)],
    ['special', 'One special character', /[^A-Za-z0-9]/.test(form.newPassword)],
  ];
  const strength = rules.filter((rule) => rule[2]).length;

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const next = {};
    if (!form.currentPassword) next.currentPassword = 'Enter your current password';
    if (strength < 5) next.newPassword = 'Your password must meet every rule';
    if (form.confirmPassword !== form.newPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      await changeOrganisationPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm(blank);
      setVisible({});
      toast.success('Password changed');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2200);
    } catch (error) {
      setForm((current) => ({ ...current, currentPassword: '' }));
      toast.error(safeMessage(error, 'Unable to change password'));
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={submit} className={card}>
      <div className="mb-4 flex items-start gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <KeyRound className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">Change password</h2>
          <p className="mt-0.5 text-xs text-slate-500">Your existing password is never displayed or returned by the server.</p>
        </div>
      </div>
      <div className="space-y-3">
        {[
          ['currentPassword', 'Current password'],
          ['newPassword', 'New password'],
          ['confirmPassword', 'Confirm new password'],
        ].map(([name, label]) => (
          <label key={name} className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
            <div className="relative">
              <input
                name={name}
                type={visible[name] ? 'text' : 'password'}
                value={form[name]}
                onChange={(event) => {
                  setForm((current) => ({ ...current, [name]: event.target.value }));
                  setErrors((current) => ({ ...current, [name]: '' }));
                }}
                autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'}
                className={`${control} pr-9 ${errors[name] ? 'border-rose-500' : ''}`}
                aria-invalid={Boolean(errors[name])}
                required
              />
              <button type="button" onClick={() => setVisible((current) => ({ ...current, [name]: !current[name] }))} className="absolute inset-y-0 right-0 grid w-9 place-items-center text-slate-500" aria-label={`${visible[name] ? 'Hide' : 'Show'} ${label.toLowerCase()}`}>
                {visible[name] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {errors[name] && <span className="mt-1 block text-[11px] text-rose-600">{errors[name]}</span>}
          </label>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
        <div className="flex justify-between text-xs font-semibold">
          <span>Password strength</span>
          <span>{['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'][strength]}</span>
        </div>
        <div className="mt-1.5 grid grid-cols-5 gap-1" aria-hidden="true">
          {rules.map((rule, index) => (
            <span key={rule[0]} className={`h-1.5 rounded-full ${index < strength ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
          ))}
        </div>
        <ul className="mt-2.5 grid gap-1 text-[11px] sm:grid-cols-2">
          {rules.map(([key, label, met]) => (
            <li key={key} className={met ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}>
              {met ? '✓' : '○'} {label}
            </li>
          ))}
        </ul>
      </div>
      <button type="submit" disabled={saving} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-emerald-700 dark:hover:bg-emerald-800">
        <ShieldCheck className="h-3.5 w-3.5" />
        {saving ? 'Updating…' : 'Update password'}
      </button>
      {success && <Success label="Password changed" />}
    </form>
  );
}

export default function OrganisationAdminProfilePage({ data, loading, error, onRetry, onReload }) {
  if (loading)
    return (
      <div className="grid gap-3.5 lg:grid-cols-2">
        <div className="h-[460px] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-[460px] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  if (error)
    return (
      <div className={`${card} text-rose-700`}>
        Unable to load your profile.{' '}
        <button onClick={onRetry} className="ml-2 underline font-bold">
          Retry
        </button>
      </div>
    );
  return (
    <div className="space-y-4">
      <header>
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">
          <UserRound className="h-3.5 w-3.5" />
          Account settings
        </div>
        <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">My Profile</h1>
        <p className="mt-0.5 text-xs text-slate-500">Manage your administrator information and account security.</p>
      </header>
      <div className="grid items-start gap-3.5 xl:grid-cols-2">
        <ProfileForm value={data?.adminProfile} onReload={onReload} />
        <PasswordForm />
      </div>
    </div>
  );
}
