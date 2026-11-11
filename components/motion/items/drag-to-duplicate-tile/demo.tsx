import { useRef, useState } from 'react';
import { DragToDuplicateTile, type PlacedTile } from './drag-to-duplicate-tile';

const KINDS = [
  {
    id: 'buoy',
    label: 'buoy',
    render: () => (
      <svg viewBox='0 0 32 32' aria-hidden='true'>
        <circle cx='16' cy='16' r='11' fill='#164cff' />
      </svg>
    ),
  },
  {
    id: 'marker',
    label: 'marker',
    render: () => (
      <svg viewBox='0 0 32 32' aria-hidden='true'>
        <rect x='6' y='6' width='20' height='20' rx='3' fill='#0c1738' />
      </svg>
    ),
  },
  {
    id: 'hazard',
    label: 'hazard',
    render: () => (
      <svg viewBox='0 0 32 32' aria-hidden='true'>
        <path d='M16 4 L29 27 H3Z' fill='#e2452b' />
      </svg>
    ),
  },
];

export default function Demo() {
  const [tiles, setTiles] = useState<PlacedTile[]>([]);
  const key = useRef(0);
  return (
    <div style={{ display: 'grid', gap: 8, width: 340, maxWidth: '100%' }}>
      <DragToDuplicateTile
        kinds={KINDS}
        tiles={tiles}
        onAdd={(t) =>
          setTiles((list) => [...list, { ...t, key: key.current++ }])
        }
      />
      <button
        type='button'
        onClick={() => setTiles([])}
        disabled={tiles.length === 0}
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
        Clear canvas
      </button>
    </div>
  );
}
