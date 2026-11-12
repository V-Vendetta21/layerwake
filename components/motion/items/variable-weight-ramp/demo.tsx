import { useState } from 'react';
import { VariableWeightRamp } from './variable-weight-ramp';

export default function Demo() {
  const [min, setMin] = useState(200);
  const [max, setMax] = useState(800);
  const [paused, setPaused] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
      {/* Inherits the page font. Layerwake uses Inter, a variable font. */}
      <p style={{ margin: 0, fontSize: 34, color: '#ffffff' }}>
        <VariableWeightRamp
          text='Heavy weather'
          min={min}
          max={max}
          paused={paused}
        />
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'end',
          color: '#b8b8b8',
          fontSize: 13,
        }}
      >
        <label style={{ display: 'grid', gap: 2 }}>
          Lightest {min}
          <input
            type='range'
            min={100}
            max={500}
            step={50}
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            style={{ accentColor: '#dce9f7' }}
          />
        </label>
        <label style={{ display: 'grid', gap: 2 }}>
          Heaviest {max}
          <input
            type='range'
            min={500}
            max={900}
            step={50}
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            style={{ accentColor: '#dce9f7' }}
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
