import { useState } from 'react';
import { SvgWaveDivider } from './svg-wave-divider';

export default function Demo() {
  const [amplitude, setAmplitude] = useState(10);
  const [speed, setSpeed] = useState(0.25);
  const [paused, setPaused] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 12, width: 340, maxWidth: '100%' }}>
      <div
        style={{
          overflow: 'hidden',
          borderRadius: 14,
          border: '1px solid #303030',
        }}
      >
        <div style={{ padding: '18px 16px 6px', background: '#121212' }}>
          <strong>Above the waterline</strong>
          <p style={{ margin: '4px 0 0', color: '#b8b8b8', fontSize: 13 }}>
            Trip details and booking.
          </p>
        </div>
        <div style={{ background: '#121212' }}>
          <SvgWaveDivider amplitude={amplitude} speed={speed} paused={paused} />
        </div>
        <div
          style={{
            padding: '6px 16px 18px',
            background: '#0047ff',
            color: '#fff',
          }}
        >
          <strong>Below</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>
            Dive sites and visibility.
          </p>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'end',
          color: '#b8b8b8',
          fontSize: 13,
        }}
      >
        <label style={{ display: 'grid', gap: 2 }}>
          Height {amplitude}px
          <input
            type='range'
            min={2}
            max={20}
            value={amplitude}
            onChange={(e) => setAmplitude(Number(e.target.value))}
            style={{ accentColor: '#648aff' }}
          />
        </label>
        <label style={{ display: 'grid', gap: 2 }}>
          Speed {speed}/s
          <input
            type='range'
            min={0.05}
            max={1}
            step={0.05}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ accentColor: '#648aff' }}
          />
        </label>
        <button
          type='button'
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
          style={{
            minHeight: 40,
            padding: '0 14px',
            border: '1px solid #474747',
            borderRadius: 8,
            background: '#121212',
            color: '#ffffff',
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
