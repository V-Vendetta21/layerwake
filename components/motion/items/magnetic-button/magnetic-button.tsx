'use client';

import { useRef, type ButtonHTMLAttributes, type PointerEvent } from 'react';
import './magnetic-button.css';

export interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** How strongly the label follows the pointer (0 to 1). */
  strength?: number;
  /** Furthest the label may travel, in pixels. */
  max?: number;
}

/** The label drifts toward the pointer, within a small bound. */
export function MagneticButton({
  strength = 0.35,
  max = 10,
  className = '',
  children,
  ...rest
}: MagneticButtonProps) {
  const label = useRef<HTMLSpanElement>(null);

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clamp = (value: number) => Math.max(-max, Math.min(max, value));
    const x = clamp((event.clientX - (rect.left + rect.width / 2)) * strength);
    const y = clamp((event.clientY - (rect.top + rect.height / 2)) * strength);
    if (label.current)
      label.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => {
    if (label.current) label.current.style.transform = '';
  };

  return (
    <button
      type='button'
      className={`mg-magnetic ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      {...rest}
    >
      <span ref={label} className='mg-magnetic__label'>
        {children}
      </span>
    </button>
  );
}
