import { useState } from 'react';
import { LayoutGrid } from './shared-layout-grid';

const BOATS = [
  { id: 'a', name: 'Aster', kind: 'sail' },
  { id: 'b', name: 'Brine', kind: 'motor' },
  { id: 'c', name: 'Cormorant', kind: 'sail' },
  { id: 'd', name: 'Drift', kind: 'row' },
  { id: 'e', name: 'Eider', kind: 'motor' },
  { id: 'f', name: 'Fathom', kind: 'sail' },
];
const FILTERS = ['all', 'sail', 'motor', 'row'];
const TONE: Record<string, string> = {
  sail: '#0047ff',
  motor: '#333333',
  row: '#5c5c5c',
};

export default function Demo() {
  const [filter, setFilter] = useState('all');
  const items = BOATS.filter(
    (boat) => filter === 'all' || boat.kind === filter
  );
  return (
    <div style={{ display: 'grid', gap: 12, width: 340, maxWidth: '100%' }}>
      <div
        role='group'
        aria-label='Filter boats'
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
      >
        {FILTERS.map((name) => (
          <button
            key={name}
            type='button'
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
            style={{
              minHeight: 40,
              padding: '0 14px',
              border: '1px solid #474747',
              borderRadius: 999,
              background: filter === name ? '#0047ff' : '#121212',
              color: filter === name ? '#fff' : '#ffffff',
              font: 'inherit',
              fontWeight: 600,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <div style={{ minHeight: 120 }}>
        <LayoutGrid
          items={items}
          columns={3}
          renderItem={(boat) => (
            <div
              style={{
                padding: '14px 8px',
                borderRadius: 10,
                background: TONE[boat.kind],
                color: '#fff',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {boat.name}
            </div>
          )}
        />
      </div>
    </div>
  );
}
