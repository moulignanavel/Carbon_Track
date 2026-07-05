/**
 * Avatar — CarbonTrack Design System
 *
 * Sizes   : xs | sm | md | lg | xl
 * Variants: initials (default) | image | icon
 * Options : status dot (online/offline/away), stacked group
 */

const SIZES = {
  xs: { box: 'h-6 w-6',   text: 'text-[9px]',  status: 'h-1.5 w-1.5' },
  sm: { box: 'h-8 w-8',   text: 'text-xs',     status: 'h-2 w-2'     },
  md: { box: 'h-9 w-9',   text: 'text-sm',     status: 'h-2.5 w-2.5' },
  lg: { box: 'h-11 w-11', text: 'text-base',   status: 'h-3 w-3'     },
  xl: { box: 'h-14 w-14', text: 'text-lg',     status: 'h-3.5 w-3.5' },
};

const STATUS_COLORS = {
  online:  'bg-green-500',
  offline: 'bg-slate-400',
  away:    'bg-amber-400',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase();
}

function colorFromName(name = '') {
  const palettes = [
    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  ];
  const idx = name.charCodeAt(0) % palettes.length;
  return palettes[idx];
}

export default function Avatar({
  name,
  src,
  size    = 'md',
  status,
  className = '',
  ...props
}) {
  const { box, text, status: statusSize } = SIZES[size];

  return (
    <span className={`relative inline-flex shrink-0 ${className}`} {...props}>
      {src ? (
        <img
          src={src}
          alt={name ?? 'Avatar'}
          className={`${box} rounded-full object-cover ring-2 ring-white dark:ring-slate-900`}
        />
      ) : (
        <span
          className={`${box} ${text} ${colorFromName(name)} inline-flex items-center justify-center rounded-full font-semibold ring-2 ring-white dark:ring-slate-900`}
          aria-label={name}
        >
          {getInitials(name)}
        </span>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 ${statusSize} rounded-full ${STATUS_COLORS[status]} ring-2 ring-white dark:ring-slate-900`}
          aria-label={`Status: ${status}`}
        />
      )}
    </span>
  );
}

/** AvatarGroup — overlapping stack */
export function AvatarGroup({ users = [], max = 4, size = 'sm' }) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((u, i) => (
        <Avatar key={u.id ?? i} name={u.name} src={u.src} size={size} title={u.name} />
      ))}
      {overflow > 0 && (
        <span
          className={`${SIZES[size].box} ${SIZES[size].text} inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold ring-2 ring-white dark:ring-slate-900`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
