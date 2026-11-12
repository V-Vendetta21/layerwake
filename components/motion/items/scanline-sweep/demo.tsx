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
        stroke='#7f9bff'
        strokeWidth='2'
      />
      <text x='50' y='95' textAnchor='middle' fontSize='11' fill='#c3cdec'>
        Battery
      </text>
      <rect
        x='130'
        y='60'
        width='60'
        height='60'
        rx='6'
        fill='none'
        stroke='#7f9bff'
        strokeWidth='2'
      />
      <text x='160' y='95' textAnchor='middle' fontSize='11' fill='#c3cdec'>
        Panel
      </text>
      <path
        d='M80 90 H130 M190 75 H260 M190 90 H260 M190 105 H260'
        stroke='#c3cdec'
        strokeWidth='2'
      />
      {['Nav lights', 'Radio', 'Pump'].map((t, i) => (
        <text key={t} x='266' y={79 + i * 15} fontSize='10' fill='#c3cdec'>
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
          border: '1px solid #b9c5e6',
          borderRadius: 8,
          background: '#fff',
          color: '#0c1738',
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
