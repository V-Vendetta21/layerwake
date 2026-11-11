import { HeatmapBrush } from './heatmap-brush';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
// Boats launched per day from the public slipway (fixture data).
const VALUES = [
  [3, 5, 4, 6, 9, 14, 12],
  [2, 4, 6, 5, 8, 16, 15],
  [4, 3, 5, 7, 10, 18, 13],
  [1, 2, 3, 4, 7, 12, 9],
];

export default function Demo() {
  return (
    <div style={{ width: 340, maxWidth: '100%' }}>
      <HeatmapBrush
        values={VALUES}
        rowLabels={WEEKS}
        columnLabels={DAYS}
        label='Slipway launches per day'
      />
    </div>
  );
}
