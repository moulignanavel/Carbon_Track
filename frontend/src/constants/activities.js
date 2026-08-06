/**
 * activities.js
 * ─────────────────────────────────────────────────────────────
 * Activity categories, types, units, and
 * UI metadata used throughout the Activity Logging module.
 *
 * Numeric emission factors are loaded from the backend catalog.
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
        description: 'Average petrol car (170 g CO₂e/km)',
      },
      {
        value: 'car_diesel',
        label: 'Car — Diesel',
        icon: '🚙',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        description: 'Average diesel car (165 g CO₂e/km)',
      },
      {
        value: 'car_electric',
        label: 'Car — Electric',
        icon: '⚡',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        description: 'UK grid average EV (53 g CO₂e/km)',
      },
      {
        value: 'car_hybrid',
        label: 'Car — Hybrid',
        icon: '🔋',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        description: 'Petrol hybrid (110 g CO₂e/km)',
      },
      {
        value: 'motorcycle',
        label: 'Motorcycle',
        icon: '🏍️',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        description: 'Average motorcycle (114 g CO₂e/km)',
      },
      {
        value: 'bus',
        label: 'Bus',
        icon: '🚌',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        description: 'Local bus (89 g CO₂e/km per passenger)',
      },
      {
        value: 'train',
        label: 'Train',
        icon: '🚆',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        description: 'National rail (41 g CO₂e/km per passenger)',
      },
      {
        value: 'subway',
        label: 'Subway / Metro',
        icon: '🚇',
        unit: 'km',
        unitOptions: ['km', 'miles'],
        description: 'Urban metro (28 g CO₂e/km per passenger)',
      },
      {
        value: 'flight_short',
        label: 'Short-haul Flight',
        icon: '✈️',
        unit: 'km',
        unitOptions: ['km'],
        description: '< 3,700 km (255 g CO₂e/km per passenger)',
      },
      {
        value: 'flight_long',
        label: 'Long-haul Flight',
        icon: '🛫',
        unit: 'km',
        unitOptions: ['km'],
        description: '≥ 3,700 km (195 g CO₂e/km per passenger)',
      },
      {
        value: 'taxi',
        label: 'Taxi / Rideshare',
        icon: '🚕',
        unit: 'km',
        unitOptions: ['km', 'miles'],
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
        description: 'UK grid average (233 g CO₂e/kWh)',
      },
      {
        value: 'electricity_solar',
        label: 'Solar (self-generated)',
        icon: '☀️',
        unit: 'kWh',
        unitOptions: ['kWh'],
        description: 'Lifecycle solar emissions (41 g CO₂e/kWh)',
      },
      {
        value: 'electricity_wind',
        label: 'Wind-tariff',
        icon: '🌬️',
        unit: 'kWh',
        unitOptions: ['kWh'],
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
        description: 'Beef production (27 kg CO₂e/kg)',
      },
      {
        value: 'lamb',
        label: 'Lamb / Mutton',
        icon: '🐑',
        unit: 'kg',
        unitOptions: ['kg', 'servings'],
        description: 'Lamb production (39 kg CO₂e/kg)',
      },
      {
        value: 'pork',
        label: 'Pork',
        icon: '🐷',
        unit: 'kg',
        unitOptions: ['kg', 'servings'],
        description: 'Pork production (7.6 kg CO₂e/kg)',
      },
      {
        value: 'chicken',
        label: 'Chicken / Poultry',
        icon: '🍗',
        unit: 'kg',
        unitOptions: ['kg', 'servings'],
        description: 'Chicken production (6.9 kg CO₂e/kg)',
      },
      {
        value: 'fish',
        label: 'Fish / Seafood',
        icon: '🐟',
        unit: 'kg',
        unitOptions: ['kg', 'servings'],
        description: 'Average fish (6.1 kg CO₂e/kg)',
      },
      {
        value: 'dairy',
        label: 'Dairy (milk/cheese)',
        icon: '🥛',
        unit: 'kg',
        unitOptions: ['kg', 'litres'],
        description: 'Dairy production (3.2 kg CO₂e/kg)',
      },
      {
        value: 'eggs',
        label: 'Eggs',
        icon: '🥚',
        unit: 'kg',
        unitOptions: ['kg', 'items'],
        description: 'Egg production (4.8 kg CO₂e/kg)',
      },
      {
        value: 'vegetables',
        label: 'Vegetables',
        icon: '🥦',
        unit: 'kg',
        unitOptions: ['kg'],
        description: 'Average vegetables (2.0 kg CO₂e/kg)',
      },
      {
        value: 'fruit',
        label: 'Fruit',
        icon: '🍎',
        unit: 'kg',
        unitOptions: ['kg'],
        description: 'Average fruit (1.1 kg CO₂e/kg)',
      },
      {
        value: 'coffee',
        label: 'Coffee',
        icon: '☕',
        unit: 'cups',
        unitOptions: ['cups', 'kg'],
        description: 'Per cup brewed (280 g CO₂e)',
      },
      {
        value: 'water_bottle',
        label: 'Water Bottle (packaged)',
        icon: '🧴',
        unit: 'items',
        unitOptions: ['items', 'litres'],
        description: 'Single-use 500mL plastic water bottle (90 g CO₂e/bottle)',
      },
      {
        value: 'beverages',
        label: 'Soft Drinks / Beverages',
        icon: '🥤',
        unit: 'items',
        unitOptions: ['items', 'litres'],
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
        description: 'Average garment (10 kg CO₂e/item)',
      },
      {
        value: 'clothing_second',
        label: 'Clothing (second-hand)',
        icon: '♻️',
        unit: 'items',
        unitOptions: ['items'],
        description: 'Second-hand clothing (0.5 kg CO₂e/item)',
      },
      {
        value: 'smartphone',
        label: 'Smartphone',
        icon: '📱',
        unit: 'items',
        unitOptions: ['items'],
        description: 'New smartphone manufacture (70 kg CO₂e)',
      },
      {
        value: 'laptop',
        label: 'Laptop / Tablet',
        icon: '💻',
        unit: 'items',
        unitOptions: ['items'],
        description: 'Laptop manufacture (300 kg CO₂e)',
      },
      {
        value: 'tv',
        label: 'Television',
        icon: '📺',
        unit: 'items',
        unitOptions: ['items'],
        description: 'TV manufacture (400 kg CO₂e)',
      },
      {
        value: 'furniture',
        label: 'Furniture',
        icon: '🛋️',
        unit: 'items',
        unitOptions: ['items'],
        description: 'Average furniture piece (50 kg CO₂e)',
      },
      {
        value: 'books',
        label: 'Books / Paper goods',
        icon: '📚',
        unit: 'items',
        unitOptions: ['items', 'kg'],
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
        description: 'Natural gas combustion (203 g CO₂e/kWh)',
      },
      {
        value: 'heating_oil',
        label: 'Heating Oil',
        icon: '🛢️',
        unit: 'litres',
        unitOptions: ['litres', 'kWh'],
        description: 'Heating oil (2.52 kg CO₂e/litre)',
      },
      {
        value: 'lpg',
        label: 'LPG / Propane',
        icon: '🏮',
        unit: 'litres',
        unitOptions: ['litres', 'kg'],
        description: 'Liquefied petroleum gas (1.51 kg CO₂e/litre)',
      },
      {
        value: 'wood_burning',
        label: 'Wood Burning',
        icon: '🪵',
        unit: 'kg',
        unitOptions: ['kg'],
        description: 'Sustainably sourced wood (15 g CO₂e/kg)',
      },
      {
        value: 'coal',
        label: 'Coal',
        icon: '⬛',
        unit: 'kg',
        unitOptions: ['kg'],
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

/** Ordered list for category tabs */
export const CATEGORY_TAB_ORDER = ['transport', 'electricity', 'food', 'shopping', 'energy'];
