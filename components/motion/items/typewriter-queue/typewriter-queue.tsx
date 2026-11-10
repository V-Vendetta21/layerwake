'use client';

import { useEffect, useState } from 'react';
import './typewriter-queue.css';

export interface TypewriterQueueProps {
  /** Keep this array stable (define it outside the component). */
  phrases: string[];
  /** Milliseconds per typed character. */
  typeMs?: number;
  /** Milliseconds per removed character. */
  deleteMs?: number;
  /** How long a finished phrase stays, in milliseconds. */
  holdMs?: number;
  className?: string;
}

/** Types each phrase, holds it, removes it, then moves to the next one. */
export function TypewriterQueue({
  phrases,
  typeMs = 55,
  deleteMs = 28,
  holdMs = 1200,
  className = '',
}: TypewriterQueueProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    let phrase = 0;
    let length = 0;
    let deleting = false;
    let timer = 0;

    const step = () => {
      const current = phrases[phrase % phrases.length];
      if (reduced) {
        // No typing: show whole phrases and swap them slowly.
        setText(current);
        phrase += 1;
        timer = window.setTimeout(step, holdMs * 2);
        return;
      }
      length += deleting ? -1 : 1;
      setText(current.slice(0, length));
      if (!deleting && length === current.length) {
        deleting = true;
        timer = window.setTimeout(step, holdMs);
      } else if (deleting && length === 0) {
        deleting = false;
        phrase += 1;
        timer = window.setTimeout(step, typeMs * 5);
      } else {
        timer = window.setTimeout(step, deleting ? deleteMs : typeMs);
      }
    };

    timer = window.setTimeout(step, 250);
    return () => window.clearTimeout(timer);
  }, [phrases, typeMs, deleteMs, holdMs]);

  return (
    <span className={`mg-typewriter ${className}`}>
      <span className='mg-typewriter__sr'>{phrases.join(', ')}</span>
      <span aria-hidden='true'>
        {text}
        <span className='mg-typewriter__caret' />
      </span>
    </span>
  );
}
