import { useState } from 'react';
import { ChatTypingRelay, type ChatMessage } from './chat-typing-relay';

const SCRIPT: Omit<ChatMessage, 'id'>[] = [
  { from: 'Harbor office', text: 'Berth B14 is free from 16:00.' },
  { from: 'You', text: 'Great, we will be there by half past.', mine: true },
  {
    from: 'Harbor office',
    text: 'Call on channel 12 when you round the breakwater.',
  },
  { from: 'You', text: 'Will do. Thanks!', mine: true },
];
const button = {
  minHeight: 44,
  padding: '0 14px',
  border: '1px solid #474747',
  borderRadius: 8,
  background: '#121212',
  color: '#ffffff',
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
} as const;

export default function Demo() {
  // Each step either shows who is typing, or delivers their message.
  const [step, setStep] = useState(0);
  const delivered = Math.floor(step / 2);
  const typing = step % 2 === 1 ? SCRIPT[delivered].from : null;
  const done = delivered >= SCRIPT.length;
  return (
    <div style={{ display: 'grid', gap: 10, width: 320, maxWidth: '100%' }}>
      <ChatTypingRelay
        label='Chat with the harbor office'
        messages={SCRIPT.slice(0, delivered).map((m, i) => ({ ...m, id: i }))}
        typing={typing}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type='button'
          style={button}
          disabled={done}
          onClick={() => setStep((s) => s + 1)}
        >
          {done
            ? 'Conversation over'
            : typing
              ? 'Deliver message'
              : 'Next speaker types'}
        </button>
        <button type='button' style={button} onClick={() => setStep(0)}>
          Reset
        </button>
      </div>
    </div>
  );
}
