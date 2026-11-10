'use client';

import { useId, useState, type ReactNode } from 'react';
import './expandable-card.css';

export interface ExpandableCardProps {
  title: string;
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/** A card that grows to reveal more detail, and shrinks back. */
export function ExpandableCard({
  title,
  summary,
  children,
  defaultOpen = false,
  className = '',
}: ExpandableCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  return (
    <div className={`mg-expand ${className}`} data-open={open}>
      <button
        type='button'
        className='mg-expand__toggle'
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>
          <strong className='mg-expand__title'>{title}</strong>
          <span className='mg-expand__summary'>{summary}</span>
        </span>
        <span className='mg-expand__chevron' aria-hidden='true' />
      </button>
      <div id={panelId} className='mg-expand__panel'>
        <div className='mg-expand__clip'>
          <div className='mg-expand__body'>{children}</div>
        </div>
      </div>
    </div>
  );
}
