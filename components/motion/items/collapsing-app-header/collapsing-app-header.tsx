'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import './collapsing-app-header.css';

export interface CollapsingAppHeaderProps {
  title: string;
  subtitle: string;
  /** The primary action, shown in both the tall and compact header. */
  action: ReactNode;
  children: ReactNode;
  label: string;
  className?: string;
}

/**
 * A tall header that condenses into a toolbar as its page scrolls. It
 * switches with hysteresis (collapse at 64px, expand below 24px), so it does
 * not flicker when you hover near the threshold, and the primary action is
 * reachable in both states.
 */
export function CollapsingAppHeader({
  title,
  subtitle,
  action,
  children,
  label,
  className = '',
}: CollapsingAppHeaderProps) {
  const page = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = page.current;
    if (!el) return;
    const onScroll = () =>
      setCompact((was) => (was ? el.scrollTop > 24 : el.scrollTop > 64));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={page}
      className={`mg-appbar ${className}`}
      data-compact={compact}
      tabIndex={0}
      role='region'
      aria-label={label}
    >
      <header className='mg-appbar__header'>
        <div className='mg-appbar__titles'>
          <h3>{title}</h3>
          <p aria-hidden={compact}>{subtitle}</p>
        </div>
        <div className='mg-appbar__action'>{action}</div>
      </header>
      <div className='mg-appbar__content'>{children}</div>
    </div>
  );
}
