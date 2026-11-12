'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import './calendar-month-slide.css';

export interface CalendarMonthSlideProps {
  value: Date | null;
  onChange: (date: Date) => void;
  /** The month shown first. Defaults to the selected date's month, or today. */
  defaultMonth?: Date;
  label: string;
  className?: string;
}

const DAY = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => {
  const next = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  return new Date(
    next.getFullYear(),
    next.getMonth(),
    Math.min(d.getDate(), last)
  );
};
const same = (a: Date | null, b: Date) =>
  !!a &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * A month grid that slides left or right as you change months. Arrow keys
 * move a day or a week (crossing into the next month as needed), Page Up and
 * Page Down change month, Home and End jump to the week's ends, and Enter
 * picks a day. The chosen date stays chosen as you browse.
 */
export function CalendarMonthSlide({
  value,
  onChange,
  defaultMonth,
  label,
  className = '',
}: CalendarMonthSlideProps) {
  const [month, setMonth] = useState(() =>
    monthStart(defaultMonth ?? value ?? new Date())
  );
  const [focus, setFocus] = useState(() => value ?? defaultMonth ?? new Date());
  const [direction, setDirection] = useState<'next' | 'prev' | 'none'>('none');
  const grid = useRef<HTMLTableElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (moved.current)
      grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [focus, month]);

  const show = (next: Date) => {
    const start = monthStart(next);
    if (start.getTime() !== month.getTime()) {
      setDirection(start > month ? 'next' : 'prev');
      setMonth(start);
    }
  };
  const goto = (d: Date) => {
    moved.current = true;
    setFocus(d);
    show(d);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const weekday = (focus.getDay() + 6) % 7;
    const map: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      Home: () => addDays(focus, -weekday),
      End: () => addDays(focus, 6 - weekday),
      PageUp: () => addMonths(focus, -1),
      PageDown: () => addMonths(focus, 1),
    };
    if (!map[event.key]) return;
    event.preventDefault();
    goto(map[event.key]());
  };

  // Six weeks starting on the Monday on or before the 1st.
  const first = addDays(month, -((month.getDay() + 6) % 7));
  const weeks = Array.from({ length: 6 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d))
  );
  const title = month.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={`mg-cal ${className}`}>
      <div className='mg-cal__head'>
        <button
          type='button'
          aria-label='Previous month'
          onClick={() => {
            moved.current = false;
            setFocus(addMonths(focus, -1));
            show(addMonths(month, -1));
          }}
        >
          ‹
        </button>
        <h4 aria-live='polite'>{title}</h4>
        <button
          type='button'
          aria-label='Next month'
          onClick={() => {
            moved.current = false;
            setFocus(addMonths(focus, 1));
            show(addMonths(month, 1));
          }}
        >
          ›
        </button>
      </div>
      <div className='mg-cal__window'>
        <table
          key={key(month)}
          ref={grid}
          className='mg-cal__grid'
          role='grid'
          aria-label={`${label}, ${title}`}
          data-direction={direction}
          onKeyDown={onKeyDown}
        >
          <thead>
            <tr>
              {DAY.map((d) => (
                <th key={d} scope='col' abbr={d}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, w) => (
              <tr key={w}>
                {week.map((day) => {
                  const inMonth = day.getMonth() === month.getMonth();
                  const selected = same(value, day);
                  return (
                    <td key={key(day)} role='gridcell' aria-selected={selected}>
                      <button
                        type='button'
                        tabIndex={same(focus, day) && inMonth ? 0 : -1}
                        data-outside={!inMonth}
                        data-selected={selected}
                        aria-label={day.toLocaleDateString(undefined, {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                        onClick={() => {
                          moved.current = true;
                          setFocus(day);
                          show(day);
                          onChange(day);
                        }}
                      >
                        {day.getDate()}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
