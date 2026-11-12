'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { focusMenuItem, handleMenuKeys } from '../../shared/menu-keys';
import { useDismiss } from '../../shared/use-dismiss';
import './breadcrumb-collapse.css';

export interface Crumb {
  id: string;
  label: string;
}

export interface BreadcrumbCollapseProps {
  /** From the root to the current page. The last item is the current page. */
  items: Crumb[];
  onNavigate: (id: string) => void;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * When the trail is too wide, middle crumbs fold into a "…" menu. The first
 * crumb and the current page always stay visible. Crumbs slide back in as
 * room returns.
 */
export function BreadcrumbCollapse({
  items,
  onNavigate,
  className = '',
}: BreadcrumbCollapseProps) {
  const root = useRef<HTMLElement>(null);
  const measure = useRef<HTMLOListElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLLIElement>(null);
  const [hidden, setHidden] = useState(0);
  const [open, setOpen] = useState(false);
  const id = useId();

  useIsomorphicLayoutEffect(() => {
    const nav = root.current;
    const row = measure.current;
    if (!nav || !row) return;
    const fit = () => {
      const widths = Array.from(row.children).map(
        (child) => (child as HTMLElement).offsetWidth
      );
      const ellipsis = widths[widths.length - 1];
      const crumbs = widths.slice(0, -1);
      const available = nav.clientWidth;
      let collapse = 0;
      const total = (n: number) =>
        crumbs.reduce((sum, w, i) => (i > 0 && i <= n ? sum : sum + w), 0) +
        (n > 0 ? ellipsis : 0);
      while (collapse < items.length - 2 && total(collapse) > available)
        collapse += 1;
      setHidden(collapse);
    };
    fit();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fit);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (open) focusMenuItem(menu.current);
  }, [open]);
  useEffect(() => {
    if (hidden === 0) setOpen(false);
  }, [hidden]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };
  useDismiss(open, [popup], (reason) => close(reason === 'escape'));

  const collapsed = items.slice(1, 1 + hidden);
  const visible = items.filter((_, i) => i === 0 || i > hidden);

  return (
    <nav
      ref={root}
      aria-label='Breadcrumb'
      className={`mg-crumbs ${className}`}
    >
      <ol ref={measure} className='mg-crumbs__measure' aria-hidden='true'>
        {items.map((item) => (
          <li key={item.id} className='mg-crumbs__item'>
            <span className='mg-crumbs__link'>{item.label}</span>
          </li>
        ))}
        <li className='mg-crumbs__item'>
          <span className='mg-crumbs__more'>…</span>
        </li>
      </ol>
      <ol className='mg-crumbs__list'>
        {visible.map((item, index) => {
          const current = item.id === items[items.length - 1].id;
          return [
            index === 1 && hidden > 0 ? (
              <li
                key='more'
                ref={popup}
                className='mg-crumbs__item mg-crumbs__item--more'
              >
                <button
                  ref={trigger}
                  type='button'
                  className='mg-crumbs__more'
                  aria-label={`Show ${hidden} hidden ${hidden === 1 ? 'level' : 'levels'}`}
                  aria-haspopup='menu'
                  aria-expanded={open}
                  aria-controls={id}
                  onClick={() => setOpen((value) => !value)}
                >
                  …
                </button>
                <div
                  ref={menu}
                  id={id}
                  role='menu'
                  className='mg-crumbs__menu'
                  hidden={!open}
                  onKeyDown={(event) => {
                    if (event.key === 'Tab') close(false);
                    else handleMenuKeys(event, menu.current);
                  }}
                >
                  {collapsed.map((crumb) => (
                    <button
                      key={crumb.id}
                      type='button'
                      role='menuitem'
                      tabIndex={-1}
                      onClick={() => {
                        close(true);
                        onNavigate(crumb.id);
                      }}
                    >
                      {crumb.label}
                    </button>
                  ))}
                </div>
              </li>
            ) : null,
            <li
              key={item.id}
              className='mg-crumbs__item'
              data-enter={index > 0}
            >
              {current ? (
                <span className='mg-crumbs__link' aria-current='page'>
                  {item.label}
                </span>
              ) : (
                <button
                  type='button'
                  className='mg-crumbs__link'
                  onClick={() => onNavigate(item.id)}
                >
                  {item.label}
                </button>
              )}
            </li>,
          ];
        })}
      </ol>
    </nav>
  );
}
