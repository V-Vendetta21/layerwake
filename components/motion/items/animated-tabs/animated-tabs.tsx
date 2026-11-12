'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import './animated-tabs.css';

export interface AnimatedTab {
  id: string;
  label: string;
  content: ReactNode;
}

export interface AnimatedTabsProps {
  tabs: AnimatedTab[];
  /** Accessible name for the tab list. */
  label: string;
  className?: string;
}

/** Tabs with an indicator that slides to the active tab. */
export function AnimatedTabs({
  tabs,
  label,
  className = '',
}: AnimatedTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id);
  const [bar, setBar] = useState({ left: 0, width: 0 });
  const list = useRef<HTMLDivElement>(null);
  const baseId = useId();

  useEffect(() => {
    const measure = () => {
      const tab = list.current?.querySelector<HTMLElement>(
        '[aria-selected="true"]'
      );
      if (tab) setBar({ left: tab.offsetLeft, width: tab.offsetWidth });
    };
    measure();
    if (typeof ResizeObserver === 'undefined' || !list.current) return;
    const observer = new ResizeObserver(measure);
    observer.observe(list.current);
    return () => observer.disconnect();
  }, [active, tabs]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((tab) => tab.id === active);
    const next: Record<string, number> = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    const target = tabs[next[event.key]];
    setActive(target.id);
    list.current
      ?.querySelector<HTMLElement>(`[data-tab="${target.id}"]`)
      ?.focus();
  };

  return (
    <div className={`mg-tabs ${className}`}>
      <div
        ref={list}
        className='mg-tabs__list'
        role='tablist'
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type='button'
            role='tab'
            id={`${baseId}-tab-${tab.id}`}
            data-tab={tab.id}
            aria-selected={tab.id === active}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={tab.id === active ? 0 : -1}
            className='mg-tabs__tab'
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <span
          className='mg-tabs__bar'
          aria-hidden='true'
          style={{ width: bar.width, transform: `translateX(${bar.left}px)` }}
        />
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role='tabpanel'
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className='mg-tabs__panel'
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
