import { useState } from 'react';
import { CollapsingAppHeader } from './collapsing-app-header';

const LINES = [
  'Scroll this page. The header condenses into a toolbar and the Log entry button stays put.',
  '06:30 · Slipped the mooring on the last of the flood.',
  '07:10 · Cleared the breakwater, main up, one reef.',
  '08:45 · Dolphins off the port bow for ten minutes.',
  '10:20 · Wind backing south-west, shaking out the reef.',
  '12:00 · Lunch at anchor in Seal Cove.',
  '14:30 · Under way again, beam reach.',
  '17:05 · Alongside, lines made fast.',
];

export default function Demo() {
  const [entries, setEntries] = useState(0);
  return (
    <div style={{ width: 340, maxWidth: '100%' }}>
      <CollapsingAppHeader
        label='Logbook page'
        title='Logbook'
        subtitle={`Tuesday · ${entries} new ${entries === 1 ? 'entry' : 'entries'}`}
        action={
          <button type='button' onClick={() => setEntries((n) => n + 1)}>
            Log entry
          </button>
        }
      >
        {LINES.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </CollapsingAppHeader>
    </div>
  );
}
