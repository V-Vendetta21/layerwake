import { useState } from 'react';
import { SwipeActionRow } from './swipe-action-row';

const MESSAGES = [
  'Ferry times changed',
  'Harbor fees for March',
  'Crew rota is ready',
];
const ACTIONS = [
  { id: 'archive', label: 'Archive' },
  { id: 'delete', label: 'Delete', tone: 'danger' as const },
];

export default function Demo() {
  const [log, setLog] = useState('Swipe a row left, or use ⋯.');
  return (
    <div style={{ display: 'grid', gap: 8, width: 320, maxWidth: '100%' }}>
      {MESSAGES.map((m) => (
        <SwipeActionRow
          key={m}
          name={m}
          actions={ACTIONS}
          onAction={(id) =>
            setLog(`${id === 'archive' ? 'Archived' : 'Deleted'}: ${m}`)
          }
        >
          <strong style={{ display: 'block', fontSize: 14 }}>{m}</strong>
          <span style={{ color: '#46527a', fontSize: 12 }}>Harbor office</span>
        </SwipeActionRow>
      ))}
      <span role='status' style={{ color: '#46527a', fontSize: 13 }}>
        {log}
      </span>
    </div>
  );
}
