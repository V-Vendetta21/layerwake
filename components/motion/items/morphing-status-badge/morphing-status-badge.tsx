'use client';

import { useEffect, useRef, useState } from 'react';
import './morphing-status-badge.css';

export type BadgeStatus = 'idle' | 'loading' | 'success' | 'error';

export interface StatusBadgeProps {
  status: BadgeStatus;
  /** Override the default wording for any status. */
  labels?: Partial<Record<BadgeStatus, string>>;
  className?: string;
}

const DEFAULT_LABELS: Record<BadgeStatus, string> = {
  idle: 'Ready',
  loading: 'Saving',
  success: 'Saved',
  error: 'Failed',
};

/** One badge that changes color, icon, label and width between statuses. */
export function StatusBadge({
  status,
  labels,
  className = '',
}: StatusBadgeProps) {
  const text = labels?.[status] ?? DEFAULT_LABELS[status];
  const label = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();

  // Measure the new label so the badge can animate to its width.
  useEffect(() => {
    if (label.current) setWidth(label.current.offsetWidth);
  }, [text]);

  return (
    <span
      className={`mg-badge ${className}`}
      data-status={status}
      role='status'
    >
      <span className='mg-badge__icon' aria-hidden='true' />
      <span className='mg-badge__clip' style={{ width }}>
        <span key={status} ref={label} className='mg-badge__label'>
          {text}
        </span>
      </span>
    </span>
  );
}
