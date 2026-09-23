import { useState, useEffect } from 'react';

export function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setCount(progress === 1 ? end : end * ease);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setCount(end);
    } else {
      window.requestAnimationFrame(step);
    }
  }, [end, duration]);

  return count;
}
