import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle, Award, Car, CheckCircle2, Leaf, Plus, Shield, ShoppingBag, Sparkles, Trash2, Trophy, Utensils, X, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrganisationChallenges, createOrganisationChallenge, deleteOrganisationChallenge } from '@/api/organisationApi';
import { formatChallengeText } from '@/utils/formatters';

const card = 'rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-5';
const control = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

function iconFor(key) {
  switch (String(key || '').toLowerCase()) {
    case 'zap': return <Zap className="h-5 w-5 text-amber-500" />;
    case 'car': return <Car className="h-5 w-5 text-blue-500" />;
    case 'shopping-bag': return <ShoppingBag className="h-5 w-5 text-purple-500" />;
    case 'utensils': return <Utensils className="h-5 w-5 text-orange-500" />;
    case 'award': return <Award className="h-5 w-5 text-emerald-500" />;
    case 'shield': return <Shield className="h-5 w-5 text-teal-500" />;
    default: return <Leaf className="h-5 w-5 text-emerald-600" />;
  }
}

function Loading() {
  return (
    <div className="space-y-4" aria-label="Loading challenges">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

function ChallengeFormModal({ onClose, onSaved }) {
  const { t } = useTranslation();
  const closeRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'all',
    metricType: 'LOG_ENTRIES',
    targetValue: 5,
    xpReward: 250,
    iconKey: 'leaf',
    period: 'weekly',
  });

  useEffect(() => {
    closeRef.current?.focus();
    const handle = (e) => { if (e.key === 'Escape' && !saving) onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [onClose, saving]);

  const change = (e) => {
    setErrorMsg(null);
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg(t('orgPortal.challengeTitleRequired', { defaultValue: 'Challenge title is required.' }));
      return;
    }
    setSaving(true);
    try {
      await createOrganisationChallenge(form);
      toast.success(`${t('orgPortal.challengeCreated', { defaultValue: 'Challenge created successfully!' })}: "${form.title}"`);
      onSaved();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || t('orgPortal.challengeCreateFailed', { defaultValue: 'Failed to create challenge.' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <motion.form
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-challenge-title"
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 id="create-challenge-title" className="text-base font-bold text-slate-950 dark:text-white">
              {t('orgPortal.createChallenge', { defaultValue: 'Create Challenge' })}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {t('orgPortal.publishChallenge', { defaultValue: 'Publish a new sustainability challenge for your organisation.' })}
            </p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} disabled={saving} aria-label="Close modal" className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('orgPortal.challengeTitle', { defaultValue: 'Challenge Title *' })}
            </span>
            <input name="title" required value={form.title} onChange={change} className={control} placeholder="e.g. Eco Commute Challenge" />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('orgPortal.description', { defaultValue: 'Description' })}
            </span>
            <input name="description" value={form.description} onChange={change} className={control} placeholder="Describe the goal of this challenge" />
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('activitiesPage.category', { defaultValue: 'Category' })}
            </span>
            <select name="category" value={form.category} onChange={change} className={control}>
              <option value="all">{t('activitiesPage.categories.all', { defaultValue: 'All Categories' })}</option>
              <option value="transport">{t('activitiesPage.categories.transport', { defaultValue: 'Transport' })}</option>
              <option value="electricity">{t('activitiesPage.categories.electricity', { defaultValue: 'Electricity' })}</option>
              <option value="food">{t('activitiesPage.categories.food', { defaultValue: 'Food & Diet' })}</option>
              <option value="shopping">{t('activitiesPage.categories.shopping', { defaultValue: 'Shopping & Retail' })}</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('orgPortal.metricType', { defaultValue: 'Metric Type' })}
            </span>
            <select name="metricType" value={form.metricType} onChange={change} className={control}>
              <option value="LOG_ENTRIES">{t('orgPortal.logEntries', { defaultValue: 'Number of Activity Logs' })}</option>
              <option value="EMISSIONS_REDUCTION">{t('orgPortal.emissionsReduction', { defaultValue: 'Emissions Saved (kg CO₂e)' })}</option>
              <option value="GREEN_COMMUTE">{t('orgPortal.greenCommute', { defaultValue: 'Green Commute Days' })}</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('orgPortal.targetValue', { defaultValue: 'Target Value' })}
            </span>
            <input type="number" name="targetValue" min="1" max="10000" value={form.targetValue} onChange={change} className={control} />
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('orgPortal.xpReward', { defaultValue: 'XP Reward' })}
            </span>
            <input type="number" name="xpReward" min="50" max="5000" step="50" value={form.xpReward} onChange={change} className={control} />
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('orgPortal.frequencyPeriod', { defaultValue: 'Period' })}
            </span>
            <select name="period" value={form.period} onChange={change} className={control}>
              <option value="daily">{t('orgPortal.daily', { defaultValue: 'Daily' })}</option>
              <option value="weekly">{t('orgPortal.weekly', { defaultValue: 'Weekly' })}</option>
              <option value="monthly">{t('orgPortal.monthly', { defaultValue: 'Monthly' })}</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t('orgPortal.icon', { defaultValue: 'Icon' })}
            </span>
            <select name="iconKey" value={form.iconKey} onChange={change} className={control}>
              <option value="leaf">🍃 {t('orgPortal.leaf', { defaultValue: 'Leaf' })}</option>
              <option value="zap">⚡ {t('activitiesPage.categories.electricity', { defaultValue: 'Energy' })}</option>
              <option value="car">🚗 {t('activitiesPage.categories.transport', { defaultValue: 'Transport' })}</option>
              <option value="utensils">🥗 {t('activitiesPage.categories.food', { defaultValue: 'Food' })}</option>
              <option value="shopping">🛍️ {t('activitiesPage.categories.shopping', { defaultValue: 'Shopping' })}</option>
              <option value="trophy">🏆 {t('orgPortal.trophy', { defaultValue: 'Trophy' })}</option>
              <option value="shield">🛡️ {t('orgPortal.shield', { defaultValue: 'Shield' })}</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
            {saving ? t('orgPortal.publishing', { defaultValue: 'Publishing…' }) : t('orgPortal.publishChallengeBtn', { defaultValue: 'Publish Challenge' })}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

export default function OrganisationChallengesPage() {
  const { t, i18n } = useTranslation();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrganisationChallenges();
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || t('orgPortal.challengesLoadError', { defaultValue: 'Unable to load organisation challenges' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`${t('orgPortal.deleteChallengeConfirm', { defaultValue: 'Delete challenge' })} "${title}"?`)) return;
    try {
      await deleteOrganisationChallenge(id);
      toast.success(t('orgPortal.challengeDeleted', { defaultValue: 'Challenge deleted.' }));
      setChallenges((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || t('orgPortal.challengeDeleteFailed', { defaultValue: 'Failed to delete challenge.' }));
    }
  };

  const filtered = useMemo(() => {
    return challenges.filter((c) => {
      if (categoryFilter && c.category !== categoryFilter) return false;
      if (typeFilter === 'custom' && c.organisationId == null) return false;
      if (typeFilter === 'system' && c.organisationId != null) return false;
      return true;
    });
  }, [challenges, categoryFilter, typeFilter]);

  const customCount = challenges.filter((c) => c.organisationId != null).length;
  const systemCount = challenges.length - customCount;

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className={`${card} text-rose-700`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div className="flex-1">
            <h1 className="font-semibold">{t('orgPortal.challengesLoadError', { defaultValue: 'Unable to load organisation challenges' })}</h1>
            <p className="text-sm">{error}</p>
          </div>
          <button type="button" onClick={load} className="rounded-lg border px-3 py-2 text-sm font-semibold">
            {t('common.retry', { defaultValue: 'Retry' })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">
            {t('orgNav.engagement', { defaultValue: 'Organisation Engagement' })}
          </p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-white sm:text-2xl">
            {t('orgNav.sustainabilityChallenges', { defaultValue: 'Sustainability Challenges' })}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {t('orgNav.challengesSubtitle', { defaultValue: 'Manage global eco challenges and launch custom sustainability challenges for your employees.' })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-all shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('orgNav.createChallenge', { defaultValue: 'Create Challenge' })}
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={card}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500">
              {t('orgNav.totalChallenges', { defaultValue: 'Total Challenges' })}
            </span>
            <Trophy className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{challenges.length}</p>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500">
              {t('orgNav.globalSystemChallenges', { defaultValue: 'Global System Challenges' })}
            </span>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{systemCount}</p>
        </div>

        <div className={card}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-500">
              {t('orgNav.orgCustomChallenges', { defaultValue: 'Organisation Custom' })}
            </span>
            <Building2Icon className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{customCount}</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <option value="">{t('orgNav.allCategories', { defaultValue: 'All Categories' })}</option>
          <option value="transport">{t('activitiesPage.categories.transport', { defaultValue: 'Transport' })}</option>
          <option value="electricity">{t('activitiesPage.categories.electricity', { defaultValue: 'Electricity' })}</option>
          <option value="food">{t('activitiesPage.categories.food', { defaultValue: 'Food & Diet' })}</option>
          <option value="shopping">{t('activitiesPage.categories.shopping', { defaultValue: 'Shopping' })}</option>
          <option value="all">{t('orgNav.generalAll', { defaultValue: 'General (All)' })}</option>
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <option value="">{t('orgNav.allChallengeTypes', { defaultValue: 'All Challenge Types' })}</option>
          <option value="system">{t('orgNav.globalSystemChallenges', { defaultValue: 'Global System Challenges' })}</option>
          <option value="custom">{t('orgNav.orgCustomChallenges', { defaultValue: 'Organisation Custom Challenges' })}</option>
        </select>
      </div>

      {/* Challenge Grid */}
      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isCustom = item.organisationId != null;
            return (
              <div key={item.id} className={`${card} relative flex flex-col justify-between border-slate-200 dark:border-slate-800`}>
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                        {iconFor(item.iconKey)}
                      </div>
                      <div>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${isCustom ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
                          {isCustom ? t('orgNav.orgCustom', { defaultValue: 'Org Custom' }) : t('orgNav.globalSystem', { defaultValue: 'Global System' })}
                        </span>
                        <h3 className="text-sm font-bold text-slate-950 dark:text-white">{formatChallengeText(item.title, i18n.language)}</h3>
                      </div>
                    </div>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        aria-label={`Delete ${item.title}`}
                        className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {formatChallengeText(item.description, i18n.language) || t('orgPortal.noDescription', { defaultValue: 'No description provided.' })}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span>
                    {t(`categories.${String(item.category || '').toLowerCase()}`, { defaultValue: item.category })} · {t(`orgNav.${String(item.period || '').toLowerCase()}`, { defaultValue: item.period })}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300">
                    ⚡ +{item.xpReward} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`${card} py-12 text-center`}>
          <Trophy className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">{t('orgPortal.noChallengesMatch', { defaultValue: 'No challenges match these filters' })}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{t('orgPortal.tryChangingFilters', { defaultValue: 'Try changing the category or challenge type filter.' })}</p>
        </div>
      )}

      {showModal && (
        <ChallengeFormModal
          onClose={() => setShowModal(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function Building2Icon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7v14m18-14v14M6 21V10a1 1 0 011-1h4a1 1 0 011 1v11m-6 0h6m4 0V5a1 1 0 011-1h4a1 1 0 011 1v16m-6 0h6" />
    </svg>
  );
}
