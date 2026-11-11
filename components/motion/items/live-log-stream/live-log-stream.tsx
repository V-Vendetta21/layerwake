'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './live-log-stream.css';

export interface LogEntry {
  id: number;
  time: string;
  level: 'info' | 'warn' | 'error';
  text: string;
}

export interface LiveLogStreamProps {
  entries: LogEntry[];
  label: string;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * New entries slide in at the bottom. While you are at the bottom the view
 * follows them; scroll up to read and it stays exactly where you are, with a
 * "Jump to latest" button counting what arrived. Nothing is announced unless
 * you ask for it, so screen readers are not flooded.
 */
export function LiveLogStream({
  entries,
  label,
  className = '',
}: LiveLogStreamProps) {
  const box = useRef<HTMLOListElement>(null);
  const [following, setFollowing] = useState(true);
  const [unseen, setUnseen] = useState(0);
  const [announce, setAnnounce] = useState(false);
  const seen = useRef(entries.length);

  useIsomorphicLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const added = entries.length - seen.current;
    seen.current = entries.length;
    if (following) el.scrollTop = el.scrollHeight;
    else if (added > 0) setUnseen((n) => n + added);
  }, [entries]);

  const latest = entries[entries.length - 1];
  return (
    <div className={`mg-log ${className}`}>
      <ol
        ref={box}
        className='mg-log__list'
        tabIndex={0}
        aria-label={label}
        onScroll={(event) => {
          const el = event.currentTarget;
          const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
          setFollowing(atBottom);
          if (atBottom) setUnseen(0);
        }}
      >
        {entries.map((e) => (
          <li key={e.id} className='mg-log__row' data-level={e.level}>
            <time>{e.time}</time>
            <span className='mg-log__level'>{e.level.toUpperCase()}</span>
            <span>{e.text}</span>
          </li>
        ))}
      </ol>
      {!following ? (
        <button
          type='button'
          className='mg-log__jump'
          onClick={() => {
            const el = box.current!;
            el.scrollTop = el.scrollHeight;
            setFollowing(true);
            setUnseen(0);
          }}
        >
          ↓ Jump to latest{unseen ? ` (${unseen} new)` : ''}
        </button>
      ) : null}
      <label className='mg-log__announce'>
        <input
          type='checkbox'
          checked={announce}
          onChange={(event) => setAnnounce(event.target.checked)}
        />
        Announce new entries
      </label>
      <span className='mg-log__sr' aria-live='polite'>
        {announce && latest ? `${latest.level}: ${latest.text}` : ''}
      </span>
    </div>
  );
}
