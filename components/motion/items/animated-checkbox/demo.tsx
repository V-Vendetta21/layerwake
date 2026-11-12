import { useState } from 'react';
import { AnimatedCheckbox } from './animated-checkbox';

const CREW = ['Skipper', 'Navigator', 'Deckhand'];

export default function Demo() {
  const [aboard, setAboard] = useState<string[]>(['Skipper']);
  const all = aboard.length === CREW.length;
  const some = aboard.length > 0 && !all;
  return (
    <fieldset
      style={{
        minWidth: 240,
        margin: 0,
        padding: '8px 16px',
        border: '1px solid #303030',
        borderRadius: 12,
        background: '#121212',
      }}
    >
      <legend style={{ padding: '0 4px', fontWeight: 700 }}>Crew aboard</legend>
      <AnimatedCheckbox
        checked={all}
        indeterminate={some}
        onChange={(checked) => setAboard(checked ? CREW : [])}
      >
        All crew ({aboard.length} of {CREW.length})
      </AnimatedCheckbox>
      <div style={{ display: 'grid', paddingLeft: 26 }}>
        {CREW.map((name) => (
          <AnimatedCheckbox
            key={name}
            checked={aboard.includes(name)}
            onChange={(checked) =>
              setAboard((list) =>
                checked ? [...list, name] : list.filter((n) => n !== name)
              )
            }
          >
            {name}
          </AnimatedCheckbox>
        ))}
      </div>
    </fieldset>
  );
}
