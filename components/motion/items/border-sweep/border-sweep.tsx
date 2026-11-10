import type { HTMLAttributes } from 'react';
import './border-sweep.css';

/** A frame with a highlight that travels around its edge. */
export function BorderSweep({
  className = '',
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mg-sweep ${className}`} {...rest}>
      <div className='mg-sweep__inner'>{children}</div>
    </div>
  );
}
