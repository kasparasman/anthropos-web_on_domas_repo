// components/GridWithRays.tsx
import { useEffect, useState } from 'react';

type Ray = {
  row: number;
  direction: 'left' | 'right';
  speed: number;
  delay: number;
};

export default function GridWithRays() {
  const [rays, setRays] = useState<Ray[]>([]);

  useEffect(() => {
    const cell = 50;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const rows = Math.ceil(h / cell);

    const newRays: Ray[] = Array.from({ length: rows }, (_, i) => {
      const direction = Math.random() < 0.5 ? 'left' : 'right';
      const speed = 2;      // 4–8s
      const delay = Math.random() * speed * 1.5; // up to 1.5× speed
      return { row: i, direction, speed, delay };
    });

    setRays(newRays);
  }, []);

  return (
    <div className="fixed overflow-hidden w-full h-screen bg-grid z-[-2]">
      {rays.map((r, i) => {
        // spawn just off-screen
        const x = r.direction === 'right' ? -24 : window.innerWidth;
        const animCls = r.direction === 'right' ? 'ray-right' : 'ray-left';

        return (
          <div
            key={i}
            className={`absolute h-[1px] w-[72px] bg-main/20 ${animCls}`}
            style={{
              top: `${r.row * 50}px`,
              left: `${x}px`,
              '--speed': `${r.speed}s`,
              '--delay': `${r.delay}s`,
            } as any}
          />
        );
      })}
    </div>

  );
}
