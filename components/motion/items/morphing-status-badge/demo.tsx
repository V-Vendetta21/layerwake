import { useEffect, useState } from 'react';
import { StatusBadge, type BadgeStatus } from './morphing-status-badge';

const button = {
  minHeight: 44,
  padding: '0 14px',
  border: '1px solid #b9c5e6',
  borderRadius: 8,
  background: '#fff',
  color: '#0c1738',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
} as const;

export default function Demo() {
  const [status, setStatus] = useState<BadgeStatus>('idle');
  const [outcome, setOutcome] = useState<BadgeStatus>('success');

  // After "loading", settle on the chosen outcome.
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => setStatus(outcome), 1400);
    return () => window.clearTimeout(timer);
  }, [status, outcome]);

  const run = (result: BadgeStatus) => {
    setOutcome(result);
    setStatus('loading');
  };

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
      <StatusBadge status={status} />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
        }}
      >
        <button type='button' style={button} onClick={() => run('success')}>
          Save
        </button>
        <button type='button' style={button} onClick={() => run('error')}>
          Save and fail
        </button>
        <button type='button' style={button} onClick={() => setStatus('idle')}>
          Reset
        </button>
      </div>
    </div>
  );
}
