import { useState } from 'react';
import { CopyConfirmationButton } from './copy-confirmation-button';

const CODE = 'BERTH-B14';
const blocked = () => Promise.reject(new Error('Simulated: clipboard blocked'));

export default function Demo() {
  const [fail, setFail] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <code
        style={{
          padding: '6px 12px',
          border: '1px solid #d6def2',
          borderRadius: 8,
          background: '#fff',
          fontSize: 18,
        }}
      >
        {CODE}
      </code>
      <CopyConfirmationButton
        text={CODE}
        label='Copy berth code'
        copy={fail ? blocked : undefined}
      />
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minHeight: 40,
          color: '#46527a',
          fontSize: 13,
        }}
      >
        <input
          type='checkbox'
          checked={fail}
          onChange={(e) => setFail(e.target.checked)}
        />
        Simulate a blocked clipboard
      </label>
    </div>
  );
}
