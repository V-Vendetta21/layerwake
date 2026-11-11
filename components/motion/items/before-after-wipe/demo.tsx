import { BeforeAfterWipe } from './before-after-wipe';

const Bay = ({ day }: { day: boolean }) => (
  <svg
    viewBox='0 0 320 180'
    role='img'
    aria-label={day ? 'The bay at noon' : 'The bay at night'}
  >
    <rect width='320' height='180' fill={day ? '#dbe5ff' : '#0c1738'} />
    <circle cx='70' cy='60' r='24' fill={day ? '#b6ff3b' : '#f5f8ff'} />
    {day ? null : <circle cx='80' cy='54' r='22' fill='#0c1738' />}
    <path
      d='M0 116 Q80 104 160 116 T320 116 V180 H0Z'
      fill={day ? '#164cff' : '#25345f'}
    />
    <path d='M200 108 h44 l-6 10 h-32z' fill={day ? '#f5f8ff' : '#b9c5e6'} />
    {day ? null : <circle cx='222' cy='100' r='3' fill='#b6ff3b' />}
  </svg>
);

export default function Demo() {
  return (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <BeforeAfterWipe
        before={<Bay day />}
        after={<Bay day={false} />}
        beforeLabel='Noon'
        afterLabel='Night'
      />
    </div>
  );
}
