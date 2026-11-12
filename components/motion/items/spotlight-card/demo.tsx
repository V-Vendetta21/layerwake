import { SpotlightCard } from './spotlight-card';

export default function Demo() {
  return (
    <SpotlightCard style={{ width: 300, maxWidth: '100%' }}>
      <h3 style={{ margin: 0, fontSize: 18 }}>Night watch</h3>
      <p style={{ margin: '8px 0 12px', color: '#c3cdec' }}>
        Move the pointer across this card to steer the light.
      </p>
      <a href='#spotlight-card'>Read the log</a>
    </SpotlightCard>
  );
}
