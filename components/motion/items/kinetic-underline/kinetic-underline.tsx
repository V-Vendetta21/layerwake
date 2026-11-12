import type { AnchorHTMLAttributes } from 'react';
import './kinetic-underline.css';

/** A link whose underline draws in from the left and leaves to the right. */
export function KineticUnderline({
  className = '',
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`mg-underline ${className}`} {...rest}>
      {children}
    </a>
  );
}
