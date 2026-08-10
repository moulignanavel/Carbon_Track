import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AlertCircle, Building2, Image, Leaf, RotateCcw, Save } from 'lucide-react';
import { updateOrganisationProfile } from '@/api/organisationApi';
import EcoLottie from '@/components/organisation/EcoLottie';

const EMPTY_DATA = {};
const successAnimation = () => import('@/assets/animations/eco-success.json');
const card = 'rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900';
const control = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const normalize = (value) => ({
  name: value?.name || '',
  code: value?.code || '',
  industry: value?.industry || '',
  organisationType: value?.organisationType || '',
  email: value?.email || '',
  phone: value?.phone || '',
  website: value?.website || '',
  address: value?.address || '',
  city: value?.city || '',
  state: value?.state || '',
  country: value?.country || '',
  postalCode: value?.postalCode || '',
  carbonTarget: value?.carbonTarget ?? '',
  reportingYear: value?.reportingYear ?? new Date().getFullYear(),
  preferredUnit: value?.preferredUnit || 'kg CO₂e',
  reportingFrequency: value?.reportingFrequency || 'monthly',
  logoUrl: value?.logoUrl || '',
  logoData: value?.logoData || '',
});
function SuccessFallback() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="#ecfdf5" />
      <path d="m29 51 14 14 29-31" fill="none" stroke="#059669" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Loading() {
  return (
    <div className="grid gap-3.5 lg:grid-cols-2" aria-label="Loading organisation profile">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}
function Field({ label, name, value, onChange, type = 'text', error, wide = false, required = false }) {
  return (
    <label className={wide ? 'sm:col-span-2' : ''}>
      <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      <input name={name} type={type} required={required} value={value} onChange={onChange} className={control} />
      {error && <span className="mt-1 block text-[11px] text-rose-600">{error}</span>}
    </label>
  );
}
function Section({ title, icon: Icon, children }) {
  return (
    <section className={card}>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 dark:text-white">{title}</h2>
      </div>
      <div className="mt-3.5 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function OrganisationProfilePage({ data, loading, error, onRetry, onReload = onRetry }) {
  const { t } = useTranslation();
  const source = data || EMPTY_DATA,
    profile = source.organisation || null,
    initial = useMemo(() => normalize(profile), [profile]),
    [form, setForm] = useState(initial),
    [errors, setErrors] = useState({}),
    [saving, setSaving] = useState(false),
    [success, setSuccess] = useState(false),
    fileRef = useRef(null),
    reduceMotion = useReducedMotion();
  useEffect(() => setForm(initial), [initial]);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  useEffect(() => {
    const before = (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, [dirty]);
  const change = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Organisation name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email';
    if (form.website) {
      try {
        new URL(form.website);
      } catch {
        next.website = 'Enter a complete URL including https://';
      }
    }
    if (form.carbonTarget !== '' && Number(form.carbonTarget) < 0) next.carbonTarget = 'Target cannot be negative';
    if (!Number.isInteger(Number(form.reportingYear)) || Number(form.reportingYear) < 2000 || Number(form.reportingYear) > 2100) next.reportingYear = 'Enter a reporting year between 2000 and 2100';
    setErrors(next);
    return !Object.keys(next).length;
  };
  const selectLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      toast.error('Logo must be PNG, JPEG, WebP or SVG');
      event.target.value = '';
      return;
    }
    if (file.size > 750 * 1024) {
      toast.error('Logo must be 750 KB or smaller');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((value) => ({ ...value, logoData: String(reader.result), logoUrl: String(reader.result) }));
    reader.onerror = () => toast.error('Unable to read the logo file');
    reader.readAsDataURL(file);
  };
  const cancel = () => {
    if (dirty && !window.confirm('Discard unsaved organisation profile changes?')) return;
    setForm(initial);
    setErrors({});
    if (fileRef.current) fileRef.current.value = '';
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    try {
      const payload = { ...form, carbonTarget: form.carbonTarget === '' ? null : Number(form.carbonTarget), reportingYear: Number(form.reportingYear), officialEmail: form.email, contactNumber: form.phone };
      await updateOrganisationProfile(payload);
      await onReload();
      toast.success('Organisation profile updated');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2200);
    } catch (apiError) {
      toast.error(apiError.response?.data?.error || apiError.response?.data?.message || 'Unable to save organisation profile');
    } finally {
      setSaving(false);
    }
  };
  if (loading) return <Loading />;
  if (error)
    return (
      <section className={`${card} text-rose-700`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <h1 className="font-semibold">{t('orgPortal.profileLoadError', { defaultValue: 'Organisation profile could not be loaded' })}</h1>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={onRetry} className="rounded-lg border px-3 py-2 text-sm font-semibold">
            {t('common.retry', { defaultValue: 'Retry' })}
          </button>
        </div>
      </section>
    );
  return (
    <form onSubmit={submit} className="space-y-4">
      <header>
        <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">
          {t('orgNav.settings', { defaultValue: 'Organisation settings' })}
        </p>
        <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
          {t('orgNav.profileTitle', { defaultValue: 'Organisation Profile' })}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          {t('orgNav.profileSubtitle', { defaultValue: 'Maintain organisation identity, address, reporting preferences and branding.' })}
        </p>
      </header>
      <div className="grid gap-3.5 lg:grid-cols-2">
        <Section title={t('orgNav.infoSection', { defaultValue: 'Organisation Information' })} icon={Building2}>
          <Field label={t('orgNav.orgName', { defaultValue: 'Organisation Name' })} name="name" value={form.name} onChange={change} error={errors.name} required />
          <Field label={t('orgNav.orgCode', { defaultValue: 'Organisation Code' })} name="code" value={form.code} onChange={change} />
          <Field label={t('orgNav.industry', { defaultValue: 'Industry' })} name="industry" value={form.industry} onChange={change} />
          <Field label={t('orgNav.type', { defaultValue: 'Type' })} name="organisationType" value={form.organisationType} onChange={change} />
          <Field label={t('orgNav.officialEmail', { defaultValue: 'Official Email' })} name="email" type="email" value={form.email} onChange={change} error={errors.email} />
          <Field label={t('orgNav.phone', { defaultValue: 'Phone' })} name="phone" type="tel" value={form.phone} onChange={change} />
          <Field label={t('orgNav.website', { defaultValue: 'Website' })} name="website" type="url" value={form.website} onChange={change} error={errors.website} wide />
        </Section>
        <Section title={t('orgNav.addressSection', { defaultValue: 'Address' })} icon={Leaf}>
          <Field label={t('orgNav.addressLine', { defaultValue: 'Address Line' })} name="address" value={form.address} onChange={change} wide />
          <Field label={t('orgNav.city', { defaultValue: 'City' })} name="city" value={form.city} onChange={change} />
          <Field label={t('orgNav.state', { defaultValue: 'State' })} name="state" value={form.state} onChange={change} />
          <Field label={t('orgNav.country', { defaultValue: 'Country' })} name="country" value={form.country} onChange={change} />
          <Field label={t('orgNav.postalCode', { defaultValue: 'Postal Code' })} name="postalCode" value={form.postalCode} onChange={change} />
        </Section>
        <Section title={t('orgNav.sustainabilitySettings', { defaultValue: 'Sustainability Settings' })} icon={Leaf}>
          <Field label={t('orgNav.annualCarbonTarget', { defaultValue: 'Annual Carbon Target' })} name="carbonTarget" type="number" value={form.carbonTarget} onChange={change} error={errors.carbonTarget} />
          <Field label={t('orgNav.reportingYear', { defaultValue: 'Reporting Year' })} name="reportingYear" type="number" value={form.reportingYear} onChange={change} error={errors.reportingYear} />
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('orgNav.preferredUnit', { defaultValue: 'Preferred Unit' })}
            </span>
            <select name="preferredUnit" value={form.preferredUnit} onChange={change} className={control}>
              <option value="kg CO₂e">kg CO₂e</option>
              <option value="t CO₂e">t CO₂e</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('orgNav.reportingFrequency', { defaultValue: 'Reporting Frequency' })}
            </span>
            <select name="reportingFrequency" value={form.reportingFrequency} onChange={change} className={control}>
              <option value="monthly">{t('orgNav.monthly', { defaultValue: 'Monthly' })}</option>
              <option value="quarterly">{t('orgNav.quarterly', { defaultValue: 'Quarterly' })}</option>
              <option value="annual">{t('orgNav.annual', { defaultValue: 'Annual' })}</option>
            </select>
          </label>
        </Section>
        <Section title={t('orgNav.branding', { defaultValue: 'Branding' })} icon={Image}>
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('orgNav.orgLogo', { defaultValue: 'Organisation Logo' })}
            </span>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={selectLogo} className="block w-full rounded-lg border border-slate-300 p-2 text-xs file:mr-2.5 file:rounded-md file:border-0 file:bg-emerald-50 file:px-2.5 file:py-1.5 file:text-xs file:font-bold file:text-emerald-700" />
            <span className="mt-1 block text-[10px] text-slate-400">{t('orgNav.logoSpecs', { defaultValue: 'PNG, JPEG, WebP or SVG · maximum 750 KB' })}</span>
          </label>
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">{t('orgNav.logoPreview', { defaultValue: 'Logo Preview' })}</p>
            <div className="grid min-h-32 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt={`${form.name || 'Organisation'} logo preview`} className="max-h-24 max-w-full object-contain" />
              ) : (
                <div className="text-center text-slate-400">
                  <Image className="mx-auto h-6 w-6" />
                  <p className="mt-1 text-xs">{t('orgNav.noLogoSelected', { defaultValue: 'No logo selected' })}</p>
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>
      <footer className="sticky bottom-4 z-10 flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500" aria-live="polite">
          {dirty ? t('orgNav.unsavedChanges', { defaultValue: 'You have unsaved changes.' }) : t('orgNav.allSaved', { defaultValue: 'All changes are saved.' })}
        </p>
        <div className="flex gap-2.5">
          <button type="button" disabled={!dirty || saving} onClick={cancel} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-40">
            <RotateCcw className="h-3.5 w-3.5" />
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button type="submit" disabled={!dirty || saving} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-40">
            <Save className="h-3.5 w-3.5" />
            {saving ? t('common.saving', { defaultValue: 'Saving…' }) : t('common.saveChanges', { defaultValue: 'Save changes' })}
          </button>
        </div>
      </footer>
      {success && (
        <motion.div initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="fixed bottom-24 right-5 z-50 rounded-xl bg-white p-3.5 text-center shadow-2xl dark:bg-slate-900" aria-live="polite">
          <EcoLottie animationData={successAnimation} loop={false} className="mx-auto h-16 w-16" fallback={<SuccessFallback />} reducedMotionFallback={<SuccessFallback />} />
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{t('orgPortal.profileSaved', { defaultValue: 'Profile saved' })}</p>
        </motion.div>
      )}
    </form>
  );
}

