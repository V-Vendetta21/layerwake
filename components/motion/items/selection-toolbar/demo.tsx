import { useState } from 'react';
import { SelectionToolbar, type Segment } from './selection-toolbar';

const START: Segment[] = [
  {
    text: 'Keep the red marks to port on the way out, and stay well off the shoal at low water.',
    marks: [],
  },
];

export default function Demo() {
  const [segments, setSegments] = useState(START);
  return (
    <div
      style={{
        display: 'grid',
        gap: 8,
        width: 330,
        maxWidth: '100%',
        paddingTop: 50,
      }}
    >
      <SelectionToolbar
        segments={segments}
        onChange={setSegments}
        label='Pilotage note'
      />
      <button
        type='button'
        onClick={() => setSegments(START)}
        style={{
          justifySelf: 'start',
          minHeight: 36,
          padding: '0 10px',
          border: 0,
          background: 'none',
          color: '#164cff',
          font: 'inherit',
          fontSize: 13,
          textDecoration: 'underline',
          cursor: 'pointer',
        }}
      >
        Clear formatting
      </button>
    </div>
  );
}
