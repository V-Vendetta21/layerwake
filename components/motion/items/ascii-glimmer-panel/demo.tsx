import { useState } from 'react';
import { AsciiGlimmerPanel } from './ascii-glimmer-panel';

export default function Demo() {
  const [run, setRun] = useState(0);
  return (
    <div
      style={{
        display: 'grid',
        gap: 10,
        width: 340,
        maxWidth: '100%',
        justifyItems: 'center',
      }}
    >
      <AsciiGlimmerPanel playKey={run}>
        <strong style={{ display: 'block', fontSize: 18 }}>
          Weather station online
        </strong>
        <span style={{ fontSize: 13, color: '#c3cdec' }}>
          Last reading 2 minutes ago
        </span>
      </AsciiGlimmerPanel>
      <button
        type='button'
        onClick={() => setRun((n) => n + 1)}
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
        Replay wave
      </button>
    </div>
  );
}
