import { useState } from 'react';
import { StackedDialog } from './stacked-dialog-depth';

const button = {
  minHeight: 44,
  padding: '0 16px',
  border: 0,
  borderRadius: 8,
  background: '#164cff',
  color: '#fff',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
} as const;
const plain = {
  ...button,
  border: '1px solid #b9c5e6',
  background: '#fff',
  color: '#0c1738',
} as const;

export default function Demo() {
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  const [log, setLog] = useState('No changes yet.');
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <button type='button' style={button} onClick={() => setFirst(true)}>
        Edit crew list
      </button>
      <span role='status' style={{ color: '#46527a', fontSize: 13 }}>
        {log}
      </span>
      <StackedDialog
        open={first}
        onClose={() => setFirst(false)}
        title='Crew list'
        covered={second}
      >
        <span>Three people aboard. Remove someone?</span>
        <button type='button' style={plain} onClick={() => setSecond(true)}>
          Remove the deckhand…
        </button>
      </StackedDialog>
      <StackedDialog
        open={second}
        onClose={() => setSecond(false)}
        title='Remove deckhand?'
      >
        <span>They will lose access to the trip plan.</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type='button'
            style={button}
            onClick={() => {
              setSecond(false);
              setLog('Removed the deckhand.');
            }}
          >
            Remove
          </button>
          <button type='button' style={plain} onClick={() => setSecond(false)}>
            Keep
          </button>
        </div>
      </StackedDialog>
    </div>
  );
}
