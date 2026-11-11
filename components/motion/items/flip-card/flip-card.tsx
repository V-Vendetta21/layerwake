'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import './flip-card.css';

export interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  /** Labels for the flip buttons on each face. */
  showBackLabel?: string;
  showFrontLabel?: string;
  className?: string;
}

/**
 * Turns over to show a second face. Only the face you can see is
 * interactive (the other is inert), and focus follows to the new face's
 * button so keyboard users are never left on a hidden control.
 */
export function FlipCard({
  front,
  back,
  showBackLabel = 'Show details',
  showFrontLabel = 'Back',
  className = '',
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const frontFace = useRef<HTMLDivElement>(null);
  const backFace = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    frontFace.current?.toggleAttribute('inert', flipped);
    backFace.current?.toggleAttribute('inert', !flipped);
    if (moved.current)
      (flipped ? backFace : frontFace).current
        ?.querySelector<HTMLElement>('.mg-flip__button')
        ?.focus();
  }, [flipped]);

  const flip = () => {
    moved.current = true;
    setFlipped((value) => !value);
  };

  return (
    <div className={`mg-flip ${className}`} data-flipped={flipped}>
      <div className='mg-flip__inner'>
        <div ref={frontFace} className='mg-flip__face' aria-hidden={flipped}>
          <div className='mg-flip__content'>{front}</div>
          <button type='button' className='mg-flip__button' onClick={flip}>
            {showBackLabel} ↻
          </button>
        </div>
        <div
          ref={backFace}
          className='mg-flip__face mg-flip__face--back'
          aria-hidden={!flipped}
        >
          <div className='mg-flip__content'>{back}</div>
          <button type='button' className='mg-flip__button' onClick={flip}>
            ↺ {showFrontLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
