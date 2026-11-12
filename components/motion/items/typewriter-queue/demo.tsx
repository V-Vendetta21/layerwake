import { TypewriterQueue } from './typewriter-queue';

const QUEUE = ['npm run build', 'npm test', 'git push origin main'];

export default function Demo() {
  return (
    <p style={{ margin: 0, fontSize: 18 }}>
      <span aria-hidden='true' style={{ color: '#6b7699' }}>
        ${' '}
      </span>
      <TypewriterQueue phrases={QUEUE} />
    </p>
  );
}
