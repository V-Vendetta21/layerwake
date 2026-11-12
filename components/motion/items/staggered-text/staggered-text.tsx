'use client';

import { Fragment, type ElementType } from 'react';
import './staggered-text.css';

export interface StaggeredTextProps {
  text: string;
  /** Element to render, for example "h2". */
  as?: ElementType;
  /** Delay between words, in milliseconds. */
  stagger?: number;
  className?: string;
}

/** Word-by-word entrance. Screen readers get the sentence in one piece. */
export function StaggeredText({
  text,
  as: Tag = 'p',
  stagger = 70,
  className = '',
}: StaggeredTextProps) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag className={`mg-stagger ${className}`}>
      <span className='mg-stagger__sr'>{text}</span>
      <span aria-hidden='true'>
        {words.map((word, index) => (
          <Fragment key={index}>
            <span
              className='mg-stagger__word'
              style={{ animationDelay: `${index * stagger}ms` }}
            >
              {word}
            </span>{' '}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
