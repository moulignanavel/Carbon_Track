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
      
      setRecommendations([]);
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
