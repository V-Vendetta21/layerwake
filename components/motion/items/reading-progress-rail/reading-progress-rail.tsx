'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './reading-progress-rail.css';

export interface ReadingSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface ReadingProgressRailProps {
  sections: ReadingSection[];
  /** Accessible name for the article. */
  label: string;
  className?: string;
}

/**
 * A scrollable article with a rail that fills as you read and marks the
 * section you are in. Section buttons jump within the article only; the
 * page around it never scrolls.
 */
export function ReadingProgressRail({
  sections,
  label,
  className = '',
}: ReadingProgressRailProps) {
  const article = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = article.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? el.scrollTop / max : 1);
      const line = el.scrollTop + el.clientHeight * 0.3;
      const heads = Array.from(
        el.querySelectorAll<HTMLElement>('[data-section]')
      );
      let index = 0;
      heads.forEach((head, i) => {
        if (head.offsetTop <= line) index = i;
      });
      if (max > 0 && el.scrollTop >= max - 2) index = heads.length - 1;
      setCurrent(index);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  const jump = (index: number) => {
    const el = article.current;
    const head = el?.querySelector<HTMLElement>(`[data-section="${index}"]`);
    if (el && head)
      el.scrollTo({
        top: head.offsetTop - 8,
        behavior: reduced ? 'auto' : 'smooth',
      });
  };

  return (
    <div
      className={`mg-read ${className}`}
      style={{ '--mg-progress': progress } as CSSProperties}
    >
      <nav className='mg-read__rail' aria-label={`${label} sections`}>
        <span className='mg-read__track' aria-hidden='true'>
          <span className='mg-read__fill' />
        </span>
        <ol>
          {sections.map((section, index) => (
            <li key={section.id}>
              <button
                type='button'
                aria-current={index === current ? 'location' : undefined}
                onClick={() => jump(index)}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ol>
        <span className='mg-read__pct'>{Math.round(progress * 100)}% read</span>
      </nav>
      <div
        ref={article}
        className='mg-read__article'
        tabIndex={0}
        role='region'
        aria-label={label}
      >
        {sections.map((section, index) => (
          <section key={section.id} data-section={index}>
            <h4>{section.title}</h4>
            {section.body}
          </section>
        ))}
      </div>
    </div>
  );
}
