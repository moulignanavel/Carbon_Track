import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../utils/api';
import { Leaf, Navigation, Zap, UtensilsCrossed, ShoppingBag, Calendar, Plus, ShieldCheck } from 'lucide-react';

export default function ActivityForm({ onLogSuccess }) {
  const { t } = useTranslation();
  const [category, setCategory] = useState('transport');
  const [activityType, setActivityType] = useState('car');
  const [quantity, setQuantity] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const CATEGORIES = [
    { id: 'transport', label: t('activitiesPage.categories.transport', { defaultValue: 'Transport' }), icon: Navigation, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { id: 'electricity', label: t('activitiesPage.categories.electricity', { defaultValue: 'Electricity' }), icon: Zap, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { id: 'food', label: t('activitiesPage.categories.food', { defaultValue: 'Food' }), icon: UtensilsCrossed, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'shopping', label: t('activitiesPage.categories.shopping', { defaultValue: 'Shopping' }), icon: ShoppingBag, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
  ];

  const CONFIG = {
    transport: {
      types: [
        { id: 'car', label: t('activitiesPage.transportModes.car_gasoline', { defaultValue: 'Car (Gasoline)' }) },
        { id: 'flight', label: t('activitiesPage.transportModes.flight', { defaultValue: 'Flight' }) },
        { id: 'public_transit', label: t('activitiesPage.transportModes.public_transit', { defaultValue: 'Public Transit' }) }
      ],
      unit: 'km'
    },
    electricity: {
      types: [
        { id: 'grid', label: t('activitiesPage.energySources.grid', { defaultValue: 'Grid Electricity' }) },
        { id: 'solar', label: t('activitiesPage.energySources.solar', { defaultValue: 'Solar Power' }) },
        { id: 'wind', label: t('activitiesPage.energySources.wind', { defaultValue: 'Wind Power' }) }
      ],
      unit: 'kWh'
    },
    food: {
      types: [
        { id: 'meat', label: t('activitiesPage.mealTypes.meat', { defaultValue: 'Meat Meal' }) },
        { id: 'vegetarian', label: t('activitiesPage.mealTypes.vegetarian', { defaultValue: 'Vegetarian Meal' }) },
        { id: 'vegan', label: t('activitiesPage.mealTypes.vegan', { defaultValue: 'Vegan Meal' }) }
      ],
      unit: 'serving'
    },
    shopping: {
      types: [
        { id: 'electronics', label: t('activitiesPage.productCategories.electronics', { defaultValue: 'Electronics' }) },
        { id: 'clothing', label: t('activitiesPage.productCategories.clothing', { defaultValue: 'Clothing/Retail' }) }
      ],
      unit: 'USD'
    }
  };

  // Update activity type when category changes
  const handleCategoryChange = (catId) => {
    setCategory(catId);
    setActivityType(CONFIG[catId].types[0].id);
    setSuccessResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessResult(null);
    setLoading(true);

    if (!quantity || parseFloat(quantity) < 0) {
      setError(t('activitiesPage.quantityNonNegative', { defaultValue: 'Quantity must be non-negative' }));
      setLoading(false);
      return;
    }

    try {
      const unit = CONFIG[category].unit;
      const response = await api.createLog(category, activityType, quantity, unit, logDate);
      setSuccessResult(response);
      setQuantity('');
      if (onLogSuccess) {
        onLogSuccess(response);
      }
    } catch (err) {
      setError(err.message || t('activitiesPage.failedToSaveLog', { defaultValue: 'Failed to record activity. Please check input values.' }));
    } finally {
      setLoading(false);
    }
  };

  const currentUnit = CONFIG[category].unit;
  const activityTypes = CONFIG[category].types;

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in">
      <div className="glass-panel p-8">
        
        {/* Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
            <Plus className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Log New Activity</h2>
            <p className="text-sm text-gray-400">Record your activities to calculate their carbon impact</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 mb-6 text-sm text-red-200 bg-red-950/40 border border-red-800/30 rounded-xl">
            {error}
          </div>
        )}

        {successResult && (
          <div className="p-5 mb-8 text-sm border rounded-xl animate-fade-in bg-emerald-950/40 border-emerald-800/30">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
              <ShieldCheck className="w-5 h-5" />
              <span>Activity Logged Successfully!</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs tracking-wide">
              <div>
                <span className="text-gray-400 block uppercase font-bold mb-1">Category</span>
                <span className="text-gray-200 text-sm font-semibold capitalize">{successResult.category}</span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-bold mb-1">Activity Type</span>
                <span className="text-gray-200 text-sm font-semibold capitalize">{successResult.activityType.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-bold mb-1">Logged Quantity</span>
                <span className="text-gray-200 text-sm font-semibold">{successResult.amount} {successResult.unit}</span>
              </div>
              <div>
                <span className="text-emerald-400 block uppercase font-bold mb-1 text-glow-secondary">Emissions Calculated</span>
                <span className="text-emerald-300 text-base font-extrabold text-glow-secondary">{successResult.calculatedEmissions.toFixed(2)} kg CO₂e</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Select Buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Select Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20 text-white'
                        : 'bg-slate-950/20 border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : cat.color.split(' ')[0]}`} />
                    <span className="text-xs font-semibold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Activity Type Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Activity Type</label>
              <select
                className="w-full px-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                value={activityType}
                onChange={(e) => { setActivityType(e.target.value); setSuccessResult(null); }}
              >
                {activityTypes.map((type) => (
                  <option key={type.id} value={type.id} className="bg-slate-900">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Logged */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Date</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-500" />
                </span>
                <input
                  type="date"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                  value={logDate}
                  onChange={(e) => { setLogDate(e.target.value); setSuccessResult(null); }}
                />
              </div>
            </div>

          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
              Quantity / Usage Amount ({currentUnit})
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm font-semibold text-gray-500">
                #
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder={`e.g. ${category === 'transport' ? '15.5' : category === 'electricity' ? '100' : '2'}`}
                className="w-full pl-11 pr-20 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setSuccessResult(null); }}
              />
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-bold text-gray-400 uppercase tracking-wider">
                {currentUnit}
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Leaf className="w-4 h-4" />
            {loading ? 'Logging Activity...' : 'Log and Calculate Emissions'}
          </button>

        </form>
      </div>
    </div>
  );
}
