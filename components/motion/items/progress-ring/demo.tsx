import { useEffect, useState } from 'react';
import { ProgressRing } from './progress-ring';

export default function Demo() {
  const [value, setValue] = useState(0);

  // Animate from empty to the starting value when the demo appears.
  useEffect(() => {
    const timer = window.setTimeout(() => setValue(68), 150);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
      <ProgressRing value={value} label='Fuel level' />
      <label style={{ display: 'grid', gap: 4, color: '#b8b8b8' }}>
        Set the level
        <input
          type='range'
          min={0}
          max={100}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          style={{ width: 200, height: 32, accentColor: '#648aff' }}
        />
      </label>
    </div>
  );
}
