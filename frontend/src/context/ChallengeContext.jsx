/**
 * ChallengeContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global challenge state — follows the same pattern as GoalContext.
 *
 * Exposes:
 *   challenges      — ChallengeResponse[]
 *   isLoading       — boolean
 *   fetchChallenges — async () => void
 *   join(id)        — async (id) => void  (joins + refreshes list)
 *   totalXp         — number (sum of xpReward for COMPLETED challenges)
 *   completedCount  — number
 */

import {
  createContext, useContext, useState,
  useCallback, useMemo, useEffect,
} from 'react';
import toast from 'react-hot-toast';
import { getChallenges, joinChallenge } from '@/api/challengeApi';
import { formatError } from '@/utils/errorHandler';
import { useAuth } from '@/context/AuthContext';

const ChallengeContext = createContext(null);

export function ChallengeProvider({ children }) {
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const { isLoggedIn }              = useAuth();

  const fetchChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getChallenges();
      setChallenges(data);
    } catch (err) {
      toast.error(formatError(err, 'Failed to load challenges'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchChallenges();
      const handleActivityLogged = () => fetchChallenges();
      window.addEventListener('activity-logged', handleActivityLogged);
      return () => window.removeEventListener('activity-logged', handleActivityLogged);
    }
  }, [isLoggedIn, fetchChallenges]);

  const join = useCallback(async (id) => {
    try {
      await joinChallenge(id);
      await fetchChallenges(); // refresh to get updated status
      toast.success('Challenge joined! Good luck 🌿');
    } catch (err) {
      toast.error(formatError(err, 'Failed to join challenge'));
    }
  }, [fetchChallenges]);

  const totalXp = useMemo(
    () => challenges
      .filter(c => c.status === 'COMPLETED')
      .reduce((s, c) => s + (c.xpReward ?? 0), 0),
    [challenges],
  );

  const completedCount = useMemo(
    () => challenges.filter(c => c.status === 'COMPLETED').length,
    [challenges],
  );

  const value = useMemo(() => ({
    challenges, isLoading, fetchChallenges, join, totalXp, completedCount,
  }), [challenges, isLoading, fetchChallenges, join, totalXp, completedCount]);

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallenges() {
  const ctx = useContext(ChallengeContext);
  if (!ctx) throw new Error('useChallenges must be used within ChallengeProvider');
  return ctx;
}
