import { useState } from 'react';
import { TextMarquee } from './text-marquee';

const PORTS = [
  'Falmouth',
  'Brest',
  'La Coruña',
  'Porto',
  'Cádiz',
  'Tangier',
  'Madeira',
];
const button = {
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
  const [speed, setSpeed] = useState(60);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [paused, setPaused] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 14, width: 360, maxWidth: '100%' }}>
      <TextMarquee
        items={PORTS}
        label='Ports of call'
        speed={speed}
        direction={direction}
        paused={paused}
      />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'end',
          color: '#b8b8b8',
          fontSize: 13,
        }}
      >
        <label style={{ display: 'grid', gap: 2 }}>
          Speed {speed}px/s
          <input
            type='range'
            min={20}
            max={160}
            step={10}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ accentColor: '#648aff' }}
          />
        </label>
        <button
          type='button'
          style={button}
          onClick={() => setDirection((d) => (d === 'left' ? 'right' : 'left'))}
        >
          {direction === 'left' ? '← Moving left' : 'Moving right →'}
        </button>
        <button
          type='button'
          style={button}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
    </div>
  );
}
