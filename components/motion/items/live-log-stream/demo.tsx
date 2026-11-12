import { useEffect, useRef, useState } from 'react';
import { LiveLogStream, type LogEntry } from './live-log-stream';

// Simulated engine-room log. Nothing is fetched.
const LINES: Omit<LogEntry, 'id' | 'time'>[] = [
  { level: 'info', text: 'Bilge pump cycle complete' },
  { level: 'info', text: 'Battery bank at 12.7 V' },
  { level: 'warn', text: 'Fuel filter pressure rising' },
  { level: 'info', text: 'GPS fix acquired, 9 satellites' },
  { level: 'info', text: 'Autopilot heading 245°' },
  { level: 'error', text: 'Depth sounder: no echo' },
  { level: 'info', text: 'Depth sounder recovered' },
];
const stamp = (n: number) =>
  `14:${String(10 + Math.floor(n / 6)).padStart(2, '0')}:${String((n * 10) % 60).padStart(2, '0')}`;

export default function Demo() {
  const count = useRef(0);
  const make = (): LogEntry => {
    const n = count.current++;
    return { id: n, time: stamp(n), ...LINES[n % LINES.length] };
  };
  const [entries, setEntries] = useState<LogEntry[]>(() =>
    Array.from({ length: 8 }, make)
  );
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setEntries((list) => [...list, make()].slice(-200)),
      900
    );
    return () => window.clearInterval(timer);
    // make() only reads a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  return (
    <div style={{ display: 'grid', gap: 6, width: 340, maxWidth: '100%' }}>
      <LiveLogStream entries={entries} label='Engine room log' />
      <button
        type='button'
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
        style={{
          justifySelf: 'start',
          minHeight: 40,
          padding: '0 14px',
          border: '1px solid #b9c5e6',
          borderRadius: 8,
          background: '#fff',
          color: '#0c1738',
          font: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {paused ? 'Resume stream' : 'Pause stream'}
      </button>
    </div>
  );
}
