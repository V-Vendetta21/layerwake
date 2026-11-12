import { useState } from 'react';
import { GradientMeshDrift } from './gradient-mesh-drift';

const PALETTES = {
  tide: ['#dbe5ff', '#164cff', '#7f9bff', '#b6ff3b'],
  dusk: ['#25345f', '#e2452b', '#7f9bff', '#f5b13c'],
} as const;
const chip = (on: boolean) =>
  ({
    minHeight: 40,
    padding: '0 12px',
    border: '1px solid #b9c5e6',
    borderRadius: 8,
    background: on ? '#0c1738' : '#fff',
    color: on ? '#fff' : '#0c1738',
    font: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
  }) as const;

export default function Demo() {
  const [palette, setPalette] = useState<keyof typeof PALETTES>('tide');
  const [paused, setPaused] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 10, width: 340, maxWidth: '100%' }}>
      <GradientMeshDrift
        palette={[...PALETTES[palette]] as [string, string, string, string]}
        paused={paused}
      >
        <strong style={{ display: 'block' }}>Members’ evening</strong>
        <span style={{ color: '#46527a', fontSize: 14 }}>
          Thursday at the boathouse, 19:00.
        </span>
      </GradientMeshDrift>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
        role='group'
        aria-label='Palette'
      >
        <button
          type='button'
          aria-pressed={palette === 'tide'}
          style={chip(palette === 'tide')}
          onClick={() => setPalette('tide')}
        >
          Tide
        </button>
        <button
          type='button'
          aria-pressed={palette === 'dusk'}
          style={chip(palette === 'dusk')}
          onClick={() => setPalette('dusk')}
        >
          Dusk
        </button>
        <button
          type='button'
          aria-pressed={paused}
          style={chip(false)}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
    </div>
  );
}
