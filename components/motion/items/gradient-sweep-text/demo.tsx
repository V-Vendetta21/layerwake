import { useState } from 'react';
import { GradientSweepText } from './gradient-sweep-text';

const control = {
  minHeight: 40,
  padding: '0 12px',
  border: '1px solid #474747',
  borderRadius: 8,
  background: '#121212',
  color: '#ffffff',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
} as const;

export default function Demo() {
  const [duration, setDuration] = useState(2600);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [paused, setPaused] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <h3 style={{ margin: 0, fontSize: 32, fontWeight: 800 }}>
        <GradientSweepText
          text='Clear horizon'
          duration={duration}
          direction={direction}
          paused={paused}
        />
      </h3>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
          color: '#b8b8b8',
          fontSize: 13,
        }}
      >
        <label style={{ display: 'grid', gap: 2 }}>
          Sweep {(duration / 1000).toFixed(1)}s
          <input
            type='range'
            min={1200}
            max={5000}
            step={200}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            style={{ accentColor: '#dce9f7' }}
          />
        </label>
        <button
          type='button'
          style={control}
          onClick={() =>
            setDirection((d) => (d === 'right' ? 'left' : 'right'))
          }
        >
          Direction: {direction === 'right' ? 'left → right' : 'right → left'}
        </button>
        <button
          type='button'
          style={control}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
    </div>
  );
}
