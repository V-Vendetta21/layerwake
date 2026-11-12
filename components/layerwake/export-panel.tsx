'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  classPrefix,
  componentCss,
  componentHtml,
  cssVariables,
  fileBase,
  htmlDocument,
  MAX_NAME_LENGTH,
  tokensJson,
} from '@/lib/layerwake/export';
import type { Edits, Model } from '@/lib/layerwake/model';
import { downloadText } from './capture-io';

type CodeTab = 'html' | 'css' | 'tokens';
export type Status = { tone: 'idle' | 'success' | 'error'; text: string };

export function ExportPanel({
  model,
  edits,
  name,
  onName,
  onStatus,
}: {
  model: Model;
  edits: Edits;
  name: string;
  onName: (name: string) => void;
  onStatus: (status: Status) => void;
}) {
  const [tab, setTab] = useState<CodeTab>('html');
  const [manual, setManual] = useState<{ what: string; text: string } | null>(
    null
  );
  const manualRef = useRef<HTMLTextAreaElement>(null);

  const prefix = classPrefix(name);
  const code = useMemo(
    () => ({
      html: componentHtml(model, edits, prefix),
      css: componentCss(model, edits, prefix),
      tokens: tokensJson(model, edits, name),
    }),
    [model, edits, prefix, name]
  );

  useEffect(() => {
    if (manual) {
      manualRef.current?.focus();
      manualRef.current?.select();
    }
  }, [manual]);

  const copy = async (what: string, text: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('unavailable');
      await navigator.clipboard.writeText(text);
      setManual(null);
      onStatus({ tone: 'success', text: `${what} copied to the clipboard.` });
    } catch {
      // Clipboard access can be denied. Offer the text for a manual copy.
      setManual({ what, text });
      onStatus({
        tone: 'error',
        text: `Clipboard access was blocked, so ${what.toLowerCase()} could not be copied automatically. Copy the selected text instead.`,
      });
    }
  };

  const save = (what: string, filename: string, text: string, type: string) => {
    try {
      downloadText(filename, text, type);
      onStatus({ tone: 'success', text: `${what} downloaded as ${filename}.` });
    } catch {
      onStatus({
        tone: 'error',
        text: `${what} could not be downloaded. Use the code view to copy it instead.`,
      });
    }
  };

  const tabs: { id: CodeTab; label: string }[] = [
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'tokens', label: 'Tokens JSON' },
  ];

  return (
    <div className='lw-export'>
      <div className='lw-export__actions'>
        <label className='lw-export__name'>
          <span className='lw-field-label'>
            Component name <span className='lw-mono'>.{prefix}</span>
          </span>
          <input
            type='text'
            className='lw-input lw-input--wide'
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(event) => onName(event.target.value)}
          />
        </label>
        <button
          type='button'
          className='lw-btn'
          onClick={() => copy('CSS variables', cssVariables(model, edits))}
        >
          Copy CSS variables
        </button>
        <button
          type='button'
          className='lw-btn'
          onClick={() =>
            save(
              'Tokens JSON',
              `${fileBase(name)}.tokens.json`,
              code.tokens,
              'application/json'
            )
          }
        >
          Download tokens JSON
        </button>
        <button
          type='button'
          className='lw-btn lw-btn--primary'
          onClick={() =>
            save(
              'HTML/CSS',
              `${fileBase(name)}.html`,
              htmlDocument(model, edits, name),
              'text/html'
            )
          }
        >
          Download HTML/CSS
        </button>
      </div>

      {manual ? (
        <div className='lw-manual' role='group' aria-label='Manual copy'>
          <div className='lw-group'>
            <strong>Copy {manual.what.toLowerCase()} manually</strong>
            <button
              type='button'
              className='lw-btn lw-btn--sm'
              style={{ marginLeft: 'auto' }}
              onClick={() => setManual(null)}
            >
              Done
            </button>
          </div>
          <p>
            The text below is selected. Press Ctrl+C (⌘C on a Mac) to copy it.
          </p>
          <textarea
            ref={manualRef}
            readOnly
            value={manual.text}
            aria-label={`${manual.what} to copy`}
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      ) : null}

      <div className='lw-center-bar'>
        <div className='lw-seg' role='tablist' aria-label='Code view'>
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type='button'
              role='tab'
              aria-selected={tab === id}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className='lw-muted'>
          Generated from the same model as the preview, with your edits.
        </span>
        <button
          type='button'
          className='lw-btn lw-btn--sm'
          style={{ marginLeft: 'auto' }}
          onClick={() => copy(tabs.find((t) => t.id === tab)!.label, code[tab])}
        >
          Copy {tabs.find((t) => t.id === tab)!.label}
        </button>
      </div>
      <pre className='lw-code' tabIndex={0} aria-label={`${tab} code`}>
        <code>{code[tab]}</code>
      </pre>
    </div>
  );
}
