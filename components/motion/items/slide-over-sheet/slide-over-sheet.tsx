'use client';

import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import './slide-over-sheet.css';

export interface SlideOverSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /**
   * By default the sheet covers the viewport. Set this to keep it inside the
   * nearest ancestor with `position: relative`.
   */
  contained?: boolean;
  className?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A panel that slides in from the right. Focus moves into it when it opens,
 * stays inside while it is open, and returns to the opener when it closes.
 * Escape and the backdrop both close it.
 */
export function SlideOverSheet({
  open,
  onClose,
  title,
  children,
  contained = false,
  className = '',
}: SlideOverSheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    return () => opener?.focus?.();
  }, [open]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !panel.current) return;
    const focusable = Array.from(
      panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)
    );
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;
    if (event.shiftKey && (current === first || current === panel.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={`mg-sheet ${className}`}
      data-open={open}
      data-contained={contained}
    >
      <div className='mg-sheet__backdrop' onClick={onClose} />
      <div
        ref={panel}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        tabIndex={-1}
        className='mg-sheet__panel'
        onKeyDown={onKeyDown}
      >
        <div className='mg-sheet__header'>
          <h2 id={titleId} className='mg-sheet__title'>
            {title}
          </h2>
          <button
            type='button'
            className='mg-sheet__close'
            aria-label='Close'
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className='mg-sheet__body'>{children}</div>
      </div>
    </div>
  );
}
