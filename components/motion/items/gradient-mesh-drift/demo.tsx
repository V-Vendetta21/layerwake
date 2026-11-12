import { useState } from 'react';
import { GradientMeshDrift } from './gradient-mesh-drift';

// Two presets in one palette family: a snow field and a graphite one.
const PALETTES = {
  snow: ['#080808', '#eaf2fb', '#dce9f7', '#ffffff'],
  graphite: ['#080808', '#5c5c5c', '#b8b8b8', '#262626'],
} as const;
const chip = (on: boolean) =>
  ({
    minHeight: 40,
    padding: '0 12px',
    border: '1px solid #474747',
    borderRadius: 8,
    background: on ? '#eaf2fb' : '#121212',
    color: on ? '#080808' : '#ffffff',
    font: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
  }) as const;

export default function Demo() {
  const [palette, setPalette] = useState<keyof typeof PALETTES>('snow');
  const [paused, setPaused] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 10, width: 340, maxWidth: '100%' }}>
      <GradientMeshDrift
        palette={[...PALETTES[palette]] as [string, string, string, string]}
        paused={paused}
      >
        <strong style={{ display: 'block' }}>Members’ evening</strong>
        <span style={{ color: '#b8b8b8', fontSize: 14 }}>
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
          aria-pressed={palette === 'snow'}
          style={chip(palette === 'snow')}
          onClick={() => setPalette('snow')}
        >
          Snow
        </button>
        <button
          type='button'
          aria-pressed={palette === 'graphite'}
          style={chip(palette === 'graphite')}
          onClick={() => setPalette('graphite')}
        >
          Graphite
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
