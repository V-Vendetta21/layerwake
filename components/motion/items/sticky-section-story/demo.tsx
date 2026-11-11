import { StickySectionStory } from './sticky-section-story';

const STEPS = [
  {
    id: 'dawn',
    title: 'Before dawn',
    text: 'Slip the lines in the dark, on the last of the flood.',
  },
  {
    id: 'point',
    title: 'Round the point',
    text: 'The tide turns and carries you out past the light.',
  },
  {
    id: 'open',
    title: 'Open water',
    text: 'Sun up, sails full, the coast falling away astern.',
  },
  {
    id: 'anchor',
    title: 'Anchor',
    text: 'Drop the hook in the cove before the afternoon breeze.',
  },
];

// Each step moves the boat and the sun. CSS transitions animate the change.
function Scene({ step }: { step: number }) {
  const t = step / 3;
  return (
    <svg viewBox='0 0 160 160' width='150' height='150'>
      <rect
        width='160'
        height='160'
        rx='14'
        fill={step === 0 ? '#25345f' : '#dbe5ff'}
        style={{ transition: 'fill 500ms' }}
      />
      <g
        style={{
          transform: `translate(${30 + t * 100}px, ${110 - Math.sin(t * Math.PI) * 70}px)`,
          transition: 'transform 500ms',
        }}
      >
        <circle r='12' fill='#b6ff3b' />
      </g>
      <path d='M0 112 Q40 104 80 112 T160 112 V160 H0Z' fill='#164cff' />
      <g
        style={{
          transform: `translateX(${t * 90}px)`,
          transition: 'transform 500ms',
        }}
      >
        <path d='M20 106 h28 l-5 7 h-18z' fill='#f5f8ff' />
        <path d='M33 104 V76 L46 102Z' fill='#f5f8ff' />
      </g>
    </svg>
  );
}

export default function Demo() {
  return (
    <div style={{ width: 380, maxWidth: '100%' }}>
      <StickySectionStory
        steps={STEPS}
        label='A day sail'
        renderVisual={(step) => <Scene step={step} />}
      />
    </div>
  );
}
