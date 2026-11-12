import { useState } from 'react';
import { ToggleIconMorph } from './toggle-icon-morph';

export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ display: 'grid', gap: 12, justifyItems: 'center', width: 260 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ToggleIconMorph
          open={open}
          onOpenChange={setOpen}
          label='Add waypoint'
          aria-controls='waypoint-form'
        />
        <span style={{ fontWeight: 600 }}>
          {open ? 'Close form' : 'Add waypoint'}
        </span>
      </div>
      <div
        id='waypoint-form'
        hidden={!open}
        style={{
          width: '100%',
          padding: 12,
          border: '1px solid #d6def2',
          borderRadius: 10,
          background: '#fff',
          color: '#46527a',
        }}
      >
        Waypoint form: name, latitude, longitude.
      </div>
    </div>
  );
}
