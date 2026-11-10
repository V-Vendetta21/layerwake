'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from 'react';
import { DEFAULT_NAME } from '@/lib/layerwake/export';
import { countNodes, EMPTY_EDITS, type Edits } from '@/lib/layerwake/model';
import { formatBytes } from '@/lib/layerwake/validate';
import {
  DEMO_NAME,
  forget,
  loadDemo,
  loadFile,
  recall,
  remember,
  WORKSPACE_PATH,
  type Loaded,
  type LoadResult,
} from './capture-io';
import { ExportPanel, type Status } from './export-panel';
import { Inspector } from './inspector';
import { LayerwakeBrand } from './logo';
import { LayerTree, TokenGroups } from './panels';
import { ComponentRender } from './render';

type Panel = 'layers' | 'preview' | 'inspect' | 'export';
type WidthMode = 'captured' | 'compact' | 'fill';

const PANELS: { id: Panel; label: string }[] = [
  { id: 'layers', label: 'Layers' },
  { id: 'preview', label: 'Preview' },
  { id: 'inspect', label: 'Inspect' },
  { id: 'export', label: 'Export' },
];

const hasFiles = (event: DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files');

export function Workspace() {
  const [booted, setBooted] = useState(false);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ tone: 'idle', text: '' });
  const [selectedId, setSelectedId] = useState('n1');
  const [edits, setEdits] = useState<Edits>(EMPTY_EDITS);
  const [name, setName] = useState(DEFAULT_NAME);
  const [panel, setPanel] = useState<Panel>('preview');
  const [dragDepth, setDragDepth] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const apply = useCallback((result: LoadResult, announce = true) => {
    if (!result.ok) {
      setError(result.error);
      setStatus({ tone: 'error', text: `Import failed. ${result.error}` });
      return;
    }
    const { loaded: next } = result;
    setLoaded(next);
    setError(null);
    setEdits(EMPTY_EDITS);
    setSelectedId(next.model.root.id);
    setName(next.source === 'demo' ? DEMO_NAME : DEFAULT_NAME);
    setPanel('preview');
    if (next.source === 'import' && result.text)
      remember(result.text, next.label);
    if (next.source === 'demo') forget();
    window.history.replaceState(
      null,
      '',
      next.source === 'demo' ? `${WORKSPACE_PATH}?demo=1` : WORKSPACE_PATH
    );
    if (announce)
      setStatus({
        tone: 'success',
        text: `${next.source === 'demo' ? 'Demo loaded' : `Imported ${next.label}`}: ${countNodes(next.model)} layers and ${next.model.tokens.length} tokens.`,
      });
  }, []);

  useEffect(() => {
    const wantsDemo = new URLSearchParams(window.location.search).has('demo');
    const saved = wantsDemo ? null : recall();
    if (wantsDemo) apply(loadDemo());
    else if (saved?.ok) apply(saved);
    setBooted(true);
  }, [apply]);

  const importFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      setStatus({ tone: 'idle', text: `Reading ${file.name}…` });
      apply(await loadFile(file));
    },
    [apply]
  );

  const openPicker = () => fileInput.current?.click();

  const setToken = useCallback(
    (tokenId: string, value: string | null) =>
      setEdits((current) => {
        const tokens = { ...current.tokens };
        const original = loaded?.model.tokenById[tokenId]?.original;
        if (value === null || value === original) delete tokens[tokenId];
        else tokens[tokenId] = value;
        return { ...current, tokens };
      }),
    [loaded]
  );

  const setText = useCallback(
    (nodeId: string, value: string | null) =>
      setEdits((current) => {
        const text = { ...current.text };
        if (value === null || value === loaded?.model.byId[nodeId]?.placeholder)
          delete text[nodeId];
        else text[nodeId] = value;
        return { ...current, text };
      }),
    [loaded]
  );

  const editCount =
    Object.keys(edits.tokens).length + Object.keys(edits.text).length;

  const reset = () => {
    setEdits(EMPTY_EDITS);
    setStatus({
      tone: 'success',
      text: 'Changes reset. The preview shows the measured values again.',
    });
  };

  const dropHandlers = {
    onDragEnter: (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      setDragDepth((d) => d + 1);
    },
    onDragOver: (event: DragEvent) => {
      if (hasFiles(event)) event.preventDefault();
    },
    onDragLeave: (event: DragEvent) => {
      if (hasFiles(event)) setDragDepth((d) => Math.max(0, d - 1));
    },
    onDrop: (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      setDragDepth(0);
      void importFiles(event.dataTransfer.files);
    },
  };

  const model = loaded?.model;
  const node = model ? (model.byId[selectedId] ?? model.root) : null;

  return (
    <div className='lw-ws' {...dropHandlers}>
      <input
        ref={fileInput}
        type='file'
        accept='.json,application/json'
        className='lw-sr'
        tabIndex={-1}
        aria-label='Choose a Layerwake capture file'
        onChange={(event) => {
          void importFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <header className='lw-top'>
        <Link href='/layerwake' aria-label='Layerwake home'>
          <LayerwakeBrand size={22} />
        </Link>
        {loaded ? (
          <div className='lw-top__source'>
            <span className='lw-chip'>
              {loaded.source === 'demo' ? 'Demo' : 'Import'}
            </span>
            <span>{loaded.label}</span>
          </div>
        ) : null}
        <div className='lw-top__actions'>
          {loaded ? (
            <button
              type='button'
              className='lw-btn'
              onClick={reset}
              disabled={editCount === 0}
            >
              Reset changes{editCount > 0 ? ` (${editCount})` : ''}
            </button>
          ) : null}
          <button type='button' className='lw-btn' onClick={openPicker}>
            Import capture
          </button>
        </div>
      </header>

      <div
        className='lw-status'
        role='status'
        aria-live='polite'
        data-tone={status.tone}
      >
        <i aria-hidden='true' />
        <span>
          {status.text ||
            (loaded
              ? 'Select a layer to inspect it. Captures stay in this browser tab.'
              : 'Nothing loaded yet.')}
        </span>
      </div>

      {!booted ? (
        <div className='lw-empty lw-dots' aria-busy='true' />
      ) : !model || !node ? (
        <EmptyState
          error={error}
          onImport={openPicker}
          onDemo={() => apply(loadDemo())}
        />
      ) : (
        <>
          <div
            className='lw-mobile-tabs'
            role='tablist'
            aria-label='Workspace panels'
          >
            {PANELS.map(({ id, label }) => (
              <button
                key={id}
                type='button'
                role='tab'
                aria-selected={panel === id}
                onClick={() => setPanel(id)}
              >
                {label}
              </button>
            ))}
          </div>

          {error ? (
            <div className='lw-alert' role='alert' style={{ margin: 12 }}>
              <div>
                <strong>That file was not imported</strong>
                {error} The current component is unchanged.
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

          <div className='lw-cols'>
            <aside
              className='lw-col lw-col--left'
              data-mobile-active={panel === 'layers'}
              aria-label='Layers and tokens'
            >
              <section className='lw-section'>
                <div className='lw-section__head'>
                  <h2>Layers</h2>
                  <span className='lw-count'>{countNodes(model)}</span>
                </div>
                <LayerTree
                  model={model}
                  selectedId={node.id}
                  onSelect={setSelectedId}
                />
              </section>
              <section className='lw-section'>
                <div className='lw-section__head'>
                  <h2>Tokens</h2>
                  <span
                    className='lw-chip lw-chip--inferred'
                    title='Values are measured. Grouping them into named tokens is Layerwake’s inference.'
                  >
                    Inferred grouping
                  </span>
                </div>
                <p className='lw-muted'>
                  Repeated measured values, grouped and named by Layerwake.
                  Select one to jump to a layer that uses it.
                </p>
              </section>
              <TokenGroups
                model={model}
                edits={edits}
                selectedId={node.id}
                onSelect={setSelectedId}
              />
            </aside>

            <main
              className='lw-col'
              data-mobile-active={panel === 'preview' || panel === 'export'}
            >
              <div className='lw-center-bar lw-center-tabs'>
                <div className='lw-seg' role='tablist' aria-label='Center view'>
                  <button
                    type='button'
                    role='tab'
                    aria-selected={panel !== 'export'}
                    onClick={() => setPanel('preview')}
                  >
                    Preview
                  </button>
                  <button
                    type='button'
                    role='tab'
                    aria-selected={panel === 'export'}
                    onClick={() => setPanel('export')}
                  >
                    Export
                  </button>
                </div>
              </div>
              {panel === 'export' ? (
                <ExportPanel
                  model={model}
                  edits={edits}
                  name={name}
                  onName={setName}
                  onStatus={setStatus}
                />
              ) : (
                <Preview
                  loaded={loaded!}
                  edits={edits}
                  selectedId={node.id}
                  onSelect={setSelectedId}
                />
              )}
            </main>

            <aside
              className='lw-col lw-col--right'
              data-mobile-active={panel === 'inspect'}
              aria-label='Inspector'
            >
              <Inspector
                model={model}
                node={node}
                edits={edits}
                onToken={setToken}
                onText={setText}
              />
            </aside>
          </div>
        </>
      )}

      {dragDepth > 0 ? (
        <div className='lw-dropping'>Drop the capture file to import it</div>
      ) : null}
    </div>
  );
}

function EmptyState({
  error,
  onImport,
  onDemo,
}: {
  error: string | null;
  onImport: () => void;
  onDemo: () => void;
}) {
  return (
    <div className='lw-empty lw-dots'>
      <div className='lw-drop'>
        <h1>Bring in a component</h1>
        <p>
          Drop a Layerwake JSON capture anywhere on this page, choose a file, or
          start with the built-in demo. Files are read in your browser and never
          uploaded.
        </p>
        <div className='lw-drop__actions'>
          <button
            type='button'
            className='lw-btn lw-btn--primary lw-btn--lg'
            onClick={onDemo}
          >
            Try demo
          </button>
          <button
            type='button'
            className='lw-btn lw-btn--lg'
            onClick={onImport}
          >
            Import capture
          </button>
        </div>
        {error ? (
          <div className='lw-alert' role='alert'>
            <div>
              <strong>That file was not imported</strong>
              {error}
            </div>
          </div>
        ) : null}
        <p style={{ marginTop: 20, fontSize: 13 }}>
          No capture yet? Open the{' '}
          <Link className='lw-link' href='/layerwake/demo'>
            demo page
          </Link>{' '}
          and capture its card with the extension.
        </p>
      </div>
    </div>
  );
}

function Preview({
  loaded,
  edits,
  selectedId,
  onSelect,
}: {
  loaded: Loaded;
  edits: Edits;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { model, capture } = loaded;
  const [mode, setMode] = useState<WidthMode>('captured');
  const [showOriginal, setShowOriginal] = useState(false);
  const [overflow, setOverflow] = useState<string[]>([]);

  const capturedWidth = Math.round(model.root.box.width);
  const compactWidth =
    capturedWidth > 260 ? 240 : Math.max(120, Math.round(capturedWidth * 0.6));
  const width =
    mode === 'captured'
      ? capturedWidth
      : mode === 'compact'
        ? compactWidth
        : null;

  const onOverflow = useCallback(
    (ids: string[]) =>
      setOverflow((current) => (current.join() === ids.join() ? current : ids)),
    []
  );

  // Report the innermost layers only: a parent overflows because a child does.
  const culprits = useMemo(
    () =>
      overflow.filter(
        (id) => !model.byId[id]?.children.some((c) => overflow.includes(c.id))
      ),
    [overflow, model]
  );

  const shownEdits = showOriginal ? EMPTY_EDITS : edits;
  const { truncation } = capture;
  const trimmed = truncation.depth || truncation.nodes || truncation.bytes;
  const limits = [
    truncation.nodes && `${capture.limits.maxNodes}-layer limit`,
    truncation.depth && `${capture.limits.maxDepth}-level depth limit`,
    truncation.bytes && `${formatBytes(capture.limits.maxBytes)} file limit`,
  ].filter(Boolean);
  const widthLabel = width ? `${width}px` : 'the full panel width';

  const modes: { id: WidthMode; label: string }[] = [
    { id: 'captured', label: `Captured ${capturedWidth}px` },
    { id: 'compact', label: `Compact ${compactWidth}px` },
    { id: 'fill', label: 'Fill' },
  ];

  return (
    <>
      <div className='lw-center-bar'>
        <div className='lw-group'>
          <span className='lw-field-label' id='lw-width-label'>
            Rebuild width test
          </span>
          <div className='lw-seg' role='group' aria-labelledby='lw-width-label'>
            {modes.map(({ id, label }) => (
              <button
                key={id}
                type='button'
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className='lw-group'>
          <span className='lw-field-label' id='lw-compare-label'>
            Compare
          </span>
          <div
            className='lw-seg'
            role='group'
            aria-labelledby='lw-compare-label'
          >
            <button
              type='button'
              aria-pressed={!showOriginal}
              onClick={() => setShowOriginal(false)}
            >
              Your edits
            </button>
            <button
              type='button'
              aria-pressed={showOriginal}
              onClick={() => setShowOriginal(true)}
            >
              As measured
            </button>
          </div>
        </div>
      </div>

      <div className='lw-stage lw-dots'>
        <div
          className='lw-frame'
          data-bounded={mode !== 'fill'}
          style={{ width: width ?? '100%', maxWidth: width ? undefined : 960 }}
        >
          <div className='lw-frame__ruler' aria-hidden='true'>
            {width ? `${width}px` : 'fill'}
          </div>
          <ComponentRender
            model={model}
            edits={shownEdits}
            selectedId={selectedId}
            onSelect={onSelect}
            onOverflow={onOverflow}
            measureKey={mode}
          />
        </div>
      </div>

      <div className='lw-checks' aria-label='Rebuild checks'>
        <div className='lw-check'>
          <span className='lw-muted'>
            One capture describes one viewport ({capture.viewport.width} ×{' '}
            {capture.viewport.height}px). Resizing here tests your rebuilt
            component with placeholder content. It does not show how the source
            page responds.
          </span>
        </div>
        {culprits.length > 0 ? (
          <div className='lw-check' data-tone='warn' role='status'>
            <span className='lw-check__mark' aria-hidden='true'>
              !
            </span>
            <span>
              Overflow at {widthLabel}: content spills out of{' '}
              {culprits.slice(0, 4).map((id, index) => (
                <span key={id}>
                  {index > 0 ? ', ' : ''}
                  <button type='button' onClick={() => onSelect(id)}>
                    {model.byId[id].name}
                  </button>
                </span>
              ))}
              {culprits.length > 4 ? ` and ${culprits.length - 4} more` : ''}.
              Try a smaller type size, gap or padding.
            </span>
          </div>
        ) : (
          <div className='lw-check' role='status'>
            <span className='lw-check__mark' aria-hidden='true'>
              ✓
            </span>
            <span>No overflow at {widthLabel}.</span>
          </div>
        )}
        {trimmed ? (
          <div className='lw-check' data-tone='warn'>
            <span className='lw-check__mark' aria-hidden='true'>
              !
            </span>
            <span>
              This capture was trimmed to fit the {limits.join(' and ')}.{' '}
              {truncation.omittedNodes} layer
              {truncation.omittedNodes === 1 ? ' is' : 's are'} missing from the
              tree and the rebuild.
            </span>
          </div>
        ) : null}
        {truncation.inaccessibleFrames > 0 ? (
          <div className='lw-check' data-tone='warn'>
            <span className='lw-check__mark' aria-hidden='true'>
              !
            </span>
            <span>
              {truncation.inaccessibleFrames} embedded frame
              {truncation.inaccessibleFrames === 1 ? '' : 's'} could not be read
              and {truncation.inaccessibleFrames === 1 ? 'is' : 'are'} shown as
              an empty slot.
            </span>
          </div>
        ) : null}
        {loaded.warnings.map((warning) => (
          <div className='lw-check' data-tone='warn' key={warning}>
            <span className='lw-check__mark' aria-hidden='true'>
              !
            </span>
            <span>{warning}</span>
          </div>
        ))}
        {model.notes.length > 0 ? (
          <div className='lw-check' data-tone='warn'>
            <span className='lw-check__mark' aria-hidden='true'>
              !
            </span>
            <div>
              Simplified preview: {model.notes.length} thing
              {model.notes.length === 1 ? '' : 's'} could not be rebuilt
              exactly.
              <ul>
                {model.notes.slice(0, 6).map((note, index) => (
                  <li key={index}>
                    <button type='button' onClick={() => onSelect(note.nodeId)}>
                      {model.byId[note.nodeId].name}
                    </button>{' '}
                    {note.text}
                  </li>
                ))}
              </ul>
              {model.notes.length > 6
                ? `…and ${model.notes.length - 6} more, marked in the layer tree.`
                : null}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
