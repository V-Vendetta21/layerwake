import { useState } from 'react';
import { SplitActionButton } from './split-action-button';

const OPTIONS = [
  { id: 'draft', label: 'Save as draft' },
  { id: 'share', label: 'Save and share with crew' },
];

export default function Demo() {
  const [outcome, setOutcome] = useState('Nothing saved yet.');
  return (
    <div
      style={{
        display: 'grid',
        gap: 14,
        justifyItems: 'center',
        minHeight: 170,
        alignContent: 'start',
        paddingTop: 20,
      }}
    >
      <SplitActionButton
        label='Save route'
        menuLabel='More save options'
        onAction={() => setOutcome('Saved the route.')}
        options={OPTIONS}
        onSelect={(id) =>
          setOutcome(
            id === 'draft'
              ? 'Saved as a draft.'
              : 'Saved and shared with the crew.'
          )
        }
      />
      <span role='status' style={{ color: '#b8b8b8' }}>
        {outcome}
      </span>
    </div>
  );
}
