import { useState } from 'react';
import { SegmentedSwitch } from './segmented-switch';

const UNITS = [
  { value: 'knots', label: 'Knots' },
  { value: 'kmh', label: 'km/h' },
  { value: 'mph', label: 'mph' },
];
const SPEED: Record<string, string> = {
  knots: '9 kn',
  kmh: '17 km/h',
  mph: '10 mph',
};

export default function Demo() {
  const [unit, setUnit] = useState('knots');
  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
      <SegmentedSwitch
        options={UNITS}
        value={unit}
        onChange={setUnit}
        label='Wind speed unit'
      />
      <span role='status' style={{ fontSize: 22, fontWeight: 700 }}>
        {SPEED[unit]}
      </span>
    </div>
  );
}
