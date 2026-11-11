import { useState } from 'react';
import { DragReorderList } from './drag-reorder-list';

export default function Demo() {
  const [stops, setStops] = useState([
    { id: 'fuel', label: 'Fuel dock' },
    { id: 'chandlery', label: 'Chandlery' },
    { id: 'office', label: 'Harbor office' },
    { id: 'market', label: 'Fish market' },
  ]);
  return (
    <div style={{ width: 300, maxWidth: '100%' }}>
      <DragReorderList
        items={stops}
        onReorder={setStops}
        label='Errand order'
      />
    </div>
  );
}
