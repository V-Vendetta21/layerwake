'use client';

import type { HTMLAttributes, PointerEvent } from 'react';
import './spotlight-card.css';

/** A card with a soft highlight that follows the pointer. */
export function SpotlightCard({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      '--mg-x',
      `${event.clientX - rect.left}px`
    );
    event.currentTarget.style.setProperty(
      '--mg-y',
      `${event.clientY - rect.top}px`
    );
  };
  return (
    <div
      className={`mg-spotlight ${className}`}
      onPointerMove={onPointerMove}
      {...rest}
    >
      {children}
    </div>
  );
}
