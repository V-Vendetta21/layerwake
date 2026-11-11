import { useState } from 'react';
import { MorphingBlob, type BlobShape } from './morphing-blob';

const SHAPES: BlobShape[] = ['circle', 'drop', 'shell', 'star'];

export default function Demo() {
  const [shape, setShape] = useState<BlobShape>('drop');
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <MorphingBlob shape={shape} label='Morphing shape' />
      <div
        role='radiogroup'
        aria-label='Shape'
        style={{ display: 'flex', gap: 6 }}
      >
        {SHAPES.map((s) => (
          <button
            key={s}
            type='button'
            role='radio'
            aria-checked={shape === s}
            onClick={() => setShape(s)}
            style={{
              minHeight: 40,
              padding: '0 12px',
              border: '1px solid #b9c5e6',
              borderRadius: 8,
              background: shape === s ? '#0c1738' : '#fff',
              color: shape === s ? '#fff' : '#0c1738',
              font: 'inherit',
              fontWeight: 600,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
