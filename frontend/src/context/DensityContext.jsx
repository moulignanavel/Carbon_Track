import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'carbontrack_density';

const DensityContext = createContext(null);

export function DensityProvider({ children }) {
  const [density, setDensity] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'compact' || stored === 'comfortable' ? stored : 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove previous classes
    root.classList.remove('density-compact', 'density-comfortable');
    
    // Apply appropriate class or styles
    if (density === 'compact') {
      root.classList.add('density-compact');
      root.style.fontSize = '14px';
    } else if (density === 'comfortable') {
      root.classList.add('density-comfortable');
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px'; // default browser baseline
    }
    
    localStorage.setItem(STORAGE_KEY, density);
  }, [density]);

  const value = useMemo(() => ({
    density,
    setDensity,
  }), [density]);

  return (
    <DensityContext.Provider value={value}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const ctx = useContext(DensityContext);
  if (!ctx) throw new Error('useDensity must be used within a DensityProvider');
  return ctx;
}
