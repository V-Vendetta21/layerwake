import { useState } from 'react';
import { IndeterminateLoader } from './indeterminate-loader';

const button = {
  minHeight: 44,
  padding: '0 16px',
  border: '1px solid #474747',
  borderRadius: 8,
  background: '#121212',
  color: '#ffffff',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
} as const;

export default function Demo() {
  const [active, setActive] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 16, width: 300, maxWidth: '100%' }}>
      <IndeterminateLoader label='Syncing charts' active={active} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type='button'
          style={button}
          onClick={() => setActive(true)}
          disabled={active}
        >
          Start
        </button>
        <button
          type='button'
          style={button}
          onClick={() => setActive(false)}
          disabled={!active}
        >
          Finish
        </button>
      </div>
    </div>
  );
}
