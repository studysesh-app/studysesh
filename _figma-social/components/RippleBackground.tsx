import { useState, useEffect, useRef } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface RippleBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function RippleBackground({ children, className = '' }: RippleBackgroundProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const createRipple = (x: number, y: number) => {
    const newRipple: Ripple = {
      id: rippleIdRef.current++,
      x,
      y,
      timestamp: Date.now(),
    };
    
    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 2000);
  };

  const handleInteraction = (clientX: number, clientY: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      createRipple(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only create ripples when mouse is pressed
    if (e.buttons === 1) {
      handleInteraction(e.clientX, e.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      handleInteraction(touch.clientX, touch.clientY);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      handleInteraction(touch.clientX, touch.clientY);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{ touchAction: 'none' }}
    >
      {/* Ripple effects layer */}
      <div className="absolute inset-0 pointer-events-none">
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              background: 'radial-gradient(circle, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 40%, transparent 70%)',
              animation: 'ripple 2s ease-out forwards',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
          }
        }
      `}</style>

      {/* Content */}
      {children}
    </div>
  );
}