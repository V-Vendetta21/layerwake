import { useState } from 'react';
import { VerificationCodeSlots } from './verification-code-slots';

// Fictional demo code. Nothing is sent anywhere.
const DEMO_CODE = '482916';

export default function Demo() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<'idle' | 'ok' | 'wrong'>('idle');
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <VerificationCodeSlots
        value={code}
        onChange={(v) => {
          setCode(v);
          setResult('idle');
        }}
        onComplete={(v) => setResult(v === DEMO_CODE ? 'ok' : 'wrong')}
        label='Test code (try 482916)'
        error={
          result === 'wrong'
            ? 'That code does not match. Try 482916.'
            : undefined
        }
      />
      <span
        role='status'
        style={{
          color: result === 'ok' ? '#8aa8ff' : '#b8b8b8',
          fontSize: 13,
          fontWeight: result === 'ok' ? 700 : 400,
        }}
      >
        {result === 'ok'
          ? '✓ Code accepted (demo)'
          : 'Type or paste six digits.'}
      </span>
    </div>
  );
}
