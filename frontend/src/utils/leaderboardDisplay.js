export function formatLeaderboardName(username, rank) {
  const cleaned = String(username ?? '')
    .replace(/[_\-.]+/g, ' ')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return `Eco Member ${String(rank ?? '').padStart(2, '0')}`;

  return cleaned
    .split(' ')
    .map((part) => part ? `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}` : '')
    .join(' ');
}

export function getLeaderboardHabitTip(user) {
  if (user?.habitTip) return user.habitTip;

  const tips = {
    'Low-carbon traveller': 'Consider lower-emission travel choices where practical.',
    'Energy saver': 'Keep reducing avoidable household energy use.',
    'Sustainable eater': 'Continue choosing lower-footprint food options.',
    'Conscious shopper': 'Prefer durable products and purchase only what is needed.',
  };

  return tips[user?.categoryStrength]
    ?? 'Log activities consistently to discover a supported low-carbon strength.';
}

