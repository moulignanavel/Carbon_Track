import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import CelebrationModal from '@/components/common/CelebrationModal';
import { useAuth } from '@/context/AuthContext';

const CelebrationContext = createContext(null);

export function CelebrationProvider({ children }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);

  const getUnlockedStorageKey = useCallback(() => {
    const userId = user?.id || user?.username || 'guest';
    return `carbontrack_unlocked_badges_${userId}`;
  }, [user]);

  const hasCelebrated = useCallback((badgeKey) => {
    try {
      const stored = localStorage.getItem(getUnlockedStorageKey());
      if (!stored) return false;
      const list = JSON.parse(stored);
      return Array.isArray(list) && list.includes(badgeKey);
    } catch (e) {
      return false;
    }
  }, [getUnlockedStorageKey]);

  const markCelebrated = useCallback((badgeKey) => {
    try {
      const stored = localStorage.getItem(getUnlockedStorageKey());
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];
      if (!list.includes(badgeKey)) {
        list.push(badgeKey);
        localStorage.setItem(getUnlockedStorageKey(), JSON.stringify(list));
      }
    } catch (e) {
      console.error('Failed to update celebrated badges in storage:', e);
    }
  }, [getUnlockedStorageKey]);

  const triggerCelebration = useCallback((data) => {
    const badgeKey = data?.badgeName || data?.title || 'general_milestone';
    
    // If already celebrated this specific badge, skip unless force flag is set
    if (!data?.force && hasCelebrated(badgeKey)) {
      return;
    }

    markCelebrated(badgeKey);
    setCelebrationData(data);
    setIsOpen(true);
  }, [hasCelebrated, markCelebrated]);

  useEffect(() => {
    const handleActivityCreated = (e) => {
      const { logCount } = e.detail || {};

      // Milestone 1: First activity log -> Eco Pioneer badge
      if (logCount === 1) {
        setTimeout(() => {
          triggerCelebration({
            title: '🎉 Badge Unlocked!',
            badgeName: 'Eco Pioneer',
            emoji: '🌿',
            description: 'Congratulations! You logged your very first environmental activity on CarbonTrack!',
            subtitle: 'Consistency is key. Keep logging your transport, energy, and meal activities to unlock more badges!',
          });
        }, 400);
      } else if (logCount === 7) {
        // Milestone 2: 7 logs -> 7-Day Streak badge
        setTimeout(() => {
          triggerCelebration({
            title: '🔥 Streak Milestone!',
            badgeName: '7-Day Streak',
            emoji: '🔥',
            description: 'Amazing work! You have logged 7 environmental activities on CarbonTrack!',
            subtitle: 'You earned +50 streak bonus points toward your Eco Score!',
          });
        }, 400);
      } else if (logCount === 10) {
        // Milestone 3: 10 logs -> Goal Crusher badge
        setTimeout(() => {
          triggerCelebration({
            title: '🎯 Badge Unlocked!',
            badgeName: 'Goal Crusher',
            emoji: '🎯',
            description: 'You are on a roll! 10 environmental activities logged.',
            subtitle: 'Check out the Badges page to track all your sustainability achievements.',
          });
        }, 400);
      }
    };

    window.addEventListener('activity-created', handleActivityCreated);
    return () => window.removeEventListener('activity-created', handleActivityCreated);
  }, [triggerCelebration]);

  const closeCelebration = useCallback(() => {
    setIsOpen(false);
    setCelebrationData(null);
  }, []);

  return (
    <CelebrationContext.Provider value={{ triggerCelebration, closeCelebration }}>
      {children}
      <CelebrationModal
        isOpen={isOpen}
        celebrationData={celebrationData}
        onClose={closeCelebration}
      />
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}
