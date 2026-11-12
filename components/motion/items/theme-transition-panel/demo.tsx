import { useState } from 'react';
import { ThemeTransitionPanel } from './theme-transition-panel';

export default function Demo() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <div style={{ display: 'grid', gap: 8, width: 320, maxWidth: '100%' }}>
      <ThemeTransitionPanel theme={theme} onThemeChange={setTheme}>
        {(t) => (
          <>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--mg-label)',
              }}
            >
              {t === 'dark' ? 'NIGHT WATCH' : 'DAY WATCH'}
            </span>
            <strong style={{ display: 'block', margin: '6px 0', fontSize: 20 }}>
              Chartplotter
            </strong>
            <p style={{ margin: 0, color: 'var(--mg-muted)' }}>
              Course 245°, speed 6.2 kn.
            </p>
            <div
              style={{
                marginTop: 14,
                padding: 10,
                borderRadius: 8,
                background: 'var(--mg-surface)',
              }}
            >
              Next waypoint: Gull Point, 3.4 nm
            </div>
          </>
        )}
      </ThemeTransitionPanel>
      <span role='status' style={{ color: '#b8b8b8', fontSize: 13 }}>
        Theme: {theme}
      </span>
    </div>
  );
}
