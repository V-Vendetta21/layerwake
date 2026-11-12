import { useState } from 'react';
import { NestedMenuDrilldown } from './nested-menu-drilldown';

const MENU = [
  {
    id: 'display',
    label: 'Display',
    children: [
      { id: 'night', label: 'Night mode' },
      {
        id: 'units',
        label: 'Units',
        children: [
          { id: 'metric', label: 'Metres' },
          { id: 'imperial', label: 'Feet' },
        ],
      },
    ],
  },
  {
    id: 'alarms',
    label: 'Alarms',
    children: [
      { id: 'anchor', label: 'Anchor drag' },
      { id: 'depth', label: 'Shallow water' },
    ],
  },
  { id: 'about', label: 'About this chartplotter' },
];

export default function Demo() {
  const [chosen, setChosen] = useState('Nothing chosen yet.');
  return (
    <div
      style={{
        display: 'grid',
        gap: 10,
        justifyItems: 'start',
        width: 300,
        minHeight: 230,
      }}
    >
      <NestedMenuDrilldown
        label='Settings'
        items={MENU}
        onSelect={(path) => setChosen(`Chose: ${path.join(' › ')}`)}
      />
      <span
        role='status'
        style={{ marginTop: 180, color: '#b8b8b8', fontSize: 13 }}
      >
        {chosen}
      </span>
    </div>
  );
}
