import { useState } from 'react';
import { SwipeDeck } from './swipe-deck';

const ANCHORAGES = [
  { name: 'Seal Cove', note: 'Sand, 4 m. Sheltered from the west.' },
  { name: 'Gull Point', note: 'Weed over rock. Lunch stop only.' },
  { name: 'Long Strand', note: 'Sand, 6 m. Swell in a southerly.' },
  { name: 'Heron Creek', note: 'Mud, 3 m. Dries at springs.' },
];

export default function Demo() {
  const [index, setIndex] = useState(0);
  return (
    <div style={{ width: 300, maxWidth: '100%' }}>
      <SwipeDeck
        items={ANCHORAGES}
        index={index}
        onIndexChange={setIndex}
        label='Anchorages'
        renderCard={(a) => (
          <>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#dce9f7',
              }}
            >
              ANCHORAGE
            </span>
            <strong style={{ display: 'block', margin: '6px 0', fontSize: 20 }}>
              {a.name}
            </strong>
            <span style={{ color: '#b8b8b8' }}>{a.note}</span>
          </>
        )}
      />
    </div>
  );
}
