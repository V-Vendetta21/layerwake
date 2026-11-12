import { useRef, useState } from 'react';
import { ToastStack, type Toast } from './toast-stack';

const MESSAGES = [
  'Mooring booked',
  'Chart downloaded',
  'Crew list saved',
  'Tide alert set',
];

export default function Demo() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const add = () => {
    const id = nextId.current++;
    setToasts((list) => [
      ...list,
      { id, message: MESSAGES[id % MESSAGES.length] },
    ]);
  };

  return (
    // `contained` pins the stack inside this box. Drop it to use the viewport.
    <div
      style={{
        position: 'relative',
        display: 'grid',
        placeItems: 'start center',
        width: '100%',
        height: 240,
      }}
    >
      <button
        type='button'
        onClick={add}
        style={{
          minHeight: 44,
          padding: '0 18px',
          border: 0,
          borderRadius: 8,
          background: '#164cff',
          color: '#fff',
          font: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Send a notice
      </button>
      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((list) => list.filter((t) => t.id !== id))}
        contained
      />
    </div>
  );
}
