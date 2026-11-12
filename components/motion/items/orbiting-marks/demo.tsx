import { useState } from 'react';
import { OrbitingMarks } from './orbiting-marks';

export default function Demo() {
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <OrbitingMarks paused={paused} speed={speed}>
        <span>
          <strong style={{ display: 'block', fontSize: 20 }}>12</strong>
          <span style={{ fontSize: 11, color: '#46527a' }}>boats out</span>
        </span>
      </OrbitingMarks>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'end',
          color: '#46527a',
          fontSize: 13,
        }}
      >
        <label style={{ display: 'grid', gap: 2 }}>
          Speed ×{speed}
          <input
            type='range'
            min={0.5}
            max={3}
            step={0.5}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ accentColor: '#164cff' }}
          />
        </label>
        <button
          type='button'
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
          style={{
            minHeight: 40,
            padding: '0 14px',
            border: '1px solid #b9c5e6',
            borderRadius: 8,
            background: '#fff',
            color: '#0c1738',
            font: 'inherit',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
    </div>
  );
}
