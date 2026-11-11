'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './token-chip-entry.css';

export interface TokenChipEntryProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  placeholder?: string;
  className?: string;
}

/**
 * Type a label and press Enter or comma to add it as a chip. Chips pop in
 * and shrink away when removed. Backspace in the empty field removes the
 * last chip; a duplicate is refused with a message and a nudge on the
 * existing chip.
 */
export function TokenChipEntry({
  value,
  onChange,
  label,
  placeholder = 'Add a tag',
  className = '',
}: TokenChipEntryProps) {
  const [draft, setDraft] = useState('');
  const [leaving, setLeaving] = useState<string | null>(null);
  const [dupe, setDupe] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const focusAfter = useRef<number | 'input' | null>(null);
  const reduced = useReducedMotion();
  const id = useId();

  useEffect(() => {
    const target = focusAfter.current;
    if (target === null) return;
    focusAfter.current = null;
    if (target === 'input') input.current?.focus();
    else
      list.current
        ?.querySelectorAll<HTMLElement>('.mg-chips__remove')
        [target]?.focus();
  }, [value]);

  const commit = () => {
    const text = draft.trim().replace(/,$/, '').trim();
    if (!text) return;
    const existing = value.find((v) => v.toLowerCase() === text.toLowerCase());
    if (existing) {
      setDupe(existing);
      setMessage(`“${existing}” is already added.`);
      return;
    }
    onChange([...value, text]);
    setDraft('');
    setDupe(null);
    setMessage(`Added “${text}”.`);
  };

  const remove = (chip: string, refocus: number | 'input') => {
    const finish = () => {
      setLeaving(null);
      focusAfter.current = refocus;
      onChange(value.filter((v) => v !== chip));
      setMessage(`Removed “${chip}”.`);
    };
    if (reduced) finish();
    else {
      setLeaving(chip);
      window.setTimeout(finish, 180);
    }
  };

  return (
    <div className={`mg-chips ${className}`}>
      <label htmlFor={id} className='mg-chips__label'>
        {label}
      </label>
      <div className='mg-chips__box' onClick={() => input.current?.focus()}>
        <ul ref={list} className='mg-chips__list'>
          {value.map((chip, i) => (
            <li
              key={chip}
              className='mg-chips__chip'
              data-leaving={leaving === chip}
              data-dupe={dupe === chip}
            >
              <span>{chip}</span>
              <button
                type='button'
                className='mg-chips__remove'
                aria-label={`Remove ${chip}`}
                onClick={(event) => {
                  event.stopPropagation();
                  remove(chip, i < value.length - 1 ? i : 'input');
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <input
          ref={input}
          id={id}
          className='mg-chips__input'
          placeholder={placeholder}
          value={draft}
          aria-describedby={`${id}-help`}
          onChange={(event) => {
            setDupe(null);
            setDraft(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              commit();
            } else if (
              event.key === 'Backspace' &&
              draft === '' &&
              value.length
            ) {
              event.preventDefault();
              remove(value[value.length - 1], 'input');
            }
          }}
        />
      </div>
      <p id={`${id}-help`} className='mg-chips__help'>
        Enter or comma adds a tag. Backspace removes the last one.
      </p>
      <p className='mg-chips__status' role='status'>
        {message}
      </p>
    </div>
  );
}
