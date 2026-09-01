import { cn } from "@/lib/utils";

export function AnimatedLogoCube({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center animate-[float_6s_ease-in-out_infinite]", className)}>
      <svg 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full text-primary drop-shadow-[0_0_40px_rgba(var(--primary),0.5)]"
      >
        <path 
          d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" 
          fill="currentColor" 
          fillOpacity="0.15" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinejoin="round"
          className="animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"
        />
        <path 
          d="M3 9.5L16 17M29 9.5L16 17M16 30V17" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinejoin="round"
        />
        <circle 
          cx="16" 
          cy="17" 
          r="3" 
          fill="currentColor" 
        />
      </svg>
      
      {/* Decorative orbital rings */}
      <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" style={{ transform: 'scale(1.2) rotateX(70deg)' }} />
      <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" style={{ transform: 'scale(1.4) rotateX(60deg) rotateY(30deg)' }} />
      <div className="absolute inset-0 border border-primary/10 rounded-full animate-[spin_20s_linear_infinite]" style={{ transform: 'scale(1.6) rotateX(80deg) rotateY(-20deg)' }} />
    </div>
  );
}
