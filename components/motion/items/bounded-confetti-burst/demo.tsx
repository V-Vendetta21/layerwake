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
        border: '1px solid #303030',
        borderRadius: 14,
        background: '#121212',
      }}
    >
      <ConfettiBurst fire={fire} />
      <div role='status' style={{ textAlign: 'center' }}>
        <strong
          style={{
            display: 'block',
            fontSize: 18,
            color: done ? '#8aa8ff' : '#ffffff',
          }}
        >
          {done ? '✓ 100 nautical miles logged' : '97 of 100 miles logged'}
        </strong>
        <span style={{ color: '#b8b8b8', fontSize: 13 }}>
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
          background: '#0047ff',
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
