import { ListToDetail } from './list-to-detail-transition';

const thumb = (sky: string, sea: string) => (
  <svg
    viewBox='0 0 160 90'
    preserveAspectRatio='xMidYMid slice'
    aria-hidden='true'
  >
    <rect width='160' height='90' fill={sky} />
    <circle cx='120' cy='30' r='12' fill='#b6ff3b' />
    <path d='M0 58 Q40 50 80 58 T160 58 V90 H0Z' fill={sea} />
  </svg>
);
const ITEMS = [
  {
    id: 'seal',
    title: 'Seal Cove',
    subtitle: 'Sand, 4 m · sheltered west',
    thumb: thumb('#dbe5ff', '#164cff'),
    body: 'Approach on the leading line; seals haul out on the north rocks.',
  },
  {
    id: 'gull',
    title: 'Gull Point',
    subtitle: 'Weed over rock · lunch only',
    thumb: thumb('#e6ecff', '#0c1738'),
    body: 'Holding is poor. Stay for a swim, not the night.',
  },
  {
    id: 'strand',
    title: 'Long Strand',
    subtitle: 'Sand, 6 m · swell in a southerly',
    thumb: thumb('#f5f8ff', '#25345f'),
    body: 'Big beach, beach bar, and a long dinghy row.',
  },
  {
    id: 'heron',
    title: 'Heron Creek',
    subtitle: 'Mud, 3 m · dries at springs',
    thumb: thumb('#c3cdec', '#164cff'),
    body: 'Perfectly still at night. Check the tide before you go in.',
  },
  {
    id: 'otter',
    title: 'Otter Bay',
    subtitle: 'Sand and weed, 5 m',
    thumb: thumb('#dbe5ff', '#46527a'),
    body: 'Good shelter from everything but the east.',
  },
];

export default function Demo() {
  return (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <ListToDetail items={ITEMS} label='Anchorages' />
    </div>
  );
}
