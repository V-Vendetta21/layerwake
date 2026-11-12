import { useState } from 'react';
import { MaskedLineReveal } from './masked-line-reveal';

export default function Demo() {
  const [width, setWidth] = useState(320);
  return (
    <div style={{ display: 'grid', gap: 16, width: 340, maxWidth: '100%' }}>
      <div
        style={{
          width,
          maxWidth: '100%',
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        <MaskedLineReveal
          as='h3'
          text='Charts are drawn for the tide you have, not the tide you hoped for.'
        />
      </div>
      <label
        style={{ display: 'grid', gap: 4, color: '#b8b8b8', fontSize: 13 }}
      >
        Text width: {width}px (lines reflow)
        <input
          type='range'
          min={160}
          max={340}
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
          style={{ accentColor: '#dce9f7' }}
        />
      </label>
    </div>
  );
}
