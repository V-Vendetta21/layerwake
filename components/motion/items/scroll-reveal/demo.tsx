import { useRef } from 'react';
import { ScrollReveal } from './scroll-reveal';

const LOG = [
  '06:30 Slipped the mooring',
  '07:10 Cleared the breakwater',
  '08:45 Dolphins off the port bow',
  '10:20 Wind backing south-west',
  '12:00 Lunch at anchor',
  '13:40 Reefed the main',
  '15:15 Lighthouse abeam',
  '17:05 Alongside, lines made fast',
];

export default function Demo() {
  const area = useRef<HTMLDivElement>(null);
  return (
    // A local scroll area: the page itself does not need to move.
    <div
      ref={area}
      tabIndex={0}
      role='group'
      aria-label="Ship's log, scrollable"
      style={{
        width: 300,
        maxWidth: '100%',
        height: 220,
        overflowY: 'auto',
        // Stop the page from scrolling when this area reaches its end.
        overscrollBehavior: 'contain',
        padding: 12,
        border: '1px solid #d6def2',
        borderRadius: 12,
        background: '#fff',
      }}
    >
      <ul
        style={{
          display: 'grid',
          gap: 10,
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {LOG.map((entry) => (
          <ScrollReveal key={entry} as='li' root={area}>
            <div
              style={{
                padding: '14px 12px',
                borderRadius: 8,
                background: '#f5f8ff',
                color: '#0c1738',
              }}
            >
              {entry}
            </div>
          </ScrollReveal>
        ))}
      </ul>
    </div>
  );
}
