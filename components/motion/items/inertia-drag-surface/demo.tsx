import { InertiaDragSurface } from './inertia-drag-surface';

export default function Demo() {
  return (
    <div style={{ width: 340, maxWidth: '100%' }}>
      <InertiaDragSurface label='A puck you can throw around the box' />
    </div>
  );
}
