import { useState } from 'react';
import { CollisionAwareLabelStack } from './collision-aware-label-stack';

const SPREAD = [
  { id: 'a', label: 'Aster', x: 60, y: 30 },
  { id: 'b', label: 'Brine', x: 110, y: 75 },
  { id: 'c', label: 'Cormorant', x: 90, y: 120 },
  { id: 'd', label: 'Drift', x: 150, y: 150 },
];
const BUNCHED = [
  { id: 'a', label: 'Aster', x: 120, y: 80 },
  { id: 'b', label: 'Brine', x: 132, y: 86 },
  { id: 'c', label: 'Cormorant', x: 126, y: 92 },
  { id: 'd', label: 'Drift', x: 140, y: 82 },
];

export default function Demo() {
  const [bunched, setBunched] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 10, width: 320, maxWidth: '100%' }}>
      <CollisionAwareLabelStack
        points={bunched ? BUNCHED : SPREAD}
        width={300}
        height={180}
        label='Boat positions on the race course'
      />
      <button
        type='button'
        aria-pressed={bunched}
        onClick={() => setBunched((b) => !b)}
        style={{
          justifySelf: 'start',
          minHeight: 44,
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
        {bunched ? 'Spread the fleet' : 'Bunch at the mark'}
      </button>
    </div>
  );
}
