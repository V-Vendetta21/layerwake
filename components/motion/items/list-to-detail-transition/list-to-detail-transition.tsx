'use client';

import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './list-to-detail-transition.css';

export interface DetailItem {
  id: string;
  title: string;
  subtitle: string;
  thumb: ReactNode;
  body: ReactNode;
}

export interface ListToDetailProps {
  items: DetailItem[];
  label: string;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Opening an item grows its thumbnail from the list into the detail view
 * (measured before and after, then animated between). Back shrinks it home.
 * The list keeps its scroll position, and focus returns to the item you
 * opened. With reduced motion the views swap instantly.
 */
export function ListToDetail({
  items,
  label,
  className = '',
}: ListToDetailProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const detail = useRef<HTMLDivElement>(null);
  const from = useRef<DOMRect | null>(null);
  const scroll = useRef(0);
  const lastOpened = useRef<string | null>(null);
  const reduced = useReducedMotion();

  const thumbIn = (root: HTMLElement | null, id: string) =>
    root?.querySelector<HTMLElement>(`[data-thumb="${id}"]`) ?? null;

  useIsomorphicLayoutEffect(() => {
    const target = openId
      ? thumbIn(detail.current, openId)
      : lastOpened.current
        ? thumbIn(list.current, lastOpened.current)
        : null;
    if (!openId && list.current) list.current.scrollTop = scroll.current;
    if (openId) detail.current?.querySelector<HTMLElement>('h3')?.focus();
    else if (lastOpened.current)
      list.current
        ?.querySelector<HTMLElement>(`[data-open="${lastOpened.current}"]`)
        ?.focus();
    const start = from.current;
    from.current = null;
    if (!target || !start || reduced || !target.animate) return;
    const end = target.getBoundingClientRect();
    target.animate(
      [
        {
          transform: `translate(${start.left - end.left}px, ${start.top - end.top}px) scale(${start.width / end.width}, ${start.height / end.height})`,
        },
        { transform: 'none' },
      ],
      {
        duration: 380,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        composite: 'replace',
      }
    );
  }, [openId]);

  const open = (id: string) => {
    scroll.current = list.current?.scrollTop ?? 0;
    from.current = thumbIn(list.current, id)?.getBoundingClientRect() ?? null;
    lastOpened.current = id;
    setOpenId(id);
  };
  const back = () => {
    from.current = openId
      ? (thumbIn(detail.current, openId)?.getBoundingClientRect() ?? null)
      : null;
    setOpenId(null);
  };

  const item = items.find((i) => i.id === openId);
  return (
    <div className={`mg-l2d ${className}`} role='region' aria-label={label}>
      {item ? (
        <div ref={detail} className='mg-l2d__detail'>
          <button type='button' className='mg-l2d__back' onClick={back}>
            ‹ Back to list
          </button>
          <span className='mg-l2d__hero' data-thumb={item.id}>
            {item.thumb}
          </span>
          <h3 tabIndex={-1}>{item.title}</h3>
          <p className='mg-l2d__sub'>{item.subtitle}</p>
          <div className='mg-l2d__body'>{item.body}</div>
        </div>
      ) : (
        <ul ref={list} className='mg-l2d__list'>
          {items.map((i) => (
            <li key={i.id}>
              <button type='button' data-open={i.id} onClick={() => open(i.id)}>
                <span className='mg-l2d__thumb' data-thumb={i.id}>
                  {i.thumb}
                </span>
                <span>
                  <strong>{i.title}</strong>
                  <span>{i.subtitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
