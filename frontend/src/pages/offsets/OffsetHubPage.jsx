/**
 * OffsetHubPage.jsx  —  Carbon Offset & Reforestation Hub
 * ─────────────────────────────────────────────────────────────────────────────
 * Net-Zero Footprint tracker, Certified Indian Eco-Projects catalog,
 * Eco-Points offset simulator, and Official Certificate of Climate Action.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Trees, Sun, Wind, Waves, Droplets, ShieldCheck, Award,
  Sparkles, Plus, CheckCircle2, ArrowRight, Download, Printer,
  FileCheck, RefreshCw, BarChart2, TrendingDown, Leaf, HeartHandshake, Coins,
  QrCode, UserCheck, Edit3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

import { useActivity } from '@/context/ActivityContext';
import { useAuth } from '@/context/AuthContext';
import { Card, Badge, Button } from '@/components/ui';
import { formatEmission, formatDate } from '@/utils/formatters';

/* ── Certified Indian Climate Projects Catalog ── */
const OFFSET_PROJECTS = [
  {
    id: 'proj_reforest',
    title: 'Western Ghats Native Reforestation',
    location: 'Karnataka & Kerala, India',
    category: 'Reforestation',
    icon: Trees,
    color: 'emerald',
    badgeVariant: 'success',
    offsetPerUnit: 50, // kg CO2e per tree
    unitName: 'Trees',
    pointsPerUnit: 250, // Eco-Points
    verifiedBy: 'Verra VCS Certified',
    description: 'Restoring degraded native forest corridors in the Western Ghats biodiversity hotspot to sequester carbon and protect endemic wildlife.',
    image: '🌲',
  },
  {
    id: 'proj_solar',
    title: 'Rajasthan Village Solar Microgrids',
    location: 'Thar Desert, Rajasthan, India',
    category: 'Renewable Solar',
    icon: Sun,
    color: 'amber',
    badgeVariant: 'warning',
    offsetPerUnit: 100, // kg CO2e per unit
    unitName: 'Solar Units',
    pointsPerUnit: 400, // Eco-Points
    verifiedBy: 'Gold Standard Certified',
    description: 'Replacing diesel generators with decentralized solar microgrids in off-grid rural communities, displacing fossil fuel energy.',
    image: '☀️',
  },
  {
    id: 'proj_mangrove',
    title: 'Sundarbans Coastal Mangrove Restoration',
    location: 'West Bengal, India',
    category: 'Blue Carbon',
    icon: Waves,
    color: 'cyan',
    badgeVariant: 'info',
    offsetPerUnit: 35,
    unitName: 'Mangroves',
    pointsPerUnit: 150, // Eco-Points
    verifiedBy: 'Plan Vivo Certified',
    description: 'Planting blue carbon coastal mangroves to shield cyclone-prone delta communities, prevent soil erosion, and capture high-density carbon.',
    image: '🌊',
  },
  {
    id: 'proj_wind',
    title: 'Muppandal Wind Energy Grid Expansion',
    location: 'Kanyakumari, Tamil Nadu, India',
    category: 'Wind Energy',
    icon: Wind,
    color: 'teal',
    badgeVariant: 'success',
    offsetPerUnit: 150,
    unitName: 'MWh Credits',
    pointsPerUnit: 500, // Eco-Points
    verifiedBy: 'UN CDM Certified',
    description: 'Expanding high-capacity clean wind turbine infrastructure in Tamil Nadu wind corridors to feed clean electricity into the southern grid.',
    image: '💨',
  },
  {
    id: 'proj_water',
    title: 'Rural Household Clean Water Filtration',
    location: 'Maharashtra & MP, India',
    category: 'Community Health',
    icon: Droplets,
    color: 'blue',
    badgeVariant: 'info',
    offsetPerUnit: 45,
    unitName: 'Water Filters',
    pointsPerUnit: 200, // Eco-Points
    verifiedBy: 'Gold Standard Certified',
    description: 'Providing zero-energy gravity water purifiers to rural households, eliminating the need to burn firewood to boil drinking water.',
    image: '💧',
  },
];

export default function OffsetHubPage() {
  const { t } = useTranslation();
  const { activities } = useActivity();
  const { user } = useAuth();

  /* Persistent Eco-Points balance stored in localStorage */
  const [ecoPoints, setEcoPoints] = useState(() => {
    try {
      const saved = localStorage.getItem('carbontrack_eco_points');
      if (saved !== null) return Number(saved);
      // Base welcome points + bonus for logged activities
      const actsCount = activities ? activities.length : 5;
      return 1500 + actsCount * 100;
    } catch {
      return 2000;
    }
  });

  /* Sync points changes to localStorage */
  useEffect(() => {
    try {
      localStorage.setItem('carbontrack_eco_points', String(ecoPoints));
    } catch (e) {
      console.error('Failed to save points:', e);
    }
  }, [ecoPoints]);

  /* Local Storage for Committed Offsets */
  const [committedOffsets, setCommittedOffsets] = useState(() => {
    try {
      const saved = localStorage.getItem('carbontrack_offsets');
      return saved ? JSON.parse(saved) : [
        {
          id: 'off_101',
          projectId: 'proj_reforest',
          projectTitle: 'Western Ghats Native Reforestation',
          units: 2,
          unitName: 'Trees',
          offsetKg: 100,
          costPoints: 500,
          date: '2026-08-01',
          certId: 'CT-OFF-2026-8821',
        }
      ];
    } catch {
      return [];
    }
  });

  /* Selected Project for Commitment Modal */
  const [selectedProject, setSelectedProject] = useState(null);
  const [quantity, setQuantity] = useState(2);
  const [certModalData, setCertModalData] = useState(null);

  /* Save offsets to localStorage */
  useEffect(() => {
    try {
      localStorage.setItem('carbontrack_offsets', JSON.stringify(committedOffsets));
    } catch (e) {
      console.error('Failed to save offsets:', e);
    }
  }, [committedOffsets]);

  /* Calculate Gross Footprint from user's activities */
  const grossEmissions = useMemo(() => {
    if (!activities || activities.length === 0) return 145.5; // fallback
    return activities.reduce((sum, act) => sum + (act.calculatedEmissions || 0), 0);
  }, [activities]);

  /* Total Committed Offsets */
  const totalOffsetKg = useMemo(() => {
    return committedOffsets.reduce((sum, off) => sum + (off.offsetKg || 0), 0);
  }, [committedOffsets]);

  /* Net Footprint */
  const netEmissions = Math.max(0, grossEmissions - totalOffsetKg);
  const netZeroProgressPct = Math.min(100, Math.round((totalOffsetKg / (grossEmissions || 1)) * 100));

  /* Track last bonus claim date to enforce 1 claim per day */
  const [lastBonusDate, setLastBonusDate] = useState(() => {
    try {
      return localStorage.getItem('carbontrack_last_bonus_date') || '';
    } catch {
      return '';
    }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const isBonusClaimedToday = lastBonusDate === todayStr;

  /* Claim Daily Eco-Bonus (Strictly Once per day) */
  const handleClaimDailyBonus = () => {
    if (isBonusClaimedToday) {
      toast(t('offsetPage.bonusClaimed', { defaultValue: "You have already claimed today's bonus! Come back tomorrow." }));
      return;
    }

    const newBal = ecoPoints + 150;
    setEcoPoints(newBal);
    setLastBonusDate(todayStr);

    try {
      localStorage.setItem('carbontrack_last_bonus_date', todayStr);
    } catch (e) {
      console.error('Failed to save bonus date:', e);
    }

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    toast.success(t('offsetPage.bonusSuccess', { defaultValue: 'Claimed +150 Eco-Points Daily Reward! Next bonus available tomorrow.' }));
  };

  /* Commit Offset Handler */
  const handleCommitOffset = () => {
    if (!selectedProject) return;

    const offsetAmountKg = selectedProject.offsetPerUnit * quantity;
    const totalPointsCost = selectedProject.pointsPerUnit * quantity;

    // Check if user has sufficient points
    if (ecoPoints < totalPointsCost) {
      toast.error(t('offsetPage.notEnoughPoints', { needed: totalPointsCost, have: ecoPoints, defaultValue: `Not enough Eco-Points! You need 🪙 ${totalPointsCost} points, but only have 🪙 ${ecoPoints} points.` }));
      return;
    }

    const certId = `CT-OFF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newEntry = {
      id: `off_${Date.now()}`,
      projectId: selectedProject.id,
      projectTitle: selectedProject.title,
      units: quantity,
      unitName: selectedProject.unitName,
      offsetKg: offsetAmountKg,
      costPoints: totalPointsCost,
      date: todayStr,
      certId,
    };

    // Deduct points from balance and persist
    const newPointsBalance = ecoPoints - totalPointsCost;
    setEcoPoints(newPointsBalance);
    setCommittedOffsets((prev) => [newEntry, ...prev]);

    // Trigger celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast.success(t('offsetPage.offsetSuccess', { amount: formatEmission(offsetAmountKg, 2, t), points: totalPointsCost, balance: newPointsBalance, defaultValue: `Successfully offset ${formatEmission(offsetAmountKg)}! Spent 🪙 ${totalPointsCost} Eco-Points (New Balance: 🪙 ${newPointsBalance}).` }));
    
    // Open Certificate Modal
    setCertModalData(newEntry);
    setSelectedProject(null);
    setQuantity(2);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-900/90 dark:via-teal-900/90 dark:to-cyan-900/90 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('offsetPage.heroBadge', { defaultValue: 'Eco-Points Climate Action Hub' })}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('offsetPage.heroTitle', { defaultValue: 'Carbon Offset & Reforestation Hub' })}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-50 opacity-95 leading-relaxed">
            {t('offsetPage.heroSubtitle', { defaultValue: 'Redeem your earned Eco-Points to support certified Indian reforestation, solar microgrids, and blue carbon mangrove projects. Neutralize your footprint and download official Climate Action Certificates.' })}
          </p>
        </div>
      </div>

      {/* Net-Zero KPI & Progress Card */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Footprint Balance Summary (7 cols) */}
        <Card className="md:col-span-7 p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-emerald-500" />
                {t('offsetPage.netZeroTitle', { defaultValue: 'Net-Zero Footprint Balance' })}
              </h2>
              <Badge variant={netZeroProgressPct >= 100 ? 'success' : 'warning'}>
                {netZeroProgressPct >= 100 
                  ? t('offsetPage.netZeroAchieved', { defaultValue: '🎉 Net-Zero Achieved!' }) 
                  : t('offsetPage.neutralized', { pct: netZeroProgressPct, defaultValue: `${netZeroProgressPct}% Neutralized` })}
              </Badge>
            </div>

            {/* 3 Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 mb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  {t('offsetPage.grossFootprint', { defaultValue: 'Gross Footprint' })}
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                  {formatEmission(grossEmissions, 2, t)}
                </span>
              </div>

              <div className="border-x border-slate-200 dark:border-slate-700 px-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  {t('offsetPage.offsetsCommitted', { defaultValue: 'Offsets Committed' })}
                </span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  -{formatEmission(totalOffsetKg, 2, t)}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  {t('offsetPage.netEmissions', { defaultValue: 'Net Emissions' })}
                </span>
                <span className={`text-lg font-extrabold mt-0.5 block ${netEmissions === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {formatEmission(netEmissions, 2, t)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
                <span className="text-slate-600 dark:text-slate-400">{t('offsetPage.progressToNetZero', { defaultValue: 'Progress to Net-Zero Neutrality:' })}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{netZeroProgressPct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 rounded-full"
                  style={{ width: `${Math.min(100, netZeroProgressPct)}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            {t('offsetPage.formula', { defaultValue: 'Formula:' })} <span className="font-semibold text-slate-700 dark:text-slate-300">{t('offsetPage.formulaText', { defaultValue: 'Net Carbon Footprint = Gross Logged Emissions - Certified Offsets' })}</span>
          </p>
        </Card>

        {/* Eco-Points Balance & Highlight Card (5 cols) */}
        <Card className="md:col-span-5 p-6 border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-amber-400" />
                {t('offsetPage.myEcoPoints', { defaultValue: 'My Eco-Points Balance' })}
              </span>
              <Badge variant="warning">{t('offsetPage.activeWallet', { defaultValue: '🪙 Active Wallet' })}</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{t('offsetPage.availablePoints', { defaultValue: 'Available Eco-Points' })}</p>
                  <p className="text-3xl font-extrabold text-amber-400 mt-0.5 flex items-center gap-1.5">
                    🪙 {ecoPoints.toLocaleString()} <span className="text-sm text-slate-300 font-medium">{t('offsetPage.points', { defaultValue: 'Points' })}</span>
                  </p>
                </div>
                <Button
                  size="xs"
                  variant={isBonusClaimedToday ? 'ghost' : 'outline'}
                  disabled={isBonusClaimedToday}
                  onClick={handleClaimDailyBonus}
                  className={`gap-1 text-[11px] font-bold ${
                    isBonusClaimedToday
                      ? 'text-slate-400 border-slate-700 bg-slate-800/50 cursor-not-allowed opacity-75'
                      : 'text-amber-300 border-amber-400/40 hover:bg-amber-500/20'
                  }`}
                >
                  {isBonusClaimedToday ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      {t('offsetPage.claimedToday', { defaultValue: 'Claimed Today (✓)' })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      {t('offsetPage.dailyBonus', { defaultValue: '+150 Daily Bonus' })}
                    </>
                  )}
                </Button>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('offsetPage.totalOffsets', { defaultValue: 'Total Offsets:' })}</span>
                  <span className="font-bold text-white">{formatEmission(totalOffsetKg, 2, t)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('offsetPage.treesEquivalent', { defaultValue: 'Trees Planted Equivalent:' })}</span>
                  <span className="font-bold text-emerald-300">
                    {t('offsetPage.trees', { n: Math.round(totalOffsetKg / 25), defaultValue: `~${Math.round(totalOffsetKg / 25)} Trees` })}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/10">
                  <span className="text-slate-300 font-semibold">{t('offsetPage.certificatesIssued', { defaultValue: 'Climate Certificates Issued:' })}</span>
                  <span className="font-bold text-cyan-300">{t('offsetPage.certificates', { n: committedOffsets.length, defaultValue: `${committedOffsets.length} Certificates` })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>{t('offsetPage.earnMorePoints', { defaultValue: 'Earn more points via Challenges' })}</span>
            <span className="text-emerald-400 font-bold">{t('offsetPage.freeOffsetting', { defaultValue: '100% Free Offsetting' })}</span>
          </div>
        </Card>
      </div>

      {/* Certified Eco Projects Catalog */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t('offsetPage.certifiedProjects', { defaultValue: 'Certified Indian Eco-Projects' })}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('offsetPage.certifiedSubtitle', { defaultValue: 'Redeem Eco-Points to support verified climate action projects in India' })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {OFFSET_PROJECTS.map((proj) => {
            const Icon = proj.icon;

            return (
              <Card
                key={proj.id}
                className="p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between bg-white dark:bg-slate-900 group"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-2xl group-hover:scale-110 transition-transform">
                        {proj.image}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                          {t(`offsetPage.projects.${proj.id}.title`, { defaultValue: proj.title })}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          📍 {t(`offsetPage.projects.${proj.id}.location`, { defaultValue: proj.location })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    {t(`offsetPage.projects.${proj.id}.description`, { defaultValue: proj.description })}
                  </p>

                  {/* Impact Specs */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 mb-4 border border-slate-100 dark:border-slate-700/50 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('offsetPage.carbonOffsetRate', { defaultValue: 'Carbon Offset Rate:' })}</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {proj.offsetPerUnit} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂ / {t(`offsetPage.projects.${proj.id}.unitSingular`, { defaultValue: proj.unitName.toLowerCase().slice(0, -1) || 'unit' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t('offsetPage.ecoPointsCost', { defaultValue: 'Eco-Points Cost:' })}</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        🪙 {proj.pointsPerUnit} {t('offsetPage.points', { defaultValue: 'Points' })}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">{t('offsetPage.verification', { defaultValue: 'Verification:' })}</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">{proj.verifiedBy}</span>
                    </div>
                  </div>
                </div>

                {/* Commit Action Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Badge variant={proj.badgeVariant}>
                    {t(`offsetPage.projects.${proj.id}.category`, { defaultValue: proj.category })}
                  </Badge>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedProject(proj);
                      setQuantity(2);
                    }}
                    className="gap-1.5 text-xs font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t('offsetPage.redeemOffset', { defaultValue: 'Redeem & Offset' })}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Committed Offsets History Table */}
      <Card className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" />
              {t('offsetPage.myOffsets', { defaultValue: 'My Committed Offset History & Certificates' })}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('offsetPage.myOffsetsSubtitle', { defaultValue: 'View your climate project contributions and download official Carbon Neutrality Certificates' })}
            </p>
          </div>
        </div>

        {committedOffsets.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
            {t('offsetPage.noOffsets', { defaultValue: 'You have not committed any carbon offsets yet. Support a project above to neutralize your emissions!' })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">{t('offsetPage.colDate', { defaultValue: 'Date' })}</th>
                  <th className="py-3 px-4">{t('offsetPage.colProject', { defaultValue: 'Project' })}</th>
                  <th className="py-3 px-4">{t('offsetPage.colContribution', { defaultValue: 'Contribution' })}</th>
                  <th className="py-3 px-4">{t('offsetPage.colCo2Offset', { defaultValue: 'CO₂ Offset' })}</th>
                  <th className="py-3 px-4">{t('offsetPage.colCertId', { defaultValue: 'Certificate ID' })}</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">{t('offsetPage.colAction', { defaultValue: 'Action' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {committedOffsets.map((off) => (
                  <tr key={off.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{formatDate(off.date)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {t(`offsetPage.projects.${off.projectId}.title`, { defaultValue: off.projectTitle })}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {off.units} {t(`offsetPage.projects.${off.projectId}.unitName`, { defaultValue: off.unitName })} (🪙 {off.costPoints || 500} {t('offsetPage.points', { defaultValue: 'pts' })})
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatEmission(off.offsetKg, 2, t)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">{off.certId}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setCertModalData(off)}
                        className="gap-1 text-xs font-semibold"
                      >
                        <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{t('offsetPage.viewCertificate', { defaultValue: 'View Certificate' })}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Commitment Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-xl">{selectedProject.image}</span>
                {t('offsetPage.supportProject', { defaultValue: 'Support Climate Project' })}
              </h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-base">
                {t(`offsetPage.projects.${selectedProject.id}.title`, { defaultValue: selectedProject.title })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                📍 {t(`offsetPage.projects.${selectedProject.id}.location`, { defaultValue: selectedProject.location })} • {selectedProject.verifiedBy}
              </p>
            </div>

            {/* Quantity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">{t('offsetPage.contributionQty', { defaultValue: 'Contribution Quantity:' })}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                  {quantity} {t(`offsetPage.projects.${selectedProject.id}.unitName`, { defaultValue: selectedProject.unitName })}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Calculated Impact Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t('offsetPage.carbonOffsetQty', { defaultValue: 'Carbon Offset Quantity:' })}</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatEmission(selectedProject.offsetPerUnit * quantity, 2, t)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{t('offsetPage.ecoPointsCost', { defaultValue: 'Eco-Points Cost:' })}</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  🪙 {selectedProject.pointsPerUnit * quantity} {t('offsetPage.points', { defaultValue: 'Points' })}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedProject(null)}>
                {t('offsetPage.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button variant="primary" className="flex-1 font-bold gap-1.5" onClick={handleCommitOffset}>
                <CheckCircle2 className="h-4 w-4" />
                {t('offsetPage.redeemOffset', { defaultValue: 'Redeem & Offset' })}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Gold & Emerald Curved Ribbon Certificate Modal */}
      {certModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-3xl space-y-4 mx-auto">
            {/* The Seamless Landscape Certificate Canvas Node */}
            <div
              id="officialClimateCertificate"
              className="w-full relative rounded-xl overflow-hidden flex flex-col space-y-3 box-border"
              style={{
                backgroundColor: '#fdfdfb',
                color: '#0f172a',
                border: '4px solid #d4af37',
                padding: '1.5rem 2rem',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(212, 175, 55, 0.06)',
              }}
            >
              {/* ── Top-Right Luxury Gold & Charcoal Curved Waves ── */}
              <div className="absolute top-0 right-0 w-36 h-36 sm:w-48 sm:h-48 pointer-events-none select-none z-0 overflow-hidden">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path d="M 50,0 Q 150,50 200,180 L 200,0 Z" fill="#0f172a" />
                  <path d="M 80,0 Q 160,70 200,150 L 200,0 Z" fill="#14532d" opacity="0.85" />
                  <path d="M 120,0 Q 175,80 200,120 L 200,0 Z" fill="url(#goldGradTop)" />
                  <defs>
                    <linearGradient id="goldGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* ── Bottom-Left Luxury Gold & Charcoal Corner Accent ── */}
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 pointer-events-none select-none z-0 overflow-hidden">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path d="M 0,60 Q 30,150 140,200 L 0,200 Z" fill="#0f172a" />
                  <path d="M 0,100 Q 50,165 110,200 L 0,200 Z" fill="#14532d" opacity="0.85" />
                  <path d="M 0,140 Q 60,180 80,200 L 0,200 Z" fill="url(#goldGradBot)" />
                  <defs>
                    <linearGradient id="goldGradBot" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="50%" stopColor="#fde68a" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* ── Thin Inlaid Gold Margin Line (All 4 Sides) ── */}
              <div
                className="absolute inset-2.5 sm:inset-3 pointer-events-none rounded-lg z-10"
                style={{ border: '1px solid rgba(212, 175, 55, 0.7)' }}
              />

              {/* ── Top-Left Gold Rosette Seal Medal with Ribbons ── */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 flex flex-col items-center">
                {/* Golden Notched Medal */}
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 shadow-lg flex items-center justify-center relative"
                  style={{ background: 'linear-gradient(135deg, #fcd34d, #fbbf24, #d97706)' }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{
                      border: '2px dashed #fef3c7',
                      background: 'linear-gradient(45deg, #f59e0b, #fcd34d)',
                    }}
                  >
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: '#0f172a', border: '1px solid #fcd34d', color: '#fcd34d' }}
                    >
                      <span className="text-sm sm:text-base font-black">★</span>
                    </div>
                  </div>
                </div>
                {/* Hanging Gold Ribbons */}
                <div className="flex gap-1 -mt-0.5 select-none">
                  <div
                    className="w-2 h-4 shadow-sm"
                    style={{
                      background: 'linear-gradient(to bottom, #fbbf24, #d97706)',
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                    }}
                  />
                  <div
                    className="w-2 h-4 shadow-sm"
                    style={{
                      background: 'linear-gradient(to bottom, #f59e0b, #b45309)',
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                    }}
                  />
                </div>
              </div>

              {/* ── Main Certificate Content (Centered Architecture) ── */}
              <div className="relative z-20 text-center space-y-2 pt-0 max-w-xl mx-auto">
                {/* Grand Header Title */}
                <div>
                  <h1
                    className="text-2xl sm:text-3xl font-serif font-black uppercase whitespace-nowrap"
                    style={{ color: '#1e293b', letterSpacing: '0.14em' }}
                  >
                    {t('offsetPage.certificate.title', { defaultValue: 'CERTIFICATE' })}
                  </h1>
                  <p
                    className="text-[9px] sm:text-[10px] font-sans font-extrabold uppercase mt-0.5"
                    style={{ color: '#0f172a', letterSpacing: '0.28em' }}
                  >
                    {t('offsetPage.certificate.climateSeal', { defaultValue: 'OF CLIMATE ACTION & NEUTRALITY' })}
                  </p>
                </div>

                {/* Presentation Line */}
                <div>
                  <p className="text-[11px] sm:text-xs font-sans font-medium" style={{ color: '#64748b' }}>
                    {t('offsetPage.certificate.presentedTo', { defaultValue: 'This certificate is proudly presented to' })}
                  </p>
                </div>

                {/* Calligraphic Recipient Name */}
                <div className="py-0">
                  <div className="inline-block px-4 py-0.5" style={{ borderBottom: '1.5px solid #cbd5e1' }}>
                    <input
                      type="text"
                      defaultValue={user?.username || 'Charu'}
                      id="certificateRecipientInput"
                      className="text-2xl sm:text-4xl font-serif italic bg-transparent text-center focus:outline-none tracking-wide font-normal"
                      placeholder="Recipient Full Name"
                      style={{
                        color: '#b45309',
                        fontFamily: '"Playfair Display", Georgia, "Brush Script MT", cursive',
                      }}
                    />
                  </div>
                  {/* Decorative Center Dot Line */}
                  <div className="flex items-center justify-center gap-2 mt-1 text-xs" style={{ color: '#94a3b8' }}>
                    <div className="w-12 sm:w-20 h-[1px]" style={{ backgroundColor: '#cbd5e1' }} />
                    <span style={{ color: '#d97706', fontSize: '8px' }}>✦</span>
                    <div className="w-12 sm:w-20 h-[1px]" style={{ backgroundColor: '#cbd5e1' }} />
                  </div>
                </div>

                {/* Achievement Description */}
                <p className="text-[11px] sm:text-xs font-sans max-w-md mx-auto leading-relaxed" style={{ color: '#475569' }}>
                  {t('offsetPage.certificate.presentedBody', { defaultValue: 'For successfully neutralizing and permanently retiring' })}{' '}
                  <strong style={{ color: '#0f172a', fontWeight: 800 }}>{formatEmission(certModalData.offsetKg, 2, t)}</strong>{' '}
                  ({t(`offsetPage.projects.${certModalData.projectId}.title`, { defaultValue: certModalData.projectTitle })}).
                </p>

                {/* Dual Authentic Cursive Calligraphy Signatures Block */}
                <div className="pt-2 grid grid-cols-2 gap-6 items-end text-center">
                  {/* Signatory 1 */}
                  <div className="flex flex-col items-center">
                    <div className="h-9 flex items-center justify-center">
                      <span
                        className="text-2xl sm:text-3xl font-normal select-none -rotate-2"
                        style={{ color: '#0f172a', fontFamily: '"Great Vibes", "Brush Script MT", cursive' }}
                      >
                        Sunita Narain
                      </span>
                    </div>
                    <div className="w-28 sm:w-40 h-[1px] my-0.5" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }} />
                    <p
                      className="font-sans font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider"
                      style={{ color: '#0f172a' }}
                    >
                      {t('offsetPage.certificate.signatory1Name', { defaultValue: 'DR. SUNITA NARAIN' })}
                    </p>
                    <p className="text-[8px] sm:text-[9px] font-sans mt-0.5" style={{ color: '#64748b' }}>
                      {t('offsetPage.certificate.signatory1Title', { defaultValue: 'Chief Climate Officer, CarbonTrack' })}
                    </p>
                  </div>

                  {/* Signatory 2 */}
                  <div className="flex flex-col items-center">
                    <div className="h-9 flex items-center justify-center">
                      <span
                        className="text-2xl sm:text-3xl font-normal select-none -rotate-1"
                        style={{ color: '#0f172a', fontFamily: '"Alex Brush", "Brush Script MT", cursive' }}
                      >
                        K. Ramesh
                      </span>
                    </div>
                    <div className="w-28 sm:w-40 h-[1px] my-0.5" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }} />
                    <p
                      className="font-sans font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider"
                      style={{ color: '#0f172a' }}
                    >
                      {t('offsetPage.certificate.signatory2Name', { defaultValue: 'PROF. K. RAMESH' })}
                    </p>
                    <p className="text-[8px] sm:text-[9px] font-sans mt-0.5" style={{ color: '#64748b' }}>
                      {t('offsetPage.certificate.signatory2Title', { defaultValue: 'Director, Environmental Verification' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Footer Registry ID ── */}
              <div
                className="relative z-20 flex justify-between items-center text-[8px] sm:text-[9px] font-mono pt-2 px-4 pb-0.5"
                style={{ borderTop: '1px solid rgba(203, 213, 225, 0.9)', color: '#334155' }}
              >
                <span className="font-semibold" style={{ color: '#334155' }}>
                  {t('offsetPage.certificate.verifiedBy', { defaultValue: 'Verified by Verra VCS & Gold Standard' })}
                </span>
                <span className="font-bold" style={{ color: '#b45309' }}>
                  {t('offsetPage.certificate.registryId', { defaultValue: 'REGISTRY ID' })}: {certModalData.certId}
                </span>
                <span className="font-semibold" style={{ color: '#334155' }}>carbontrack.org/verify</span>
              </div>
            </div>

            {/* ── High-Contrast Vibrant Modal Action Controls ── */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                className="px-6 py-2.5 rounded-full font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition-all shadow-sm cursor-pointer"
                onClick={() => setCertModalData(null)}
              >
                {t('offsetPage.certificate.close', { defaultValue: 'Close' })}
              </button>

              <button
                type="button"
                className="flex-1 px-6 py-2.5 rounded-full font-bold inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                onClick={async () => {
                  const nameEl = document.getElementById('certificateRecipientInput');
                  const recipient = nameEl ? nameEl.value.trim() : (user?.username || 'Champion');

                  try {
                    try {
                      await document.fonts.ready;
                    } catch (e) {
                      console.warn('Font load:', e);
                    }

                    const canvas = document.createElement('canvas');
                    const w = 2400;
                    const h = 1697; // A4 Landscape ratio
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');

                    // 1. Background
                    ctx.fillStyle = '#fdfdfb';
                    ctx.fillRect(0, 0, w, h);

                    // 2. Outer Gold Borders
                    ctx.strokeStyle = '#d4af37';
                    ctx.lineWidth = 14;
                    ctx.strokeRect(30, 30, w - 60, h - 60);

                    ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(60, 60, w - 120, h - 120);

                    // 3. Top-Right Charcoal & Emerald Waves
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(w - 500, 0);
                    ctx.bezierCurveTo(w - 250, 150, w - 100, 450, w, 550);
                    ctx.lineTo(w, 0);
                    ctx.closePath();
                    ctx.fillStyle = '#0f172a';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(w - 380, 0);
                    ctx.bezierCurveTo(w - 200, 180, w - 80, 380, w, 440);
                    ctx.lineTo(w, 0);
                    ctx.closePath();
                    ctx.fillStyle = '#14532d';
                    ctx.fill();

                    const gradTop = ctx.createLinearGradient(w - 300, 0, w, 300);
                    gradTop.addColorStop(0, '#f59e0b');
                    gradTop.addColorStop(0.5, '#fbbf24');
                    gradTop.addColorStop(1, '#b45309');
                    ctx.beginPath();
                    ctx.moveTo(w - 280, 0);
                    ctx.bezierCurveTo(w - 150, 140, w - 40, 260, w, 300);
                    ctx.lineTo(w, 0);
                    ctx.closePath();
                    ctx.fillStyle = gradTop;
                    ctx.fill();
                    ctx.restore();

                    // 4. Bottom-Left Charcoal & Emerald Waves (Corner Anchored - Zero Text Overlap)
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(0, h - 280);
                    ctx.bezierCurveTo(70, h - 170, 170, h - 70, 280, h);
                    ctx.lineTo(0, h);
                    ctx.closePath();
                    ctx.fillStyle = '#0f172a';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(0, h - 210);
                    ctx.bezierCurveTo(50, h - 130, 130, h - 50, 210, h);
                    ctx.lineTo(0, h);
                    ctx.closePath();
                    ctx.fillStyle = '#14532d';
                    ctx.fill();

                    const gradBot = ctx.createLinearGradient(0, h - 140, 140, h);
                    gradBot.addColorStop(0, '#d97706');
                    gradBot.addColorStop(0.5, '#fde68a');
                    gradBot.addColorStop(1, '#b45309');
                    ctx.beginPath();
                    ctx.moveTo(0, h - 140);
                    ctx.bezierCurveTo(35, h - 80, 80, h - 35, 140, h);
                    ctx.lineTo(0, h);
                    ctx.closePath();
                    ctx.fillStyle = gradBot;
                    ctx.fill();
                    ctx.restore();

                    // 5. Gold Star Medal Badge (Top Left)
                    ctx.save();
                    ctx.translate(170, 170);
                    ctx.beginPath();
                    ctx.arc(0, 0, 70, 0, Math.PI * 2);
                    const medalGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 70);
                    medalGrad.addColorStop(0, '#fde68a');
                    medalGrad.addColorStop(0.6, '#fbbf24');
                    medalGrad.addColorStop(1, '#d97706');
                    ctx.fillStyle = medalGrad;
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(0, 0, 52, 0, Math.PI * 2);
                    ctx.fillStyle = '#0f172a';
                    ctx.fill();
                    ctx.strokeStyle = '#fbbf24';
                    ctx.lineWidth = 4;
                    ctx.stroke();

                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 44px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('★', 0, 2);

                    // Hanging ribbons
                    ctx.fillStyle = '#d97706';
                    ctx.beginPath();
                    ctx.moveTo(-20, 60);
                    ctx.lineTo(-20, 120);
                    ctx.lineTo(-10, 105);
                    ctx.lineTo(0, 120);
                    ctx.lineTo(0, 60);
                    ctx.fill();

                    ctx.fillStyle = '#b45309';
                    ctx.beginPath();
                    ctx.moveTo(0, 60);
                    ctx.lineTo(0, 120);
                    ctx.lineTo(10, 105);
                    ctx.lineTo(20, 120);
                    ctx.lineTo(20, 60);
                    ctx.fill();
                    ctx.restore();

                    // 6. Header Typography
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#1e293b';
                    ctx.font = 'bold 88px "Cinzel", "Playfair Display", Georgia, serif';
                    ctx.fillText('C E R T I F I C A T E', w / 2, 280);

                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'bold 26px "Inter", "Segoe UI", Arial, sans-serif';
                    ctx.fillText('OF CLIMATE ACTION & NEUTRALITY', w / 2, 340);

                    ctx.fillStyle = '#64748b';
                    ctx.font = '500 32px "Inter", "Segoe UI", Arial, sans-serif';
                    ctx.fillText('This certificate is proudly presented to', w / 2, 440);

                    // 7. Recipient Name (Calligraphic)
                    ctx.fillStyle = '#b45309';
                    ctx.font = 'italic bold 110px "Playfair Display", "Times New Roman", Georgia, serif';
                    ctx.fillText(recipient, w / 2, 590);

                    // Divider underline
                    ctx.strokeStyle = '#cbd5e1';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(w / 2 - 320, 640);
                    ctx.lineTo(w / 2 - 40, 640);
                    ctx.moveTo(w / 2 + 40, 640);
                    ctx.lineTo(w / 2 + 320, 640);
                    ctx.stroke();

                    ctx.fillStyle = '#d97706';
                    ctx.font = 'bold 24px sans-serif';
                    ctx.fillText('✦', w / 2, 646);

                    // 8. Description Statement
                    ctx.fillStyle = '#475569';
                    ctx.font = 'normal 32px "Inter", "Segoe UI", Arial, sans-serif';
                    ctx.fillText(
                      `For successfully neutralizing and permanently retiring ${formatEmission(certModalData.offsetKg)} through the`,
                      w / 2,
                      760
                    );
                    ctx.fillText(
                      `${certModalData.projectTitle} verified by CarbonTrack on ${formatDate(certModalData.date)}.`,
                      w / 2,
                      820
                    );

                    // 9. Signatures Block
                    // Signatory 1
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'italic 84px "Great Vibes", "Alex Brush", "Brush Script MT", cursive';
                    ctx.fillText('Sunita Narain', w / 2 - 420, 1140);
                    ctx.restore();

                    ctx.strokeStyle = '#0f172a';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(w / 2 - 580, 1180);
                    ctx.lineTo(w / 2 - 260, 1180);
                    ctx.stroke();

                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'bold 26px sans-serif';
                    ctx.fillText('DR. SUNITA NARAIN', w / 2 - 420, 1230);
                    ctx.fillStyle = '#64748b';
                    ctx.font = 'normal 22px sans-serif';
                    ctx.fillText('Chief Climate Officer, CarbonTrack', w / 2 - 420, 1270);

                    // Signatory 2
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'italic 84px "Alex Brush", "Great Vibes", "Brush Script MT", cursive';
                    ctx.fillText('K. Ramesh', w / 2 + 420, 1140);
                    ctx.restore();

                    ctx.strokeStyle = '#0f172a';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(w / 2 + 260, 1180);
                    ctx.lineTo(w / 2 + 580, 1180);
                    ctx.stroke();

                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'bold 26px sans-serif';
                    ctx.fillText('PROF. K. RAMESH', w / 2 + 420, 1230);
                    ctx.fillStyle = '#64748b';
                    ctx.font = 'normal 22px sans-serif';
                    ctx.fillText('Director, Environmental Verification', w / 2 + 420, 1270);

                    // 10. High-Contrast Footer Details (Positioned Safely Above Bottom Margin)
                    ctx.textAlign = 'left';
                    ctx.fillStyle = '#334155';
                    ctx.font = 'bold 24px monospace';
                    ctx.fillText('Verified by Verra VCS & Gold Standard', 150, h - 90);

                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#b45309';
                    ctx.font = 'bold 26px monospace';
                    ctx.fillText(`REGISTRY ID: ${certModalData.certId}`, w / 2, h - 90);

                    ctx.textAlign = 'right';
                    ctx.fillStyle = '#334155';
                    ctx.font = 'bold 24px monospace';
                    ctx.fillText('carbontrack.org/verify', w - 150, h - 90);

                    // 11. Download PNG
                    const dataUrl = canvas.toDataURL('image/png', 1.0);
                    const link = document.createElement('a');
                    link.download = `Certificate_Climate_Action_${recipient.replace(/\s+/g, '_')}.png`;
                    link.href = dataUrl;
                    link.click();
                    toast.success('Downloaded Standalone Certificate (PNG)!');
                  } catch (err) {
                    console.error('PNG error:', err);
                    toast.error('Failed to export PNG.');
                  }
                }}
              >
                <Download className="h-5 w-5 text-slate-950" />
                <span>{t('offsetPage.certificate.downloadPng', { defaultValue: 'Download Image (PNG)' })}</span>
              </button>

              <button
                type="button"
                className="flex-1 px-6 py-3 rounded-full font-bold inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/30 transition-all cursor-pointer"
                onClick={async () => {
                  const nameEl = document.getElementById('certificateRecipientInput');
                  const recipient = nameEl ? nameEl.value.trim() : (user?.username || 'Champion');

                  try {
                    try {
                      await document.fonts.ready;
                    } catch (e) {
                      console.warn('Font load wait:', e);
                    }

                    const canvas = document.createElement('canvas');
                    const w = 2400;
                    const h = 1697; // A4 Landscape ratio
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');

                    // 1. Background
                    ctx.fillStyle = '#fdfdfb';
                    ctx.fillRect(0, 0, w, h);

                    // 2. Outer Gold Borders
                    ctx.strokeStyle = '#d4af37';
                    ctx.lineWidth = 14;
                    ctx.strokeRect(30, 30, w - 60, h - 60);

                    ctx.strokeStyle = 'rgba(212, 175, 55, 0.7)';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(60, 60, w - 120, h - 120);

                    // 3. Top-Right Charcoal & Emerald Waves
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(w - 500, 0);
                    ctx.bezierCurveTo(w - 250, 150, w - 100, 450, w, 550);
                    ctx.lineTo(w, 0);
                    ctx.closePath();
                    ctx.fillStyle = '#0f172a';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(w - 380, 0);
                    ctx.bezierCurveTo(w - 200, 180, w - 80, 380, w, 440);
                    ctx.lineTo(w, 0);
                    ctx.closePath();
                    ctx.fillStyle = '#14532d';
                    ctx.fill();

                    const gradTop = ctx.createLinearGradient(w - 300, 0, w, 300);
                    gradTop.addColorStop(0, '#f59e0b');
                    gradTop.addColorStop(0.5, '#fbbf24');
                    gradTop.addColorStop(1, '#b45309');
                    ctx.beginPath();
                    ctx.moveTo(w - 280, 0);
                    ctx.bezierCurveTo(w - 150, 140, w - 40, 260, w, 300);
                    ctx.lineTo(w, 0);
                    ctx.closePath();
                    ctx.fillStyle = gradTop;
                    ctx.fill();
                    ctx.restore();

                    // 4. Bottom-Left Charcoal & Emerald Waves (Corner Anchored - Zero Text Overlap)
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(0, h - 280);
                    ctx.bezierCurveTo(70, h - 170, 170, h - 70, 280, h);
                    ctx.lineTo(0, h);
                    ctx.closePath();
                    ctx.fillStyle = '#0f172a';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(0, h - 210);
                    ctx.bezierCurveTo(50, h - 130, 130, h - 50, 210, h);
                    ctx.lineTo(0, h);
                    ctx.closePath();
                    ctx.fillStyle = '#14532d';
                    ctx.fill();

                    const gradBot = ctx.createLinearGradient(0, h - 140, 140, h);
                    gradBot.addColorStop(0, '#d97706');
                    gradBot.addColorStop(0.5, '#fde68a');
                    gradBot.addColorStop(1, '#b45309');
                    ctx.beginPath();
                    ctx.moveTo(0, h - 140);
                    ctx.bezierCurveTo(35, h - 80, 80, h - 35, 140, h);
                    ctx.lineTo(0, h);
                    ctx.closePath();
                    ctx.fillStyle = gradBot;
                    ctx.fill();
                    ctx.restore();

                    // 5. Gold Star Medal Badge (Top Left)
                    ctx.save();
                    ctx.translate(170, 170);
                    ctx.beginPath();
                    ctx.arc(0, 0, 70, 0, Math.PI * 2);
                    const medalGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 70);
                    medalGrad.addColorStop(0, '#fde68a');
                    medalGrad.addColorStop(0.6, '#fbbf24');
                    medalGrad.addColorStop(1, '#d97706');
                    ctx.fillStyle = medalGrad;
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(0, 0, 52, 0, Math.PI * 2);
                    ctx.fillStyle = '#0f172a';
                    ctx.fill();
                    ctx.strokeStyle = '#fbbf24';
                    ctx.lineWidth = 4;
                    ctx.stroke();

                    ctx.fillStyle = '#fbbf24';
                    ctx.font = 'bold 44px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('★', 0, 2);

                    // Hanging ribbons
                    ctx.fillStyle = '#d97706';
                    ctx.beginPath();
                    ctx.moveTo(-20, 60);
                    ctx.lineTo(-20, 120);
                    ctx.lineTo(-10, 105);
                    ctx.lineTo(0, 120);
                    ctx.lineTo(0, 60);
                    ctx.fill();

                    ctx.fillStyle = '#b45309';
                    ctx.beginPath();
                    ctx.moveTo(0, 60);
                    ctx.lineTo(0, 120);
                    ctx.lineTo(10, 105);
                    ctx.lineTo(20, 120);
                    ctx.lineTo(20, 60);
                    ctx.fill();
                    ctx.restore();

                    // 6. Header Typography
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#1e293b';
                    ctx.font = 'bold 88px "Cinzel", "Playfair Display", Georgia, serif';
                    ctx.fillText('C E R T I F I C A T E', w / 2, 280);

                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'bold 26px "Inter", "Segoe UI", Arial, sans-serif';
                    ctx.fillText('OF CLIMATE ACTION & NEUTRALITY', w / 2, 340);

                    ctx.fillStyle = '#64748b';
                    ctx.font = '500 32px "Inter", "Segoe UI", Arial, sans-serif';
                    ctx.fillText('This certificate is proudly presented to', w / 2, 440);

                    // 7. Recipient Name (Calligraphic)
                    ctx.fillStyle = '#b45309';
                    ctx.font = 'italic bold 110px "Playfair Display", "Times New Roman", Georgia, serif';
                    ctx.fillText(recipient, w / 2, 590);

                    // Divider underline
                    ctx.strokeStyle = '#cbd5e1';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(w / 2 - 320, 640);
                    ctx.lineTo(w / 2 - 40, 640);
                    ctx.moveTo(w / 2 + 40, 640);
                    ctx.lineTo(w / 2 + 320, 640);
                    ctx.stroke();

                    ctx.fillStyle = '#d97706';
                    ctx.font = 'bold 24px sans-serif';
                    ctx.fillText('✦', w / 2, 646);

                    // 8. Description Statement
                    ctx.fillStyle = '#475569';
                    ctx.font = 'normal 32px "Inter", "Segoe UI", Arial, sans-serif';
                    ctx.fillText(
                      `For successfully neutralizing and permanently retiring ${formatEmission(certModalData.offsetKg)} through the`,
                      w / 2,
                      760
                    );
                    ctx.fillText(
                      `${certModalData.projectTitle} verified by CarbonTrack on ${formatDate(certModalData.date)}.`,
                      w / 2,
                      820
                    );

                    // 9. Signatures Block
                    // Signatory 1
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'italic 84px "Great Vibes", "Alex Brush", "Brush Script MT", cursive';
                    ctx.fillText('Sunita Narain', w / 2 - 420, 1140);
                    ctx.restore();

                    ctx.strokeStyle = '#0f172a';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(w / 2 - 580, 1180);
                    ctx.lineTo(w / 2 - 260, 1180);
                    ctx.stroke();

                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'bold 26px sans-serif';
                    ctx.fillText('DR. SUNITA NARAIN', w / 2 - 420, 1230);
                    ctx.fillStyle = '#64748b';
                    ctx.font = 'normal 22px sans-serif';
                    ctx.fillText('Chief Climate Officer, CarbonTrack', w / 2 - 420, 1270);

                    // Signatory 2
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'italic 84px "Alex Brush", "Great Vibes", "Brush Script MT", cursive';
                    ctx.fillText('K. Ramesh', w / 2 + 420, 1140);
                    ctx.restore();

                    ctx.strokeStyle = '#0f172a';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(w / 2 + 260, 1180);
                    ctx.lineTo(w / 2 + 580, 1180);
                    ctx.stroke();

                    ctx.fillStyle = '#0f172a';
                    ctx.font = 'bold 26px sans-serif';
                    ctx.fillText('PROF. K. RAMESH', w / 2 + 420, 1230);
                    ctx.fillStyle = '#64748b';
                    ctx.font = 'normal 22px sans-serif';
                    ctx.fillText('Director, Environmental Verification', w / 2 + 420, 1270);

                    // 10. High-Contrast Footer Details (Positioned Safely Above Bottom Margin)
                    ctx.textAlign = 'left';
                    ctx.fillStyle = '#334155';
                    ctx.font = 'bold 24px monospace';
                    ctx.fillText('Verified by Verra VCS & Gold Standard', 150, h - 90);

                    ctx.textAlign = 'center';
                    ctx.fillStyle = '#b45309';
                    ctx.font = 'bold 26px monospace';
                    ctx.fillText(`REGISTRY ID: ${certModalData.certId}`, w / 2, h - 90);

                    ctx.textAlign = 'right';
                    ctx.fillStyle = '#334155';
                    ctx.font = 'bold 24px monospace';
                    ctx.fillText('carbontrack.org/verify', w - 150, h - 90);

                    // 11. Download PDF
                    const imgData = canvas.toDataURL('image/png', 1.0);
                    const pdf = new jsPDF({
                      orientation: 'landscape',
                      unit: 'mm',
                      format: 'a4',
                    });
                    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
                    pdf.save(`Certificate_Climate_Action_${recipient.replace(/\s+/g, '_')}.pdf`);
                    toast.success('Downloaded Official Certificate (PDF)!');
                  } catch (err) {
                    console.error('PDF error:', err);
                    toast.error('Failed to export PDF.');
                  }
                }}
              >
                <Download className="h-5 w-5 text-white" />
                <span>Download PDF Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
