import { useState } from 'react';
import { SlideOverSheet } from './slide-over-sheet';

const button = {
  minHeight: 44,
  padding: '0 18px',
  border: 0,
  borderRadius: 8,
  background: '#0047ff',
  color: '#fff',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
} as const;

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    // `contained` keeps the sheet inside this box. Drop it to cover the page.
    <div
      style={{
        position: 'relative',
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        height: 260,
        overflow: 'hidden',
        borderRadius: 12,
      }}
    >
      <button type='button' style={button} onClick={() => setOpen(true)}>
        Open passage plan
      </button>
      <SlideOverSheet
        open={open}
        onClose={() => setOpen(false)}
        title='Passage plan'
        contained
      >
        <p style={{ margin: '0 0 12px' }}>
          Depart 06:30 on the ebb. Arrive before the afternoon sea breeze.
        </p>
        <button type='button' style={button} onClick={() => setOpen(false)}>
          Confirm
        </button>
      </SlideOverSheet>
    </div>
  );
}
