import { useState } from 'react';
import { PixelDissolve } from './pixel-dissolve';

function Lighthouse() {
  return (
    <svg
      viewBox='0 0 300 200'
      role='img'
      aria-label='A striped lighthouse on a rock at dusk'
    >
      <rect width='300' height='200' fill='#25345f' />
      <circle cx='230' cy='50' r='18' fill='#b6ff3b' />
      <path d='M120 160 L132 70 H160 L172 160Z' fill='#f5f8ff' />
      <path
        d='M126 115 H166 L168 130 H124Z M129 90 H163 L164 100 H128Z'
        fill='#e2452b'
      />
      <rect x='134' y='56' width='24' height='14' fill='#b6ff3b' />
      <path d='M0 160 Q75 150 150 160 T300 160 V200 H0Z' fill='#164cff' />
    </svg>
  );
}

export default function Demo() {
  const [run, setRun] = useState(0);
  return (
    <div
      style={{
        display: 'grid',
        gap: 10,
        width: 300,
        maxWidth: '100%',
        justifyItems: 'center',
      }}
    >
      <PixelDissolve playKey={run} seed={42}>
        <Lighthouse />
      </PixelDissolve>
      <button
        type='button'
        onClick={() => setRun((n) => n + 1)}
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
        Dissolve again
      </button>
    </div>
  );
}
