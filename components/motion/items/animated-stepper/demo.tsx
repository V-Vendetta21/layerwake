import { useState } from 'react';
import { Stepper } from './animated-stepper';

const STEPS = ['Route', 'Crew', 'Supplies', 'Depart'];

export default function Demo() {
  const [step, setStep] = useState(1);
  const button = (disabled: boolean) =>
    ({
      minHeight: 44,
      padding: '0 16px',
      border: '1px solid #b9c5e6',
      borderRadius: 8,
      background: '#fff',
      color: disabled ? '#6b7699' : '#0c1738',
      font: 'inherit',
      fontWeight: 600,
      cursor: disabled ? 'default' : 'pointer',
    }) as const;
  return (
    <div style={{ display: 'grid', gap: 16, width: 360, maxWidth: '100%' }}>
      <Stepper
        steps={STEPS}
        current={step}
        onStepChange={setStep}
        label='Trip setup'
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          type='button'
          style={button(step === 0)}
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </button>
        <button
          type='button'
          style={button(step === STEPS.length - 1)}
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => s + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
