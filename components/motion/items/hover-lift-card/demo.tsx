import { HoverLiftCard } from './hover-lift-card';

export default function Demo() {
  return (
    <HoverLiftCard
      href='#hover-lift-card'
      style={{ width: 260, maxWidth: '100%' }}
    >
      <strong style={{ display: 'block', fontSize: 17 }}>Harbor guide</strong>
      <span style={{ display: 'block', marginTop: 6, color: '#46527a' }}>
        Berths, fuel docks and where to find coffee before six.
      </span>
    </HoverLiftCard>
  );
}
