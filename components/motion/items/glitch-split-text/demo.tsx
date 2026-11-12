import { useState } from 'react';
import { GlitchSplitText } from './glitch-split-text';

export default function Demo() {
  const [play, setPlay] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 18, justifyItems: 'center' }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#ffffff' }}>
        <GlitchSplitText text='Signal found' as='h3' playKey={play} />
      </div>
      <button
        type='button'
        onClick={() => setPlay((n) => n + 1)}
        style={{
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
        Glitch again
      </button>
    </div>
  );
}
