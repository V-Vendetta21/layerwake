import { PeelCornerCard } from './peel-corner-card';

export default function Demo() {
  return (
    <div style={{ width: 280, maxWidth: '100%' }}>
      <PeelCornerCard
        toggleLabel='Peel back the corner to see the member offer'
        hidden={
          <span>
            Members
            <br />
            save 10%
          </span>
        }
      >
        <strong style={{ display: 'block', fontSize: 18 }}>
          Harbor kayak tour
        </strong>
        <span style={{ display: 'block', marginTop: 6, color: '#46527a' }}>
          Two hours along the sea caves. Gear included.
        </span>
        <span
          style={{
            display: 'block',
            marginTop: 14,
            fontSize: 12,
            color: '#46527a',
          }}
        >
          Lift the corner ↘
        </span>
      </PeelCornerCard>
    </div>
  );
}
