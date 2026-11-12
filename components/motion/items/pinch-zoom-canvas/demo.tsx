import { PinchZoomCanvas } from './pinch-zoom-canvas';

function Chart() {
  return (
    <svg
      viewBox='0 0 340 200'
      aria-hidden='true'
      preserveAspectRatio='xMidYMid slice'
    >
      <rect width='340' height='200' fill='#1b1b1b' />
      <path
        d='M0 0 H120 Q140 60 110 120 Q90 170 120 200 H0Z'
        fill='#1b1b1b'
        stroke='#ffffff'
      />
      {[
        [180, 60],
        [220, 110],
        [260, 70],
        [200, 160],
        [290, 140],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r='3' fill='#ededed' />
          <text x={x + 5} y={y - 4} fontSize='6' fill='#ffffff'>
            {(i + 3) * 2}m
          </text>
        </g>
      ))}
      <path
        d='M130 40 C170 80 210 60 250 100 S300 160 330 150'
        fill='none'
        stroke='#dce9f7'
        strokeDasharray='4 3'
      />
      <text x='20' y='100' fontSize='10' fontWeight='700' fill='#ffffff'>
        Quay
      </text>
    </svg>
  );
}

export default function Demo() {
  return (
    <div style={{ width: 340, maxWidth: '100%' }}>
      <PinchZoomCanvas label='Harbor approach chart'>
        <Chart />
      </PinchZoomCanvas>
    </div>
  );
}
