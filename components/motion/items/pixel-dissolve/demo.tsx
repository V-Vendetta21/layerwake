import { useState } from 'react';
import { PixelDissolve } from './pixel-dissolve';

function Lighthouse() {
  return (
    <svg
      viewBox='0 0 300 200'
      role='img'
      aria-label='A striped lighthouse on a rock at dusk'
    >
      <rect width='300' height='200' fill='#1b1b1b' />
      <circle cx='230' cy='50' r='18' fill='#eaf2fb' />
      <path d='M120 160 L132 70 H160 L172 160Z' fill='#1b1b1b' />
      <path
        d='M126 115 H166 L168 130 H124Z M129 90 H163 L164 100 H128Z'
        fill='#dce9f7'
      />
      <rect x='134' y='56' width='24' height='14' fill='#eaf2fb' />
      <path d='M0 160 Q75 150 150 160 T300 160 V200 H0Z' fill='#eaf2fb' />
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
          border: '1px solid #474747',
          borderRadius: 8,
          background: '#121212',
          color: '#ffffff',
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
