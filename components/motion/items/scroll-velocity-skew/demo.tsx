import { SkewStrip, VelocityScroller } from './scroll-velocity-skew';

const P = [
  'Flick the scroll wheel or swipe quickly: the bands lean with your speed and straighten when you stop.',
  'Weather routing starts with the big picture: where the highs sit and how fast the lows are moving.',
  'Then zoom in on the local effects, where headlands bend the wind and tides change the sea state.',
  'A good plan has an exit at every stage, a port you can reach if the forecast turns out wrong.',
  'Write it down, share it with the crew and keep it where everyone can see it underway.',
];

export default function Demo() {
  return (
    <div style={{ width: 340, maxWidth: '100%' }}>
      <VelocityScroller label='Passage notes'>
        <p>{P[0]}</p>
        <SkewStrip>≈ PASSAGE NOTES ≈ PASSAGE NOTES ≈ PASSAGE NOTES</SkewStrip>
        <p>{P[1]}</p>
        <p>{P[2]}</p>
        <SkewStrip>≈ LOCAL EFFECTS ≈ LOCAL EFFECTS ≈ LOCAL EFFECTS</SkewStrip>
        <p>{P[3]}</p>
        <SkewStrip>≈ EXITS ≈ EXITS ≈ EXITS ≈ EXITS ≈ EXITS</SkewStrip>
        <p>{P[4]}</p>
      </VelocityScroller>
    </div>
  );
}
