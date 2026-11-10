'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';
import {
  isEdited,
  tokenValue,
  EMPTY_EDITS,
  type Edits,
  type Model,
  type ModelNode,
  type Token,
  type TokenGroup,
} from '@/lib/layerwake/model';

const GLYPH: Record<ModelNode['slot'], string> = {
  container: '▢',
  text: 'T',
  image: '▨',
  control: '▭',
};

export function LayerTree({
  model,
  selectedId,
  onSelect,
}: {
  model: Model;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const focusNext = useRef(false);

  useEffect(() => {
    if (focusNext.current) {
      focusNext.current = false;
      refs.current[selectedId]?.focus();
    }
  }, [selectedId]);

  const move = (id: string | null | undefined) => {
    if (!id) return;
    focusNext.current = true;
    onSelect(id);
  };

  const onKeyDown = (event: KeyboardEvent, node: ModelNode) => {
    const index = model.order.indexOf(node.id);
    const keys: Record<string, string | null | undefined> = {
      ArrowDown: model.order[index + 1],
      ArrowUp: model.order[index - 1],
      ArrowLeft: node.parentId,
      ArrowRight: node.children[0]?.id,
      Home: model.order[0],
      End: model.order[model.order.length - 1],
    };
    if (event.key in keys) {
      event.preventDefault();
      move(keys[event.key]);
    }
  };

  return (
    <div className='lw-tree' role='tree' aria-label='Component layers'>
      {model.order.map((id) => {
        const node = model.byId[id];
        const selected = id === selectedId;
        return (
          <button
            key={id}
            ref={(el) => {
              refs.current[id] = el;
            }}
            type='button'
            role='treeitem'
            aria-level={node.depth + 1}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className='lw-tree__row'
            style={{ paddingLeft: 6 + node.depth * 14 }}
            onClick={() => onSelect(id)}
            onKeyDown={(event) => onKeyDown(event, node)}
          >
            <span className='lw-tree__glyph' aria-hidden='true'>
              {GLYPH[node.slot]}
            </span>
            <span className='lw-tree__name'>{node.name}</span>
            {node.notes.length > 0 ? (
              <span className='lw-tree__flag' title='Simplified in the rebuild'>
                <span className='lw-sr'>, simplified in the rebuild</span>
              </span>
            ) : null}
            <span className='lw-tree__tag' aria-hidden='true'>
              {node.tag}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const GROUPS: { group: TokenGroup; title: string; empty: string }[] = [
  { group: 'color', title: 'Colors', empty: 'No colors were captured.' },
  {
    group: 'fontSize',
    title: 'Type sizes',
    empty: 'No text sizes were captured.',
  },
  {
    group: 'space',
    title: 'Spacing',
    empty: 'No padding or gaps were captured.',
  },
  {
    group: 'radius',
    title: 'Radii',
    empty: 'No rounded corners were captured.',
  },
  { group: 'shadow', title: 'Shadows', empty: 'No shadows were captured.' },
];

function TokenSample({ token, value }: { token: Token; value: string }) {
  if (token.group === 'color')
    return <span className='lw-token__swatch' style={{ background: value }} />;
  if (token.group === 'radius')
    return (
      <span
        className='lw-token__swatch'
        style={{
          borderRadius: `min(${value}, 8px)`,
          borderColor: 'var(--lw-ink)',
        }}
      />
    );
  if (token.group === 'shadow')
    return (
      <span
        className='lw-token__swatch'
        style={{
          boxShadow: '1px 2px 4px rgba(12,23,56,.45)',
          background: '#fff',
        }}
      />
    );
  return null;
}

export function TokenGroups({
  model,
  edits,
  selectedId,
  onSelect,
}: {
  model: Model;
  edits: Edits;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {GROUPS.map(({ group, title, empty }) => {
        const tokens = model.tokens.filter((t) => t.group === group);
        return (
          <section className='lw-section' key={group} aria-label={title}>
            <div className='lw-section__head'>
              <h3>{title}</h3>
              <span className='lw-count'>{tokens.length}</span>
            </div>
            {tokens.length === 0 ? (
              <p className='lw-muted'>{empty}</p>
            ) : (
              <div className='lw-tokens'>
                {tokens.map((token) => {
                  const value = tokenValue(token, edits);
                  const edited = isEdited(token, edits);
                  const layers = [...new Set(token.uses.map((u) => u.nodeId))];
                  const active = layers.includes(selectedId);
                  // Step through the layers that use this token.
                  const next =
                    layers[(layers.indexOf(selectedId) + 1) % layers.length];
                  return (
                    <button
                      key={token.id}
                      type='button'
                      className='lw-token'
                      data-active={active}
                      title={`Used by ${layers.length} layer${layers.length === 1 ? '' : 's'}. Select to jump to ${model.byId[next].name}.`}
                      onClick={() => onSelect(next)}
                    >
                      <TokenSample token={token} value={value} />
                      <span className='lw-token__name'>{token.name}</span>
                      {edited ? (
                        <span className='lw-token__dot'>
                          <span className='lw-sr'>edited</span>
                        </span>
                      ) : null}
                      <span className='lw-token__value'>
                        {edited ? (
                          <del>{tokenValue(token, EMPTY_EDITS)}</del>
                        ) : null}
                        {value}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
