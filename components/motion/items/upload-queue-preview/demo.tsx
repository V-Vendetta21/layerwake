import { useEffect, useState } from 'react';
import { UploadQueue, type UploadItem } from './upload-queue-preview';

// Fixture files and a fake transfer: nothing leaves the page.
const START: UploadItem[] = [
  {
    id: 'chart',
    name: 'chart-west-approach.pdf',
    size: '1.2 MB',
    status: 'queued',
    progress: 0,
  },
  {
    id: 'crew',
    name: 'crew-list.csv',
    size: '18 KB',
    status: 'queued',
    progress: 0,
  },
];

export default function Demo() {
  const [items, setItems] = useState(START);
  const [attempts, setAttempts] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = window.setInterval(() => {
      setItems((list) => {
        // One upload at a time: start the next queued file when the line is free.
        const uploading = list.some((i) => i.status === 'uploading');
        let started = uploading;
        return list.map((item) => {
          if (item.status === 'queued' && !started) {
            started = true;
            return { ...item, status: 'uploading', progress: 0.02 };
          }
          if (item.status !== 'uploading') return item;
          const step = item.id === 'chart' ? 0.12 : 0.2;
          const progress = Math.min(1, item.progress + step);
          // The crew list fails at 60% on its first try, to show Retry.
          if (item.id === 'crew' && !attempts.crew && progress >= 0.6)
            return {
              ...item,
              status: 'failed',
              progress: 0.6,
              error: 'Connection dropped',
            };
          return progress >= 1
            ? { ...item, status: 'completed', progress: 1 }
            : { ...item, progress };
        });
      });
    }, 350);
    return () => window.clearInterval(timer);
  }, [attempts]);

  return (
    <div style={{ display: 'grid', gap: 10, width: 330, maxWidth: '100%' }}>
      <UploadQueue
        items={items}
        onCancel={(id) =>
          setItems((list) =>
            list.map((i) => (i.id === id ? { ...i, status: 'canceled' } : i))
          )
        }
        onRetry={(id) => {
          setAttempts((a) => ({ ...a, [id]: (a[id] ?? 0) + 1 }));
          setItems((list) =>
            list.map((i) =>
              i.id === id
                ? { ...i, status: 'queued', progress: 0, error: undefined }
                : i
            )
          );
        }}
      />
      <button
        type='button'
        onClick={() => {
          setItems(START);
          setAttempts({});
        }}
        style={{
          justifySelf: 'start',
          minHeight: 40,
          padding: '0 14px',
          border: '1px solid #b9c5e6',
          borderRadius: 8,
          background: '#fff',
          color: '#0c1738',
          font: 'inherit',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Start over
      </button>
    </div>
  );
}
