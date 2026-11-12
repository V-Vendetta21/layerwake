import { useState } from 'react';
import { DualThumbRange } from './dual-thumb-range';

export default function Demo() {
  const [range, setRange] = useState<[number, number]>([8, 18]);
  return (
    <div style={{ display: 'grid', gap: 8, width: 320, maxWidth: '100%' }}>
      <DualThumbRange
        value={range}
        onChange={setRange}
        min={0}
        max={30}
        minGap={2}
        labels={['Lowest wind', 'Highest wind']}
        format={(v) => `${v} kn`}
      />
      <span style={{ color: '#b8b8b8', fontSize: 13 }}>
        Show days with {range[0]}–{range[1]} knots of wind.
      </span>
    </div>
  );
}
