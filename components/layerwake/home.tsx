'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { parsePx, px } from '@/lib/layerwake/css-values';
import { EMPTY_EDITS, type Edits } from '@/lib/layerwake/model';
import { loadDemo, loadFile, remember, WORKSPACE_PATH } from './capture-io';
import { ComponentRender } from './render';

const ACCENTS = [
  { name: 'Cobalt', value: '#164cff' },
  { name: 'Ink', value: '#0c1738' },
  { name: 'Kelp', value: '#0b7a5c' },
  { name: 'Coral', value: '#e2452b' },
];

export function HomeActions() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    const result = await loadFile(file);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    remember(result.text ?? '', result.loaded.label);
    router.push(WORKSPACE_PATH);
  };

  return (
    <>
      <div className='lw-hero__cta'>
        <Link
          href={`${WORKSPACE_PATH}?demo=1`}
          className='lw-btn lw-btn--primary lw-btn--lg'
        >
          Try demo
        </Link>
        <button
          type='button'
          className='lw-btn lw-btn--lg'
          onClick={() => input.current?.click()}
          disabled={busy}
        >
          {busy ? 'Reading…' : 'Import capture'}
        </button>
        <input
          ref={input}
          type='file'
          accept='.json,application/json'
          className='lw-sr'
          tabIndex={-1}
          aria-label='Choose a Layerwake capture file'
          onChange={(event) => {
            void onFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>
      {error ? (
        <div className='lw-alert' role='alert' style={{ marginTop: 16 }}>
          <div>
            <strong>That file was not imported</strong>
            {error}
          </div>
          <button
            type='button'
            className='lw-alert__close'
            aria-label='Dismiss'
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      ) : null}
      <p className='lw-hero__fine'>
        Runs entirely in your browser. No account, no upload, no API key.
      </p>
    </>
  );
}

/** A small live slice of the workspace, driven by the bundled demo capture. */
export function HomeSample() {
  const demo = useMemo(() => loadDemo(), []);
  const model = demo.ok ? demo.loaded.model : null;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Edits>(EMPTY_EDITS);

  if (!model) return null;

  const fallback =
    model.order.find((id) => model.byId[id].name === 'headline') ??
    model.root.id;
  const node = model.byId[selectedId ?? fallback] ?? model.root;
  const accent = model.tokens.find(
    (t) => t.group === 'color' && t.original === ACCENTS[0].value
  );
  const radius = model.tokens.find(
    (t) =>
      t.group === 'radius' && t.uses.some((u) => u.nodeId === model.root.id)
  );
  const set = (id: string, value: string) =>
    setEdits((current) => ({
      ...current,
      tokens: { ...current.tokens, [id]: value },
    }));

  const type = node.effective['font-size'];
  const facts: [string, string][] = [
    ['size', `${Math.round(node.box.width)} × ${Math.round(node.box.height)}`],
    ['pattern', node.layout.label.toLowerCase()],
  ];
  if (node.slot === 'text' && type) facts.push(['type', type]);
  if (node.measured['padding-top'])
    facts.push(['padding', node.measured['padding-top']]);
  if (node.measured['row-gap'] && node.measured['row-gap'] !== 'normal')
    facts.push(['gap', node.measured['row-gap']]);

  return (
    <div className='lw-sample' aria-label='Interactive sample'>
      <div className='lw-sample__bar'>
        <i aria-hidden='true' />
        <span>Live sample: select any layer</span>
      </div>
      <div className='lw-sample__body'>
        <div className='lw-sample__stage lw-dots'>
          <div style={{ width: model.root.box.width, maxWidth: '100%' }}>
            <ComponentRender
              model={model}
              edits={edits}
              selectedId={node.id}
              onSelect={setSelectedId}
            />
          </div>
        </div>
        <div className='lw-sample__side'>
          <div>
            <h3>Inspect</h3>
            <p className='lw-sample__name' aria-live='polite'>
              {node.name}
            </p>
            <dl className='lw-kv'>
              {facts.map(([term, value]) => (
                <div key={term} style={{ display: 'contents' }}>
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3>Rebuild</h3>
            {radius ? (
              <label style={{ display: 'block', marginTop: 6 }}>
                <span className='lw-field-label'>
                  Card radius{' '}
                  <span className='lw-mono'>
                    {edits.tokens[radius.id] ?? radius.original}
                  </span>
                </span>
                <input
                  type='range'
                  min={0}
                  max={40}
                  step={1}
                  style={{ width: '100%', accentColor: 'var(--lw-cobalt)' }}
                  value={
                    parsePx(edits.tokens[radius.id] ?? radius.original) ?? 0
                  }
                  onChange={(event) =>
                    set(radius.id, px(Number(event.target.value)))
                  }
                />
              </label>
            ) : null}
            {accent ? (
              <div style={{ marginTop: 8 }}>
                <span className='lw-field-label' id='lw-accent-label'>
                  Accent
                </span>
                <div
                  className='lw-swatches'
                  role='group'
                  aria-labelledby='lw-accent-label'
                  style={{ marginTop: 6 }}
                >
                  {ACCENTS.map(({ name, value }) => (
                    <button
                      key={value}
                      type='button'
                      aria-label={name}
                      title={name}
                      aria-pressed={
                        (edits.tokens[accent.id] ?? accent.original) === value
                      }
                      style={{ background: value }}
                      onClick={() => set(accent.id, value)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <Link
            className='lw-link'
            href={`${WORKSPACE_PATH}?demo=1`}
            style={{ marginTop: 'auto' }}
          >
            Open in the workspace →
          </Link>
        </div>
      </div>
    </div>
  );
}
