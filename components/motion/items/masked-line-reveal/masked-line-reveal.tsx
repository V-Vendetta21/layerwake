'use client';

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
} from 'react';
import './masked-line-reveal.css';

export interface MaskedLineRevealProps {
  text: string;
  /** Element to render, for example "h2". */
  as?: ElementType;
  /** Delay between lines, in milliseconds. */
  stagger?: number;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Splits text into the lines the browser actually draws, then slides each
 * line up out of its own clipping mask. Lines are re-measured on resize, so
 * the text reflows naturally at any width. Screen readers get the plain text.
 */
export function MaskedLineReveal({
  text,
  as = 'p',
  stagger = 110,
  className = '',
}: MaskedLineRevealProps) {
  const root = useRef<HTMLElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[] | null>(null);
  const [settled, setSettled] = useState(false);
  const words = text.split(/\s+/).filter(Boolean);

  useIsomorphicLayoutEffect(() => {
    const el = measure.current;
    if (!el) return;
    const split = () => {
      const groups: string[][] = [];
      let top: number | null = null;
      el.querySelectorAll<HTMLElement>('[data-word]').forEach((word) => {
        if (top === null || Math.abs(word.offsetTop - top) > 2) {
          groups.push([]);
          top = word.offsetTop;
        }
        groups[groups.length - 1].push(word.textContent ?? '');
      });
      const next = groups.map((group) => group.join(' '));
      setLines((current) =>
        current && current.join('\n') === next.join('\n') ? current : next
      );
    };
    split();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(split);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  // After the first reveal, later reflows (resizing) must not replay it.
  useEffect(() => {
    if (!lines || settled) return;
    const timer = window.setTimeout(
      () => setSettled(true),
      lines.length * stagger + 800
    );
    return () => window.clearTimeout(timer);
  }, [lines, settled, stagger]);

  return createElement(
    as,
    {
      ref: root,
      className: `mg-lines ${className}`,
      'data-settled': settled,
    },
    <>
      <span className='mg-lines__sr'>{text}</span>
      <span ref={measure} className='mg-lines__measure' aria-hidden='true'>
        {words.map((word, index) => (
          <span key={index} data-word=''>
            {word}{' '}
          </span>
        ))}
      </span>
      <span className='mg-lines__visual' aria-hidden='true'>
        {(lines ?? []).map((line, index) => (
          <span key={index} className='mg-lines__mask'>
            <span
              className='mg-lines__line'
              style={{ '--mg-delay': `${index * stagger}ms` } as CSSProperties}
            >
              {line}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}
