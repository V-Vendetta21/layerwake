import { useState } from 'react';
import { ResizableSplitPane } from './resizable-split-pane';

export default function Demo() {
  const [split, setSplit] = useState(40);
  return (
    <div style={{ display: 'grid', gap: 10, width: 360, maxWidth: '100%' }}>
      <ResizableSplitPane
        value={split}
        onChange={setSplit}
        label='Resize chart and notes'
        start={
          <>
            <strong>Chart</strong>
            <p style={{ margin: '6px 0 0', color: '#46527a', fontSize: 13 }}>
              Approach from the south-west.
            </p>
          </>
        }
        end={
          <>
            <strong>Notes</strong>
            <p style={{ margin: '6px 0 0', color: '#46527a', fontSize: 13 }}>
              Watch for pots near the green buoy.
            </p>
          </>
        }
      />
      <span style={{ color: '#46527a', fontSize: 13 }}>
        Split: {split}% / {100 - split}% (20–80% allowed)
      </span>
    </div>
  );
}
