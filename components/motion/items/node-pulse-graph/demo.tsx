import { useState } from 'react';
import { NodePulseGraph } from './node-pulse-graph';

const NODES = [
  { id: 'hq', label: 'Harbor', x: 60, y: 60 },
  { id: 'pier', label: 'Pier', x: 170, y: 40 },
  { id: 'light', label: 'Light', x: 280, y: 70 },
  { id: 'buoy', label: 'Buoy', x: 110, y: 150 },
  { id: 'rock', label: 'Rock', x: 230, y: 160 },
];
const EDGES: [string, string][] = [
  ['hq', 'pier'],
  ['hq', 'buoy'],
  ['pier', 'light'],
  ['pier', 'rock'],
  ['buoy', 'rock'],
];
const name = (id: string) => NODES.find((n) => n.id === id)!.label;

export default function Demo() {
  const [source, setSource] = useState('hq');
  const [run, setRun] = useState(0);
  const [summary, setSummary] = useState('Choose a node to send a pulse.');
  return (
    <div style={{ display: 'grid', gap: 10, width: 340, maxWidth: '100%' }}>
      <NodePulseGraph
        nodes={NODES}
        edges={EDGES}
        source={source}
        run={run}
        viewBox='0 0 340 200'
        label='Radio relay network of five stations'
        onComplete={(levels) =>
          setSummary(
            `From ${name(levels[0][0])}: ` +
              levels
                .slice(1)
                .map(
                  (l, i) => `step ${i + 1} reached ${l.map(name).join(' and ')}`
                )
                .join('; ') +
              '.'
          )
        }
      />
      <div
        role='group'
        aria-label='Send a pulse from'
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
      >
        {NODES.map((n) => (
          <button
            key={n.id}
            type='button'
            aria-pressed={source === n.id}
            onClick={() => {
              setSource(n.id);
              setRun((r) => r + 1);
            }}
            style={{
              minHeight: 40,
              padding: '0 10px',
              border: '1px solid #474747',
              borderRadius: 8,
              background: source === n.id ? '#eaf2fb' : '#121212',
              color: source === n.id ? '#080808' : '#ffffff',
              font: 'inherit',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pulse from {n.label}
          </button>
        ))}
      </div>
      <p role='status' style={{ margin: 0, color: '#b8b8b8', fontSize: 13 }}>
        {summary}
      </p>
    </div>
  );
}
