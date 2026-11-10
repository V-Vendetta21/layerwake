import { ScrambleText } from './scramble-text';

export default function Demo() {
  return (
    <p style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
      <ScrambleText text='SIGNAL ACQUIRED 0427' duration={1200} />
    </p>
  );
}
