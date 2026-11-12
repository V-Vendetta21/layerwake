import { AnimatedTabs } from './animated-tabs';

const TABS = [
  {
    id: 'today',
    label: 'Today',
    content: 'Calm until dusk, wind from the west.',
  },
  {
    id: 'tomorrow',
    label: 'Tomorrow',
    content: 'Swell builds to one metre by noon.',
  },
  {
    id: 'week',
    label: 'This week',
    content: 'Settled through Friday, then a front.',
  },
];

export default function Demo() {
  return (
    <div style={{ width: 340, maxWidth: '100%' }}>
      <AnimatedTabs tabs={TABS} label='Forecast range' />
    </div>
  );
}
