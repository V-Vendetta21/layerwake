'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  CATEGORIES,
  ENTRIES,
  SOURCES,
  type MotionCategory,
  type MotionEntry,
} from './registry';

type View = 'preview' | 'code';

function CopyButton({
  label,
  text,
  target,
}: {
  label: string;
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
        onClick={copy}
      >
        {state === 'copied' ? 'Copied' : label}
      </button>
      <span className='lw-sr' role='status'>
        {state === 'copied'
          ? `${label}: copied to the clipboard.`
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
        <CopyButton label={copyLabel} text={code} target={ref} />
      </div>
      <pre className='mgx-code' tabIndex={0} aria-label={`${file} source`}>
        <code ref={ref}>{code}</code>
      </pre>
    </section>
  );
}

function CodePanel({ entry }: { entry: MotionEntry }) {
  const source = SOURCES[entry.slug];
  return (
    <div className='mgx-codepanel'>
      <ol className='mgx-steps'>
        <li>
          Needs <strong>React 18 or newer</strong>. No other packages to
          install.
        </li>
        <li>
          Copy <code>{entry.slug}.tsx</code> and <code>{entry.slug}.css</code>{' '}
          into the same folder. The component imports its own CSS.
        </li>
        <li>
          Import it as the usage example shows. Colors can be changed with the{' '}
          <code>--mg-*</code> custom properties in the CSS file.
        </li>
      </ol>
      <CodeBlock
        file='usage.tsx'
        note='The example running in Preview'
        copyLabel='Copy usage'
        code={source.usage}
      />
      <CodeBlock
        file={`${entry.slug}.tsx`}
        note='Component source'
        copyLabel='Copy component'
        code={source.component}
      />
      <CodeBlock
        file={`${entry.slug}.css`}
        note='Required styles'
        copyLabel='Copy CSS'
        code={source.css}
      />
    </div>
  );
}

function Entry({ entry }: { entry: MotionEntry }) {
  const [view, setView] = useState<View>('preview');
  const [run, setRun] = useState(0);
  const [inView, setInView] = useState(false);
  const card = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const id = useId();
  const category = CATEGORIES.find((c) => c.id === entry.category)!;

  // Demos mount only while their card is on screen, so nothing animates or
  // loops out of sight.
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

  const { Demo } = entry;
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
        <span className='lw-chip'>{category.label}</span>
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
            <span aria-hidden='true'>↻</span>{' '}
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
          {inView && view === 'preview' ? <Demo key={run} /> : null}
        </div>
        <p className='mgx-cue'>
          <span aria-hidden='true'>☞</span> {entry.cue}
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

export function MotionGallery() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MotionCategory | 'all'>('all');

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return ENTRIES.filter((entry) => {
      if (category !== 'all' && entry.category !== category) return false;
      const label = CATEGORIES.find((c) => c.id === entry.category)!.label;
      const haystack = `${entry.name} ${entry.purpose} ${label}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }, [query, category]);

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
            placeholder='Search 24 components'
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
            All
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type='button'
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className='mgx-count' role='status'>
          Showing {shown.length} of {ENTRIES.length}
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
            {category !== 'all'
              ? ` in ${CATEGORIES.find((c) => c.id === category)!.label}`
              : ''}
            . Try a shorter word such as “card”, “text” or “toast”.
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
