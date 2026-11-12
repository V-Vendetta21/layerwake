'use client';

import {
  Suspense,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  InteractIcon,
  ReplayIcon,
  ResetIcon,
} from '@/components/layerwake/icons';
import { CATALOG, CATEGORIES } from './catalog';
import { DEMOS, SOURCES } from './loaders.generated';
import type { CatalogEntry, MotionCategory, MotionSource } from './types';

type View = 'preview' | 'code';

const LABEL = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
) as Record<MotionCategory, string>;

function CopyButton({
  label,
  name,
  text,
  target,
}: {
  label: string;
  /** File name, used in the accessible name so every copy button is unique. */
  name: string;
  text: string;
  /** The code element to select if the clipboard is unavailable. */
  target: React.RefObject<HTMLElement | null>;
}) {
  const [state, setState] = useState<'idle' | 'copied' | 'manual'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = window.setTimeout(
      () => setState('idle'),
      state === 'copied' ? 2000 : 6000
    );
    return () => window.clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('unavailable');
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      // Clipboard blocked: select the code so it can be copied by hand.
      const el = target.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setState('manual');
    }
  };

  return (
    <>
      <button
        type='button'
        className='mgx-copy'
        data-state={state}
        aria-label={`${label}: ${name}`}
        onClick={copy}
      >
        {state === 'copied' ? 'Copied' : label}
      </button>
      <span className='lw-sr' role='status'>
        {state === 'copied'
          ? `${name} copied to the clipboard.`
          : state === 'manual'
            ? 'Clipboard blocked. The code is selected; press Ctrl or Command C.'
            : ''}
      </span>
      {state === 'manual' ? (
        <span className='mgx-copy__hint' aria-hidden='true'>
          Selected. Press Ctrl/⌘ C
        </span>
      ) : null}
    </>
  );
}

function CodeBlock({
  file,
  note,
  copyLabel,
  code,
}: {
  file: string;
  note: string;
  copyLabel: string;
  code: string;
}) {
  const ref = useRef<HTMLElement>(null);
  return (
    <section className='mgx-file' aria-label={file}>
      <div className='mgx-file__head'>
        <span className='mgx-file__name'>{file}</span>
        <span className='mgx-file__note'>{note}</span>
        <CopyButton label={copyLabel} name={file} text={code} target={ref} />
      </div>
      <pre className='mgx-code' tabIndex={0} aria-label={`${file} source`}>
        <code ref={ref}>{code}</code>
      </pre>
    </section>
  );
}

const COPY_LABEL = {
  component: 'Copy component',
  css: 'Copy CSS',
  helper: 'Copy helper',
};
const NOTE = {
  component: 'Component source',
  css: 'Required styles',
  helper: 'Required helper',
};

function CodePanel({ entry }: { entry: CatalogEntry }) {
  const [source, setSource] = useState<MotionSource | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    SOURCES[entry.slug]()
      .then((loaded) => live && setSource(loaded))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [entry.slug]);

  if (failed)
    return (
      <p className='mgx-loading' role='alert'>
        The source could not be loaded. Reload the page to try again.
      </p>
    );
  if (!source)
    return (
      <p className='mgx-loading' role='status'>
        Loading code…
      </p>
    );

  const helpers = source.files.filter((file) => file.kind === 'helper');
  return (
    <div className='mgx-codepanel'>
      <ol className='mgx-steps'>
        <li>
          Needs <strong>React 18 or newer</strong> and TypeScript. No other
          packages to install.
        </li>
        <li>
          Copy{' '}
          {source.files.length === 2 ? 'both' : `all ${source.files.length}`}{' '}
          files below into one folder:{' '}
          {source.files.map((file, index) => (
            <span key={file.name}>
              {index > 0 ? ', ' : ''}
              <code>{file.name}</code>
            </span>
          ))}
          . The component imports its own CSS
          {helpers.length ? ' and helpers' : ''}.
        </li>
        <li>
          Use it as the example shows. Restyle through the <code>--mg-*</code>{' '}
          custom properties in the CSS file.
        </li>
      </ol>
      <CodeBlock
        file='usage.tsx'
        note='The example running in Preview'
        copyLabel='Copy usage'
        code={source.usage}
      />
      {source.files.map((file) => (
        <CodeBlock
          key={file.name}
          file={file.name}
          note={NOTE[file.kind]}
          copyLabel={COPY_LABEL[file.kind]}
          code={file.code}
        />
      ))}
    </div>
  );
}

function Entry({ entry }: { entry: CatalogEntry }) {
  const [view, setView] = useState<View>('preview');
  const [run, setRun] = useState(0);
  const [inView, setInView] = useState(false);
  const card = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const id = useId();

  // Demos mount only while their card is on screen, so nothing animates or
  // loops out of sight, and each preview's code is fetched only then.
  useEffect(() => {
    const el = card.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([item]) => setInView(item.isIntersecting),
      { rootMargin: '80px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onTabKey = (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next: View =
      event.key === 'Home'
        ? 'preview'
        : event.key === 'End'
          ? 'code'
          : view === 'preview'
            ? 'code'
            : 'preview';
    setView(next);
    tabs.current?.querySelector<HTMLElement>(`[data-view="${next}"]`)?.focus();
  };

  const Demo = DEMOS[entry.slug];
  return (
    <article ref={card} id={entry.slug} className='mgx-entry' data-view={view}>
      <header className='mgx-entry__head'>
        <div>
          <h2>
            <a href={`#${entry.slug}`} title='Link to this component'>
              {entry.name}
              <span aria-hidden='true'> #</span>
            </a>
          </h2>
          <p>{entry.purpose}</p>
        </div>
        <span className='lw-chip'>{LABEL[entry.category]}</span>
      </header>

      <div className='mgx-tabbar'>
        <div
          ref={tabs}
          role='tablist'
          aria-label={`${entry.name} views`}
          className='mgx-tabs'
          onKeyDown={onTabKey}
        >
          {(['preview', 'code'] as const).map((name) => (
            <button
              key={name}
              type='button'
              role='tab'
              id={`${id}-tab-${name}`}
              data-view={name}
              aria-selected={view === name}
              aria-controls={`${id}-panel-${name}`}
              tabIndex={view === name ? 0 : -1}
              onClick={() => setView(name)}
            >
              {name === 'preview' ? 'Preview' : 'Code'}
            </button>
          ))}
        </div>
        {view === 'preview' ? (
          <button
            type='button'
            className='mgx-replay'
            onClick={() => setRun((n) => n + 1)}
            aria-label={`${entry.replays ? 'Replay' : 'Reset'} ${entry.name}`}
          >
            {entry.replays ? <ReplayIcon /> : <ResetIcon />}{' '}
            {entry.replays ? 'Replay' : 'Reset'}
          </button>
        ) : null}
      </div>

      <div
        role='tabpanel'
        id={`${id}-panel-preview`}
        aria-labelledby={`${id}-tab-preview`}
        hidden={view !== 'preview'}
        className='mgx-preview'
      >
        <div className='mgx-stage lw-dots'>
          {inView && view === 'preview' && Demo ? (
            <Suspense
              fallback={
                <span className='mgx-loading' role='status'>
                  Loading preview…
                </span>
              }
            >
              <Demo key={run} />
            </Suspense>
          ) : null}
        </div>
        <p className='mgx-cue'>
          <InteractIcon /> {entry.cue}
        </p>
      </div>
      <div
        role='tabpanel'
        id={`${id}-panel-code`}
        aria-labelledby={`${id}-tab-code`}
        hidden={view !== 'code'}
      >
        {view === 'code' ? <CodePanel entry={entry} /> : null}
      </div>
    </article>
  );
}

function matches(entry: CatalogEntry, words: string[]) {
  const haystack = [
    entry.name,
    entry.slug,
    entry.purpose,
    LABEL[entry.category],
    ...entry.keywords,
  ]
    .join(' ')
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}

export function MotionGallery() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MotionCategory | 'all'>('all');
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      CATEGORIES.map((item) => ({
        ...item,
        count: CATALOG.filter((entry) => entry.category === item.id).length,
      })).filter((item) => item.count > 0),
    []
  );

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return CATALOG.filter(
      (entry) =>
        (category === 'all' || entry.category === category) &&
        matches(entry, words)
    );
  }, [query, category]);

  // A deep link always lands on its component: if the current search or
  // filter hides it, the filters are cleared first.
  const shownRef = useRef(shown);
  shownRef.current = shown;
  useEffect(() => {
    const follow = () => {
      const slug = decodeURIComponent(window.location.hash.slice(1));
      if (!CATALOG.some((entry) => entry.slug === slug)) return;
      if (!shownRef.current.some((entry) => entry.slug === slug)) {
        setQuery('');
        setCategory('all');
      }
      setPendingScroll(slug);
    };
    window.addEventListener('hashchange', follow);
    if (window.location.hash) follow();
    return () => window.removeEventListener('hashchange', follow);
  }, []);

  useEffect(() => {
    if (!pendingScroll) return;
    document.getElementById(pendingScroll)?.scrollIntoView({ block: 'start' });
    setPendingScroll(null);
  }, [pendingScroll, shown]);

  const filtered = query !== '' || category !== 'all';
  const clear = () => {
    setQuery('');
    setCategory('all');
  };

  return (
    <>
      <div className='mgx-controls'>
        <label className='mgx-search'>
          <span className='lw-sr'>Search components</span>
          <input
            type='search'
            className='lw-input'
            placeholder={`Search ${CATALOG.length} components`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div
          className='mgx-filters'
          role='group'
          aria-label='Filter by category'
        >
          <button
            type='button'
            aria-pressed={category === 'all'}
            onClick={() => setCategory('all')}
          >
            All <span className='mgx-filters__n'>{CATALOG.length}</span>
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type='button'
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.label} <span className='mgx-filters__n'>{item.count}</span>
            </button>
          ))}
        </div>
        <p className='mgx-count' role='status'>
          Showing {shown.length} of {CATALOG.length}
          {filtered ? (
            <>
              {' · '}
              <button type='button' className='lw-link' onClick={clear}>
                Clear filters
              </button>
            </>
          ) : null}
        </p>
      </div>

      {shown.length === 0 ? (
        <div className='mgx-empty'>
          <h2>No components match</h2>
          <p>
            Nothing fits “{query}”
            {category !== 'all' ? ` in ${LABEL[category]}` : ''}. Try a shorter
            word such as “card”, “drag”, “menu” or “scroll”.
          </p>
          <button
            type='button'
            className='lw-btn lw-btn--primary'
            onClick={clear}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className='mgx-grid'>
          {shown.map((entry) => (
            <Entry key={entry.slug} entry={entry} />
          ))}
        </div>
      )}
    </>
  );
}
