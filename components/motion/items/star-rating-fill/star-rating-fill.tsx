'use client';

import { useId, useState } from 'react';
import './star-rating-fill.css';

export interface StarRatingFillProps {
  value: number;
  onChange: (value: number) => void;
  /** The question, used as the group's legend. */
  label: string;
  max?: number;
  className?: string;
}

/**
 * A radio group drawn as stars. Hovering previews a rating with outlined,
 * dashed stars; choosing one fills them solid with a small pop. Arrow keys
 * work as in any radio group.
 */
export function StarRatingFill({
  value,
  onChange,
  label,
  max = 5,
  className = '',
}: StarRatingFillProps) {
  const [preview, setPreview] = useState<number | null>(null);
  const [popped, setPopped] = useState(0);
  const name = useId();
  const shown = preview ?? value;

  return (
    <fieldset
      className={`mg-stars ${className}`}
      onPointerLeave={() => setPreview(null)}
    >
      <legend className='mg-stars__legend'>{label}</legend>
      <div className='mg-stars__row'>
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
          const previewing = preview !== null && preview !== value;
          const state = n > shown ? 'empty' : previewing ? 'preview' : 'set';
          return (
            <label
              key={n}
              className='mg-stars__star'
              data-state={state}
              data-pop={n <= value && popped === value}
              onPointerEnter={() => setPreview(n)}
            >
              <input
                type='radio'
                className='mg-stars__input'
                name={name}
                value={n}
                checked={value === n}
                onChange={() => {
                  onChange(n);
                  setPopped(n);
                }}
              />
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z' />
              </svg>
              <span className='mg-stars__sr'>
                {n} {n === 1 ? 'star' : 'stars'}
              </span>
            </label>
          );
        })}
      </div>
      <p className='mg-stars__text'>
        {preview !== null && preview !== value
          ? `Preview: ${preview} of ${max}`
          : value
            ? `Your rating: ${value} of ${max}`
            : 'Not rated yet'}
      </p>
    </fieldset>
  );
}
