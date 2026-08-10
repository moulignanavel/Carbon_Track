/**
 * EnergySimulatorPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Smart Home Energy & Household Appliance Auditor.
 * Interactive Indian household electricity simulator with:
 *  - Appliance-level wattage, star ratings, and daily hours
 *  - Rooftop Solar PV & PM Surya Ghar Net-Zero simulator
 *  - Monthly EB bill estimate (₹ INR) & Carbon Footprint (kg CO2e)
 *  - Energy efficiency upgrade recommendations
 *  - 1-Click direct log to CarbonTrack activity tracker
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import {
  Zap, Sun, Wind, CheckCircle2, TrendingDown,
  Sparkles, DollarSign, Leaf, HelpCircle, ArrowRight,
  ShieldCheck, RefreshCw, Plus, ChevronRight, Award,
  Sliders, BatteryCharging, Home, AlertCircle,
} from 'lucide-react';

import activityService from '@/services/api/activityService';
import { Button, Card, Badge, StatCard } from '@/components/ui';

/* ── Default Indian Household Appliances ── */
const INITIAL_APPLIANCES = [
  {
    id: 'ac',
    name: 'Air Conditioner (1.5 Ton)',
    icon: '❄️',
    rating: '5star_inverter',
    powerW: 950,
    qty: 1,
    hoursPerDay: 8,
    acTemp: 24,
    options: [
      { key: '5star_inverter', label: '5-Star Inverter (950W)', power: 950 },
      { key: '3star_inverter', label: '3-Star Inverter (1250W)', power: 1250 },
      { key: 'non_inverter', label: 'Non-Inverter (1650W)', power: 1650 },
    ],
  },
  {
    id: 'fan',
    name: 'Ceiling Fans',
    icon: '🌀',
    rating: 'bldc',
    powerW: 28,
    qty: 4,
    hoursPerDay: 14,
    options: [
      { key: 'bldc', label: 'BLDC 5-Star (28W)', power: 28 },
      { key: 'standard', label: 'Standard Induction (75W)', power: 75 },
    ],
  },
  {
    id: 'fridge',
    name: 'Refrigerator (260L)',
    icon: '🧊',
    rating: '5star',
    powerW: 140,
    qty: 1,
    hoursPerDay: 24,
    options: [
      { key: '5star', label: '5-Star Inverter (140W)', power: 140 },
      { key: '3star', label: '3-Star Frost Free (220W)', power: 220 },
      { key: 'old', label: 'Old Direct Cool (320W)', power: 320 },
    ],
  },
  {
    id: 'geyser',
    name: 'Water Heater / Geyser',
    icon: '♨️',
    rating: 'storage',
    powerW: 2000,
    qty: 1,
    hoursPerDay: 1.5,
    options: [
      { key: 'solar', label: 'Solar Water Heater (0W Grid)', power: 0 },
      { key: 'instant', label: 'Instant Geyser (3000W)', power: 3000 },
      { key: 'storage', label: 'Storage Geyser (2000W)', power: 2000 },
    ],
  },
  {
    id: 'tv',
    name: 'Smart Television (55")',
    icon: '📺',
    rating: 'led',
    powerW: 85,
    qty: 1,
    hoursPerDay: 5,
    options: [
      { key: 'oled', label: 'OLED / 4K (120W)', power: 120 },
      { key: 'led', label: 'Smart LED (85W)', power: 85 },
      { key: 'small', label: '32" HD LED (45W)', power: 45 },
    ],
  },
  {
    id: 'lighting',
    name: 'Home Lighting Points',
    icon: '💡',
    rating: 'led_9w',
    powerW: 9,
    qty: 12,
    hoursPerDay: 6,
    options: [
      { key: 'led_9w', label: '9W LED Bulbs (9W)', power: 9 },
      { key: 'cfl', label: 'CFL Lights (20W)', power: 20 },
      { key: 'incandescent', label: 'Incandescent Bulbs (60W)', power: 60 },
    ],
  },
  {
    id: 'wfh',
    name: 'Work From Home (Laptop & Monitor)',
    icon: '💻',
    rating: 'laptop_monitor',
    powerW: 110,
    qty: 1,
    hoursPerDay: 8,
    options: [
      { key: 'laptop_monitor', label: 'Laptop + Dual Monitor (110W)', power: 110 },
      { key: 'laptop_only', label: 'Laptop Only (50W)', power: 50 },
      { key: 'desktop', label: 'Desktop Tower (250W)', power: 250 },
    ],
  },
  {
    id: 'washing',
    name: 'Washing Machine',
    icon: '🧺',
    rating: 'front_load',
    powerW: 350,
    qty: 1,
    hoursPerDay: 0.8,
    options: [
      { key: 'front_load', label: '5-Star Front Load (350W)', power: 350 },
      { key: 'top_load', label: 'Top Load Automatic (450W)', power: 450 },
      { key: 'semi_auto', label: 'Semi-Automatic (550W)', power: 550 },
    ],
  },
];

/* ── Indian DISCOM Electricity Tariff Calculator (Tiered Slabs) ── */
function calculateIndianElectricityBill(monthlyKwh) {
  let bill = 0;
  let remaining = monthlyKwh;

  // Slab 1: 0 - 100 units @ ₹4.50
  const slab1 = Math.min(remaining, 100);
  bill += slab1 * 4.5;
  remaining -= slab1;

  if (remaining > 0) {
    // Slab 2: 101 - 300 units @ ₹6.50
    const slab2 = Math.min(remaining, 200);
    bill += slab2 * 6.5;
    remaining -= slab2;
  }

  if (remaining > 0) {
    // Slab 3: 301 - 500 units @ ₹8.00
    const slab3 = Math.min(remaining, 200);
    bill += slab3 * 8.0;
    remaining -= slab3;
  }

  if (remaining > 0) {
    // Slab 4: > 500 units @ ₹9.50
    bill += remaining * 9.5;
  }

  // Add fixed meter charges (~₹120)
  bill += 120;
  return Math.round(bill);
}

export default function EnergySimulatorPage() {
  const { t } = useTranslation();
  const [appliances, setAppliances] = useState(INITIAL_APPLIANCES);
  const [solarCapacityKw, setSolarCapacityKw] = useState(0); // 0, 1, 2, 3, 5 kW
  const [isLogging, setIsLogging] = useState(false);

  // Update appliance property
  const handleUpdateAppliance = (id, field, value) => {
    setAppliances((prev) =>
      prev.map((app) => {
        if (app.id !== id) return app;
        if (field === 'rating') {
          const opt = app.options.find((o) => o.key === value);
          return { ...app, rating: value, powerW: opt ? opt.power : app.powerW };
        }
        return { ...app, [field]: value };
      })
    );
  };

  // Calculations
  const metrics = useMemo(() => {
    let totalDailyKwh = 0;

    appliances.forEach((app) => {
      // For AC, slight modifier if temp is altered
      let effectivePower = app.powerW;
      if (app.id === 'ac' && app.acTemp) {
        // Every 1 deg above 24 saves 6% power, below adds 6%
        const tempDiff = 24 - app.acTemp;
        effectivePower = app.powerW * (1 + tempDiff * 0.06);
      }

      // Refrigerator duty cycle is ~40% compressor running time
      const dutyCycle = app.id === 'fridge' ? 0.45 : 1.0;
      const dailyKwh = (effectivePower * app.qty * app.hoursPerDay * dutyCycle) / 1000;
      totalDailyKwh += dailyKwh;
    });

    const monthlyGrossKwh = Math.round(totalDailyKwh * 30);
    // Solar generation in India: ~120 kWh / month per kW installed
    const monthlySolarGenerationKwh = Math.round(solarCapacityKw * 120);
    const netGridKwh = Math.max(0, monthlyGrossKwh - monthlySolarGenerationKwh);

    // Carbon Footprint: CEA Indian Grid Baseline = 0.72 kg CO2e / kWh
    const grossCarbonKg = Number((monthlyGrossKwh * 0.72).toFixed(1));
    const netCarbonKg = Number((netGridKwh * 0.72).toFixed(1));
    const carbonAvoidedKg = Number((grossCarbonKg - netCarbonKg).toFixed(1));

    // Bills
    const grossBillInr = calculateIndianElectricityBill(monthlyGrossKwh);
    const netBillInr = calculateIndianElectricityBill(netGridKwh);
    const monthlySavingsInr = Math.max(0, grossBillInr - netBillInr);

    // PM Surya Ghar Subsidy
    let solarSubsidyInr = 0;
    if (solarCapacityKw === 1) solarSubsidyInr = 30000;
    else if (solarCapacityKw === 2) solarSubsidyInr = 60000;
    else if (solarCapacityKw >= 3) solarSubsidyInr = 78000;

    return {
      dailyKwh: totalDailyKwh.toFixed(1),
      monthlyGrossKwh,
      monthlySolarGenerationKwh,
      netGridKwh,
      grossCarbonKg,
      netCarbonKg,
      carbonAvoidedKg,
      grossBillInr,
      netBillInr,
      monthlySavingsInr,
      solarSubsidyInr,
      isNetZero: netGridKwh === 0 && monthlyGrossKwh > 0,
    };
  }, [appliances, solarCapacityKw]);

  // Log monthly electricity consumption to tracker
  const handleLogElectricity = async () => {
    setIsLogging(true);
    try {
      await activityService.logElectricityActivity({
        energySource: solarCapacityKw > 0 ? 'solar' : 'grid',
        kwhConsumed: metrics.netGridKwh > 0 ? metrics.netGridKwh : metrics.monthlyGrossKwh,
        unit: 'kWh',
        logDate: new Date().toISOString().split('T')[0],
        notes: `Smart Home Simulator (${appliances.length} appliances, ${solarCapacityKw}kW Solar)`,
      });

      window.dispatchEvent(new Event('activity-logged'));

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success(
        `Logged ${metrics.netGridKwh} kWh monthly household electricity to tracker!`
      );
    } catch (err) {
      console.error('Failed to log electricity:', err);
      toast.error('Failed to log electricity activity. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-600 text-white shadow-lg shadow-amber-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {t('energySimulator.title', { defaultValue: 'Smart Home Energy Auditor & Simulator' })}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('energySimulator.subtitle', { defaultValue: 'Simulate appliance consumption, rooftop solar ROI, and your monthly carbon footprint.' })}
              </p>
            </div>
          </div>
        </div>

        {/* 1-Click Direct Log Action */}
        <Button
          variant="primary"
          leftIcon={<Zap className="h-4 w-4" />}
          loading={isLogging}
          onClick={handleLogElectricity}
          className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 font-bold"
        >
          {t('energySimulator.logKwhToTracker', { kwh: metrics.netGridKwh, defaultValue: `Log ${metrics.netGridKwh} kWh to Tracker` })}
        </Button>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('energySimulator.monthlyElectricity', { defaultValue: 'Monthly Electricity' })}
          value={`${metrics.netGridKwh} ${t('activitiesPage.units.kWh', { defaultValue: 'kWh' })}`}
          unit={metrics.monthlyGrossKwh !== metrics.netGridKwh ? `(Gross ${metrics.monthlyGrossKwh} kWh)` : ''}
          icon={Zap}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
          trend={metrics.monthlySolarGenerationKwh > 0 ? 'down' : 'neutral'}
          trendLabel={metrics.monthlySolarGenerationKwh > 0 ? `-${metrics.monthlySolarGenerationKwh} solar kWh` : 'Grid power'}
        />

        <StatCard
          title={t('energySimulator.estimatedMonthlyBill', { defaultValue: 'Estimated Monthly Bill' })}
          value={`₹${metrics.netBillInr.toLocaleString('en-IN')}`}
          icon={DollarSign}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          trend={metrics.monthlySavingsInr > 0 ? 'down' : 'neutral'}
          trendLabel={metrics.monthlySavingsInr > 0 ? `Saves ₹${metrics.monthlySavingsInr}/mo` : 'Standard DISCOM tariff'}
        />

        <StatCard
          title={t('energySimulator.gridCarbonEmissions', { defaultValue: 'Grid Carbon Emissions' })}
          value={`${metrics.netCarbonKg} ${t('activitiesPage.units.kg', { defaultValue: 'kg' })}`}
          unit="CO₂e"
          icon={Leaf}
          iconBg="bg-teal-100 dark:bg-teal-900/30"
          iconColor="text-teal-600 dark:text-teal-400"
          trend={metrics.carbonAvoidedKg > 0 ? 'down' : 'neutral'}
          trendLabel={metrics.carbonAvoidedKg > 0 ? `-${metrics.carbonAvoidedKg} kg avoided` : '0.72 kg CO₂e / kWh'}
        />

        <StatCard
          title={t('energySimulator.rooftopSolarOffset', { defaultValue: 'Rooftop Solar Offset' })}
          value={metrics.isNetZero ? '100% Net-Zero' : `${solarCapacityKw} kW PV`}
          icon={Sun}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-500 dark:text-amber-400"
          trend="down"
          trendLabel={metrics.isNetZero ? '🌟 Zero grid dependency' : `~${metrics.monthlySolarGenerationKwh} kWh/mo solar`}
        />
      </div>

      {/* ── Rooftop Solar PV Simulator Panel ── */}
      <Card className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-transparent border-2 border-amber-200 dark:border-amber-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                ☀️ {t('energySimulator.pmSuryaGharSimulator', { defaultValue: 'PM Surya Ghar Simulator' })}
              </Badge>
              {metrics.isNetZero && (
                <Badge variant="success" className="bg-emerald-500 text-white font-extrabold animate-pulse">
                  🌟 {t('energySimulator.netZeroHomeBadge', { defaultValue: '100% NET-ZERO HOME' })}
                </Badge>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('energySimulator.addRooftopSolar', { defaultValue: 'Add Rooftop Solar PV to Neutralize Electricity' })}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('energySimulator.subsidyDesc', { defaultValue: 'Government subsidy up to ₹78,000 under PM Surya Ghar Yojana. Average generation in India: ~4 units / kW / day.' })}
            </p>
          </div>

          {/* Solar Capacity Slider */}
          <div className="flex flex-col gap-2 min-w-[280px]">
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>{t('energySimulator.solarCapacity', { defaultValue: 'Solar Capacity:' })}</span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">{solarCapacityKw} kW System</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={solarCapacityKw}
              onChange={(e) => setSolarCapacityKw(Number(e.target.value))}
              className="w-full h-2 bg-amber-200 dark:bg-amber-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>{t('energySimulator.gridOnly', { defaultValue: '0 kW (Grid Only)' })}</span>
              <span>1 kW</span>
              <span>2 kW</span>
              <span>{t('energySimulator.idealKw', { defaultValue: '3 kW (Ideal)' })}</span>
              <span>5 kW</span>
            </div>
          </div>
        </div>

        {solarCapacityKw > 0 && (
          <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-amber-800/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <span className="text-slate-400 block text-[10px]">{t('energySimulator.monthlySolarGen', { defaultValue: 'Monthly Solar Gen' })}</span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">~{metrics.monthlySolarGenerationKwh} kWh</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <span className="text-slate-400 block text-[10px]">{t('energySimulator.govtSubsidy', { defaultValue: 'Govt Subsidy' })}</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{metrics.solarSubsidyInr.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <span className="text-slate-400 block text-[10px]">{t('energySimulator.annualEbSavings', { defaultValue: 'Annual EB Savings' })}</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{(metrics.monthlySavingsInr * 12).toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-amber-100 dark:border-amber-900/40">
              <span className="text-slate-400 block text-[10px]">{t('energySimulator.carbonSlashed', { defaultValue: 'Carbon Slashed' })}</span>
              <span className="font-extrabold text-teal-600 dark:text-teal-400 text-sm">~{metrics.carbonAvoidedKg} kg CO₂e/mo</span>
            </div>
          </div>
        )}
      </Card>

      {/* ── Household Appliances Auditor Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Home className="h-5 w-5 text-emerald-600" />
              {t('energySimulator.applianceAuditor', { defaultValue: 'Household Appliance Auditor' })}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('energySimulator.applianceSubtitle', { defaultValue: 'Adjust energy star ratings, quantities, and daily usage hours to see exact appliance impact.' })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAppliances(INITIAL_APPLIANCES)}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            {t('energySimulator.resetDefaults', { defaultValue: 'Reset Defaults' })}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appliances.map((app) => {
            const duty = app.id === 'fridge' ? 0.45 : 1.0;
            const appMonthlyKwh = Math.round(((app.powerW * app.qty * app.hoursPerDay * duty) / 1000) * 30);
            const appMonthlyCarbon = (appMonthlyKwh * 0.72).toFixed(1);

            return (
              <Card key={app.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{app.icon}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {t(`energySimulator.appliances.${app.id}.name`, { defaultValue: app.name })}
                      </h3>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                        {app.powerW}W · ~{appMonthlyKwh} {t('activitiesPage.units.kWh', { defaultValue: 'kWh' })}/mo (~{appMonthlyCarbon} {t('activitiesPage.units.kg', { defaultValue: 'kg' })} CO₂e)
                      </span>
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => handleUpdateAppliance(app.id, 'qty', Math.max(0, app.qty - 1))}
                      className="h-6 w-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-slate-800 dark:text-slate-100">{app.qty}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateAppliance(app.id, 'qty', app.qty + 1)}
                      className="h-6 w-6 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Rating / Efficiency Dropdown */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                      {t('energySimulator.efficiencyModel', { defaultValue: 'Efficiency / Model' })}
                    </label>
                    <select
                      value={app.rating}
                      onChange={(e) => handleUpdateAppliance(app.id, 'rating', e.target.value)}
                      className="w-full p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {app.options.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {t(`energySimulator.appliances.${app.id}.options.${opt.key}`, { defaultValue: opt.label })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hours per day slider */}
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                      <span>{t('energySimulator.usage', { defaultValue: 'Usage:' })}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">
                        {app.hoursPerDay} {t('energySimulator.hrsDay', { defaultValue: 'hrs/day' })}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max={app.id === 'fridge' ? '24' : '24'}
                      step="0.5"
                      value={app.hoursPerDay}
                      onChange={(e) => handleUpdateAppliance(app.id, 'hoursPerDay', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2"
                    />
                  </div>
                </div>

                {/* AC Specific Eco Temperature Control */}
                {app.id === 'ac' && (
                  <div className="mt-3 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-900 dark:text-blue-300 block">
                        {t('energySimulator.setAcTemp', { defaultValue: 'Set AC Temperature:' })} {app.acTemp || 24}°C
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400">
                        {app.acTemp >= 24
                          ? t('energySimulator.beeIdeal', { defaultValue: '🌿 Bureau of Energy Efficiency (BEE) Ideal (24°C)' })
                          : t('energySimulator.acWarning', { defaultValue: '⚠️ Below 24°C increases power by 6% per degree' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[22, 24, 26].map((temp) => (
                        <button
                          key={temp}
                          type="button"
                          onClick={() => handleUpdateAppliance('ac', 'acTemp', temp)}
                          className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                            (app.acTemp || 24) === temp
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100'
                          }`}
                        >
                          {temp}°C
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── High-Impact Energy Upgrade Tips ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
            <Sparkles className="h-4 w-4" />
            <span>{t('energySimulator.tipBldc', { defaultValue: 'Switch to BLDC Ceiling Fans' })}</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            {t('energySimulator.tipBldcDesc', { defaultValue: 'Replacing 4 standard induction fans (75W) with 5-Star BLDC fans (28W) saves ~78 kWh/mo (₹510 & 56 kg CO₂e).' })}
          </p>
        </Card>

        <Card className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
            <Sun className="h-4 w-4" />
            <span>{t('energySimulator.tipSolarWater', { defaultValue: 'Solar Water Heating' })}</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            {t('energySimulator.tipSolarWaterDesc', { defaultValue: 'Solar thermal water heaters eliminate 100% of morning geyser electricity (~90 kWh/mo saving ₹585).' })}
          </p>
        </Card>

        <Card className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
            <Award className="h-4 w-4" />
            <span>{t('energySimulator.tipAc24', { defaultValue: 'Default AC 24°C Guideline' })}</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            {t('energySimulator.tipAc24Desc', { defaultValue: 'Setting cooling thermostat to 24°C rather than 18°C reduces compressor runtime by 24% without sacrificing comfort.' })}
          </p>
        </Card>
      </div>
    </div>
  );
}
