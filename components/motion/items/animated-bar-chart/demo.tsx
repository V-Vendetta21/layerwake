import { useState } from 'react';
import { AnimatedBarChart } from './animated-bar-chart';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SETS = {
  this: [12, 18, 9, 22, 15],
  last: [20, 8, 14, 11, 25],
};

export default function Demo() {
  const [set, setSet] = useState<'this' | 'last'>('this');
  const data = DAYS.map((d, i) => ({ id: d, label: d, value: SETS[set][i] }));
  return (
    <div style={{ display: 'grid', gap: 12, width: 320, maxWidth: '100%' }}>
      <AnimatedBarChart
        data={data}
        max={30}
        unit=' kn'
        label={`Wind speed, ${set === 'this' ? 'this' : 'last'} week`}
      />
      <div
        role='group'
        aria-label='Dataset'
        style={{ display: 'flex', gap: 6 }}
      >
        {(['this', 'last'] as const).map((key) => (
          <button
            key={key}
            type='button'
            aria-pressed={set === key}
            onClick={() => setSet(key)}
            style={{
              minHeight: 40,
              padding: '0 12px',
              border: '1px solid #b9c5e6',
              borderRadius: 8,
              background: set === key ? '#0c1738' : '#fff',
              color: set === key ? '#fff' : '#0c1738',
              font: 'inherit',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {key === 'this' ? 'This week' : 'Last week'}
          </button>
        ))}
      </div>
    </div>
  );
}
