import type { ElementType } from 'react';
import './glitch-split-text.css';

export interface GlitchSplitTextProps {
  text: string;
  /** Element to render, for example "h2". */
  as?: ElementType;
  /** Change this value to play the glitch again. */
  playKey?: number | string;
  className?: string;
}

/**
 * Two colored copies slip sideways and settle back into one heading. The
 * copies are decorative; only the real text is exposed, and the main text
 * never disappears, so the effect does not flash.
 */
export function GlitchSplitText({
  text,
  as: Tag = 'h2',
  playKey = 0,
  className = '',
}: GlitchSplitTextProps) {
  return (
    <Tag className={`mg-glitch ${className}`}>
      <span className='mg-glitch__text'>{text}</span>
      <span
        key={`a-${playKey}`}
        className='mg-glitch__layer mg-glitch__layer--a'
        aria-hidden='true'
      >
        {text}
      </span>
      <span
        key={`b-${playKey}`}
        className='mg-glitch__layer mg-glitch__layer--b'
        aria-hidden='true'
      >
        {text}
      </span>
    </Tag>
  );
}
