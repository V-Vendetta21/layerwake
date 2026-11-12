'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './route-transition-curtain.css';

export interface CurtainView {
  id: string;
  title: string;
  content: ReactNode;
}

export interface RouteTransitionCurtainProps {
  views: CurtainView[];
  current: string;
  onNavigate: (id: string) => void;
  label: string;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const HALF = 220;

/**
 * Changing view draws a curtain across, swaps the view behind it, then
 * draws it away. Rapid clicks simply retarget the swap. Focus lands on the
 * new view's heading so keyboard and screen-reader users know where they are.
 */
export function RouteTransitionCurtain({
  views,
  current,
  onNavigate,
  label,
  className = '',
}: RouteTransitionCurtainProps) {
  const [shown, setShown] = useState(current);
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle');
  const target = useRef(current);
  const timer = useRef(0);
  const moved = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const titleId = useId();

  useEffect(() => {
    target.current = current;
    if (current === shown && phase === 'idle') return;
    moved.current = true;
    if (reduced) {
      setShown(current);
      return;
    }
    if (phase === 'cover') return; // the swap at mid-point will pick up the new target
    window.clearTimeout(timer.current);
    setPhase('cover');
    timer.current = window.setTimeout(() => {
      setShown(target.current);
      setPhase('reveal');
      timer.current = window.setTimeout(() => setPhase('idle'), HALF);
    }, HALF);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, reduced]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useIsomorphicLayoutEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [shown]);

  const view = views.find((v) => v.id === shown) ?? views[0];
  return (
    <div className={`mg-curtain ${className}`}>
      <nav className='mg-curtain__nav' aria-label={label}>
        {views.map((v) => (
          <button
            key={v.id}
            type='button'
            aria-current={v.id === current ? 'page' : undefined}
            onClick={() => onNavigate(v.id)}
          >
            {v.title}
          </button>
        ))}
      </nav>
      <div className='mg-curtain__stage'>
        <section className='mg-curtain__view' aria-labelledby={titleId}>
          <h3 id={titleId} ref={heading} tabIndex={-1}>
            {view.title}
          </h3>
          {view.content}
        </section>
        <span
          className='mg-curtain__cloth'
          data-phase={phase}
          aria-hidden='true'
        />
      </div>
    </div>
  );
}
