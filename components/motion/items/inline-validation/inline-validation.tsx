'use client';

import { useId, useState } from 'react';
import './inline-validation.css';

export type ValidationResult =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; message: string };

export interface InlineValidationProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validate: (value: string) => ValidationResult;
  /** Shown below the field before anything is checked. */
  hint?: string;
  className?: string;
}

/**
 * A field whose message slides between hint, error and success. Checking
 * starts after the first blur, then follows every keystroke. The message
 * area keeps a fixed height and is linked to the input.
 */
export function InlineValidation({
  label,
  value,
  onChange,
  validate,
  hint = '',
  className = '',
}: InlineValidationProps) {
  const [touched, setTouched] = useState(false);
  const id = useId();
  const result: ValidationResult = touched
    ? validate(value)
    : { status: 'idle' };
  const message = result.status === 'idle' ? hint : result.message;

  return (
    <div className={`mg-valid ${className}`} data-status={result.status}>
      <label htmlFor={id} className='mg-valid__label'>
        {label}
      </label>
      <div className='mg-valid__field'>
        <input
          id={id}
          className='mg-valid__input'
          value={value}
          aria-invalid={result.status === 'error'}
          aria-describedby={`${id}-message`}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => setTouched(true)}
        />
        <span className='mg-valid__icon' aria-hidden='true' />
      </div>
      <p id={`${id}-message`} className='mg-valid__message' aria-live='polite'>
        <span key={`${result.status}-${message}`}>
          {result.status === 'error'
            ? 'Error: '
            : result.status === 'success'
              ? 'OK: '
              : ''}
          {message}
        </span>
      </p>
    </div>
  );
}
