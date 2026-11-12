import { useState } from 'react';
import {
  CanvasSelectionMarquee,
  type MarqueeShape,
} from './canvas-selection-marquee';

const SHAPES: MarqueeShape[] = [
  { id: 'a', label: 'Dock A', x: 20, y: 20, w: 50, h: 30, kind: 'rect' },
  { id: 'b', label: 'Buoy 1', x: 110, y: 40, w: 26, h: 26, kind: 'circle' },
  { id: 'c', label: 'Dock B', x: 40, y: 110, w: 60, h: 34, kind: 'rect' },
  { id: 'd', label: 'Buoy 2', x: 150, y: 120, w: 26, h: 26, kind: 'circle' },
  { id: 'e', label: 'Slipway', x: 160, y: 20, w: 30, h: 60, kind: 'rect' },
];

export default function Demo() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div style={{ width: 340, maxWidth: '100%' }}>
      <CanvasSelectionMarquee
        shapes={SHAPES}
        selected={selected}
        onSelect={setSelected}
        label='Marina layout'
      />
    </div>
  );
}
