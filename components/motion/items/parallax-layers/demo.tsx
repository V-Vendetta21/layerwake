import { ParallaxLayers } from './parallax-layers';

const LAYERS = [
  {
    depth: 0.1,
    content: (
      <svg viewBox='0 0 340 240'>
        <circle cx='250' cy='70' r='30' fill='#eaf2fb' />
      </svg>
    ),
  },
  {
    depth: 0.35,
    content: (
      <svg viewBox='0 0 340 240'>
        <path
          d='M0 170 L60 110 L110 150 L170 90 L240 160 L300 120 L340 150 V240 H0Z'
          fill='#dce9f7'
        />
      </svg>
    ),
  },
  {
    depth: 0.7,
    content: (
      <svg viewBox='0 0 340 240'>
        <path d='M0 200 Q85 180 170 200 T340 200 V240 H0Z' fill='#eaf2fb' />
      </svg>
    ),
  },
];
const card = {
  margin: '0 0 12px',
  padding: 14,
  borderRadius: 10,
  background: 'rgba(18, 18, 18, 0.94)',
  color: '#ffffff',
} as const;

export default function Demo() {
  return (
    <div style={{ width: 340, maxWidth: '100%' }}>
      <ParallaxLayers layers={LAYERS} label='Coastline stops'>
        <p style={card}>
          <strong>Scroll down.</strong> The sun, hills and sea drift at
          different speeds.
        </p>
        <p style={card}>
          <strong>Stop 1 · Seal Cove.</strong> Sandy, sheltered from the west.
        </p>
        <p style={card}>
          <strong>Stop 2 · Gull Point.</strong> Lunch only; weed over rock.
        </p>
        <p style={card}>
          <strong>Stop 3 · Long Strand.</strong> Good holding in sand.
        </p>
      </ParallaxLayers>
    </div>
  );
}
