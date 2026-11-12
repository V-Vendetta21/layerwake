import { useState } from 'react';
import { InlineValidation, type ValidationResult } from './inline-validation';

const TAKEN = ['aster', 'brine'];
const check = (value: string): ValidationResult => {
  const name = value.trim();
  if (name.length < 3)
    return { status: 'error', message: 'Use at least 3 letters.' };
  if (TAKEN.includes(name.toLowerCase()))
    return { status: 'error', message: `“${name}” is already registered.` };
  return { status: 'success', message: `“${name}” is available.` };
};
const chip = {
  minHeight: 36,
  padding: '0 10px',
  border: '1px solid #474747',
  borderRadius: 999,
  background: '#121212',
  color: '#ffffff',
  font: 'inherit',
  fontSize: 13,
  cursor: 'pointer',
} as const;

export default function Demo() {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'grid', gap: 8, width: 300, maxWidth: '100%' }}>
      <InlineValidation
        label='Boat name'
        value={value}
        onChange={setValue}
        validate={check}
        hint='Checked when you leave the field.'
      />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
          fontSize: 13,
          color: '#b8b8b8',
        }}
      >
        Try:
        {['Br', 'Brine', 'Cormorant'].map((sample) => (
          <button
            key={sample}
            type='button'
            style={chip}
            onClick={() => setValue(sample)}
          >
            {sample}
          </button>
        ))}
      </div>
    </div>
  );
}
