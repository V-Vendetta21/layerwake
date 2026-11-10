import { useState } from 'react';
import { RollingCounter } from './rolling-counter';

const button = {
  minWidth: 44,
  minHeight: 44,
  padding: '0 14px',
  border: '1px solid #b9c5e6',
  borderRadius: 8,
  background: '#fff',
  color: '#0c1738',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
} as const;

export default function Demo() {
  const [value, setValue] = useState(1284);
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <span style={{ fontSize: 44, fontWeight: 700 }}>
        <RollingCounter value={value} minDigits={4} />
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type='button'
          style={button}
          aria-label='Decrease'
          onClick={() => setValue((v) => Math.max(0, v - 1))}
        >
          −
        </button>
        <button
          type='button'
          style={button}
          aria-label='Increase'
          onClick={() => setValue((v) => v + 1)}
        >
          +
        </button>
        <button
          type='button'
          style={button}
          onClick={() => setValue(Math.floor(Math.random() * 9000) + 1000)}
        >
          Random
        </button>
      </div>
    </div>
  );
}
