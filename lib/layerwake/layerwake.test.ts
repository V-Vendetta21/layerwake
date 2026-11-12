import { describe, expect, it } from 'vitest';
import { checkStyle, isResourceValue, sanitizeStyle } from './css-values';
import demo from './demo-capture.json';
import {
  classPrefix,
  componentCss,
  cssVariables,
  escapeHtml,
  htmlDocument,
  tokensJson,
} from './export';
import { buildModel, EMPTY_EDITS, type Edits } from './model';
import { LIMITS } from './schema';
import { parseCaptureText, validateCapture } from './validate';

const node = (overrides: Record<string, unknown> = {}) => ({
  tag: 'div',
  slot: 'container',
  box: { x: 0, y: 0, width: 200, height: 100 },
  styles: {},
  children: [],
  ...overrides,
});

const capture = (
  root: unknown = node(),
  overrides: Record<string, unknown> = {}
) => ({
  format: 'layerwake-capture',
  schemaVersion: 1,
  viewport: { width: 1280, height: 720, devicePixelRatio: 1 },
  truncation: {},
  root,
  ...overrides,
});

const expectError = (data: unknown, pattern: RegExp) => {
  const result = validateCapture(data);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toMatch(pattern);
};

describe('capture validation', () => {
  it('accepts the bundled demo capture without warnings', () => {
    const result = validateCapture(demo);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.warnings).toEqual([]);
  });

  it('rejects non-JSON, empty and non-capture files', () => {
    expect(parseCaptureText('')).toMatchObject({ ok: false });
    expect(parseCaptureText('<html>')).toMatchObject({
      ok: false,
      error: expect.stringMatching(/not valid JSON/),
    });
    expectError([], /not a Layerwake capture/);
    expectError({ format: 'something-else' }, /not a Layerwake capture/);
  });

  it('rejects an unsupported schema version', () => {
    expectError(capture(node(), { schemaVersion: 2 }), /schema version 2/);
    expectError(
      capture(node(), { schemaVersion: undefined }),
      /no schema version/
    );
  });

  it('rejects oversized files before parsing them', () => {
    const result = parseCaptureText(' '.repeat(LIMITS.maxBytes + 1));
    expect(result).toMatchObject({
      ok: false,
      error: expect.stringMatching(/limited to/),
    });
  });

  it('rejects captures that exceed the node or depth limits', () => {
    const wide = node({
      children: Array.from({ length: LIMITS.maxNodes }, () => node()),
    });
    expectError(capture(wide), /more than 200 nodes/);

    let deep: Record<string, unknown> = node();
    for (let i = 0; i < LIMITS.maxDepth + 1; i++)
      deep = node({ children: [deep] });
    expectError(capture(deep), /nested deeper/);
  });

  it('rejects malformed structure', () => {
    expectError(capture(node({ tag: 'script' })), /unsupported tag/);
    expectError(capture(node({ tag: 'my-widget' })), /unsupported tag/);
    expectError(capture(node({ slot: 'html' })), /unknown slot/);
    expectError(
      capture(node({ box: { x: 0, y: 0, width: 'wide', height: 1 } })),
      /must be a number/
    );
    expectError(
      capture(node({ box: { x: 0, y: 0, width: Infinity, height: 1 } })),
      /must be a number/
    );
    expectError(capture(node({ children: 'nope' })), /children must be a list/);
    expectError(
      capture(node({ box: { x: 0, y: 0, width: 0, height: 0 } })),
      /no visible size/
    );
    expectError(capture(node(), { viewport: null }), /viewport/);
  });

  it('rejects any value that could load a resource', () => {
    for (const value of [
      'url(https://example.com/a.png)',
      'URL( "//example.com/x" )',
      'image-set("a.png" 1x)',
      'linear-gradient(red, blue), url(x)',
      'red; background: url(x)',
      '\\75 rl(x)',
    ]) {
      expectError(
        capture(node({ styles: { 'background-image': value } })),
        /outside resource/
      );
    }
    // Even under a property the app does not know.
    expectError(
      capture(node({ styles: { 'mask-image': 'url(x.svg)' } })),
      /outside resource/
    );
  });

  it('drops unknown properties and invalid values, and says so', () => {
    const result = validateCapture(
      capture(
        node({
          styles: {
            display: 'flex',
            'z-index': '10',
            color: 'not-a-color',
            'padding-top': '12px',
          },
        })
      )
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.capture.root.styles).toEqual({
      display: 'flex',
      'padding-top': '12px',
    });
    expect(result.warnings).toHaveLength(2);
  });

  it('keeps only known fields, so page content cannot ride along', () => {
    const result = validateCapture(
      capture(
        node({
          text: '<script>alert(1)</script>',
          attributes: { onclick: 'alert(1)', href: 'https://example.com' },
          innerHTML: '<img src=x onerror=alert(1)>',
          children: [
            node({
              tag: 'span',
              slot: 'text',
              textLength: 12,
              value: 'secret',
            }),
          ],
        }),
        { url: 'https://example.com/private', __proto__: { polluted: true } }
      )
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const json = JSON.stringify(result.capture);
    expect(json).not.toMatch(/script|onclick|example\.com|secret|innerHTML/);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe('css allowlist', () => {
  it('normalizes colors and lengths', () => {
    expect(sanitizeStyle('color', 'rgb(22, 76, 255)')).toBe('#164cff');
    expect(sanitizeStyle('color', 'rgba(12, 23, 56, 0.5)')).toBe('#0c173880');
    expect(sanitizeStyle('padding-top', '12.5px')).toBe('12.5px');
    expect(sanitizeStyle('padding-top', '-4px')).toBeNull();
    expect(sanitizeStyle('margin-top', '-4px')).toBe('-4px');
  });

  it('accepts gradients but nothing that names another function', () => {
    expect(
      sanitizeStyle(
        'background-image',
        'linear-gradient(135deg, rgb(1, 2, 3) 0%, #fff 100%)'
      )
    ).not.toBeNull();
    expect(
      sanitizeStyle('background-image', 'linear-gradient(red, var(--x))')
    ).toBeNull();
    expect(
      sanitizeStyle('background-image', 'cross-fade(red, blue)')
    ).toBeNull();
  });

  it('rejects values that try to break out of a declaration', () => {
    expect(
      checkStyle('font-family', 'Inter; } body { display: none').status
    ).toBe('resource');
    expect(sanitizeStyle('font-family', '"Inter, sans-serif')).toBeNull();
    expect(sanitizeStyle('font-family', '</style><script>')).toBeNull();
    expect(sanitizeStyle('display', 'flex !important')).toBeNull();
    expect(isResourceValue('expression(alert(1))')).toBe(true);
    expect(
      sanitizeStyle('box-shadow', '0px 1px 2px 0px rgba(0, 0, 0, 0.2)')
    ).toBe('0px 1px 2px 0px rgba(0, 0, 0, 0.2)');
  });
});

describe('model and export', () => {
  const result = validateCapture(demo);
  if (!result.ok) throw new Error('demo capture must be valid');
  const model = buildModel(result.capture);
  const textNode = model.order
    .map((id) => model.byId[id])
    .find((n) => n.slot === 'text')!;
  const hostile = `"><script>alert('x')</script>&<img src=x onerror=1>`;

  it('gives every node a unique, readable name', () => {
    const names = model.order.map((id) => model.byId[id].name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(
      expect.arrayContaining(['root', 'headline', 'badge', 'action', 'label'])
    );
    for (const name of names) expect(name).toMatch(/^[a-z][a-z0-9-]*$/);
  });

  it('escapes HTML special characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
    );
  });

  it('escapes edited text and the component name in exported HTML', () => {
    const edits: Edits = { tokens: {}, text: { [textNode.id]: hostile } };
    const html = htmlDocument(model, edits, hostile);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;');
    // Exactly one <title>, <style> and <body>: nothing was injected.
    for (const tag of ['<title>', '<style>', '<body>'])
      expect(html.split(tag)).toHaveLength(2);
  });

  it('turns any component name into a safe class prefix', () => {
    expect(classPrefix('Coastal card')).toBe('coastal-card');
    expect(classPrefix(hostile)).toMatch(/^[a-z][a-z0-9-]*$/);
    expect(classPrefix('123')).toBe('c-123');
    expect(classPrefix('  ')).toBe('component');
    expect(classPrefix('}{;')).toBe('component');
  });

  it('exports contain no resource references or scripts', () => {
    const html = htmlDocument(model, EMPTY_EDITS, 'Coastal card');
    expect(html).not.toMatch(/url\(|<script|<link|@import|src=|https?:/i);
  });

  it('reflects token edits in every export', () => {
    const space = model.tokens.find((t) => t.group === 'space')!;
    const color = model.tokens.find((t) => t.name === 'color-surface')!;
    const edits: Edits = {
      tokens: { [space.id]: '37px', [color.id]: '#ff00aa' },
      text: {},
    };
    expect(cssVariables(model, edits)).toContain(`${space.cssVar}: 37px;`);
    expect(componentCss(model, edits, 'x')).toContain(
      `${color.cssVar}: #ff00aa;`
    );
    expect(htmlDocument(model, edits, 'x')).toContain(`${space.cssVar}: 37px;`);
    const tokens = JSON.parse(tokensJson(model, edits, 'x'));
    expect(tokens.tokens.color.surface).toMatchObject({
      value: '#ff00aa',
      measured: '#121212',
      edited: true,
    });
    // Unedited output still carries the measured value.
    expect(cssVariables(model, EMPTY_EDITS)).toContain(
      `${space.cssVar}: ${space.original};`
    );
  });

  it('notes layouts it cannot rebuild', () => {
    const table = validateCapture(
      capture(
        node({
          styles: { display: 'table' },
          children: [node({ styles: { position: 'absolute' } })],
        })
      )
    );
    if (!table.ok) throw new Error(table.error);
    const notes = buildModel(table.capture)
      .notes.map((n) => n.text)
      .join(' ');
    expect(notes).toMatch(/"table" layout is not rebuilt/);
    expect(notes).toMatch(/Absolute positioning is approximated/);
  });
});
