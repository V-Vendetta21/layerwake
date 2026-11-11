import { useState } from 'react';
import { PointerTiltCard } from './pointer-tilt-card';

export default function Demo() {
  const [demo, setDemo] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <PointerTiltCard
        demonstrate={demo}
        style={{ width: 260, maxWidth: '100%' }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#164cff',
          }}
        >
          BOARDING PASS
        </span>
        <strong style={{ display: 'block', margin: '8px 0 4px', fontSize: 22 }}>
          Isles ferry
        </strong>
        <span style={{ color: '#46527a' }}>Deck B · Departs 07:40</span>
      </PointerTiltCard>
      <button
        type='button'
        aria-pressed={demo}
        onClick={() => setDemo((d) => !d)}
        style={{
          minHeight: 44,
          padding: '0 16px',
          border: '1px solid #b9c5e6',
          borderRadius: 8,
          background: '#fff',
          color: '#0c1738',
          font: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {demo ? 'Stop demonstration' : 'Demonstrate tilt'}
      </button>
    </div>
  );
}
