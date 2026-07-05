/**
 * RecommendationsPage.jsx
 * ─────────────────────────────────────────────────────────────
 * Personalized carbon reduction recommendations page.
 * Shows suggestions based on user's activity patterns and emissions.
 */

import { useEffect, useState } from 'react';
import './recommendations.css';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load recommendations on mount
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      // const data = await recommendationsService.getRecommendations();
      
      // Mock data for now
      setRecommendations([
        {
          id: 1,
          title: 'Switch to Public Transport',
          description: 'Your car trips account for 40% of your emissions. Consider using public transport 3 days a week.',
          impact: 'Save ~2.5 kg CO₂/week',
          difficulty: 'Easy',
          category: 'Transportation',
          icon: '🚌'
        },
        {
          id: 2,
          title: 'Reduce Meat Consumption',
          description: 'Meat-heavy meals contribute significantly to your carbon footprint. Try 1-2 plant-based days per week.',
          impact: 'Save ~0.8 kg CO₂/week',
          difficulty: 'Medium',
          category: 'Food',
          icon: '🥗'
        },
        {
          id: 3,
          title: 'Energy Efficiency at Home',
          description: 'Installing LED bulbs and improving insulation can reduce your home energy consumption.',
          impact: 'Save ~1.2 kg CO₂/week',
          difficulty: 'Hard',
          category: 'Energy',
          icon: '💡'
        },
      ]);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              key={rec.id}
              className="recommendation-card"
              style={{ 
                animation: `fadeInUp 0.5s ease forwards`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="rec-icon">{rec.icon}</div>
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
              <div className="rec-meta">
                <span className="impact">{rec.impact}</span>
                <span className={`difficulty ${rec.difficulty.toLowerCase()}`}>
                  {rec.difficulty}
                </span>
              </div>
              <button className="rec-action-btn">
                Learn More →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
