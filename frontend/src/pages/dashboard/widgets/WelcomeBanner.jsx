/**
 * WelcomeBanner — gradient hero strip with daily summary
 */
import { Link } from 'react-router-dom';
import { Plus, Leaf, Sun, TrendingDown } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { formatEmission } from '@/utils/formatters';

function Pill({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-white/70 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-[10px] text-white/60 leading-none">{label}</p>
        <p className="text-xs font-bold text-white mt-0.5 leading-none tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export default function WelcomeBanner({ user, kpi }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
                'Good evening';

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 md:p-7 bg-gradient-to-br from-green-900 via-green-800 to-green-700"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-teal-400/10" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        {/* Left — greeting */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Leaf className="h-4 w-4 text-green-300" aria-hidden="true" />
            <span className="text-xs text-white/60 font-medium uppercase tracking-wide">
              {greeting}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">
            {user?.username ?? 'Eco Warrior'}
          </h2>
          <p className="mt-1.5 text-sm text-white/70 max-w-xs leading-relaxed">
            {kpi?.today?.trend === 'down'
              ? `You're doing great today — already ${Math.abs(kpi.today.delta).toFixed(2)} kg below yesterday.`
              : `You've logged ${formatEmission(kpi?.today?.value ?? 0)} today. Keep it up!`}
          </p>

          {/* Stat pills row */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill label="Today"     value={formatEmission(kpi?.today?.value ?? 0)}   icon={Sun}         />
            <Pill label="This week" value={formatEmission(kpi?.weekly?.value ?? 0)}  icon={TrendingDown} />
          </div>
        </div>

        {/* Right — CTA */}
        <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
          <Link to="/activities">
            <Button
              variant="glass"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Log Activity
            </Button>
          </Link>
          <Badge
            variant="green"
            size="sm"
            dot
            className="bg-white/20 text-white border-white/30"
          >
            July 2026
          </Badge>
        </div>
      </div>
    </div>
  );
}
