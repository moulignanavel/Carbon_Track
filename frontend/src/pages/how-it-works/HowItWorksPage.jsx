import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Leaf,
  Zap,
  Target,
  Trophy,
  Activity,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Calculator,
  Compass,
  Building2,
  TreeDeciduous,
  Smartphone,
  Car,
  Globe2,
  CheckCircle2,
  Info,
  HelpCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import DataNodeGrid from '@/components/landing/DataNodeGrid';

export default function HowItWorksPage() {
  const { t, i18n } = useTranslation();

  // Interactive Live Calculator state
  const [calcCategory, setCalcCategory] = useState('transport');
  const [calcSubtype, setCalcSubtype] = useState('car_petrol');
  const [calcAmount, setCalcAmount] = useState(25);

  // Active FAQ Accordion state
  const [openFaq, setOpenFaq] = useState(0);

  // Categories for live estimator
  const CALCULATOR_OPTIONS = {
    transport: {
      label: t('howItWorks.calcTransport', { defaultValue: 'Transport' }),
      icon: Car,
      unit: 'km',
      min: 1,
      max: 500,
      step: 1,
      defaultVal: 25,
      options: [
        { id: 'car_petrol', label: t('howItWorks.carPetrol', { defaultValue: 'Petrol Car' }), factor: 0.171 },
        { id: 'car_diesel', label: t('howItWorks.carDiesel', { defaultValue: 'Diesel Car' }), factor: 0.165 },
        { id: 'car_ev', label: t('howItWorks.carEv', { defaultValue: 'Electric Vehicle (EV)' }), factor: 0.045 },
        { id: 'bus', label: t('howItWorks.bus', { defaultValue: 'Public Bus' }), factor: 0.089 },
        { id: 'train', label: t('howItWorks.train', { defaultValue: 'Train / Metro' }), factor: 0.035 },
        { id: 'flight', label: t('howItWorks.flight', { defaultValue: 'Short-haul Flight' }), factor: 0.255 },
      ],
    },
    electricity: {
      label: t('howItWorks.calcEnergy', { defaultValue: 'Electricity' }),
      icon: Zap,
      unit: 'kWh',
      min: 5,
      max: 1000,
      step: 5,
      defaultVal: 150,
      options: [
        { id: 'grid_standard', label: t('howItWorks.gridElectricity', { defaultValue: 'Standard National Grid' }), factor: 0.716 },
        { id: 'grid_green', label: t('howItWorks.greenTariff', { defaultValue: 'Renewable Green Tariff' }), factor: 0.025 },
        { id: 'solar_rooftop', label: t('howItWorks.solarRooftop', { defaultValue: 'Rooftop Solar Generated' }), factor: 0.0 },
      ],
    },
    food: {
      label: t('howItWorks.calcFood', { defaultValue: 'Food & Meals' }),
      icon: Leaf,
      unit: t('howItWorks.meals', { defaultValue: 'meals' }),
      min: 1,
      max: 30,
      step: 1,
      defaultVal: 7,
      options: [
        { id: 'meal_beef', label: t('howItWorks.mealBeef', { defaultValue: 'Beef / Lamb Heavy Meal' }), factor: 6.5 },
        { id: 'meal_poultry', label: t('howItWorks.mealPoultry', { defaultValue: 'Poultry / Fish Meal' }), factor: 1.8 },
        { id: 'meal_vegetarian', label: t('howItWorks.mealVegetarian', { defaultValue: 'Vegetarian Meal' }), factor: 0.9 },
        { id: 'meal_vegan', label: t('howItWorks.mealVegan', { defaultValue: 'Plant-Based / Vegan Meal' }), factor: 0.5 },
      ],
    },
  };

  const currentCategoryConfig = CALCULATOR_OPTIONS[calcCategory];
  const selectedOption = currentCategoryConfig.options.find((o) => o.id === calcSubtype) || currentCategoryConfig.options[0];

  const liveCo2 = useMemo(() => {
    return (calcAmount * (selectedOption?.factor || 0.1)).toFixed(2);
  }, [calcAmount, selectedOption]);

  const treeEquivalent = useMemo(() => {
    // 1 mature tree absorbs approx 21 kg CO2/year => ~0.057 kg/day
    return (parseFloat(liveCo2) / 21).toFixed(2);
  }, [liveCo2]);

  const phoneCharges = useMemo(() => {
    // ~0.008 kg CO2 per standard phone charge
    return Math.round(parseFloat(liveCo2) / 0.008);
  }, [liveCo2]);

  const handleCategorySwitch = (catKey) => {
    setCalcCategory(catKey);
    const firstOption = CALCULATOR_OPTIONS[catKey].options[0];
    setCalcSubtype(firstOption.id);
    setCalcAmount(CALCULATOR_OPTIONS[catKey].defaultVal);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const STEPS = [
    {
      step: '01',
      tag: t('howItWorks.step1Tag', { defaultValue: 'Instant Capture' }),
      title: t('howItWorks.step1Title', { defaultValue: 'Log Daily Activities in 3 Taps' }),
      desc: t('howItWorks.step1Desc', { defaultValue: 'Capture your real-world footprint across Transport, Electricity, Food, and Shopping. Easily input distance, energy bills, or meals with pre-configured verified emission factors.' }),
      icon: Activity,
      color: 'emerald',
      highlight: t('howItWorks.step1Highlight', { defaultValue: 'Zero guesswork with smart presets and quick-select templates.' }),
    },
    {
      step: '02',
      tag: t('howItWorks.step2Tag', { defaultValue: 'Scientific Engine' }),
      title: t('howItWorks.step2Title', { defaultValue: 'Real-Time GHG Protocol Conversion' }),
      desc: t('howItWorks.step2Desc', { defaultValue: 'Every logged entry is computed into precise kg CO₂e using IPCC, EPA, and national electricity carbon intensity benchmarks with Scope 1, 2, and 3 categorization.' }),
      icon: Calculator,
      color: 'teal',
      highlight: t('howItWorks.step2Highlight', { defaultValue: 'Transparent calculation methodology backed by verified environmental databases.' }),
    },
    {
      step: '03',
      tag: t('howItWorks.step3Tag', { defaultValue: 'Holistic Intelligence' }),
      title: t('howItWorks.step3Title', { defaultValue: 'Dynamic EcoScore & AI Recommendations' }),
      desc: t('howItWorks.step3Desc', { defaultValue: 'Your activity translates into a dynamic EcoScore (300-850) combining your emission reduction rate, logging consistency streak, and active goals impact.' }),
      icon: ShieldCheck,
      color: 'amber',
      highlight: t('howItWorks.step3Highlight', { defaultValue: 'Personalized AI insights suggest actionable changes that deliver the highest reduction.' }),
    },
    {
      step: '04',
      tag: t('howItWorks.step4Tag', { defaultValue: 'Targeted Action' }),
      title: t('howItWorks.step4Title', { defaultValue: 'Set Budgets, Earn Badges & Offset Residuals' }),
      desc: t('howItWorks.step4Desc', { defaultValue: 'Set monthly carbon budgets, participate in community challenges, level up green badges, and neutralize unavoidable emissions through verified carbon offset projects.' }),
      icon: Trophy,
      color: 'indigo',
      highlight: t('howItWorks.step4Highlight', { defaultValue: 'Climb the global leaderboard and download audit-ready sustainability reports.' }),
    },
  ];

  const FAQS = [
    {
      q: t('howItWorks.faq1Q', { defaultValue: 'How is my Carbon Footprint (kg CO₂e) calculated?' }),
      a: t('howItWorks.faq1A', { defaultValue: 'CarbonTrack follows the Greenhouse Gas (GHG) Protocol standard. We multiply your reported activity metric (e.g., kilometers travelled, kWh consumed, or meal type) by scientifically verified emission factors from authoritative sources including the IPCC, EPA, and regional grid authorities.' }),
    },
    {
      q: t('howItWorks.faq2Q', { defaultValue: 'What is the EcoScore and how does the 300–850 rating work?' }),
      a: t('howItWorks.faq2A', { defaultValue: 'The EcoScore is a comprehensive index modeled on credit ratings. It evaluates three pillars: 1) Monthly Emission Performance (350 pts), 2) Logging Consistency & Streak (250 pts), and 3) Goal Adherence & Engagement (250 pts). Scores range from Needs Work (<550), Fair (551-670), Good (671-750), to Excellent (751-850).' }),
    },
    {
      q: t('howItWorks.faq3Q', { defaultValue: 'Can CarbonTrack be used for corporate teams and organizations?' }),
      a: t('howItWorks.faq3A', { defaultValue: 'Yes! CarbonTrack offers a dedicated Organisation Portal featuring employee engagement leaderboards, department-level carbon tracking, Scope 1/2/3 breakdown charts, and one-click PDF/CSV ESG compliance exports.' }),
    },
    {
      q: t('howItWorks.faq4Q', { defaultValue: 'Are my logs and personal sustainability data private?' }),
      a: t('howItWorks.faq4A', { defaultValue: 'Absolutely. Your data is encrypted in transit and at rest. If you join the community leaderboard, you can toggle Anonymous Mode at any time in Settings to mask your full name and profile details.' }),
    },
    {
      q: t('howItWorks.faq5Q', { defaultValue: 'How do Carbon Offsets work in the Offset Hub?' }),
      a: t('howItWorks.faq5A', { defaultValue: 'The Offset Hub allows users to support certified climate projects—such as certified reforestation, solar grid expansions, and methane capture. Each offset transaction is verified against recognized carbon registries (Gold Standard, Verra VCS) and directly credited to your portfolio.' }),
    },
    {
      q: t('howItWorks.faq6Q', { defaultValue: 'Is there an AI assistant to help me reduce emissions?' }),
      a: t('howItWorks.faq6A', { defaultValue: 'Yes! CarbonBot, our AI sustainability assistant, is available 24/7. It analyzes your highest emission categories, recommends low-carbon travel alternatives, simulates rooftop solar savings, and guides you with customized daily tips.' }),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-900 overflow-x-hidden relative">
      {/* Background Ambient FX */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#08131d] to-[#030712]" />
        <DataNodeGrid />
        <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.04] blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] rounded-full bg-teal-500/[0.03] blur-[160px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-600/[0.03] blur-[150px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-[#030712]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2E22] border border-[#1E4432] group-hover:border-[#5FA37A] transition-colors shadow-lg shadow-emerald-950/40">
              <Leaf className="h-5 w-5 text-[#7FBF8C]" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-black text-[#F3EFE4] leading-none tracking-tight">CarbonTrack</span>
              <p className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#7FBF8C]/80 mt-0.5">
                {t('landing.sustainabilityPlatform', { defaultValue: 'Sustainability Platform' })}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <Link to="/" className="hover:text-emerald-400 transition-colors">
              {t('howItWorks.navHome', { defaultValue: 'Home' })}
            </Link>
            <a href="#process" className="text-emerald-400 font-bold border-b-2 border-emerald-400 pb-0.5">
              {t('howItWorks.navProcess', { defaultValue: 'How It Works' })}
            </a>
            <a href="#calculator" className="hover:text-emerald-400 transition-colors">
              {t('howItWorks.navCalculator', { defaultValue: 'Live Calculator' })}
            </a>
            <a href="#methodology" className="hover:text-emerald-400 transition-colors">
              {t('howItWorks.navMethodology', { defaultValue: 'Methodology' })}
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              {t('howItWorks.navFaq', { defaultValue: 'FAQ' })}
            </a>
          </nav>

          {/* Action Area & Language Switcher */}
          <div className="flex items-center gap-3">
            <select
              value={i18n.language || 'en'}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="h-9 rounded-xl border border-white/10 bg-[#0F2E22]/60 px-3 text-xs font-semibold text-emerald-200 outline-none hover:border-emerald-500/50 transition cursor-pointer"
              aria-label={t('common.selectLanguage', { defaultValue: 'Select Language' })}
            >
              <option value="en" className="bg-slate-900 text-slate-100">English</option>
              <option value="ta" className="bg-slate-900 text-slate-100">தமிழ் (Tamil)</option>
              <option value="hi" className="bg-slate-900 text-slate-100">हिंदी (Hindi)</option>
              <option value="es" className="bg-slate-900 text-slate-100">Español</option>
              <option value="fr" className="bg-slate-900 text-slate-100">Français</option>
              <option value="de" className="bg-slate-900 text-slate-100">Deutsch</option>
            </select>

            <Link to="/">
              <Button variant="primary" size="sm" className="font-bold px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
                {t('howItWorks.getStarted', { defaultValue: 'Sign In / Register' })}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F2E22]/90 border border-[#1E4432] text-xs font-mono font-medium text-[#9CC9AC] shadow-lg mb-8">
          <Sparkles className="h-3.5 w-3.5 text-[#E8C468]" />
          <span>{t('howItWorks.heroBadge', { defaultValue: 'GHG Protocol Aligned • Real-Time Environmental Analytics' })}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#F3EFE4] tracking-tight max-w-4xl leading-[1.15]">
          {t('howItWorks.heroTitle', { defaultValue: 'How CarbonTrack Transforms Daily Habits into Climate Impact' })}
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed font-normal">
          {t('howItWorks.heroSubtitle', { defaultValue: 'An end-to-end guide to how our verified calculation algorithms convert transport, electricity, diet, and spending data into actionable reduction targets.' })}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#calculator">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-8 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {t('howItWorks.tryCalculatorBtn', { defaultValue: 'Try Interactive Calculator' })}
            </Button>
          </a>
          <Link to="/">
            <Button variant="glass" size="lg" className="border-white/10 hover:bg-white/5 font-bold px-8 rounded-2xl">
              {t('howItWorks.createAccountBtn', { defaultValue: 'Start Tracking Free' })}
            </Button>
          </Link>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-16 pt-8 border-t border-white/[0.08]">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-2xl sm:text-3xl font-black text-[#7FBF8C]">3 Taps</div>
            <div className="text-xs text-slate-400 font-medium mt-1">{t('howItWorks.stat1', { defaultValue: 'Instant Activity Logging' })}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-2xl sm:text-3xl font-black text-[#E8C468]">300–850</div>
            <div className="text-xs text-slate-400 font-medium mt-1">{t('howItWorks.stat2', { defaultValue: 'EcoScore Rating Scale' })}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-2xl sm:text-3xl font-black text-[#7FBF8C]">100%</div>
            <div className="text-xs text-slate-400 font-medium mt-1">{t('howItWorks.stat3', { defaultValue: 'GHG Protocol Standards' })}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-2xl sm:text-3xl font-black text-[#E8C468]">Scope 1, 2, 3</div>
            <div className="text-xs text-slate-400 font-medium mt-1">{t('howItWorks.stat4', { defaultValue: 'Full Enterprise Accounting' })}</div>
          </div>
        </div>
      </section>

      {/* 4-Step Process Section */}
      <section id="process" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#7FBF8C] font-bold">
            {t('howItWorks.processSub', { defaultValue: 'Step-by-Step Methodology' })}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#F3EFE4] mt-2">
            {t('howItWorks.processTitle', { defaultValue: 'The 4 Pillars of Carbon Tracking' })}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            {t('howItWorks.processDesc', { defaultValue: 'From daily logging to measurable decarbonization, here is how the CarbonTrack lifecycle works.' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="relative group bg-[#081A13]/90 backdrop-blur-xl p-8 rounded-3xl border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-300 shadow-xl shadow-black/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-black text-[#1E4432] group-hover:text-emerald-500/40 transition-colors font-mono">
                      {step.step}
                    </span>
                    <div className="p-3.5 rounded-2xl bg-[#0F2E22] border border-[#1E4432] text-[#7FBF8C] shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <span className="text-xs font-mono uppercase tracking-wider text-[#E8C468] font-bold">
                    {step.tag}
                  </span>
                  <h3 className="text-xl font-bold text-[#F3EFE4] mt-2 mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-normal mb-6">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs font-semibold text-[#7FBF8C]">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{step.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Live Emissions Simulator */}
      <section id="calculator" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-b from-[#0B2319] to-[#06140F] border border-emerald-500/20 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8C468] font-bold">
              {t('howItWorks.calcTag', { defaultValue: 'Live Interactive Simulator' })}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F3EFE4] mt-2">
              {t('howItWorks.calcHeading', { defaultValue: 'Test the Calculation Engine' })}
            </h2>
            <p className="text-slate-300 text-sm mt-2">
              {t('howItWorks.calcSub', { defaultValue: 'Select a category, choose an activity type, and slide the input to see real-time carbon conversion.' })}
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {Object.keys(CALCULATOR_OPTIONS).map((key) => {
              const cat = CALCULATOR_OPTIONS[key];
              const CatIcon = cat.icon;
              const isActive = calcCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategorySwitch(key)}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                      : 'bg-[#0F2E22]/80 text-slate-300 hover:bg-[#1E4432] border border-white/10'
                  }`}
                >
                  <CatIcon className="h-4 w-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Calculator Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#030712]/70 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/10">
            {/* Controls Side */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {t('howItWorks.selectType', { defaultValue: '1. Select Activity Type' })}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentCategoryConfig.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCalcSubtype(opt.id)}
                      className={`p-3 rounded-xl text-left text-xs font-semibold transition border ${
                        calcSubtype === opt.id
                          ? 'bg-[#0F2E22] border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {opt.factor} kg CO₂e / {currentCategoryConfig.unit}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t('howItWorks.adjustAmount', { defaultValue: '2. Adjust Metric Quantity' })}
                  </label>
                  <span className="text-sm font-mono font-extrabold text-emerald-400">
                    {calcAmount} {currentCategoryConfig.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={currentCategoryConfig.min}
                  max={currentCategoryConfig.max}
                  step={currentCategoryConfig.step}
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                  <span>{currentCategoryConfig.min} {currentCategoryConfig.unit}</span>
                  <span>{currentCategoryConfig.max} {currentCategoryConfig.unit}</span>
                </div>
              </div>
            </div>

            {/* Live Result Display Side */}
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0F2E22] to-[#081A13] p-6 rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center text-center shadow-xl">
              <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#E8C468] font-bold">
                {t('howItWorks.estimatedOutput', { defaultValue: 'Estimated Carbon Footprint' })}
              </span>

              <div className="my-3">
                <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                  {liveCo2}
                </span>
                <span className="text-sm font-bold text-emerald-400 ml-2">kg CO₂e</span>
              </div>

              <p className="text-xs text-slate-300 font-medium mb-6">
                Formula: {calcAmount} {currentCategoryConfig.unit} × {selectedOption.factor} kg/unit
              </p>

              {/* Equivalence Cards */}
              <div className="grid grid-cols-2 gap-3 w-full pt-4 border-t border-white/10 text-left">
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2.5">
                  <TreeDeciduous className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white font-mono">{treeEquivalent}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Trees needed / year</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center gap-2.5">
                  <Smartphone className="h-5 w-5 text-teal-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white font-mono">{phoneCharges}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">Phone recharges</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology & Standards Section */}
      <section id="methodology" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#7FBF8C] font-bold">
            {t('howItWorks.methodologyTag', { defaultValue: 'Scientific Integrity' })}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#F3EFE4] mt-2">
            {t('howItWorks.methodologyTitle', { defaultValue: 'Calculation Standards & Data Sources' })}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            {t('howItWorks.methodologyDesc', { defaultValue: 'We believe climate accounting must be transparent, verifiable, and mathematically grounded.' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#081A13]/80 border border-white/10">
            <div className="p-3 w-fit rounded-xl bg-[#0F2E22] border border-[#1E4432] text-[#7FBF8C] mb-4">
              <Globe2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {t('howItWorks.methodScopeTitle', { defaultValue: 'Scope 1, 2 & 3 Classification' })}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('howItWorks.methodScopeDesc', { defaultValue: 'Activities are automatically mapped to standard GHG scopes: Scope 1 (Direct fuel combustion), Scope 2 (Purchased electricity/heat), and Scope 3 (Supply chain, business travel, and lifestyle diets).' })}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#081A13]/80 border border-white/10">
            <div className="p-3 w-fit rounded-xl bg-[#0F2E22] border border-[#1E4432] text-[#E8C468] mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {t('howItWorks.methodGovTitle', { defaultValue: 'Authoritative Emission Factors' })}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('howItWorks.methodGovDesc', { defaultValue: 'Factors are curated from peer-reviewed databases: IPCC AR6 Reports, UK DEFRA/BEIS conversion tables, US EPA eGRID, and the Central Electricity Authority (CEA) emission factors.' })}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#081A13]/80 border border-white/10">
            <div className="p-3 w-fit rounded-xl bg-[#0F2E22] border border-[#1E4432] text-teal-400 mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {t('howItWorks.methodAuditTitle', { defaultValue: 'Audit-Ready Reports' })}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('howItWorks.methodAuditDesc', { defaultValue: 'Generate instant PDF/CSV summaries formatted for corporate CSRD, BRSR, and ISO 14064 compliance or personal climate footprint portfolios.' })}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8C468] font-bold">
            {t('howItWorks.faqTag', { defaultValue: 'Got Questions?' })}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#F3EFE4] mt-2">
            {t('howItWorks.faqTitle', { defaultValue: 'Frequently Asked Questions' })}
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#081A13]/90 border border-white/10 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-100 hover:text-emerald-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-[#0F2E22] via-[#0B2319] to-[#081A13] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-[#F3EFE4] tracking-tight mb-4">
            {t('howItWorks.ctaTitle', { defaultValue: 'Ready to Measure and Reduce Your Footprint?' })}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto mb-8 font-normal">
            {t('howItWorks.ctaSubtitle', { defaultValue: 'Join thousands of individuals and organizations actively tracking, reducing, and offsetting emissions with CarbonTrack.' })}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-8 rounded-2xl shadow-xl shadow-emerald-500/25">
                {t('howItWorks.ctaRegister', { defaultValue: 'Create Free Account' })}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="glass" size="lg" className="border-white/10 hover:bg-white/5 font-bold px-8 rounded-2xl">
                {t('howItWorks.ctaSignIn', { defaultValue: 'Sign In to Dashboard' })}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-white/[0.08] bg-[#030712] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-[#7FBF8C]" />
            <span className="font-bold text-slate-200">CarbonTrack</span>
            <span>· © {new Date().getFullYear()} {t('landing.copyright', { defaultValue: 'All rights reserved.' })}</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-emerald-400 transition-colors">
              {t('howItWorks.navHome', { defaultValue: 'Home' })}
            </Link>
            <Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">
              {t('howItWorks.navProcess', { defaultValue: 'How It Works' })}
            </Link>
            <Link to="/admin/login" className="hover:text-emerald-400 transition-colors">
              {t('nav.adminPortal', { defaultValue: 'Admin Portal' })}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
