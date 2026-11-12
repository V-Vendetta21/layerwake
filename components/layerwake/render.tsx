'use client';

import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { resetCss } from '@/lib/layerwake/export';
import {
  declValue,
  nodeText,
  tokenVariables,
  type Edits,
  type Model,
  type ModelNode,
} from '@/lib/layerwake/model';

const ROOT_CLASS = 'lw-render';
const camel = (prop: string) =>
  prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function nodeStyle(node: ModelNode, model: Model): CSSProperties {
  const style: Record<string, string> = {};
  for (const decl of node.decls)
    style[camel(decl.prop)] = declValue(decl, model);
  return style;
}

function renderNode(node: ModelNode, model: Model, edits: Edits): ReactNode {
  // Only app-owned elements, structured styles and React-escaped text reach
  // the DOM. Nothing from an import is ever written as markup.
  const props: Record<string, unknown> = {
    key: node.id,
    style: nodeStyle(node, model),
    'data-lw-node': node.id,
  };
  if (node.tag === 'button') {
    props.type = 'button';
    props.tabIndex = -1;
  }
  if (node.slot === 'image') {
    props.role = 'img';
    props['aria-label'] = 'Image placeholder';
  }
  const content =
    node.slot === 'text'
      ? nodeText(node, edits)
      : node.children.map((child) => renderNode(child, model, edits));
  return createElement(node.tag, props, content);
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComponentRenderProps {
  model: Model;
  edits: Edits;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Reports node ids whose content spills outside the frame. */
  onOverflow?: (ids: string[]) => void;
  /** Anything that should trigger re-measuring (e.g. the frame width). */
  measureKey?: string | number;
}

/**
 * Renders the normalized model. The exported HTML/CSS is generated from the
 * same declarations, so what you see here is what you download.
 */
export function ComponentRender({
  model,
  edits,
  selectedId,
  onSelect,
  onOverflow,
  measureKey,
}: ComponentRenderProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [selectedRect, setSelectedRect] = useState<Rect | null>(null);
  const [hover, setHover] = useState<{ id: string; rect: Rect } | null>(null);
  const [tick, setTick] = useState(0);

  const rectOf = useCallback((id: string): Rect | null => {
    const host = hostRef.current;
    const el = host?.querySelector<HTMLElement>(`[data-lw-node="${id}"]`);
    if (!host || !el) return null;
    const a = host.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    return {
      x: b.left - a.left,
      y: b.top - a.top,
      width: b.width,
      height: b.height,
    };
  }, []);

  useLayoutEffect(() => {
    setSelectedRect(selectedId ? rectOf(selectedId) : null);
    setHover(null);
  }, [selectedId, model, edits, measureKey, tick, rectOf]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setTick((t) => t + 1));
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!onOverflow) return;
    const host = hostRef.current;
    if (!host) return;
    const frame = window.requestAnimationFrame(() => {
      const limit = host.getBoundingClientRect().right + 1;
      const ids: string[] = [];
      host.querySelectorAll<HTMLElement>('[data-lw-node]').forEach((el) => {
        const clipped = window.getComputedStyle(el).overflowX !== 'visible';
        const spills =
          el.getBoundingClientRect().right > limit ||
          (!clipped && el.scrollWidth > el.clientWidth + 1);
        if (spills) ids.push(el.dataset.lwNode!);
      });
      onOverflow(ids);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [model, edits, measureKey, tick, onOverflow]);

  const idFromEvent = (event: MouseEvent) =>
    (event.target as HTMLElement).closest<HTMLElement>('[data-lw-node]')
      ?.dataset.lwNode ?? null;

  const interactive = Boolean(onSelect);
  const selected = selectedId ? model.byId[selectedId] : null;

  return (
    <div
      ref={hostRef}
      style={{
        position: 'relative',
        ...(tokenVariables(model, edits) as CSSProperties),
      }}
      onClick={
        interactive
          ? (event) => {
              const id = idFromEvent(event);
              if (id) onSelect!(id);
            }
          : undefined
      }
      onMouseOver={
        interactive
          ? (event) => {
              const id = idFromEvent(event);
              const rect = id ? rectOf(id) : null;
              setHover(id && rect && id !== selectedId ? { id, rect } : null);
            }
          : undefined
      }
      onMouseLeave={interactive ? () => setHover(null) : undefined}
    >
      <style>{resetCss(ROOT_CLASS)}</style>
      <div className={ROOT_CLASS}>{renderNode(model.root, model, edits)}</div>
      {hover ? <Outline rect={hover.rect} hover /> : null}
      {selected && selectedRect ? (
        <Outline rect={selectedRect} label={selected.name} />
      ) : null}
    </div>
  );
}

function Outline({
  rect,
  label,
  hover,
}: {
  rect: Rect;
  label?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={hover ? 'lw-outline lw-outline--hover' : 'lw-outline'}
      aria-hidden='true'
      style={{
        transform: `translate(${rect.x}px, ${rect.y}px)`,
        width: rect.width,
        height: rect.height,
      }}
    >
      {label ? <span className='lw-outline__tag'>{label}</span> : null}
    </div>
  );
}
