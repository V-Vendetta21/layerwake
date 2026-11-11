'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { focusMenuItem, handleMenuKeys } from '../../shared/menu-keys';
import { useDismiss } from '../../shared/use-dismiss';
import './nested-menu-drilldown.css';

export interface MenuNode {
  id: string;
  label: string;
  children?: MenuNode[];
}

export interface NestedMenuDrilldownProps {
  /** Text on the opening button; also the name of the top level. */
  label: string;
  items: MenuNode[];
  /** Called with the labels from the top level down to the chosen item. */
  onSelect: (path: string[]) => void;
  className?: string;
}

/**
 * A menu whose submenus slide into the same panel instead of popping out
 * sideways. A back item and a visible path show where you are. Right arrow
 * or Enter opens a submenu, Left arrow or Escape goes back up (focusing the
 * item you came from), and Escape at the top closes the menu.
 */
export function NestedMenuDrilldown({
  label,
  items,
  onSelect,
  className = '',
}: NestedMenuDrilldownProps) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState<MenuNode[]>([]);
  const [direction, setDirection] = useState<'in' | 'out'>('in');
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<string | null>(null);
  const id = useId();

  const level = path.length ? (path[path.length - 1].children ?? []) : items;

  useEffect(() => {
    if (!open) return;
    const back = returnTo.current;
    returnTo.current = null;
    const target = back
      ? panel.current?.querySelector<HTMLElement>(`[data-id="${back}"]`)
      : null;
    // Land on the item you came from, or on the level's first real item.
    const first = panel.current?.querySelector<HTMLElement>('.mg-drill__item');
    if (target) target.focus();
    else if (first) first.focus();
    else focusMenuItem(panel.current);
  }, [open, path]);

  const close = (refocus: boolean) => {
    setOpen(false);
    setPath([]);
    if (refocus) trigger.current?.focus();
  };
  const goUp = () => {
    if (!path.length) return close(true);
    returnTo.current = path[path.length - 1].id;
    setDirection('out');
    setPath((p) => p.slice(0, -1));
  };
  const enter = (node: MenuNode) => {
    setDirection('in');
    setPath((p) => [...p, node]);
  };
  useDismiss(open, [root], (reason) =>
    reason === 'escape' ? goUp() : close(false)
  );

  return (
    <div ref={root} className={`mg-drill ${className}`}>
      <button
        ref={trigger}
        type='button'
        className='mg-drill__trigger'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        {label} <span aria-hidden='true'>▾</span>
      </button>
      {open ? (
        <div className='mg-drill__surface'>
          <p className='mg-drill__path' aria-hidden='true'>
            {[label, ...path.map((p) => p.label)].join(' › ')}
          </p>
          <div
            key={path.map((p) => p.id).join('/') || 'root'}
            ref={panel}
            id={id}
            role='menu'
            aria-label={path.length ? path[path.length - 1].label : label}
            className='mg-drill__panel'
            data-direction={direction}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' && path.length) {
                event.preventDefault();
                goUp();
              } else if (event.key === 'Tab') close(false);
              else handleMenuKeys(event, panel.current);
            }}
          >
            {path.length ? (
              <button
                type='button'
                role='menuitem'
                tabIndex={-1}
                className='mg-drill__back'
                onClick={goUp}
              >
                ‹ Back to{' '}
                {path.length > 1 ? path[path.length - 2].label : label}
              </button>
            ) : null}
            {level.map((node) => (
              <button
                key={node.id}
                type='button'
                role='menuitem'
                tabIndex={-1}
                data-id={node.id}
                aria-haspopup={node.children ? 'menu' : undefined}
                className='mg-drill__item'
                onKeyDown={(event) => {
                  if (event.key === 'ArrowRight' && node.children) {
                    event.preventDefault();
                    enter(node);
                  }
                }}
                onClick={() => {
                  if (node.children) enter(node);
                  else {
                    onSelect([...path.map((p) => p.label), node.label]);
                    close(true);
                  }
                }}
              >
                <span>{node.label}</span>
                {node.children ? <span aria-hidden='true'>›</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
