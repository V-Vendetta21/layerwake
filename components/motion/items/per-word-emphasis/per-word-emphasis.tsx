'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './per-word-emphasis.css';

export interface PerWordEmphasisProps {
  text: string;
  /** Index of the emphasized word, starting at 0. */
  index: number;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Splits text into words, for counting and stepping. */
export const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);

/**
 * The whole sentence stays put while a highlight glides to the word at
 * `index`. The emphasized word also turns bold, so the change is not
 * carried by color alone. Drive `index` yourself (buttons, audio time).
 */
export function PerWordEmphasis({
  text,
  index,
  className = '',
}: PerWordEmphasisProps) {
  const root = useRef<HTMLParagraphElement>(null);
  const [box, setBox] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const words = wordsOf(text);
  const current = Math.max(0, Math.min(words.length - 1, index));

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const place = () => {
      const word = el.querySelector<HTMLElement>(`[data-index="${current}"]`);
      if (word)
        setBox({
          x: word.offsetLeft,
          y: word.offsetTop,
          w: word.offsetWidth,
          h: word.offsetHeight,
        });
    };
    place();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(place);
    observer.observe(el);
    return () => observer.disconnect();
  }, [current, text]);

  return (
    <p ref={root} className={`mg-emphasis ${className}`}>
      {box ? (
        <span
          className='mg-emphasis__mark'
          aria-hidden='true'
          style={{
            transform: `translate(${box.x}px, ${box.y}px)`,
            width: box.w,
            height: box.h,
          }}
        />
      ) : null}
      {words.map((word, i) => (
        <span key={i}>
          <span
            className='mg-emphasis__word'
            data-index={i}
            data-word={word}
            data-active={i === current}
          >
            {word}
          </span>{' '}
        </span>
      ))}
    </p>
  );
}
