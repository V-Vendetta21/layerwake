import { useEffect, useRef, useState } from 'react';
import { PathTracer } from './path-tracer';

const ROUTE = 'M20 150 C70 150 70 60 130 70 S200 150 250 110 S290 30 310 30';
const button = {
  minHeight: 44,
  padding: '0 14px',
  border: '1px solid #474747',
  borderRadius: 8,
  background: '#121212',
  color: '#ffffff',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
} as const;

export default function Demo() {
  const [progress, setProgress] = useState(0.35);
  const [playing, setPlaying] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1);
      setPlaying(false);
      return;
    }
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setProgress((p) => {
        const next = Math.min(1, p + dt / 3000);
        if (next >= 1) setPlaying(false);
        return next;
      });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [playing]);

  return (
    <div style={{ display: 'grid', gap: 10, width: 340, maxWidth: '100%' }}>
      <PathTracer
        d={ROUTE}
        viewBox='0 0 330 180'
        progress={progress}
        startLabel='Harbor'
        endLabel='Lighthouse'
        label='Route from the harbor to the lighthouse'
      />
      <label
        style={{ display: 'grid', gap: 2, color: '#b8b8b8', fontSize: 13 }}
      >
        Route progress: {Math.round(progress * 100)}%
        <input
          type='range'
          min={0}
          max={100}
          value={Math.round(progress * 100)}
          onChange={(e) => {
            setPlaying(false);
            setProgress(Number(e.target.value) / 100);
          }}
          style={{ accentColor: '#dce9f7' }}
        />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type='button'
          style={button}
          onClick={() => {
            if (progress >= 1) setProgress(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? 'Pause' : progress >= 1 ? 'Play again' : 'Play'}
        </button>
      </div>
    </div>
  );
}
