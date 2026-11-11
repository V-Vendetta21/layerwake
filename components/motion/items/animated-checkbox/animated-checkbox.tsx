'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import './animated-checkbox.css';

export interface AnimatedCheckboxProps {
  checked: boolean;
  /** Shows a dash: some, but not all, of a group is checked. */
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}

/**
 * A native checkbox (so forms, labels and screen readers work as usual)
 * with a drawn check mark and a drawn dash for the mixed state.
 */
export function AnimatedCheckbox({
  checked,
  indeterminate = false,
  onChange,
  children,
  className = '',
}: AnimatedCheckboxProps) {
  const input = useRef<HTMLInputElement>(null);
  const id = useId();

  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const state = indeterminate ? 'mixed' : checked ? 'checked' : 'unchecked';
  return (
    <label className={`mg-check ${className}`} htmlFor={id} data-state={state}>
      <input
        ref={input}
        id={id}
        type='checkbox'
        className='mg-check__input'
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className='mg-check__box' aria-hidden='true'>
        <svg viewBox='0 0 20 20'>
          <path
            className='mg-check__tick'
            d='M4.5 10.5 L8.5 14.5 L15.5 6'
            pathLength={1}
          />
          <path className='mg-check__dash' d='M5 10 H15' pathLength={1} />
        </svg>
      </span>
      <span className='mg-check__label'>{children}</span>
    </label>
  );
}
