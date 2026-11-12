import { ImageFocusLens } from './image-focus-lens';

function Chart() {
  return (
    <svg viewBox='0 0 320 200' aria-hidden='true'>
      <rect width='320' height='200' fill='#f5f8ff' />
      <path
        d='M30 160 C80 110 110 150 150 100 S230 60 290 40'
        fill='none'
        stroke='#164cff'
        strokeWidth='3'
      />
      {[
        [60, 132, 'Buoy 3'],
        [150, 100, 'Rock'],
        [230, 62, 'Light'],
        [290, 40, 'Pier'],
      ].map(([x, y, t]) => (
        <g key={String(t)}>
          <circle cx={Number(x)} cy={Number(y)} r='5' fill='#0c1738' />
          <text x={Number(x) + 8} y={Number(y) - 8} fontSize='9' fill='#0c1738'>
            {t}
          </text>
        </g>
      ))}
      <text x='20' y='190' fontSize='7' fill='#46527a'>
        Depths in metres · not for navigation
      </text>
    </svg>
  );
}

export default function Demo() {
  return (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <ImageFocusLens label='Harbor chart with four labelled marks'>
        <Chart />
      </ImageFocusLens>
    </div>
  );
}
