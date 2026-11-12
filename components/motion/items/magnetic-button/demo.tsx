import { MagneticButton } from './magnetic-button';

export default function Demo() {
  return (
    <div style={{ padding: 24 }}>
      <MagneticButton strength={0.4} max={12}>
        Cast off
      </MagneticButton>
    </div>
  );
}
