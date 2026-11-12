import { useState } from 'react';
import { PerWordEmphasis, wordsOf } from './per-word-emphasis';

const LINE = 'Reef the main before the squall reaches the headland.';
const button = {
  minWidth: 44,
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
  const words = wordsOf(LINE);
  const [index, setIndex] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 14, width: 330, maxWidth: '100%' }}>
      <div style={{ fontSize: 22, lineHeight: 1.5, color: '#ffffff' }}>
        <PerWordEmphasis text={LINE} index={index} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type='button'
          style={button}
          aria-label='Previous word'
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          ←
        </button>
        <button
          type='button'
          style={button}
          aria-label='Next word'
          disabled={index === words.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          →
        </button>
        <span role='status' style={{ color: '#b8b8b8', fontSize: 13 }}>
          Word {index + 1} of {words.length}: “
          {words[index].replace(/[.,]/g, '')}”
        </span>
      </div>
    </div>
  );
}
