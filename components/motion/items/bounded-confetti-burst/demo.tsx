import { useState } from 'react';
import { ConfettiBurst } from './bounded-confetti-burst';

export default function Demo() {
  const [fire, setFire] = useState(0);
  const done = fire > 0;
  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        gap: 12,
        width: 300,
        maxWidth: '100%',
        height: 220,
        overflow: 'hidden',
        border: '1px solid #d6def2',
        borderRadius: 14,
        background: '#fff',
      }}
    >
      <ConfettiBurst fire={fire} />
      <div role='status' style={{ textAlign: 'center' }}>
        <strong
          style={{
            display: 'block',
            fontSize: 18,
            color: done ? '#3d6b00' : '#0c1738',
          }}
        >
          {done ? '✓ 100 nautical miles logged' : '97 of 100 miles logged'}
        </strong>
        <span style={{ color: '#46527a', fontSize: 13 }}>
          {done ? 'Badge earned: Coastal Century' : 'Three miles to go'}
        </span>
      </div>
      <button
        type='button'
        onClick={() => setFire((n) => n + 1)}
        style={{
          minHeight: 44,
          padding: '0 16px',
          border: 0,
          borderRadius: 8,
          background: '#164cff',
          color: '#fff',
          font: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {done ? 'Celebrate again' : 'Log the last 3 miles'}
      </button>
    </div>
  );
}
