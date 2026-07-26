/**
 * activities.js
 * ─────────────────────────────────────────────────────────────
 * Activity categories, types, units, emission factors, and
 * UI metadata used throughout the Activity Logging module.
 *
 * Emission factors are in kg CO₂e per unit.
 * Source: DEFRA / EPA estimates — replace with backend values
 * once the EmissionFactor API endpoint is ready.
 */

/* ══════════════════════════════════════════════════════════════
   Category UI metadata
   ══════════════════════════════════════════════════════════════ */

export const CATEGORY_META = {
  transport: {
    label:    'Transport',
    emoji:    '🚗',
    color:    '#22c55e',   // green-500
    bgLight:  'bg-green-50  dark:bg-green-900/20',
    border:   'border-green-200  dark:border-green-800',
    badge:    'green',
    iconCls:  'text-green-600 dark:text-green-400',
  },
  electricity: {
    label:    'Electricity',
    emoji:    '⚡',
    color:    '#f59e0b',   // amber-500
    bgLight:  'bg-amber-50  dark:bg-amber-900/20',
    border:   'border-amber-200  dark:border-amber-800',
    badge:    'yellow',
    iconCls:  'text-amber-600 dark:text-amber-400',
  },
  food: {
    label:    'Food',
    emoji:    '🍽️',
    color:    '#14b8a6',   // teal-500
    bgLight:  'bg-teal-50   dark:bg-teal-900/20',
    border:   'border-teal-200   dark:border-teal-800',
    badge:    'teal',
    iconCls:  'text-teal-600 dark:text-teal-400',
  },
  shopping: {
    label:    'Shopping',
    emoji:    '🛍️',
    color:    '#8b5cf6',   // violet-500
    bgLight:  'bg-purple-50 dark:bg-purple-900/20',
    border:   'border-purple-200 dark:border-purple-800',
    badge:    'purple',
    iconCls:  'text-purple-600 dark:text-purple-400',
  },
  energy: {
    label:    'Home Energy',
    emoji:    '🔥',
    color:    '#ef4444',   // red-500
    bgLight:  'bg-red-50    dark:bg-red-900/20',
    border:   'border-red-200    dark:border-red-800',
    badge:    'red',
    iconCls:  'text-red-600 dark:text-red-400',
  },
};

/* ══════════════════════════════════════════════════════════════
   Full category + type definitions
   Each type carries:
     value        — form field value / API key
     label        — display name
     unit         — default unit
     unitOptions  — selectable unit alternatives
     factor       — kg CO₂e per 1 unit (DEFRA estimates)
     description  — helper text shown in the form
     icon         — emoji
   ══════════════════════════════════════════════════════════════ */

export const ACTIVITY_CATEGORIES = [
  /* ── Transport ─────────────────────────────────────────── */
  {
    value: 'transport',
    label: 'Transport',
    emoji: '🚗',
    description: 'Journeys by car, bus, train, or plane',
    types: [
      {
        value: 'car_petrol',
        label: 'Car — Petrol',
        icon: '🚗',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        factor: 0.18,
        description: 'Average petrol car (170 g CO₂e/km)',
      },
      {
        value: 'car_diesel',
        label: 'Car — Diesel',
        icon: '🚙',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        factor: 0.165,
        description: 'Average diesel car (165 g CO₂e/km)',
      },
      {
        value: 'car_electric',
        label: 'Car — Electric',
        icon: '⚡',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        factor: 0.053,
        description: 'UK grid average EV (53 g CO₂e/km)',
      },
      {
        value: 'car_hybrid',
        label: 'Car — Hybrid',
        icon: '🔋',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        factor: 0.11,
        description: 'Petrol hybrid (110 g CO₂e/km)',
      },
      {
        value: 'motorcycle',
        label: 'Motorcycle',
        icon: '🏍️',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        factor: 0.114,
        description: 'Average motorcycle (114 g CO₂e/km)',
      },
      {
        value: 'bus',
        label: 'Bus',
        icon: '🚌',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        factor: 0.089,
        description: 'Local bus (89 g CO₂e/km per passenger)',
      },
      {
        value: 'train',
        label: 'Train',
        icon: '🚆',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        factor: 0.041,
        description: 'National rail (41 g CO₂e/km per passenger)',
      },
      {
        value: 'subway',
        label: 'Subway / Metro',
        icon: '🚇',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        factor: 0.028,
        description: 'Urban metro (28 g CO₂e/km per passenger)',
      },
      {
        value: 'flight_short',
        label: 'Short-haul Flight',
        icon: '✈️',
        unit: 'km',
        unitOptions: ['km'],
        factor: 0.255,
        description: '< 3,700 km (255 g CO₂e/km per passenger)',
      },
      {
        value: 'flight_long',
        label: 'Long-haul Flight',
        icon: '🛫',
        unit: 'km',
        unitOptions: ['km'],
        factor: 0.195,
        description: '≥ 3,700 km (195 g CO₂e/km per passenger)',
      },
      {
        value: 'taxi',
        label: 'Taxi / Rideshare',
        icon: '🚕',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        factor: 0.149,
        description: 'Taxi or app-based ride (149 g CO₂e/km)',
      },
    ],
  },

  /* ── Electricity ────────────────────────────────────────── */
  {
    value: 'electricity',
    label: 'Electricity',
    emoji: '⚡',
    description: 'Home or office electricity consumption',
    types: [
      {
        value: 'electricity_grid',
        label: 'Grid Electricity',
        icon: '🔌',
        unit: 'kWh',
        unitOptions: ['kWh'],
        factor: 0.233,
        description: 'UK grid average (233 g CO₂e/kWh)',
      },
      {
        value: 'electricity_solar',
        label: 'Solar (self-generated)',
        icon: '☀️',
        unit: 'kWh',
        unitOptions: ['kWh'],
        factor: 0.041,
        description: 'Lifecycle solar emissions (41 g CO₂e/kWh)',
      },
      {
        value: 'electricity_wind',
        label: 'Wind-tariff',
        icon: '🌬️',
        unit: 'kWh',
        unitOptions: ['kWh'],
        factor: 0.011,
        description: 'Wind-certified tariff (11 g CO₂e/kWh)',
      },
    ],
  },

  /* ── Food ───────────────────────────────────────────────── */
  {
    value: 'food',
    label: 'Food',
    emoji: '🍽️',
    description: 'Meals and dietary choices',
    types: [
      {
        value: 'beef',
        label: 'Beef',
        icon: '🥩',
        unit: 'kg',
        unitOptions: ['kg', 'servings'],
        factor: 27.0,
        description: 'Beef production (27 kg CO₂e/kg)',
      },
      {
        value: 'lamb',
        label: 'Lamb / Mutton',
        icon: '🐑',
        unit: 'kg',
        unitOptions: ['kg', 'servings'],
        factor: 39.2,
        description: 'Lamb production (39 kg CO₂e/kg)',
      },
      {
        value: 'pork',
        label: 'Pork',
        icon: '🐷',
        unit: 'kg',
        unitOptions: ['kg', 'servings'],
        factor: 7.6,
        description: 'Pork production (7.6 kg CO₂e/kg)',
      },
      {
        value: 'chicken',
        label: 'Chicken / Poultry',
        icon: '🍗',
        unit: 'kg',
        unitOptions: ['kg', 'servings'],
        factor: 6.9,
        description: 'Chicken production (6.9 kg CO₂e/kg)',
      },
      {
        value: 'fish',
        label: 'Fish / Seafood',
        icon: '🐟',
        unit: 'kg',
        unitOptions: ['kg', 'servings'],
        factor: 6.1,
        description: 'Average fish (6.1 kg CO₂e/kg)',
      },
      {
        value: 'dairy',
        label: 'Dairy (milk/cheese)',
        icon: '🥛',
        unit: 'kg',
        unitOptions: ['kg', 'litres'],
        factor: 3.2,
        description: 'Dairy production (3.2 kg CO₂e/kg)',
      },
      {
        value: 'eggs',
        label: 'Eggs',
        icon: '🥚',
        unit: 'kg',
        unitOptions: ['kg', 'items'],
        factor: 4.8,
        description: 'Egg production (4.8 kg CO₂e/kg)',
      },
      {
        value: 'vegetables',
        label: 'Vegetables',
        icon: '🥦',
        unit: 'kg',
        unitOptions: ['kg'],
        factor: 2.0,
        description: 'Average vegetables (2.0 kg CO₂e/kg)',
      },
      {
        value: 'fruit',
        label: 'Fruit',
        icon: '🍎',
        unit: 'kg',
        unitOptions: ['kg'],
        factor: 1.1,
        description: 'Average fruit (1.1 kg CO₂e/kg)',
      },
      {
        value: 'coffee',
        label: 'Coffee',
        icon: '☕',
        unit: 'cups',
        unitOptions: ['cups', 'kg'],
        factor: 0.28,
        description: 'Per cup brewed (280 g CO₂e)',
      },
      {
        value: 'water_bottle',
        label: 'Water Bottle (packaged)',
        icon: '🧴',
        unit: 'items',
        unitOptions: ['items', 'litres'],
        factor: 0.09,
        description: 'Single-use 500mL plastic water bottle (90 g CO₂e/bottle)',
      },
      {
        value: 'beverages',
        label: 'Soft Drinks / Beverages',
        icon: '🥤',
        unit: 'items',
        unitOptions: ['items', 'litres'],
        factor: 0.20,
        description: 'Soft drink / canned soda (200 g CO₂e/item)',
      },
    ],
  },

  /* ── Shopping ───────────────────────────────────────────── */
  {
    value: 'shopping',
    label: 'Shopping',
    emoji: '🛍️',
    description: 'Consumer goods and products',
    types: [
      {
        value: 'clothing_new',
        label: 'Clothing (new)',
        icon: '👕',
        unit: 'items',
        unitOptions: ['items', 'kg'],
        factor: 10.0,
        description: 'Average garment (10 kg CO₂e/item)',
      },
      {
        value: 'clothing_second',
        label: 'Clothing (second-hand)',
        icon: '♻️',
        unit: 'items',
        unitOptions: ['items'],
        factor: 0.5,
        description: 'Second-hand clothing (0.5 kg CO₂e/item)',
      },
      {
        value: 'smartphone',
        label: 'Smartphone',
        icon: '📱',
        unit: 'items',
        unitOptions: ['items'],
        factor: 70.0,
        description: 'New smartphone manufacture (70 kg CO₂e)',
      },
      {
        value: 'laptop',
        label: 'Laptop / Tablet',
        icon: '💻',
        unit: 'items',
        unitOptions: ['items'],
        factor: 300.0,
        description: 'Laptop manufacture (300 kg CO₂e)',
      },
      {
        value: 'tv',
        label: 'Television',
        icon: '📺',
        unit: 'items',
        unitOptions: ['items'],
        factor: 400.0,
        description: 'TV manufacture (400 kg CO₂e)',
      },
      {
        value: 'furniture',
        label: 'Furniture',
        icon: '🛋️',
        unit: 'items',
        unitOptions: ['items'],
        factor: 50.0,
        description: 'Average furniture piece (50 kg CO₂e)',
      },
      {
        value: 'books',
        label: 'Books / Paper goods',
        icon: '📚',
        unit: 'items',
        unitOptions: ['items', 'kg'],
        factor: 1.0,
        description: 'Printed book (1 kg CO₂e)',
      },
    ],
  },

  /* ── Energy (Home) ──────────────────────────────────────── */
  {
    value: 'energy',
    label: 'Home Energy',
    emoji: '🔥',
    description: 'Heating, gas, and home energy use',
    types: [
      {
        value: 'natural_gas',
        label: 'Natural Gas',
        icon: '🔥',
        unit: 'kWh',
        unitOptions: ['kWh', 'm³'],
        factor: 0.203,
        description: 'Natural gas combustion (203 g CO₂e/kWh)',
      },
      {
        value: 'heating_oil',
        label: 'Heating Oil',
        icon: '🛢️',
        unit: 'litres',
        unitOptions: ['litres', 'kWh'],
        factor: 2.52,
        description: 'Heating oil (2.52 kg CO₂e/litre)',
      },
      {
        value: 'lpg',
        label: 'LPG / Propane',
        icon: '🏮',
        unit: 'litres',
        unitOptions: ['litres', 'kg'],
        factor: 1.51,
        description: 'Liquefied petroleum gas (1.51 kg CO₂e/litre)',
      },
      {
        value: 'wood_burning',
        label: 'Wood Burning',
        icon: '🪵',
        unit: 'kg',
        unitOptions: ['kg'],
        factor: 0.015,
        description: 'Sustainably sourced wood (15 g CO₂e/kg)',
      },
      {
        value: 'coal',
        label: 'Coal',
        icon: '⬛',
        unit: 'kg',
        unitOptions: ['kg'],
        factor: 2.42,
        description: 'Coal combustion (2.42 kg CO₂e/kg)',
      },
    ],
  },
];

/* ── Lookup helpers ──────────────────────────────────────────── */

/** Map category value → category object */
export const CATEGORY_MAP = Object.fromEntries(
  ACTIVITY_CATEGORIES.map((c) => [c.value, c])
);

/** Map activityType value → type object (across all categories) */
export const TYPE_MAP = Object.fromEntries(
  ACTIVITY_CATEGORIES.flatMap((c) =>
    c.types.map((t) => [t.value, { ...t, category: c.value }])
  )
);

/**
 * Estimate CO₂e for a given activity type and amount.
 * Falls back to 0 if the type or factor is unknown.
 *
 * @param {string} activityType
 * @param {number} amount
 * @param {string} [unit]        — future: unit conversion support
 * @returns {number}             kg CO₂e
 */
export function estimateEmissions(activityType, amount) {
  const type = TYPE_MAP[activityType];
  if (!type || !amount || isNaN(amount)) return 0;
  return +(type.factor * amount).toFixed(4);
}

/** Ordered list for category tabs */
export const CATEGORY_TAB_ORDER = ['transport', 'electricity', 'food', 'shopping', 'energy'];
