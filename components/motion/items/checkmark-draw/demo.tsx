import { useState } from 'react';
import { CheckmarkDraw } from './checkmark-draw';

export default function Demo() {
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
      <CheckmarkDraw done={done} label='Mooring paid for 3 nights' />
      <button
        type='button'
        onClick={() => setDone((d) => !d)}
        style={{
          minHeight: 44,
          padding: '0 16px',
          border: 0,
          borderRadius: 8,
          background: done ? '#0c1738' : '#164cff',
          color: '#fff',
          font: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {done ? 'Reset' : 'Pay mooring fee'}
      </button>
    </div>
  );
}
