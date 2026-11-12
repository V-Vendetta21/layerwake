import { useState } from 'react';
import { HoldToConfirm } from './hold-to-confirm';

export default function Demo() {
  const [deleted, setDeleted] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <HoldToConfirm
        label='Hold to delete route'
        doneLabel='Route deleted'
        resetKey={resetKey}
        onConfirm={() => setDeleted((n) => n + 1)}
      />
      <span style={{ color: '#b8b8b8', fontSize: 13 }}>
        Confirmed {deleted} {deleted === 1 ? 'time' : 'times'}
      </span>
      <button
        type='button'
        onClick={() => setResetKey((k) => k + 1)}
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
        Reset
      </button>
    </div>
  );
}
