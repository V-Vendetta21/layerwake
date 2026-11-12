'use client';

import { useId, useState, type ReactNode } from 'react';
import './spring-accordion.css';

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

export interface SpringAccordionProps {
  items: AccordionItem[];
  /** Id of the item that starts open. */
  defaultOpen?: string;
  className?: string;
}

/** One section open at a time. Opening overshoots slightly, like a spring. */
export function SpringAccordion({
  items,
  defaultOpen,
  className = '',
}: SpringAccordionProps) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const baseId = useId();
  return (
    <div className={`mg-accordion ${className}`}>
      {items.map((item) => {
        const isOpen = item.id === open;
        return (
          <div key={item.id} className='mg-accordion__item' data-open={isOpen}>
            <h3 className='mg-accordion__heading'>
              <button
                type='button'
                id={`${baseId}-button-${item.id}`}
                className='mg-accordion__button'
                aria-expanded={isOpen}
                aria-controls={`${baseId}-panel-${item.id}`}
                onClick={() => setOpen(isOpen ? null : item.id)}
              >
                {item.title}
                <span className='mg-accordion__mark' aria-hidden='true' />
              </button>
            </h3>
            <div
              id={`${baseId}-panel-${item.id}`}
              role='region'
              aria-labelledby={`${baseId}-button-${item.id}`}
              className='mg-accordion__panel'
            >
              <div className='mg-accordion__clip'>
                <div className='mg-accordion__body'>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
