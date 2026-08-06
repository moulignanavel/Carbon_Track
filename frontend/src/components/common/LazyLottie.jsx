import React, { Suspense, lazy, useEffect, useState } from 'react';

// Lazy-load lottie-react with CJS/ESM interop fallback
const Lottie = lazy(async () => {
  const mod = await import('lottie-react');
  const Component = mod.default?.default || mod.default || mod;
  return { default: Component };
});

// Hook for prefers-reduced-motion
const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery) {
      setReduced(mediaQuery.matches);
      const handler = (e) => setReduced(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);
  return reduced;
};

export default function LazyLottie({
  animationData,
  className = '',
  height,
  width,
  loop = true,
  autoplay = true,
  ...props
}) {
  const isReduced = useReducedMotion();
  const style = {
    height: height || '100%',
    width: width || '100%',
  };

  return (
    <Suspense fallback={<div className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-full" style={style} />}>
      <Lottie
        animationData={animationData}
        loop={isReduced ? false : loop}
        autoplay={isReduced ? false : autoplay}
        style={style}
        className={className}
        {...props}
      />
    </Suspense>
  );
}
