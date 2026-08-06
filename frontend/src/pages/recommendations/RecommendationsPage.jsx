/**
 * RecommendationsPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Personalized carbon reduction recommendations page.
 * Shows suggestions based on user's activity patterns and emissions.
 * Displays interactive detailed carbon math and reduction strategies on click.
 */

import { useEffect, useState } from 'react';
import { X, Calculator, Leaf, Sparkles, Zap, Car, Utensils, Plane, ShoppingBag, Home, Lightbulb } from 'lucide-react';
import recommendationsService from '@/services/api/recommendationsService';
import './recommendations.css';

/* ── Detailed Content Mapping by Category ────────────────────── */
const ELABORATION_MAP = {
  transport: {
    formula: "Emissions (kg CO₂e) = Distance (km/miles) × Emission Factor",
    explain: "Transport emissions represent greenhouse gases emitted directly by the combustion of fuel. The backend uses the DEFRA database factor for each specific vehicle type (e.g., Petrol Car: 0.18 kg CO₂e/km, Diesel Car: 0.165 kg CO₂e/km, Hybrid: 0.11 kg CO₂e/km, Electric: 0.053 kg CO₂e/km).",
    strategies: [
      "Switch to active transit like walking, cycling, or using an e-scooter for commutes under 5 km.",
      "Combine multiple errands into a single trip to avoid cold engine starts and save up to 20% on fuel.",
      "Utilize public subway systems, trains, or buses, which cut greenhouse gas emissions per passenger by up to 80%."
    ],
    tips: [
      "Keep tires properly inflated. Under-inflated tires increase fuel consumption by 3%.",
      "Drive smoothly: avoid rapid acceleration and hard braking, which wastes fuel.",
      "Consider train or high-speed rail travel for domestic trips instead of short-haul flights."
    ]
  },
  energy: {
    formula: "Emissions (kg CO₂e) = Energy Used (kWh/m³) × Emission Factor",
    explain: "Energy emissions represent fuel burned for home heating (e.g., Natural Gas: 0.203 kg CO₂e/kWh) or carbon generated at power plants to produce electricity (e.g., Grid: 0.233 kg CO₂e/kWh). Solar and wind produce near-zero operational emissions.",
    strategies: [
      "Switch your utility provider to a 100% certified renewable energy plan (solar or wind).",
      "Improve home heating efficiency by sealing drafty doors/windows with weather stripping.",
      "Upgrade to energy-efficient appliances (look for high Energy Star ratings) when replacements are needed."
    ],
    tips: [
      "Wash laundry in cold water (30°C) instead of hot. This saves up to 38% of washing machine energy.",
      "Adjust your thermostat: lowering it by just 1-2°C in winter can cut heating bills and emissions by 10%.",
      "Unplug idle electronics. Standby 'vampire' power accounts for up to 5-10% of household electricity usage."
    ]
  },
  food: {
    formula: "Emissions (kg CO₂e) = Quantity (kg/servings) × Emission Factor",
    explain: "Food emissions account for agriculture, land use changes, transportation, and methane production from livestock. Ruminant meat (e.g., Beef: 27.0 kg CO₂e/kg, Lamb: 39.2 kg CO₂e/kg) has an extremely high footprint compared to poultry (6.9 kg CO₂e/kg) and vegetables (2.0 kg CO₂e/kg).",
    strategies: [
      "Introduce 'Meatless Mondays' or dedicate 2-3 days a week to completely plant-based meals.",
      "Minimize food waste by planning your shopping lists and freezing leftovers before they spoil.",
      "Prioritize buying seasonal, local foods to reduce transportation emissions ('food miles')."
    ],
    tips: [
      "Swap beef/lamb for chicken, pork, or plant-based proteins like lentils, chickpeas, or beans.",
      "Try plant-based dairy alternatives (e.g., oat, soy, or almond milk) in your coffee and cereal.",
      "Brew coffee mindfully: only make what you will drink, and use reusable pods or filters."
    ]
  },
  shopping: {
    formula: "Emissions (kg CO₂e) = Items Purchased × Manufacturing Footprint Factor",
    explain: "Shopping emissions represent the 'embodied carbon' required to extract materials, manufacture, and transport products. For example, a laptop carries about 300 kg CO₂e, a smartphone carries 70 kg CO₂e, and a new article of clothing carries about 10 kg CO₂e of embodied carbon.",
    strategies: [
      "Adopt a circular mindset: rent, share, or borrow tools and clothing that you use infrequently.",
      "Repair damaged electronics, furniture, or clothes instead of immediately buying new ones.",
      "Shop vintage or buy certified second-hand items which extend a product's life and generate zero new manufacturing carbon."
    ],
    tips: [
      "When replacing electronics, purchase refurbished models rather than brand new ones.",
      "Avoid fast-fashion brands; invest in high-quality, durable garments made from organic or recycled fabrics.",
      "Choose furniture made from sustainably managed forests (look for FSC certification) or buy second-hand."
    ]
  },
  default: {
    formula: "Emissions (kg CO₂e) = Activity Quantity × Emission Factor",
    explain: "Carbon emissions are calculated by multiplying the logged quantity of an activity by its specific CO₂e emission factor sourced from IPCC, DEFRA, and FAO databases.",
    strategies: [
      "Track your daily carbon footprint regularly to identify high-impact areas.",
      "Set reasonable monthly reduction targets using the Goals tab.",
      "Share sustainable habits with family and coworkers to drive community-wide impact."
    ],
    tips: [
      "Focus on reducing high-impact areas first (such as solo driving and red meat consumption).",
      "Support local carbon offset and sustainability initiatives.",
      "Always select clean, durable, or reusable options over single-use items."
    ]
  }
};

const DEFAULT_RECOMMENDATIONS = [
  {
    id: 'default-1',
    category: 'energy',
    title: 'Energy Tip',
    description: 'Grid electricity emissions are mainly driven by fossil fuel power plants. Cut your electricity footprint by switching all home lights to energy-efficient LEDs, unplugging idle appliances, and washing laundry in cold water (30°C) instead of hot.',
    emissions: 13.28,
    difficulty: 'Moderate',
    activityType: 'electricity'
  },
  {
    id: 'default-2',
    category: 'transport',
    title: 'Transport Tip',
    description: 'Petrol and diesel car emissions contribute heavily to your footprint. Consider combining errands into a single trip, maintaining correct tire pressure to improve fuel efficiency by up to 3%, or carpooling with colleagues twice a week to cut transport emissions in half.',
    emissions: 12.60,
    difficulty: 'Moderate',
    activityType: 'car_petrol'
  },
  {
    id: 'default-3',
    category: 'transport',
    title: 'Transport Tip',
    description: 'Transportation emissions are a major component of personal carbon footprints. Try to walk or bicycle for short trips under 2 km, use public bus or rail transit where possible, and drive at moderate, steady speeds.',
    emissions: 7.35,
    difficulty: 'Moderate',
    activityType: 'transit'
  }
];

function getElaboration(activityType) {
  const type = (activityType || '').toLowerCase();
  if (type.includes('car') || type.includes('flight') || type.includes('transit') || type.includes('transport') || type.includes('bus') || type.includes('train') || type.includes('subway') || type.includes('taxi') || type.includes('motorcycle')) {
    return ELABORATION_MAP.transport;
  }
  if (type.includes('electricity') || type.includes('grid') || type.includes('solar') || type.includes('wind') || type.includes('natural_gas') || type.includes('gas') || type.includes('heating') || type.includes('lpg') || type.includes('coal') || type.includes('wood') || type.includes('energy')) {
    return ELABORATION_MAP.energy;
  }
  if (type.includes('beef') || type.includes('lamb') || type.includes('pork') || type.includes('chicken') || type.includes('meat') || type.includes('poultry') || type.includes('food') || type.includes('dairy') || type.includes('eggs') || type.includes('fruit') || type.includes('vegetables') || type.includes('coffee')) {
    return ELABORATION_MAP.food;
  }
  if (type.includes('clothing') || type.includes('clothes') || type.includes('shopping') || type.includes('smartphone') || type.includes('laptop') || type.includes('tv') || type.includes('electronics') || type.includes('furniture') || type.includes('books')) {
    return ELABORATION_MAP.shopping;
  }
  return ELABORATION_MAP.default;
}

function renderRecIcon(category, activityType) {
  const type = (activityType || '').toLowerCase();
  if (type.includes('flight')) {
    return <Plane className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
  }
  if (type.includes('car') || type.includes('transport') || type.includes('transit') || category === 'transport') {
    return <Car className="w-5 h-5 text-red-600 dark:text-red-500" />;
  }
  if (type.includes('beef') || type.includes('meat') || type.includes('food') || category === 'food') {
    return <Utensils className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  }
  if (type.includes('energy') || type.includes('electricity') || category === 'energy') {
    return <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />;
  }
  if (type.includes('furniture')) {
    return <Home className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
  }
  if (type.includes('clothing') || type.includes('shopping') || category === 'shopping') {
    return <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
  }
  return <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState(DEFAULT_RECOMMENDATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRec, setSelectedRec] = useState(null);

  useEffect(() => {
    loadRecommendations();

    const handleActivityLogged = () => loadRecommendations();
    window.addEventListener('activity-logged', handleActivityLogged);

    return () => window.removeEventListener('activity-logged', handleActivityLogged);
  }, []);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const data = await recommendationsService.getRecommendations();
      
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((item, index) => {
          let title = "Tip";
          let category = "default";
          const type = (item.activityType || '').toLowerCase();
          
          if (type.includes('flight')) {
            title = "Flight Tip"; category = "transport";
          } else if (type.includes('petrol')) {
            title = "Petrol Vehicle Tip"; category = "transport";
          } else if (type.includes('diesel')) {
            title = "Diesel Vehicle Tip"; category = "transport";
          } else if (type.includes('bus') || type.includes('train') || type.includes('transit') || type.includes('subway')) {
            title = "Public Transit Tip"; category = "transport";
          } else if (type.includes('car') || type.includes('transport') || type.includes('taxi') || type.includes('motorcycle')) {
            title = "Transport Tip"; category = "transport";
          } else if (type.includes('beef') || type.includes('meat') || type.includes('food') || type.includes('lamb') || type.includes('chicken') || type.includes('dairy')) {
            title = "Diet Tip"; category = "food";
          } else if (type.includes('energy') || type.includes('electricity') || type.includes('grid')) {
            title = "Energy Tip"; category = "energy";
          } else if (type.includes('furniture')) {
            title = "Home Tip"; category = "home";
          } else if (type.includes('clothing') || type.includes('shopping')) {
            title = "Shopping Tip"; category = "shopping";
          }

          return {
            id: index,
            category,
            title,
            description: item.tip,
            emissions: item.emissions ?? 10.0,
            difficulty: "Moderate",
            activityType: item.activityType
          };
        });
        setRecommendations(formatted);
      } else {
        setRecommendations(DEFAULT_RECOMMENDATIONS);
      }
    } catch (error) {
      console.error('Failed to load recommendations, displaying default recommendations:', error);
      setRecommendations(DEFAULT_RECOMMENDATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const activeElaboration = selectedRec ? getElaboration(selectedRec.activityType) : null;

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h1>Personalized Recommendations</h1>
        <p>Tailored suggestions to reduce your carbon footprint</p>
      </div>

      {isLoading ? (
        <div className="recommendations-loading">
          <div className="spinner"></div>
          <p>Loading recommendations...</p>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((rec, index) => (
            <div
              key={rec.id || index}
              className="recommendation-card"
              onClick={() => setSelectedRec(rec)}
              style={{ 
                animation: `fadeInUp 0.5s ease forwards`,
                animationDelay: `${index * 0.1}s`,
                cursor: 'pointer'
              }}
            >
              <div className="rec-icon-box">
                {renderRecIcon(rec.category, rec.activityType)}
              </div>
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
              <div className="rec-meta">
                <span className="impact">
                  {rec.emissions ? `${rec.emissions.toFixed(2)} KG CO₂E` : '13.28 KG CO₂E'}
                </span>
                <span className="difficulty">
                  {rec.difficulty || 'Moderate'}
                </span>
              </div>
              <button 
                type="button" 
                className="rec-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRec(rec);
                }}
              >
                Elaborate & Learn More
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Elaborate Details Modal */}
      {selectedRec && activeElaboration && (
        <div 
          className="rec-modal-overlay" 
          onClick={() => setSelectedRec(null)}
        >
          <div 
            className="rec-modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rec-modal-header">
              <div className="rec-modal-header-left">
                <div className="rec-icon-box" style={{ margin: 0 }}>
                  {renderRecIcon(selectedRec.category, selectedRec.activityType)}
                </div>
                <div className="rec-modal-header-info">
                  <h2>{selectedRec.title} Details</h2>
                  <p className="rec-subtitle">Personalized analysis of your carbon footprint</p>
                </div>
              </div>
              <button 
                type="button" 
                className="rec-modal-close-btn"
                onClick={() => setSelectedRec(null)}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rec-modal-body">
              {/* How carbon is calculated */}
              <div className="rec-modal-section">
                <h4>
                  <Calculator className="w-5 h-5" />
                  How Carbon is Calculated
                </h4>
                <div className="rec-math-card">
                  <span className="rec-math-formula">{activeElaboration.formula}</span>
                  <p className="rec-math-explain">{activeElaboration.explain}</p>
                </div>
              </div>

              {/* How to reduce emissions */}
              <div className="rec-modal-section">
                <h4>
                  <Leaf className="w-5 h-5" />
                  How to Reduce Emissions
                </h4>
                <ul className="rec-bullet-list">
                  {activeElaboration.strategies.map((strategy, i) => (
                    <li key={i} className="rec-bullet-item">{strategy}</li>
                  ))}
                </ul>
              </div>

              {/* Actionable everyday tips */}
              <div className="rec-modal-section">
                <h4>
                  <Sparkles className="w-5 h-5" />
                  Everyday Eco Tips
                </h4>
                <ul className="rec-bullet-list">
                  {activeElaboration.tips.map((tip, i) => (
                    <li key={i} className="rec-bullet-item">{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rec-modal-footer">
              <button 
                type="button" 
                className="rec-action-btn" 
                onClick={() => setSelectedRec(null)}
                style={{ margin: 0, width: 'auto', padding: '0.75rem 1.5rem' }}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

