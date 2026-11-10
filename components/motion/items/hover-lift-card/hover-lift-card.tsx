import type { AnchorHTMLAttributes } from 'react';
import './hover-lift-card.css';

/** A linked card that rises on hover and on keyboard focus. */
export function HoverLiftCard({
  className = '',
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`mg-lift ${className}`} {...rest}>
      {children}
    </a>
  );
}
