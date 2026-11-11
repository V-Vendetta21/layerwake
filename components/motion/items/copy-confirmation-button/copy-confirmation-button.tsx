'use client';

import { useEffect, useState } from 'react';
import './copy-confirmation-button.css';

type Phase = 'idle' | 'copied' | 'error';

export interface CopyConfirmationButtonProps {
  /** The text to copy. */
  text: string;
  label?: string;
  /** Replace the clipboard call, for example to copy rich content. */
  copy?: (text: string) => Promise<void>;
  /** How long the success or error state stays, in milliseconds. */
  resetAfter?: number;
  className?: string;
}

const defaultCopy = async (text: string) => {
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
  await navigator.clipboard.writeText(text);
};

/**
 * Copies text, then turns its icon into a tick and its label into "Copied"
 * only after the copy really succeeded. A failure shows an error state with
 * a way forward, and either state returns to idle for the next copy.
 */
export function CopyConfirmationButton({
  text,
  label = 'Copy',
  copy = defaultCopy,
  resetAfter = 2200,
  className = '',
}: CopyConfirmationButtonProps) {
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    if (phase === 'idle') return;
    const timer = window.setTimeout(() => setPhase('idle'), resetAfter);
    return () => window.clearTimeout(timer);
  }, [phase, resetAfter]);

  const run = async () => {
    try {
      await copy(text);
      setPhase('copied');
    } catch {
      setPhase('error');
    }
  };

  return (
    <span className={`mg-copyok ${className}`} data-phase={phase}>
      <button type='button' className='mg-copyok__button' onClick={run}>
        <svg className='mg-copyok__icon' viewBox='0 0 20 20' aria-hidden='true'>
          <rect
            className='mg-copyok__sheet'
            x='6'
            y='6'
            width='9'
            height='10'
            rx='2'
          />
          <path
            className='mg-copyok__sheet'
            d='M12 4 H5.5 A1.5 1.5 0 0 0 4 5.5 V13'
          />
          <path
            className='mg-copyok__tick'
            d='M4.5 10.5 L8.5 14.5 L15.5 6'
            pathLength={1}
          />
          <path
            className='mg-copyok__cross'
            d='M6 6 L14 14 M14 6 L6 14'
            pathLength={1}
          />
        </svg>
        <span className='mg-copyok__label'>
          {phase === 'copied'
            ? 'Copied'
            : phase === 'error'
              ? 'Copy failed'
              : label}
        </span>
      </button>
      <span className='mg-copyok__status' role='status'>
        {phase === 'copied'
          ? 'Copied to the clipboard.'
          : phase === 'error'
            ? 'Could not copy. Select the text and press Ctrl+C or ⌘C.'
            : ''}
      </span>
    </span>
  );
}
