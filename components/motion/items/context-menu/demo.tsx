import { useState } from 'react';
import { ContextMenu } from './context-menu';

const ITEMS = [
  { id: 'mark', label: 'Drop a waypoint' },
  { id: 'measure', label: 'Measure from here' },
  { id: 'note', label: 'Add a note' },
];

export default function Demo() {
  const [last, setLast] = useState(
    'Right-click the chart, press Shift+F10, or tap Actions.'
  );
  return (
    <div style={{ display: 'grid', gap: 10, width: 320, maxWidth: '100%' }}>
      <ContextMenu
        items={ITEMS}
        label='Chart'
        onSelect={(id) =>
          setLast(`Chose: ${ITEMS.find((i) => i.id === id)!.label}`)
        }
      >
        <strong>Chart area</strong>
        <p style={{ margin: '6px 0 0', color: '#b8b8b8', fontSize: 13 }}>
          The menu opens where you click.
        </p>
      </ContextMenu>
      <span role='status' style={{ color: '#b8b8b8', fontSize: 13 }}>
        {last}
      </span>
    </div>
  );
}
