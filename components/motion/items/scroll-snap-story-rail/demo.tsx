import { ScrollSnapStoryRail } from './scroll-snap-story-rail';

const STORIES = [
  ['06:00', 'Engine checks and a coffee in the cockpit.'],
  ['07:30', 'Out past the breakwater on the ebb.'],
  ['11:00', 'Dolphins for twenty minutes off the bow.'],
  ['15:00', 'Wind backs; reef early and press on.'],
  ['18:30', 'Alongside in a new harbor, tired and happy.'],
];

export default function Demo() {
  return (
    <div style={{ width: 340, maxWidth: '100%' }}>
      <ScrollSnapStoryRail
        label='Passage day'
        slides={STORIES.map(([time, text]) => (
          <>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                opacity: 0.8,
              }}
            >
              {time}
            </span>
            <p style={{ margin: '8px 0 0', fontSize: 17, fontWeight: 600 }}>
              {text}
            </p>
          </>
        ))}
      />
    </div>
  );
}
