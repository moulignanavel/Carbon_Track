/**
 * GoalContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global goal state provider.
 *
 * USE_MOCK = true  → seeded from MOCK_GOALS, all mutations local.
 * USE_MOCK = false → uncomment real API calls.
 *
 * Exposed:
 *   goals          — Goal[]
 *   isLoading      — boolean
 *   addGoal(data)  — adds a new goal
 *   updateGoal(id, data) — patches an existing goal
 *   deleteGoal(id) — removes a goal
 */

import {
  createContext, useContext, useState,
  useCallback, useMemo,
} from 'react';
import toast from 'react-hot-toast';
import { MOCK_GOALS } from '@/data/goalsMock';

const USE_MOCK = true;

// When backend is ready:
// import { getGoals, createGoal, updateGoal as apiUpdate, deleteGoal as apiDelete } from '@/api/goalsApi';

const GoalContext = createContext(null);

export function GoalProvider({ children }) {
  const [goals,     setGoals]     = useState(USE_MOCK ? MOCK_GOALS : []);
  const [isLoading, setIsLoading] = useState(false);

  /* ── fetch (no-op in mock mode) ──────────────────────────── */
  const fetchGoals = useCallback(async () => {
    if (USE_MOCK) return;
    setIsLoading(true);
    try {
      // const data = await getGoals();
      // setGoals(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── add ──────────────────────────────────────────────────── */
  const addGoal = useCallback((data) => {
    const newGoal = {
      ...data,
      id:        Date.now(),
      current:   0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGoals((prev) => [newGoal, ...prev]);
    toast.success('Goal created! 🎯');
    return newGoal;
  }, []);

  /* ── update ───────────────────────────────────────────────── */
  const updateGoal = useCallback((id, data) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...data } : g))
    );
    toast.success('Goal updated');
  }, []);

  /* ── delete ───────────────────────────────────────────────── */
  const deleteGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.success('Goal deleted');
  }, []);

  /* ── derived stats ────────────────────────────────────────── */
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
