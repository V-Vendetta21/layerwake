import { useState } from 'react';
import { WaveformEqualizer } from './waveform-equalizer';

export default function Demo() {
  const [sensitivity, setSensitivity] = useState(1);
  const [paused, setPaused] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 10, width: 320, maxWidth: '100%' }}>
      <WaveformEqualizer
        sensitivity={sensitivity}
        paused={paused}
        label='Radio channel 16 (simulated)'
      />
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
          Sensitivity ×{sensitivity}
          <input
            type='range'
            min={0.4}
            max={1.6}
            step={0.2}
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
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
