'use client';

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
  type RefObject,
} from 'react';
import './scroll-reveal.css';

export interface ScrollRevealProps {
  children: ReactNode;
  /**
   * The scrolling element to watch. Leave it out to use the page. Pass a ref
   * to reveal items inside a local scroll area.
   */
  root?: RefObject<HTMLElement | null>;
  /** Element to render, for example "li". */
  as?: ElementType;
  className?: string;
}

/** Fades and lifts its content into place the first time it scrolls into view. */
export function ScrollReveal({
  children,
  root,
  as = 'div',
  className = '',
}: ScrollRevealProps) {
  const element = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = element.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { root: root?.current ?? null, threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [root]);

  return createElement(
    as,
    {
      ref: element,
      className: `mg-reveal ${className}`,
      'data-visible': visible,
    },
    children
  );
}
