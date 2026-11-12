'use client';

import {
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from 'react';
import './press-ripple.css';

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

/** A button whose ripple starts where it was pressed (or its center for keys). */
export function RippleButton({
  className = '',
  children,
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // `detail` is 0 when the click came from the keyboard.
    const fromKeyboard = event.detail === 0;
    setRipples((current) => [
      ...current,
      {
        id: nextId.current++,
        x: fromKeyboard ? rect.width / 2 : event.clientX - rect.left,
        y: fromKeyboard ? rect.height / 2 : event.clientY - rect.top,
        size: Math.max(rect.width, rect.height) * 2.2,
      },
    ]);
    onClick?.(event);
  };

  return (
    <button
      type='button'
      className={`mg-ripple ${className}`}
      onClick={handleClick}
      {...rest}
    >
      <span className='mg-ripple__label'>{children}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className='mg-ripple__wave'
          aria-hidden='true'
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
          onAnimationEnd={() =>
            setRipples((current) => current.filter((r) => r.id !== ripple.id))
          }
        />
      ))}
    </button>
  );
}
