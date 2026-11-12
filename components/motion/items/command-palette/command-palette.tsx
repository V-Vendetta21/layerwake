'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import './command-palette.css';

export interface Command {
  id: string;
  label: string;
  hint?: string;
}

export interface CommandPaletteProps {
  commands: Command[];
  onRun: (command: Command) => void;
  /** Text on the opening button. */
  label?: string;
  /** Listen for Ctrl+K / ⌘K while mounted. */
  shortcut?: boolean;
  className?: string;
}

/**
 * A searchable command list in a modal dialog. Open it with the button or
 * Ctrl+K / ⌘K, move with the arrow keys, run with Enter. Escape closes it,
 * and focus goes back to wherever it was before.
 */
export function CommandPalette({
  commands,
  onRun,
  label = 'Commands',
  shortcut = true,
  className = '',
}: CommandPaletteProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const id = useId();

  const results = commands.filter((c) =>
    c.label.toLowerCase().includes(query.trim().toLowerCase())
  );
  const current = results[Math.min(active, results.length - 1)];

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      opener.current = document.activeElement as HTMLElement | null;
      el.showModal();
      input.current?.focus();
    } else if (!open && el.open) {
      el.close();
      // Only now is the rest of the page focusable again.
      opener.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  const finish = (command?: Command) => {
    setOpen(false);
    setQuery('');
    setActive(0);
    if (command) onRun(command);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((i) =>
        results.length ? (i + step + results.length) % results.length : 0
      );
    } else if (event.key === 'Enter' && current) {
      event.preventDefault();
      finish(current);
    }
  };

  return (
    <>
      <button
        type='button'
        className={`mg-cmdk__open ${className}`}
        onClick={() => setOpen(true)}
      >
        {label}
        {shortcut ? <kbd aria-hidden='true'>Ctrl K</kbd> : null}
      </button>
      <dialog
        ref={dialog}
        className='mg-cmdk'
        aria-label={label}
        onClose={() => {
          // Escape closed the dialog natively; sync state and restore focus.
          if (!open) return;
          finish();
          opener.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) finish();
        }}
      >
        <div className='mg-cmdk__panel'>
          <input
            ref={input}
            className='mg-cmdk__input'
            role='combobox'
            aria-expanded='true'
            aria-controls={`${id}-list`}
            aria-activedescendant={current ? `${id}-${current.id}` : undefined}
            aria-label='Type a command'
            placeholder='Type a command…'
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <ul
            id={`${id}-list`}
            role='listbox'
            aria-label='Commands'
            className='mg-cmdk__list'
          >
            {results.map((command) => (
              <li
                key={command.id}
                id={`${id}-${command.id}`}
                role='option'
                aria-selected={command === current}
                className='mg-cmdk__option'
                onPointerMove={() => setActive(results.indexOf(command))}
                onClick={() => finish(command)}
              >
                <span>{command.label}</span>
                {command.hint ? (
                  <span className='mg-cmdk__hint'>{command.hint}</span>
                ) : null}
              </li>
            ))}
          </ul>
          {results.length === 0 ? (
            <p className='mg-cmdk__empty'>No command matches “{query}”.</p>
          ) : null}
          <p className='mg-cmdk__keys' aria-hidden='true'>
            ↑↓ to move · Enter to run · Esc to close
          </p>
        </div>
      </dialog>
    </>
  );
}
