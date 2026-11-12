import { useState } from 'react';
import { ImageShutterReveal } from './image-shutter-reveal';

function Harbor() {
  return (
    <svg
      viewBox='0 0 320 180'
      role='img'
      aria-label='A sailboat crossing a calm bay under a low sun'
    >
      <rect width='320' height='180' fill='#1b1b1b' />
      <circle cx='240' cy='70' r='26' fill='#eaf2fb' />
      <path d='M0 112 Q80 100 160 112 T320 112 V180 H0Z' fill='#eaf2fb' />
      <path d='M0 132 Q80 122 160 132 T320 132 V180 H0Z' fill='#ededed' />
      <path d='M118 104 L148 104 L142 112 L124 112Z' fill='#1b1b1b' />
      <path d='M133 102 L133 58 L152 100Z' fill='#1b1b1b' />
    </svg>
  );
}

export default function Demo() {
  const [play, setPlay] = useState(0);
  return (
    <div
      style={{
        display: 'grid',
        gap: 14,
        width: 320,
        maxWidth: '100%',
        justifyItems: 'center',
      }}
    >
      <ImageShutterReveal playKey={play} slats={7}>
        <Harbor />
      </ImageShutterReveal>
      <button
        type='button'
        onClick={() => setPlay((n) => n + 1)}
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
        Close and reopen
      </button>
    </div>
  );
}
