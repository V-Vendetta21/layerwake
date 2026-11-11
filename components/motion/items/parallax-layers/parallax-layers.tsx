'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './parallax-layers.css';

export interface ParallaxLayer {
  /** 0 stays put, 1 moves with the content, in between drifts slower. */
  depth: number;
  content: ReactNode;
}

export interface ParallaxLayersProps {
  /** Back to front. Decorative: hidden from assistive tech. */
  layers: ParallaxLayer[];
  /** The content that scrolls over the scene. */
  children: ReactNode;
  label: string;
  className?: string;
}

/**
 * A small scrolling viewport where background layers drift at different
 * speeds behind the content. With reduced motion the scene stays still.
 */
export function ParallaxLayers({
  layers,
  children,
  label,
  className = '',
}: ParallaxLayersProps) {
  const el = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      node.style.setProperty(
        '--mg-scroll',
        reduced ? '0' : String(node.scrollTop)
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      node.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div
      ref={el}
      className={`mg-parallax ${className}`}
      tabIndex={0}
      role='region'
      aria-label={label}
    >
      <div className='mg-parallax__scene' aria-hidden='true'>
        {layers.map((layer, index) => (
          <div
            key={index}
            className='mg-parallax__layer'
            style={{ '--mg-depth': 1 - layer.depth } as CSSProperties}
          >
            {layer.content}
          </div>
        ))}
      </div>
      <div className='mg-parallax__content'>{children}</div>
    </div>
  );
}
