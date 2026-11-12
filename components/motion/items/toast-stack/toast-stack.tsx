'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import './toast-stack.css';

export interface Toast {
  id: number;
  message: string;
}

export interface ToastStackProps {
  toasts: Toast[];
  /** Called once a toast has finished leaving. Remove it from your list. */
  onDismiss: (id: number) => void;
  /** Time before a toast leaves on its own, in milliseconds. */
  duration?: number;
  /** How many toasts stay visible in the stack. */
  max?: number;
  /**
   * By default the stack is pinned to the viewport. Set this to pin it inside
   * the nearest ancestor with `position: relative`.
   */
  contained?: boolean;
  className?: string;
}

function ToastItem({
  toast,
  depth,
  duration,
  onDismiss,
}: {
  toast: Toast;
  depth: number;
  duration: number;
  onDismiss: (id: number) => void;
}) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLeaving(true), duration);
    return () => window.clearTimeout(timer);
  }, [duration]);

  return (
    <li
      className='mg-toasts__slot'
      style={{ '--mg-depth': depth } as CSSProperties}
    >
      <div
        className='mg-toasts__toast'
        data-leaving={leaving}
        role='status'
        onAnimationEnd={() => leaving && onDismiss(toast.id)}
      >
        <span>{toast.message}</span>
        <button
          type='button'
          className='mg-toasts__close'
          aria-label={`Dismiss: ${toast.message}`}
          onClick={() => setLeaving(true)}
        >
          ×
        </button>
      </div>
    </li>
  );
}

/** Notices slide in, stack behind the newest one and leave on their own. */
export function ToastStack({
  toasts,
  onDismiss,
  duration = 4000,
  max = 3,
  contained = false,
  className = '',
}: ToastStackProps) {
  const visible = toasts.slice(-max);
  return (
    <ol
      className={`mg-toasts ${className}`}
      data-contained={contained}
      aria-label='Notifications'
    >
      {visible.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          depth={visible.length - 1 - index}
          duration={duration}
          onDismiss={onDismiss}
        />
      ))}
    </ol>
  );
}
