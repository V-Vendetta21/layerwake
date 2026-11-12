'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import './selection-toolbar.css';

export type Mark = 'bold' | 'italic' | 'highlight';

export interface Segment {
  text: string;
  marks: Mark[];
}

export interface SelectionToolbarProps {
  segments: Segment[];
  onChange: (segments: Segment[]) => void;
  label: string;
  className?: string;
}

const MARKS: { id: Mark; label: string; glyph: ReactNode }[] = [
  { id: 'bold', label: 'Bold', glyph: <b>B</b> },
  { id: 'italic', label: 'Italic', glyph: <i>I</i> },
  {
    id: 'highlight',
    label: 'Highlight',
    glyph: <span className='mg-seltb__hl'>H</span>,
  },
];

/** Character offset of a DOM position inside `root`. */
function offsetIn(root: HTMLElement, node: Node, offset: number) {
  const range = document.createRange();
  range.selectNodeContents(root);
  range.setEnd(node, offset);
  return range.toString().length;
}

/** Toggle a mark on characters [start, end). */
function apply(
  segments: Segment[],
  start: number,
  end: number,
  mark: Mark
): Segment[] {
  const chars = segments.flatMap((s) =>
    Array.from(s.text, (c) => ({ c, marks: s.marks }))
  );
  const allHave = chars
    .slice(start, end)
    .every((ch) => ch.marks.includes(mark));
  chars.forEach((ch, i) => {
    if (i < start || i >= end) return;
    ch.marks = allHave
      ? ch.marks.filter((m) => m !== mark)
      : ([...new Set([...ch.marks, mark])].sort() as Mark[]);
  });
  const out: Segment[] = [];
  for (const ch of chars) {
    const last = out[out.length - 1];
    if (last && last.marks.join() === ch.marks.join()) last.text += ch.c;
    else out.push({ text: ch.c, marks: ch.marks });
  }
  return out;
}

/**
 * Select text in the paragraph and a small format bar appears just above
 * the selection. Keyboard users select with Shift + arrows, then press
 * Alt+F10 (or use the "Format selection" button) to move into the bar.
 */
export function SelectionToolbar({
  segments,
  onChange,
  label,
  className = '',
}: SelectionToolbarProps) {
  const root = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<{
    start: number;
    end: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const onChangeSel = () => {
      const s = window.getSelection();
      const el = text.current;
      if (!s || !el || s.rangeCount === 0 || s.isCollapsed) {
        if (
          !root.current?.contains(document.activeElement) ||
          document.activeElement === el
        )
          setSel(null);
        return;
      }
      const range = s.getRangeAt(0);
      if (
        !el.contains(range.startContainer) ||
        !el.contains(range.endContainer)
      )
        return;
      const a = offsetIn(el, range.startContainer, range.startOffset);
      const b = offsetIn(el, range.endContainer, range.endOffset);
      const rect = range.getBoundingClientRect();
      const box = root.current!.getBoundingClientRect();
      setSel({
        start: Math.min(a, b),
        end: Math.max(a, b),
        x: Math.max(
          70,
          Math.min(box.width - 70, rect.left + rect.width / 2 - box.left)
        ),
        y: rect.top - box.top,
      });
    };
    document.addEventListener('selectionchange', onChangeSel);
    return () => document.removeEventListener('selectionchange', onChangeSel);
  }, []);

  const format = (mark: Mark) => {
    if (!sel) return;
    onChange(apply(segments, sel.start, sel.end, mark));
  };
  const enterBar = () =>
    bar.current?.querySelector<HTMLElement>('button')?.focus();

  return (
    <div ref={root} className={`mg-seltb ${className}`}>
      <p
        ref={text}
        className='mg-seltb__text'
        tabIndex={0}
        aria-label={`${label}. Select text, then press Alt+F10 to format it.`}
        onKeyDown={(event) => {
          if (event.key === 'F10' && event.altKey && sel) {
            event.preventDefault();
            enterBar();
          }
        }}
      >
        {segments.map((s, i) => (
          <span key={i} data-marks={s.marks.join(' ')}>
            {s.text}
          </span>
        ))}
      </p>
      {sel ? (
        <div
          ref={bar}
          role='toolbar'
          aria-label='Format selection'
          className='mg-seltb__bar'
          style={{
            transform: `translate(${sel.x}px, ${sel.y}px) translate(-50%, calc(-100% - 8px))`,
          }}
          onKeyDown={(event) => {
            const buttons = Array.from(
              bar.current?.querySelectorAll<HTMLElement>('button') ?? []
            );
            const i = buttons.indexOf(document.activeElement as HTMLElement);
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              buttons[
                (i + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) %
                  buttons.length
              ].focus();
            } else if (event.key === 'Escape') {
              text.current?.focus();
            }
          }}
          onMouseDown={(event) => event.preventDefault()}
        >
          {MARKS.map((m) => (
            <button
              key={m.id}
              type='button'
              aria-label={m.label}
              onClick={() => format(m.id)}
            >
              {m.glyph}
            </button>
          ))}
        </div>
      ) : null}
      <button
        type='button'
        className='mg-seltb__fallback'
        disabled={!sel}
        onMouseDown={(event) => event.preventDefault()}
        onClick={enterBar}
      >
        Format selection
      </button>
    </div>
  );
}
