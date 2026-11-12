import { StaggeredText } from './staggered-text';

export default function Demo() {
  return (
    <div
      style={{ maxWidth: 320, fontSize: 24, fontWeight: 700, lineHeight: 1.25 }}
    >
      <StaggeredText
        as='h3'
        text='Every word arrives a beat after the last one.'
        stagger={80}
      />
    </div>
  );
}
