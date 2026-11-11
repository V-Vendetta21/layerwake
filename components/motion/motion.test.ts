import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectSources } from '../../scripts/build-motion-sources.mjs';
import { CATALOG, CATEGORIES, EXPECTED_TOTAL } from './catalog';
import type { MotionSource } from './types';

const items = path.join(__dirname, 'items');
const slugs = readdirSync(items).sort();
const listing = (slug: string): MotionSource =>
  JSON.parse(
    readFileSync(path.join(__dirname, 'sources', `${slug}.json`), 'utf8')
  );
const loaders = readFileSync(
  path.join(__dirname, 'loaders.generated.ts'),
  'utf8'
);

describe('motion gallery registry', () => {
  it(`ships exactly ${EXPECTED_TOTAL} components`, () => {
    expect(CATALOG).toHaveLength(EXPECTED_TOTAL);
    expect(slugs).toHaveLength(EXPECTED_TOTAL);
  });

  it('has unique slugs and names', () => {
    expect(new Set(CATALOG.map((e) => e.slug)).size).toBe(CATALOG.length);
    expect(new Set(CATALOG.map((e) => e.name)).size).toBe(CATALOG.length);
  });

  it('pairs every catalog entry with a demo, a component and a source listing', () => {
    expect(CATALOG.map((e) => e.slug).sort()).toEqual(slugs);
    for (const { slug } of CATALOG) {
      const files = readdirSync(path.join(items, slug));
      expect(files, slug).toEqual(
        expect.arrayContaining(['demo.tsx', `${slug}.tsx`, `${slug}.css`])
      );
      expect(loaders, slug).toContain(
        `'${slug}': lazy(() => import('./items/${slug}/demo'))`
      );
      expect(loaders, slug).toContain(`import('./sources/${slug}.json')`);
    }
  });

  it('gives every entry a known category and the text the card needs', () => {
    const ids = CATEGORIES.map((c) => c.id);
    for (const entry of CATALOG) {
      expect(ids, entry.slug).toContain(entry.category);
      expect(entry.slug, entry.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(entry.purpose.length, entry.slug).toBeGreaterThan(15);
      expect(entry.cue.length, entry.slug).toBeGreaterThan(8);
      expect(entry.keywords.length, entry.slug).toBeGreaterThan(0);
    }
  });
});

describe('motion gallery sources', () => {
  it('shows exactly the files the previews run', async () => {
    const fresh = await collectSources();
    expect(Object.keys(fresh).sort()).toEqual(slugs);
    for (const slug of slugs) expect(listing(slug), slug).toEqual(fresh[slug]);
  });

  it('keeps every copied component free of Layerwake and third-party imports', () => {
    for (const slug of slugs) {
      const { usage, files } = listing(slug);
      const names = files.map((f) => f.name.replace(/\.(tsx?|css)$/, ''));
      for (const code of [usage, ...files.map((f) => f.code)]) {
        const imports = [
          ...code.matchAll(/from '([^']+)'|import '([^']+)'/g),
        ].map((m) => m[1] ?? m[2]);
        for (const source of imports) {
          if (source === 'react' || source === 'react-dom') continue;
          expect(source, `${slug}: ${source}`).toMatch(/^\.\//);
          const local = source.slice(2).replace(/\.css$/, '');
          expect(names, `${slug}: ${source}`).toContain(local);
        }
      }
      const component = files.find((f) => f.kind === 'component')!;
      expect(component.code, slug).toContain(`import './${slug}.css'`);
      for (const file of files)
        expect(file.code, slug).not.toMatch(/--lw-|url\(|@import|shared\//);
    }
  });

  it('gives every animated component a reduced-motion path', () => {
    for (const slug of slugs) {
      const all = listing(slug)
        .files.map((f) => f.code)
        .join('\n');
      const animated =
        /animation|transition|\.animate\(|requestAnimationFrame|setInterval|setTimeout/.test(
          all
        );
      if (animated)
        expect(all, slug).toMatch(/prefers-reduced-motion|useReducedMotion/);
    }
  });
});
