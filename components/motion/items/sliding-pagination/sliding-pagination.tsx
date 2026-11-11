'use client';

import type { ReactNode } from 'react';
import './sliding-pagination.css';

export interface SlidingPaginationProps<T> {
  items: T[];
  pageSize: number;
  /** Current page, starting at 1. */
  page: number;
  onPageChange: (page: number) => void;
  renderItem: (item: T) => ReactNode;
  /** Accessible name, for example "Harbor results". */
  label: string;
  /** The page you came from, so the new page slides in from the right side. */
  previousPage?: number;
  className?: string;
}

/**
 * Each page slides in from the direction you are moving. The controls never
 * move, and the current page is announced in words.
 */
export function SlidingPagination<T>({
  items,
  pageSize,
  page,
  onPageChange,
  renderItem,
  label,
  previousPage,
  className = '',
}: SlidingPaginationProps<T>) {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const direction =
    previousPage === undefined || previousPage === page
      ? 'none'
      : page > previousPage
        ? 'forward'
        : 'back';
  const slice = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <nav className={`mg-pages ${className}`} aria-label={label}>
      <div className='mg-pages__window'>
        <ul key={page} className='mg-pages__list' data-direction={direction}>
          {slice.map((item, index) => (
            <li key={index}>{renderItem(item)}</li>
          ))}
        </ul>
      </div>
      <div className='mg-pages__controls'>
        <button
          type='button'
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label='Previous page'
        >
          ←
        </button>
        <ol>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <li key={n}>
              <button
                type='button'
                aria-current={n === page ? 'page' : undefined}
                aria-label={`Page ${n}`}
                onClick={() => onPageChange(n)}
              >
                {n}
              </button>
            </li>
          ))}
        </ol>
        <button
          type='button'
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
          aria-label='Next page'
        >
          →
        </button>
      </div>
      <p className='mg-pages__status' role='status'>
        Page {page} of {pages}
      </p>
    </nav>
  );
}
