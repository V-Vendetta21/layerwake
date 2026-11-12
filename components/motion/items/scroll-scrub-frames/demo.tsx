import { ScrollScrubFrames } from './scroll-scrub-frames';

const FRAMES = 8;

// Original frames: a sunrise over the bay, drawn from the frame number.
function Sunrise({ index }: { index: number }) {
  const t = index / (FRAMES - 1);
  const sky = [
    '#262626',
    '#1b1b1b',
    '#474747',
    '#648aff',
    '#474747',
    '#1b1b1b',
    '#141d38',
    '#1b1b1b',
  ][index];
  return (
    <svg
      viewBox='0 0 320 200'
      role='img'
      aria-label={`Sunrise, frame ${index + 1}: the sun is ${Math.round(t * 100)}% risen`}
    >
      <rect width='320' height='200' fill={sky} />
      <circle
        cx={80 + t * 140}
        cy={150 - t * 100}
        r={16 + t * 6}
        fill='#0047ff'
      />
      <path d='M0 140 Q80 130 160 140 T320 140 V200 H0Z' fill='#0047ff' />
      <path d={`M${40 + t * 180} 136 h26 l-5 7 h-16z`} fill='#1b1b1b' />
    </svg>
  );
}

export default function Demo() {
  return (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <ScrollScrubFrames
        frames={FRAMES}
        label='Sunrise over the bay'
        renderFrame={(i) => <Sunrise index={i} />}
      />
    </div>
  );
}
