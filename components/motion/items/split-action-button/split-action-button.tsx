'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { focusMenuItem, handleMenuKeys } from '../../shared/menu-keys';
import { useDismiss } from '../../shared/use-dismiss';
import './split-action-button.css';

export interface SplitAction {
  id: string;
  label: string;
}

export interface SplitActionButtonProps {
  label: string;
  onAction: () => void;
  /** Other actions, shown in the menu behind the caret. */
  options: SplitAction[];
  onSelect: (id: string) => void;
  /** Accessible name for the caret, for example "More save options". */
  menuLabel: string;
  className?: string;
}

/**
 * A primary action with a separate caret for related actions. The menu
 * supports arrow keys, Home, End and Escape, closes on an outside press, and
 * returns focus to the caret after a choice or Escape.
 */
export function SplitActionButton({
  label,
  onAction,
  options,
  onSelect,
  menuLabel,
  className = '',
}: SplitActionButtonProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const caret = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  const firstOrLast = useRef<'first' | 'last'>('first');

  useEffect(() => {
    if (open) focusMenuItem(menu.current, firstOrLast.current);
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) caret.current?.focus();
  };
  useDismiss(open, [root], (reason) => close(reason === 'escape'));

  return (
    <div ref={root} className={`mg-split ${className}`} data-open={open}>
      <button type='button' className='mg-split__main' onClick={onAction}>
        {label}
      </button>
      <button
        ref={caret}
        type='button'
        className='mg-split__caret'
        aria-label={menuLabel}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          firstOrLast.current = 'first';
          setOpen((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            firstOrLast.current = event.key === 'ArrowUp' ? 'last' : 'first';
            setOpen(true);
          }
        }}
      >
        <span aria-hidden='true' className='mg-split__chevron' />
      </button>
      <div
        ref={menu}
        id={id}
        role='menu'
        aria-label={menuLabel}
        className='mg-split__menu'
        hidden={!open}
        onKeyDown={(event) => {
          if (event.key === 'Tab') close(false);
          else handleMenuKeys(event, menu.current);
        }}
      >
        {options.map((option) => (
          <button
            key={option.id}
            type='button'
            role='menuitem'
            tabIndex={-1}
            className='mg-split__item'
            onClick={() => {
              onSelect(option.id);
              close(true);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
