import { useState } from 'react';
import { RotaryDial } from './rotary-dial';

const DEFAULT = 4;

export default function Demo() {
  const [volume, setVolume] = useState(DEFAULT);
  return (
    <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
      <RotaryDial
        value={volume}
        onChange={setVolume}
        label='Radio volume'
        format={(v) => `Volume ${v} of 10`}
      />
      <button
        type='button'
        onClick={() => setVolume(DEFAULT)}
        disabled={volume === DEFAULT}
        style={{
          minHeight: 40,
          padding: '0 14px',
          border: '1px solid #474747',
          borderRadius: 8,
          background: '#121212',
          color: '#ffffff',
          font: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reset to {DEFAULT}
      </button>
    </div>
  );
}
