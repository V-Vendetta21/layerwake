import { useState } from 'react';
import { ScanlineSweep } from './scanline-sweep';

function Wiring() {
  return (
    <svg
      viewBox='0 0 320 180'
      role='img'
      aria-label='Wiring diagram: battery, switch panel and three circuits'
    >
      <rect
        x='20'
        y='70'
        width='60'
        height='40'
        rx='6'
        fill='none'
        stroke='#dce9f7'
        strokeWidth='2'
      />
      <text x='50' y='95' textAnchor='middle' fontSize='11' fill='#b8b8b8'>
        Battery
      </text>
      <rect
        x='130'
        y='60'
        width='60'
        height='60'
        rx='6'
        fill='none'
        stroke='#dce9f7'
        strokeWidth='2'
      />
      <text x='160' y='95' textAnchor='middle' fontSize='11' fill='#b8b8b8'>
        Panel
      </text>
      <path
        d='M80 90 H130 M190 75 H260 M190 90 H260 M190 105 H260'
        stroke='#303030'
        strokeWidth='2'
      />
      {['Nav lights', 'Radio', 'Pump'].map((t, i) => (
        <text key={t} x='266' y={79 + i * 15} fontSize='10' fill='#b8b8b8'>
          {t}
        </text>
      ))}
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
        width: 320,
        maxWidth: '100%',
        justifyItems: 'center',
      }}
    >
      <ScanlineSweep playKey={run} result='All circuits OK'>
        <Wiring />
      </ScanlineSweep>
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
        Scan again
      </button>
    </div>
  );
}
