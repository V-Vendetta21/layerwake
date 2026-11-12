import { FlipCard } from './flip-card';

export default function Demo() {
  return (
    <div style={{ width: 280, maxWidth: '100%' }}>
      <FlipCard
        showBackLabel='Show tide times'
        showFrontLabel='Show summary'
        front={
          <>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#648aff',
              }}
            >
              TODAY
            </span>
            <strong style={{ display: 'block', margin: '6px 0', fontSize: 22 }}>
              Good for sailing
            </strong>
            <span style={{ color: '#b8b8b8' }}>
              Light westerly, slight sea.
            </span>
          </>
        }
        back={
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '4px 14px',
              margin: 0,
            }}
          >
            <dt>High</dt>
            <dd style={{ margin: 0 }}>06:12 · 14:20</dd>
            <dt>Low</dt>
            <dd style={{ margin: 0 }}>00:01 · 20:45</dd>
            <dt>Range</dt>
            <dd style={{ margin: 0 }}>3.1 m</dd>
          </dl>
        }
      />
    </div>
  );
}
