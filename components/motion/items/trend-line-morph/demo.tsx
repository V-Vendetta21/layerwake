import { useState } from 'react';
import { TrendLineMorph } from './trend-line-morph';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const SERIES = {
  water: [9, 8, 9, 11, 13, 16],
  air: [7, 8, 11, 14, 17, 20],
};

export default function Demo() {
  const [series, setSeries] = useState<'water' | 'air'>('water');
  const [selected, setSelected] = useState(2);
  return (
    <div style={{ display: 'grid', gap: 10, width: 330, maxWidth: '100%' }}>
      <div role='group' aria-label='Series' style={{ display: 'flex', gap: 6 }}>
        {(['water', 'air'] as const).map((key) => (
          <button
            key={key}
            type='button'
            aria-pressed={series === key}
            onClick={() => setSeries(key)}
            style={{
              minHeight: 40,
              padding: '0 12px',
              border: '1px solid #474747',
              borderRadius: 8,
              background: series === key ? '#0047ff' : '#121212',
              color: series === key ? '#fff' : '#ffffff',
              font: 'inherit',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {key === 'water' ? 'Water temperature' : 'Air temperature'}
          </button>
        ))}
      </div>
      <TrendLineMorph
        values={SERIES[series]}
        labels={MONTHS}
        min={0}
        max={24}
        unit=' °C'
        selected={selected}
        onSelect={setSelected}
        label={`${series === 'water' ? 'Water' : 'Air'} temperature, January to June`}
      />
    </div>
  );
}
