'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './sticky-section-story.css';

export interface StoryStep {
  id: string;
  title: string;
  text: string;
}

export interface StickySectionStoryProps {
  steps: StoryStep[];
  /** Draws the pinned picture for the active step. */
  renderVisual: (index: number) => ReactNode;
  /** Accessible name for the story. */
  label: string;
  className?: string;
}

/**
 * A picture stays pinned while captions scroll past it inside the story's
 * own scroll area, and the picture follows the caption in view. Numbered
 * buttons jump straight to a caption.
 */
export function StickySectionStory({
  steps,
  renderVisual,
  label,
  className = '',
}: StickySectionStoryProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = el.scrollTop + el.clientHeight * 0.45;
      let index = 0;
      el.querySelectorAll<HTMLElement>('[data-step]').forEach((step, i) => {
        if (step.offsetTop <= line) index = i;
      });
      setActive(index);
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
  }, [steps]);

  const jump = (index: number) => {
    const el = scroller.current;
    const step = el?.querySelector<HTMLElement>(`[data-step="${index}"]`);
    if (el && step)
      el.scrollTo({
        top: step.offsetTop - el.clientHeight * 0.2,
        behavior: reduced ? 'auto' : 'smooth',
      });
  };

  return (
    <div className={`mg-story ${className}`}>
      <div
        ref={scroller}
        className='mg-story__scroller'
        tabIndex={0}
        role='region'
        aria-label={label}
      >
        <div className='mg-story__layout'>
          <div className='mg-story__pin' aria-hidden='true'>
            {renderVisual(active)}
          </div>
          <ol className='mg-story__steps'>
            {steps.map((step, index) => (
              <li
                key={step.id}
                data-step={index}
                data-active={index === active}
                className='mg-story__step'
              >
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div
        className='mg-story__jumps'
        role='group'
        aria-label={`${label}: jump to a step`}
      >
        {steps.map((step, index) => (
          <button
            key={step.id}
            type='button'
            aria-current={index === active ? 'step' : undefined}
            aria-label={`Step ${index + 1}: ${step.title}`}
            onClick={() => jump(index)}
          >
            {index + 1}
          </button>
        ))}
        <span className='mg-story__now'>
          Step {active + 1} of {steps.length}: {steps[active]?.title}
        </span>
      </div>
    </div>
  );
}
