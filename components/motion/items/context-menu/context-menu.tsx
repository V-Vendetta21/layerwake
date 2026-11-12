'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { focusMenuItem, handleMenuKeys } from '../../shared/menu-keys';
import { useDismiss } from '../../shared/use-dismiss';
import './context-menu.css';

export interface ContextMenuItem {
  id: string;
  label: string;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  onSelect: (id: string) => void;
  /** Accessible name of the area the menu belongs to. */
  label: string;
  children: ReactNode;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Right-click (or long-press on some devices) opens a menu at the pointer,
 * kept inside the area. Keyboard users press Shift+F10 or the Menu key on
 * the focused area; a visible "Actions" button opens it on touch.
 */
export function ContextMenu({
  items,
  onSelect,
  label,
  children,
  className = '',
}: ContextMenuProps) {
  const area = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useIsomorphicLayoutEffect(() => {
    if (!at || !area.current || !menu.current) return;
    const w = area.current.clientWidth;
    const h = area.current.clientHeight;
    setPos({
      x: Math.max(4, Math.min(at.x, w - menu.current.offsetWidth - 4)),
      y: Math.max(4, Math.min(at.y, h - menu.current.offsetHeight - 4)),
    });
    focusMenuItem(menu.current);
  }, [at]);

  const openAt = (x: number, y: number, from: HTMLElement | null) => {
    returnTo.current = from;
    setAt({ x, y });
  };
  const close = (refocus: boolean) => {
    setAt(null);
    if (refocus) returnTo.current?.focus();
  };
  useDismiss(at !== null, [menu], (reason) => close(reason === 'escape'));

  const onContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    openAt(event.clientX - rect.left, event.clientY - rect.top, area.current);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== area.current) return;
    if (
      event.key === 'ContextMenu' ||
      (event.key === 'F10' && event.shiftKey)
    ) {
      event.preventDefault();
      openAt(16, 16, area.current);
    }
  };

  return (
    <div
      ref={area}
      className={`mg-ctx ${className}`}
      tabIndex={0}
      role='group'
      aria-label={`${label}. Press Shift+F10 for actions.`}
      onContextMenu={onContextMenu}
      onKeyDown={onKeyDown}
    >
      {children}
      <button
        ref={button}
        type='button'
        className='mg-ctx__button'
        aria-haspopup='menu'
        aria-expanded={at !== null}
        onClick={(event) => {
          const rect = area.current!.getBoundingClientRect();
          const b = event.currentTarget.getBoundingClientRect();
          openAt(b.left - rect.left, b.bottom - rect.top + 4, button.current);
        }}
      >
        Actions
      </button>
      {at ? (
        <div
          ref={menu}
          role='menu'
          aria-label={`${label} actions`}
          className='mg-ctx__menu'
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          onKeyDown={(event) => {
            if (event.key === 'Tab') close(false);
            else handleMenuKeys(event, menu.current);
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              type='button'
              role='menuitem'
              tabIndex={-1}
              onClick={() => {
                close(true);
                onSelect(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
