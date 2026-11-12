import { useState } from 'react';
import { GlitchSplitText } from './glitch-split-text';

export default function Demo() {
  const [play, setPlay] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 18, justifyItems: 'center' }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#0c1738' }}>
        <GlitchSplitText text='Signal found' as='h3' playKey={play} />
      </div>
      <button
        type='button'
        onClick={() => setPlay((n) => n + 1)}
        style={{
          minHeight: 44,
          padding: '0 16px',
          border: '1px solid #b9c5e6',
          borderRadius: 8,
          background: '#fff',
          color: '#0c1738',
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
