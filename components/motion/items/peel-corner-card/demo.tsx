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
        <span style={{ display: 'block', marginTop: 6, color: '#b8b8b8' }}>
          Two hours along the sea caves. Gear included.
        </span>
        <span
          style={{
            display: 'block',
            marginTop: 14,
            fontSize: 12,
            color: '#b8b8b8',
          }}
        >
          Lift the corner ↘
        </span>
      </PeelCornerCard>
    </div>
  );
}
