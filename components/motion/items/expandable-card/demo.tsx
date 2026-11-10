import { ExpandableCard } from './expandable-card';

export default function Demo() {
  return (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <ExpandableCard title='Tide table' summary='High water at 14:20'>
        <p style={{ margin: 0 }}>
          Low water follows at 20:45 with a range of 3.1 m. Springs return on
          Thursday, so allow extra depth under the keel.
        </p>
      </ExpandableCard>
    </div>
  );
}
