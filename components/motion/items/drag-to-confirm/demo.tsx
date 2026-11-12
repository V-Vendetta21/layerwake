import { useState } from 'react';
import { DragToConfirm } from './drag-to-confirm';

export default function Demo() {
  const [resetKey, setResetKey] = useState(0);
  const [sent, setSent] = useState(false);
  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        width: 300,
        maxWidth: '100%',
        justifyItems: 'center',
      }}
    >
      <DragToConfirm
        label='Slide to send mayday drill'
        doneLabel='Drill sent'
        resetKey={resetKey}
        onConfirm={() => setSent(true)}
      />
      <span style={{ color: '#b8b8b8', fontSize: 13 }}>
        {sent ? 'Simulated: the drill alert went out.' : 'Nothing sent yet.'}
      </span>
      <button
        type='button'
        onClick={() => {
          setResetKey((k) => k + 1);
          setSent(false);
        }}
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
