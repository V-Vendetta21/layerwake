'use client';

import { useEffect, useId, useState } from 'react';
import {
  color as normalizeColor,
  parsePx,
  px,
} from '@/lib/layerwake/css-values';
import { MAX_TEXT_LENGTH } from '@/lib/layerwake/export';
import {
  EMPTY_EDITS,
  isEdited,
  nodeText,
  tokenValue,
  type Edits,
  type Model,
  type ModelNode,
  type Token,
} from '@/lib/layerwake/model';

export interface InspectorProps {
  model: Model;
  node: ModelNode;
  edits: Edits;
  onToken: (tokenId: string, value: string | null) => void;
  onText: (nodeId: string, value: string | null) => void;
}

const layersUsing = (token: Token) =>
  new Set(token.uses.map((u) => u.nodeId)).size;

function ControlShell({
  label,
  token,
  edits,
  onReset,
  message,
  children,
}: {
  label: string;
  token: Token;
  edits: Edits;
  onReset: () => void;
  message: { tone: 'info' | 'error'; text: string } | null;
  children: React.ReactNode;
}) {
  const edited = isEdited(token, edits);
  const shared = layersUsing(token);
  return (
    <div className='lw-control'>
      <div className='lw-control__head'>
        <span className='lw-control__label'>{label}</span>
        <span className='lw-control__token'>{token.name}</span>
        {edited ? (
          <button
            type='button'
            className='lw-btn lw-btn--sm'
            onClick={onReset}
            aria-label={`Reset ${label} to the measured value`}
          >
            Reset
          </button>
        ) : null}
      </div>
      {children}
      <p
        className='lw-control__foot'
        data-tone={message?.tone}
        role={message?.tone === 'error' ? 'alert' : undefined}
      >
        {message
          ? message.text
          : `Measured ${tokenValue(token, EMPTY_EDITS)}${
              shared > 1 ? ` · shared by ${shared} layers` : ''
            }`}
      </p>
    </div>
  );
}

function NumberControl({
  label,
  token,
  edits,
  onToken,
}: {
  label: string;
  token: Token;
  edits: Edits;
  onToken: InspectorProps['onToken'];
}) {
  const id = useId();
  const min = token.min ?? 0;
  const max = token.max ?? 96;
  const current = parsePx(edits.tokens[token.id] ?? token.original) ?? 0;
  const [draft, setDraft] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    tone: 'info' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    setDraft(null);
    setMessage(null);
  }, [token.id]);

  const commit = (raw: string) => {
    const n = Number(raw);
    if (raw.trim() === '' || !Number.isFinite(n)) {
      setMessage({
        tone: 'error',
        text: `Enter a number from ${min} to ${max}.`,
      });
      return;
    }
    const clamped = Math.min(max, Math.max(min, Math.round(n * 100) / 100));
    setMessage(
      clamped !== n
        ? { tone: 'info', text: `Kept within ${min}–${max} px.` }
        : null
    );
    onToken(token.id, px(clamped));
  };

  return (
    <ControlShell
      label={label}
      token={token}
      edits={edits}
      message={message}
      onReset={() => {
        setDraft(null);
        setMessage(null);
        onToken(token.id, null);
      }}
    >
      <div className='lw-control__row'>
        <input
          type='range'
          aria-label={`${label}, ${min} to ${max} pixels`}
          min={min}
          max={max}
          step={1}
          value={current}
          onChange={(event) => {
            setDraft(null);
            commit(event.target.value);
          }}
        />
        <input
          id={id}
          type='number'
          className='lw-input lw-input--num'
          aria-label={`${label} in pixels`}
          aria-invalid={message?.tone === 'error'}
          min={min}
          max={max}
          step={1}
          value={draft ?? String(current)}
          onChange={(event) => {
            setDraft(event.target.value);
            commit(event.target.value);
          }}
          onBlur={() => {
            setDraft(null);
            setMessage((m) => (m?.tone === 'error' ? null : m));
          }}
        />
        <span className='lw-unit' aria-hidden='true'>
          px
        </span>
      </div>
    </ControlShell>
  );
}

function ColorControl({
  label,
  token,
  edits,
  onToken,
}: {
  label: string;
  token: Token;
  edits: Edits;
  onToken: InspectorProps['onToken'];
}) {
  const current = edits.tokens[token.id] ?? token.original;
  const alpha = current.length === 9 ? current.slice(7) : '';
  const [draft, setDraft] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    tone: 'info' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    setDraft(null);
    setMessage(null);
  }, [token.id]);

  return (
    <ControlShell
      label={label}
      token={token}
      edits={edits}
      message={
        message ??
        (alpha
          ? {
              tone: 'info',
              text: `Measured ${tokenValue(token, EMPTY_EDITS)} · ${Math.round((parseInt(alpha, 16) / 255) * 100)}% opacity is kept`,
            }
          : null)
      }
      onReset={() => {
        setDraft(null);
        setMessage(null);
        onToken(token.id, null);
      }}
    >
      <div className='lw-control__row'>
        <input
          type='color'
          className='lw-color'
          aria-label={`${label} color picker`}
          value={current.slice(0, 7)}
          onChange={(event) => {
            setDraft(null);
            setMessage(null);
            onToken(token.id, `${event.target.value.toLowerCase()}${alpha}`);
          }}
        />
        <input
          type='text'
          className='lw-input lw-input--hex'
          aria-label={`${label} hex value`}
          aria-invalid={message?.tone === 'error'}
          spellCheck={false}
          maxLength={9}
          value={draft ?? current}
          onChange={(event) => {
            const raw = event.target.value.trim();
            setDraft(event.target.value);
            const next = /^#/.test(raw) ? normalizeColor(raw) : null;
            if (next) {
              setMessage(null);
              onToken(token.id, next);
            } else {
              setMessage({
                tone: 'error',
                text: 'Use a hex color such as #164CFF.',
              });
            }
          }}
          onBlur={() => {
            setDraft(null);
            setMessage(null);
          }}
        />
      </div>
    </ControlShell>
  );
}

const COLOR_ROLE: Record<string, string> = {
  color: 'Text',
  'background-color': 'Fill',
};

const sideLabel = (props: string[], all: number, noun: string) => {
  const parts = [...new Set(props)].map((p) =>
    p
      .replace(/^(padding|border)-/, '')
      .replace(/-radius$/, '')
      .replace('-', ' ')
  );
  return parts.length >= all ? noun : `${noun} · ${parts.join(', ')}`;
};

/** The token an inherited property resolves to, walking up the captured tree. */
function inheritedToken(
  model: Model,
  node: ModelNode,
  prop: string
): { token: Token; from: ModelNode } | null {
  let current: ModelNode | null = node;
  while (current) {
    const decl = current.decls.find((d) => d.prop === prop);
    const part = decl?.parts.find((p) => typeof p !== 'string');
    if (part && typeof part !== 'string')
      return { token: model.tokenById[part.token], from: current };
    current = current.parentId ? model.byId[current.parentId] : null;
  }
  return null;
}

const hasText = (node: ModelNode): boolean =>
  node.slot === 'text' || node.children.some(hasText);

function Missing({ children }: { children: React.ReactNode }) {
  return <p className='lw-muted'>{children}</p>;
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='lw-section' aria-label={title}>
      <div className='lw-section__head'>
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function Inspector({
  model,
  node,
  edits,
  onToken,
  onText,
}: InspectorProps) {
  const m = node.measured;
  const own = (prop: string) =>
    model.tokens
      .map((token) => ({
        token,
        props: token.uses
          .filter((u) => u.nodeId === node.id)
          .map((u) => u.prop),
      }))
      .filter((entry) => entry.props.some((p) => p.startsWith(prop)));

  /* palette */
  const colors = model.tokens
    .filter((t) => t.group === 'color')
    .map((token) => ({
      token,
      props: token.uses.filter((u) => u.nodeId === node.id).map((u) => u.prop),
    }))
    .filter((entry) => entry.props.length > 0)
    .map(({ token, props }) => ({
      token,
      label: [...new Set(props.map((p) => COLOR_ROLE[p] ?? 'Border'))].join(
        ' + '
      ),
    }));
  const textual = hasText(node);
  if (textual && !colors.some((c) => c.label.includes('Text'))) {
    const inherited = inheritedToken(model, node, 'color');
    if (inherited && !colors.some((c) => c.token.id === inherited.token.id))
      colors.unshift({
        token: inherited.token,
        label: `Text · from ${inherited.from.name}`,
      });
  }

  const fontSize = textual ? inheritedToken(model, node, 'font-size') : null;
  const gaps = own('row-gap').concat(
    own('column-gap').filter(
      (g) => !own('row-gap').some((r) => r.token.id === g.token.id)
    )
  );
  const paddings = own('padding-');
  const radii = model.tokens
    .filter((t) => t.group === 'radius')
    .map((token) => ({
      token,
      props: token.uses.filter((u) => u.nodeId === node.id).map((u) => u.prop),
    }))
    .filter((entry) => entry.props.length > 0);
  const isFlexOrGrid = ['row', 'column', 'grid'].includes(node.layout.kind);
  const rawRadius = m['border-top-left-radius'];

  /* measured rows */
  const family = node.effective['font-family']
    ?.split(',')[0]
    .replace(/["']/g, '');
  const inheritedNote = (prop: string) =>
    m[prop] === undefined ? ' (inherited)' : '';
  const rows: [string, string | null][] = [
    ['Size', `${node.box.width} × ${node.box.height} px`],
    [
      'Offset',
      node.parentId ? `${node.box.x}, ${node.box.y} px from root` : null,
    ],
    ['Display', m.display ?? null],
  ];
  if (m.position) rows.push(['Position', m.position]);
  if (isFlexOrGrid) {
    rows.push(['Justify', m['justify-content'] ?? null]);
    rows.push(['Align', m['align-items'] ?? null]);
  }
  if (m['flex-grow'] !== undefined)
    rows.push([
      'Flex item',
      `${m['flex-grow']} ${m['flex-shrink'] ?? '1'} ${m['flex-basis'] ?? 'auto'}`,
    ]);
  if (textual) {
    rows.push(['Font', family ? family + inheritedNote('font-family') : null]);
    rows.push([
      'Weight',
      node.effective['font-weight']
        ? node.effective['font-weight'] + inheritedNote('font-weight')
        : null,
    ]);
    rows.push([
      'Line height',
      node.effective['line-height']
        ? node.effective['line-height'] + inheritedNote('line-height')
        : null,
    ]);
    if (
      node.effective['letter-spacing'] &&
      node.effective['letter-spacing'] !== 'normal'
    )
      rows.push([
        'Tracking',
        node.effective['letter-spacing'] + inheritedNote('letter-spacing'),
      ]);
  }
  rows.push(['Shadow', m['box-shadow'] ?? 'none']);
  if (m.opacity) rows.push(['Opacity', m.opacity]);

  const captured = Object.entries(m);

  const missing: string[] = [];
  if (colors.length === 0)
    missing.push('Palette: no color was captured on this layer.');
  if (!fontSize)
    missing.push(
      `Type size: ${textual ? 'not captured.' : 'this layer has no text.'}`
    );
  if (gaps.length === 0)
    missing.push(
      `Gap: ${isFlexOrGrid ? 'none was measured (0).' : 'not a flex or grid container.'}`
    );
  if (paddings.length === 0) missing.push('Padding: none was measured (0).');
  if (radii.length === 0)
    missing.push(
      `Corner radius: ${
        rawRadius
          ? `${rawRadius} is kept as measured; only px radii are editable.`
          : 'none was measured (0).'
      }`
    );

  return (
    <>
      <section className='lw-section' aria-label='Selected layer'>
        <div className='lw-insp__title'>
          <h2>{node.name}</h2>
          <span
            className='lw-chip lw-chip--inferred'
            title='Layerwake chose this name from the layer’s role. It was not read from the page.'
          >
            Inferred name
          </span>
        </div>
        <p className='lw-insp__meta'>
          &lt;{node.tag}&gt; · {node.slot} slot
          {node.sourceTag !== node.tag && node.sourceTag !== '#text'
            ? ` · captured as <${node.sourceTag}>`
            : ''}
        </p>
      </section>

      <section className='lw-section' aria-label='Rebuild controls'>
        <div className='lw-section__head'>
          <h3>Rebuild</h3>
          <span className='lw-chip lw-chip--edited'>Editable</span>
        </div>

        {node.slot === 'text' ? (
          <div className='lw-control'>
            <div className='lw-control__head'>
              <label className='lw-control__label' htmlFor={`text-${node.id}`}>
                Placeholder text
              </label>
            </div>
            <input
              id={`text-${node.id}`}
              type='text'
              className='lw-input lw-input--wide'
              maxLength={MAX_TEXT_LENGTH}
              value={nodeText(node, edits)}
              onChange={(event) => onText(node.id, event.target.value)}
            />
            <p className='lw-control__foot'>
              Generic stand-in. The original was {node.textLength} characters;
              its wording was never captured.
            </p>
          </div>
        ) : null}

        {colors.map(({ token, label }) => (
          <ColorControl
            key={token.id}
            label={label}
            token={token}
            edits={edits}
            onToken={onToken}
          />
        ))}
        {fontSize ? (
          <NumberControl
            label={
              fontSize.from.id === node.id
                ? 'Type size'
                : `Type size · from ${fontSize.from.name}`
            }
            token={fontSize.token}
            edits={edits}
            onToken={onToken}
          />
        ) : null}
        {gaps.map(({ token, props }) => (
          <NumberControl
            key={token.id}
            label={
              gaps.length > 1
                ? props.includes('row-gap')
                  ? 'Row gap'
                  : 'Column gap'
                : 'Gap'
            }
            token={token}
            edits={edits}
            onToken={onToken}
          />
        ))}
        {paddings.map(({ token, props }) => (
          <NumberControl
            key={token.id}
            label={sideLabel(
              props.filter((p) => p.startsWith('padding-')),
              4,
              'Padding'
            )}
            token={token}
            edits={edits}
            onToken={onToken}
          />
        ))}
        {radii.map(({ token, props }) => (
          <NumberControl
            key={token.id}
            label={sideLabel(props, 4, 'Corner radius')}
            token={token}
            edits={edits}
            onToken={onToken}
          />
        ))}

        {missing.length > 0 ? (
          <div className='lw-control'>
            {missing.map((text) => (
              <Missing key={text}>{text}</Missing>
            ))}
          </div>
        ) : null}
      </section>

      {node.notes.length > 0 ? (
        <Group title='Rebuild limits'>
          <ul className='lw-notes'>
            {node.notes.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </Group>
      ) : null}

      <section className='lw-section' aria-label='Measured values'>
        <div className='lw-section__head'>
          <h3>From the capture</h3>
          <span className='lw-chip lw-chip--measured'>Measured</span>
        </div>
        <dl className='lw-rows'>
          {rows.map(([term, value]) => (
            <Row key={term} term={term} value={value} />
          ))}
        </dl>
      </section>

      <section className='lw-section' aria-label='Inferred groupings'>
        <div className='lw-section__head'>
          <h3>Layerwake’s reading</h3>
          <span className='lw-chip lw-chip--inferred'>Inferred</span>
        </div>
        <dl className='lw-rows'>
          <Row
            term='Pattern'
            value={`${node.layout.label}${node.layout.detail ? ` · ${node.layout.detail}` : ''}`}
          />
          <Row term='Role' value={node.name.replace(/-\d+$/, '')} />
          <Row
            term='Children'
            value={
              node.slot === 'container' ? String(node.children.length) : null
            }
            missing='not applicable'
          />
        </dl>
      </section>

      <section className='lw-section'>
        <details className='lw-details'>
          <summary>
            All captured values
            <span className='lw-count'>{captured.length}</span>
          </summary>
          {captured.length === 0 ? (
            <p className='lw-muted' style={{ marginTop: 8 }}>
              No styles were recorded for this layer. It inherits everything
              from its parent.
            </p>
          ) : (
            <dl className='lw-rows'>
              {captured.map(([prop, value]) => (
                <Row key={prop} term={prop} value={value} />
              ))}
            </dl>
          )}
          {node.omitted.length > 0 ? (
            <p className='lw-muted' style={{ marginTop: 8 }}>
              Left out on purpose: {node.omitted.join(', ')}.
            </p>
          ) : null}
        </details>
      </section>
    </>
  );
}

function Row({
  term,
  value,
  missing = 'not captured',
}: {
  term: string;
  value: string | null;
  missing?: string;
}) {
  return (
    <>
      <dt>{term}</dt>
      <dd data-missing={value === null}>{value ?? missing}</dd>
    </>
  );
}
