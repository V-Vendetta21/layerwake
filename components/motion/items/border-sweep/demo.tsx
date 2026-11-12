import { BorderSweep } from './border-sweep';

export default function Demo() {
  return (
    <BorderSweep style={{ width: 280, maxWidth: '100%' }}>
      <strong style={{ display: 'block', fontSize: 17 }}>Syncing charts</strong>
      <span style={{ display: 'block', marginTop: 6, color: '#46527a' }}>
        The edge keeps moving while work is in progress.
      </span>
    </BorderSweep>
  );
}
