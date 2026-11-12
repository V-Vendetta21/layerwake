import { useRef, useState } from 'react';
import { UndoBanner } from './undo-banner';

const START = [
  'Check the forecast',
  'Fill the water tanks',
  'Charge the radio',
  'Pack the charts',
];

export default function Demo() {
  const [tasks, setTasks] = useState(START);
  const [archived, setArchived] = useState<{
    task: string;
    index: number;
  } | null>(null);
  const list = useRef<HTMLUListElement>(null);

  const archive = (index: number) => {
    const task = tasks[index];
    setTasks((t) => t.filter((_, i) => i !== index));
    setArchived({ task, index });
    // The focused button is going away: keep focus in the list, not on the banner.
    requestAnimationFrame(() => {
      const buttons = list.current?.querySelectorAll('button');
      (
        buttons?.[Math.min(index, (buttons?.length ?? 1) - 1)] as
          HTMLElement | undefined
      )?.focus();
    });
  };
  const undo = () => {
    if (!archived) return;
    setTasks((t) => [
      ...t.slice(0, archived.index),
      archived.task,
      ...t.slice(archived.index),
    ]);
    setArchived(null);
  };

  return (
    <div style={{ display: 'grid', gap: 10, width: 320, maxWidth: '100%' }}>
      <ul
        ref={list}
        style={{
          display: 'grid',
          gap: 6,
          margin: 0,
          padding: 0,
          listStyle: 'none',
          minHeight: 196,
        }}
      >
        {tasks.map((task, i) => (
          <li
            key={task}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 4px 4px 12px',
              border: '1px solid #d6def2',
              borderRadius: 10,
              background: '#fff',
            }}
          >
            {task}
            <button
              type='button'
              onClick={() => archive(i)}
              aria-label={`Archive ${task}`}
              style={{
                minHeight: 36,
                padding: '0 10px',
                border: '1px solid #b9c5e6',
                borderRadius: 8,
                background: '#fff',
                color: '#0c1738',
                font: 'inherit',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Archive
            </button>
          </li>
        ))}
        {tasks.length === 0 ? (
          <li style={{ color: '#46527a' }}>Everything is archived.</li>
        ) : null}
      </ul>
      <div style={{ minHeight: 52 }}>
        {archived ? (
          <UndoBanner
            key={archived.task}
            message={`Archived “${archived.task}”.`}
            onUndo={undo}
            onDismiss={() => setArchived(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
