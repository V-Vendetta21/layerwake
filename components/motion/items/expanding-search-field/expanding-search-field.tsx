'use client';

import { useEffect, useId, useRef, useState } from 'react';
import './expanding-search-field.css';

export interface ExpandingSearchFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name, for example "Search harbors". */
  label: string;
  placeholder?: string;
  /** Id of the results the input filters, for aria-controls. */
  controls?: string;
  className?: string;
}

/**
 * A compact search button that grows into a field. Its right edge stays
 * anchored. The input takes focus on open; Escape clears and closes it and
 * puts focus back on the button.
 */
export function ExpandingSearchField({
  value,
  onValueChange,
  label,
  placeholder = 'Search',
  controls,
  className = '',
}: ExpandingSearchFieldProps) {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const reopened = useRef(false);
  const id = useId();

  useEffect(() => {
    if (open) input.current?.focus();
    else if (reopened.current) toggle.current?.focus();
  }, [open]);

  const close = () => {
    reopened.current = true;
    onValueChange('');
    setOpen(false);
  };

  return (
    <div className={`mg-search ${className}`} data-open={open} role='search'>
      <label htmlFor={id} className='mg-search__sr'>
        {label}
      </label>
      <input
        ref={input}
        id={id}
        type='search'
        className='mg-search__input'
        placeholder={placeholder}
        value={value}
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        aria-controls={controls}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            close();
          }
        }}
      />
      <button
        ref={toggle}
        type='button'
        className='mg-search__toggle'
        aria-label={open ? `Close ${label.toLowerCase()}` : label}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <svg viewBox='0 0 20 20' aria-hidden='true'>
          <circle className='mg-search__lens' cx='8.5' cy='8.5' r='5' />
          <path className='mg-search__lens' d='M12.5 12.5 L16.5 16.5' />
          <path className='mg-search__x' d='M5 5 L15 15 M15 5 L5 15' />
        </svg>
      </button>
    </div>
  );
}
