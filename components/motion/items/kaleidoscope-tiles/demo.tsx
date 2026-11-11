import { useState } from 'react';
import { KaleidoscopeTiles } from './kaleidoscope-tiles';

export default function Demo() {
  const [segments, setSegments] = useState(8);
  const [paused, setPaused] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <KaleidoscopeTiles segments={segments} paused={paused} />
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'end',
          color: '#46527a',
          fontSize: 13,
        }}
      >
        <label style={{ display: 'grid', gap: 2 }}>
          {segments} segments
          <input
            type='range'
            min={4}
            max={16}
            step={2}
            value={segments}
            onChange={(e) => setSegments(Number(e.target.value))}
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
