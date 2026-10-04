// Leichtgewichtiges CSS-Konfetti für Erfolge.
import { useMemo } from 'react';

export function Confetti({ count = 46 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.6 + Math.random() * 1.4,
        color: ['var(--primary)', '#f2b84b', '#4cc28a', '#79a9dc', '#e98fb0'][i % 5],
        rot: Math.random() * 360,
        size: 6 + Math.random() * 6,
      })),
    [count],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            width: p.size,
            height: p.size * 0.6,
          }}
        />
      ))}
    </div>
  );
}
