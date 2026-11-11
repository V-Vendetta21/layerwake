'use client';

import { useId, useRef, useState } from 'react';
import './verification-code-slots.css';

export interface VerificationCodeSlotsProps {
  value: string;
  onChange: (value: string) => void;
  /** Called once all slots are filled. */
  onComplete?: (code: string) => void;
  length?: number;
  label: string;
  /** Shake the slots and show this message. */
  error?: string;
  className?: string;
}

/**
 * One real input (so paste, autofill, backspace and screen readers behave
 * normally) drawn as separate slots. A highlight follows the next slot to
 * fill.
 */
export function VerificationCodeSlots({
  value,
  onChange,
  onComplete,
  length = 6,
  label,
  error,
  className = '',
}: VerificationCodeSlotsProps) {
  const input = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const id = useId();
  const active = Math.min(value.length, length - 1);

  return (
    <div className={`mg-otp ${className}`} data-error={Boolean(error)}>
      <label htmlFor={id} className='mg-otp__label'>
        {label}
      </label>
      <div className='mg-otp__field'>
        <input
          ref={input}
          id={id}
          className='mg-otp__input'
          inputMode='numeric'
          autoComplete='one-time-code'
          pattern='[0-9]*'
          maxLength={length}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => {
            const digits = event.target.value
              .replace(/\D/g, '')
              .slice(0, length);
            onChange(digits);
            if (digits.length === length) onComplete?.(digits);
          }}
          onSelect={(event) => {
            // Keep the caret at the end so typing always fills the next slot.
            const el = event.currentTarget;
            if (el.selectionStart !== el.value.length)
              el.setSelectionRange(el.value.length, el.value.length);
          }}
        />
        <div
          className='mg-otp__slots'
          aria-hidden='true'
          onClick={() => input.current?.focus()}
        >
          {Array.from({ length }, (_, i) => (
            <span
              key={i}
              className='mg-otp__slot'
              data-filled={i < value.length}
              data-active={focused && i === active}
            >
              {value[i] ?? ''}
            </span>
          ))}
        </div>
      </div>
      <p id={`${id}-error`} className='mg-otp__error' role='alert'>
        {error ?? ''}
      </p>
    </div>
  );
}
