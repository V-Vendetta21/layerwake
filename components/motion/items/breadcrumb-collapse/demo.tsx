import { useState } from 'react';
import { BreadcrumbCollapse } from './breadcrumb-collapse';

const TRAIL = [
  { id: 'home', label: 'Home' },
  { id: 'atlantic', label: 'Atlantic' },
  { id: 'biscay', label: 'Biscay' },
  { id: 'brittany', label: 'Brittany' },
  { id: 'brest', label: 'Brest harbor' },
];

export default function Demo() {
  const [width, setWidth] = useState(240);
  const [went, setWent] = useState('');
  return (
    <div style={{ display: 'grid', gap: 12, width: 520, maxWidth: '100%' }}>
      <div
        style={{
          width,
          maxWidth: '100%',
          padding: '0 8px',
          border: '1px dashed #474747',
          borderRadius: 8,
          background: '#121212',
        }}
      >
        <BreadcrumbCollapse
          items={TRAIL}
          onNavigate={(id) => setWent(TRAIL.find((t) => t.id === id)!.label)}
        />
      </div>
      <label
        style={{ display: 'grid', gap: 2, color: '#b8b8b8', fontSize: 13 }}
      >
        Container width: {width}px
        <input
          type='range'
          min={160}
          max={520}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          style={{ accentColor: '#648aff' }}
        />
      </label>
      <span role='status' style={{ color: '#b8b8b8', fontSize: 13 }}>
        {went ? `Would open: ${went}` : 'Widen it to bring the crumbs back.'}
      </span>
    </div>
  );
}
