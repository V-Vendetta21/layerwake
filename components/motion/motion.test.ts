import { readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectSources } from '../../scripts/build-motion-sources.mjs';
import generated from './sources.generated.json';

const items = path.join(__dirname, 'items');
const slugs = readdirSync(items).sort();
const sources = generated as Record<
  string,
  { component: string; css: string; usage: string }
>;

describe('motion gallery sources', () => {
  it('ships 24 components', () => {
    expect(slugs).toHaveLength(24);
    expect(Object.keys(sources).sort()).toEqual(slugs);
  });

  it('shows exactly the files the previews run', async () => {
    expect(JSON.parse(await collectSources())).toEqual(sources);
  });

  it('keeps every component free of Layerwake and third-party imports', () => {
    for (const slug of slugs) {
      const { component, css, usage } = sources[slug];
      const imports = [
        ...`${component}\n${usage}`.matchAll(
          /from '([^']+)'|import '([^']+)'/g
        ),
      ].map((m) => m[1] ?? m[2]);
      for (const source of imports)
        expect(
          ['react', `./${slug}`, `./${slug}.css`],
          `${slug}: ${source}`
        ).toContain(source);
      expect(component, slug).toContain(`import './${slug}.css'`);
      expect(css, slug).not.toMatch(/--lw-|url\(|@import/);
    }
  });

  it('gives every animated component a reduced-motion path', () => {
    for (const slug of slugs) {
      const { component, css } = sources[slug];
      const animated =
        /animation|transition|\.animate\(|requestAnimationFrame|setInterval|setTimeout/.test(
          component + css
        );
      if (animated)
        expect(component + css, slug).toMatch(/prefers-reduced-motion/);
    }
  });
});
