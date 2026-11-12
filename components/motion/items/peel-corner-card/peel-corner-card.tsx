'use client';

import { useId, useState, type ReactNode } from 'react';
import './peel-corner-card.css';

export interface PeelCornerCardProps {
  children: ReactNode;
  /** The secondary label under the corner. It stays readable to assistive tech. */
  hidden: ReactNode;
  /** Accessible name for the corner toggle. */
  toggleLabel: string;
  className?: string;
}

/**
 * A folded corner lifts to show a small label printed underneath. The corner
 * is a real toggle button with a large tap target.
 */
export function PeelCornerCard({
  children,
  hidden,
  toggleLabel,
  className = '',
}: PeelCornerCardProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`mg-peel ${className}`} data-open={open}>
      <div className='mg-peel__under' id={id}>
        {hidden}
      </div>
      <div className='mg-peel__face'>{children}</div>
      <span className='mg-peel__flap' aria-hidden='true' />
      <button
        type='button'
        className='mg-peel__toggle'
        aria-expanded={open}
        aria-controls={id}
        aria-label={toggleLabel}
        onClick={() => setOpen((value) => !value)}
      />
    </div>
  );
}
