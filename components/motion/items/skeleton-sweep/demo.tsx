import { useEffect, useState } from 'react';
import { SkeletonSweep } from './skeleton-sweep';

export default function Demo() {
  const [loading, setLoading] = useState(true);

  // Stand in for a request that takes a moment.
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => setLoading(false), 1800);
    return () => window.clearTimeout(timer);
  }, [loading]);

  return (
    <div style={{ display: 'grid', gap: 14, width: 300, maxWidth: '100%' }}>
      <SkeletonSweep loading={loading}>
        <strong style={{ display: 'block', fontSize: 17 }}>
          Morning report
        </strong>
        <span style={{ display: 'block', marginTop: 6, color: '#b8b8b8' }}>
          Visibility is good and the bar is safe to cross until noon.
        </span>
      </SkeletonSweep>
      <button
        type='button'
        onClick={() => setLoading(true)}
        disabled={loading}
        style={{
          justifySelf: 'start',
          minHeight: 44,
          padding: '0 14px',
          border: '1px solid #474747',
          borderRadius: 8,
          background: '#121212',
          color: loading ? '#8f8f8f' : '#ffffff',
          font: 'inherit',
          fontWeight: 600,
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        {loading ? 'Loading…' : 'Load again'}
      </button>
    </div>
  );
}
