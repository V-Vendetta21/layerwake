'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import './stacked-dialog-depth.css';

export interface StackedDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** True while another dialog is open on top of this one. */
  covered?: boolean;
  className?: string;
}

/**
 * A modal dialog built on the native <dialog>. Open a second one from inside
 * the first and the first steps back (smaller, dimmer) to show the depth.
 * The browser traps focus in the top dialog; Escape closes only the top one,
 * and each close returns focus to the button that opened it.
 */
export function StackedDialog({
  open,
  onClose,
  title,
  children,
  covered = false,
  className = '',
}: StackedDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      opener.current = document.activeElement as HTMLElement | null;
      el.showModal();
    } else if (!open && el.open) {
      el.close();
      opener.current?.focus();
    }
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={`mg-stack ${className}`}
      aria-labelledby={titleId}
      data-covered={covered}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className='mg-stack__head'>
        <h2 id={titleId}>{title}</h2>
        <button
          type='button'
          className='mg-stack__close'
          aria-label={`Close ${title}`}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className='mg-stack__body'>{children}</div>
    </dialog>
  );
}
