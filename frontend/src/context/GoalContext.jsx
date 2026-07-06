/**
 * GoalContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global goal state provider — backed by real per-user API.
 *
 * Every operation (fetch, add, update, delete) is scoped to the
 * currently authenticated user via JWT on the backend.
 *
 * Exposed:
 *   goals          — GoalResponse[]
 *   isLoading      — boolean
 *   fetchGoals()   — async () => void  (called on mount automatically)
 *   addGoal(data)  — async (data) => GoalResponse
 *   updateGoal(id, data) — async (id, data) => void
 *   deleteGoal(id) — async (id) => void
 *   stats          — { total, onTrack, warning, exceeded }
 */

import {
  createContext, useContext, useState,
  useCallback, useMemo, useEffect,
} from 'react';
import toast from 'react-hot-toast';
import { getGoals, createGoal, updateGoalApi, deleteGoalApi } from '@/api/goalsApi';
import { formatError } from '@/utils/errorHandler';

const GoalContext = createContext(null);

export function GoalProvider({ children }) {
  const [goals,     setGoals]     = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  /* ── fetch ──────────────────────────────────────────────────── */
  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getGoals();
      // Backend returns target/current (mapped in GoalResponse DTO)
      setGoals(data);
    } catch (err) {
      toast.error(formatError(err, 'Failed to load goals'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Re-fetch goals whenever an activity is logged so progress updates immediately
  useEffect(() => {
    const handler = () => fetchGoals();
    window.addEventListener('activity-logged', handler);
    return () => window.removeEventListener('activity-logged', handler);
  }, [fetchGoals]);

  /* ── add ────────────────────────────────────────────────────── */
  const addGoal = useCallback(async (data) => {
    try {
      const newGoal = await createGoal(data);
      setGoals((prev) => [newGoal, ...prev]);
      toast.success('Goal created! 🎯');
      return newGoal;
    } catch (err) {
      toast.error(formatError(err, 'Failed to create goal'));
      throw err;
    }
  }, []);

  /* ── update ─────────────────────────────────────────────────── */
  const updateGoal = useCallback(async (id, data) => {
    try {
      const updated = await updateGoalApi(id, data);
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
      toast.success('Goal updated');
    } catch (err) {
      toast.error(formatError(err, 'Failed to update goal'));
      throw err;
    }
  }, []);

  /* ── delete ─────────────────────────────────────────────────── */
  const deleteGoal = useCallback(async (id) => {
    try {
      await deleteGoalApi(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success('Goal deleted');
    } catch (err) {
      toast.error(formatError(err, 'Failed to delete goal'));
      throw err;
    }
  }, []);

  /* ── derived stats ──────────────────────────────────────────── */
  const stats = useMemo(() => {
    const total    = goals.length;
    const onTrack  = goals.filter((g) => (g.current / g.target) < 0.85).length;
    const exceeded = goals.filter((g) => g.current >= g.target).length;
    const warning  = goals.filter((g) => {
      const p = g.current / g.target;
      return p >= 0.85 && p < 1;
    }).length;
    return { total, onTrack, exceeded, warning };
  }, [goals]);

  const value = useMemo(() => ({
    goals,
    isLoading,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    stats,
  }), [goals, isLoading, fetchGoals, addGoal, updateGoal, deleteGoal, stats]);

  return (
    <GoalContext.Provider value={value}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  const ctx = useContext(GoalContext);
  if (!ctx) throw new Error('useGoals must be used within a GoalProvider');
  return ctx;
}
