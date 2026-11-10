import { RotatingHeadline } from './rotating-headline';

const PHRASES = ['small screens', 'slow networks', 'tired eyes', 'real people'];

export default function Demo() {
  return (
    <div style={{ fontSize: 26 }}>
      <RotatingHeadline prefix='Design for' phrases={PHRASES} interval={1800} />
    </div>
  );
}
