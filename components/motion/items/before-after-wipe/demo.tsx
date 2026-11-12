import { BeforeAfterWipe } from './before-after-wipe';

const Bay = ({ day }: { day: boolean }) => (
  <svg
    viewBox='0 0 320 180'
    role='img'
    aria-label={day ? 'The bay at noon' : 'The bay at night'}
  >
    <rect width='320' height='180' fill={day ? '#1b1b1b' : '#eaf2fb'} />
    <circle cx='70' cy='60' r='24' fill={day ? '#eaf2fb' : '#1b1b1b'} />
    {day ? null : <circle cx='80' cy='54' r='22' fill='#ededed' />}
    <path
      d='M0 116 Q80 104 160 116 T320 116 V180 H0Z'
      fill={day ? '#eaf2fb' : '#1b1b1b'}
    />
    <path d='M200 108 h44 l-6 10 h-32z' fill={day ? '#1b1b1b' : '#474747'} />
    {day ? null : <circle cx='222' cy='100' r='3' fill='#eaf2fb' />}
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
