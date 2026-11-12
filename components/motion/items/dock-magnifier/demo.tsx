import { useState } from 'react';
import { Dock } from './dock-magnifier';

const NAMES = ['Maps', 'Tides', 'Wind', 'Logbook', 'Radio'];

export default function Demo() {
  const [chosen, setChosen] = useState('Maps');
  const items = NAMES.map((name) => ({
    id: name,
    label: name,
    icon: name[0],
    onSelect: () => setChosen(name),
  }));
  return (
    <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
      <Dock items={items} label='Apps' />
      <span role='status' style={{ color: '#b8b8b8' }}>
        Open: {chosen}
      </span>
    </div>
  );
}
