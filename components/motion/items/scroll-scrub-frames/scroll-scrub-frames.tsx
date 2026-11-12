'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './scroll-scrub-frames.css';

export interface ScrollScrubFramesProps {
  frames: number;
  renderFrame: (index: number) => ReactNode;
  /** Accessible name for the sequence, for example "Sunrise". */
  label: string;
  className?: string;
}

/**
 * Scrolling inside the box steps through a sequence of frames, like a flip
 * book. A labelled slider picks a frame directly. With reduced motion the
 * first frame stays put until a frame is chosen with the slider.
 */
export function ScrollScrubFrames({
  frames,
  renderFrame,
  label,
  className = '',
}: ScrollScrubFramesProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const reduced = useReducedMotion();
  const fromSlider = useRef(false);
  const id = useId();

  useEffect(() => {
    const el = scroller.current;
    if (!el || reduced) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (fromSlider.current) return;
      const max = el.scrollHeight - el.clientHeight;
      setFrame(Math.round((max > 0 ? el.scrollTop / max : 0) * (frames - 1)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const release = () => (fromSlider.current = false);
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('wheel', release, { passive: true });
    el.addEventListener('touchstart', release, { passive: true });
    el.addEventListener('keydown', release);
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('wheel', release);
      el.removeEventListener('touchstart', release);
      el.removeEventListener('keydown', release);
      cancelAnimationFrame(raf);
    };
  }, [frames, reduced]);

  const choose = (next: number) => {
    setFrame(next);
    const el = scroller.current;
    if (!el || reduced) return;
    fromSlider.current = true;
    el.scrollTop = ((el.scrollHeight - el.clientHeight) * next) / (frames - 1);
  };

  return (
    <div className={`mg-scrub ${className}`}>
      <div
        ref={scroller}
        className='mg-scrub__scroller'
        tabIndex={0}
        role='region'
        aria-label={`${label}: scroll to play`}
      >
        <div className='mg-scrub__stage'>{renderFrame(frame)}</div>
        <div className='mg-scrub__spacer' aria-hidden='true' />
      </div>
      <label className='mg-scrub__slider' htmlFor={id}>
        Frame {frame + 1} of {frames}
        <input
          id={id}
          type='range'
          min={0}
          max={frames - 1}
          step={1}
          value={frame}
          onChange={(event) => choose(Number(event.target.value))}
        />
      </label>
    </div>
  );
}
