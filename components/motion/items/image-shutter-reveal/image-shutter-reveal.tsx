import type { CSSProperties, ReactNode } from 'react';
import './image-shutter-reveal.css';

export interface ImageShutterRevealProps {
  /** The image. Give it its own alternative text. */
  children: ReactNode;
  /** Number of shutter slats. */
  slats?: number;
  /** Delay between slats, in milliseconds. */
  stagger?: number;
  /** Change this value to close and reopen the shutters. */
  playKey?: number | string;
  className?: string;
}

/**
 * Vertical slats fold away one after another to expose the image beneath.
 * The image is in the page the whole time, so its alt text is always there.
 */
export function ImageShutterReveal({
  children,
  slats = 6,
  stagger = 90,
  playKey = 0,
  className = '',
}: ImageShutterRevealProps) {
  return (
    <figure className={`mg-shutter ${className}`}>
      {children}
      <div key={playKey} className='mg-shutter__slats' aria-hidden='true'>
        {Array.from({ length: slats }, (_, index) => (
          <span
            key={index}
            className='mg-shutter__slat'
            style={{ '--mg-delay': `${index * stagger}ms` } as CSSProperties}
          />
        ))}
      </div>
    </figure>
  );
}
