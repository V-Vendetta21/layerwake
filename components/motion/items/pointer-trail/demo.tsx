import { useState } from 'react';
import { PointerTrail } from './pointer-trail';

export default function Demo() {
  const [active, setActive] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 10, width: 320, maxWidth: '100%' }}>
      <PointerTrail active={active} label='Drawing area with a pointer trail'>
        {active ? 'Move the pointer or drag a finger here.' : 'Trail stopped.'}
      </PointerTrail>
      <button
        type='button'
        aria-pressed={active}
        onClick={() => setActive((a) => !a)}
        style={{
          justifySelf: 'start',
          minHeight: 44,
          padding: '0 16px',
          border: '1px solid #474747',
          borderRadius: 8,
          background: '#121212',
          color: '#ffffff',
          font: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {active ? 'Stop trail' : 'Start trail'}
      </button>
    </div>
  );
}
