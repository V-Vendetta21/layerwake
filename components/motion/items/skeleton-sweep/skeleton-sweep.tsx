import type { ReactNode } from 'react';
import './skeleton-sweep.css';

export interface SkeletonSweepProps {
  /** While true, placeholder bars are shown instead of the content. */
  loading: boolean;
  /** Number of placeholder bars. */
  lines?: number;
  children: ReactNode;
  className?: string;
}

const WIDTHS = ['92%', '78%', '56%'];

/** Shimmering placeholder bars that cross-fade into the real content. */
export function SkeletonSweep({
  loading,
  lines = 3,
  children,
  className = '',
}: SkeletonSweepProps) {
  return (
    <div
      className={`mg-skeleton ${className}`}
      data-loading={loading}
      aria-busy={loading}
    >
      <div className='mg-skeleton__bones' aria-hidden='true'>
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className='mg-skeleton__bone'
            style={{ width: WIDTHS[index % WIDTHS.length] }}
          />
        ))}
      </div>
      <div className='mg-skeleton__content' aria-hidden={loading}>
        {children}
      </div>
    </div>
  );
}
