import { useState } from 'react';
import { RippleButton } from './press-ripple';

export default function Demo() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <RippleButton onClick={() => setCount((c) => c + 1)}>
        Ring the bell
      </RippleButton>
      <span role='status' style={{ color: '#b8b8b8' }}>
        Rung {count} {count === 1 ? 'time' : 'times'}
      </span>
    </div>
  );
}
