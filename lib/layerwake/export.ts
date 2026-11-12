/**
 * Exports. Everything here is generated from the normalized model plus the
 * current edits — the same data the live preview renders.
 */

import {
  declValue,
  isEdited,
  nodeText,
  tokenValue,
  VAR_PREFIX,
  type Edits,
  type Model,
  type ModelNode,
  type TokenGroup,
} from './model';

export const DEFAULT_NAME = 'Captured component';
export const MAX_NAME_LENGTH = 60;
export const MAX_TEXT_LENGTH = 240;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Turn a free-form component name into a safe CSS class prefix. */
export function classPrefix(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '');
  if (!slug) return 'component';
  return /^[a-z]/.test(slug) ? slug : `c-${slug}`;
}

export function fileBase(name: string): string {
  return classPrefix(name);
}

export const classFor = (prefix: string, node: ModelNode) =>
  node.parentId === null ? prefix : `${prefix}__${node.name}`;

/**
 * A zero-specificity reset so the component looks the same wherever it is
 * pasted. The preview injects exactly this rule for its own root.
 */
export function resetCss(rootClass: string): string {
  return [
    `:where(.${rootClass}),`,
    `:where(.${rootClass}) * {`,
    '  box-sizing: border-box;',
    '  margin: 0;',
    '  padding: 0;',
    '  border: 0 solid;',
    '  background: none;',
    '  font: inherit;',
    '  color: inherit;',
    '  letter-spacing: inherit;',
    '  text-align: inherit;',
    '  text-transform: inherit;',
    '  text-decoration: none;',
    '  list-style: none;',
    '}',
  ].join('\n');
}

const GROUP_TITLES: Record<TokenGroup, string> = {
  color: 'Color',
  fontSize: 'Type size',
  space: 'Spacing',
  radius: 'Corner radius',
  shadow: 'Shadow',
};
const GROUP_ORDER: TokenGroup[] = [
  'color',
  'fontSize',
  'space',
  'radius',
  'shadow',
];

export function cssVariables(model: Model, edits: Edits, selector = ':root') {
  const lines: string[] = [`${selector} {`];
  for (const group of GROUP_ORDER) {
    const tokens = model.tokens.filter((t) => t.group === group);
    if (tokens.length === 0) continue;
    lines.push(`  /* ${GROUP_TITLES[group]} */`);
    for (const token of tokens)
      lines.push(`  ${token.cssVar}: ${tokenValue(token, edits)};`);
  }
  if (lines.length === 1)
    lines.push('  /* No tokens were found in this capture. */');
  lines.push('}');
  return lines.join('\n');
}

export function tokensJson(model: Model, edits: Edits, name: string): string {
  const groups: Record<string, Record<string, unknown>> = {};
  for (const group of GROUP_ORDER) {
    const tokens = model.tokens.filter((t) => t.group === group);
    if (tokens.length === 0) continue;
    groups[group] = {};
    for (const token of tokens) {
      groups[group][token.name.replace(/^[a-z]+-(size-)?/, '')] = {
        value: tokenValue(token, edits),
        measured: tokenValue(token, { tokens: {}, text: {} }),
        edited: isEdited(token, edits),
        cssVariable: token.cssVar,
        usedBy: [...new Set(token.uses.map((u) => u.nodeId))].length,
      };
    }
  }
  return JSON.stringify(
    {
      generator: 'Layerwake',
      tokenFormatVersion: 1,
      component: name,
      variablePrefix: VAR_PREFIX,
      tokens: groups,
    },
    null,
    2
  );
}

export function componentCss(model: Model, edits: Edits, prefix: string) {
  const blocks: string[] = [cssVariables(model, edits), resetCss(prefix)];
  for (const id of model.order) {
    const node = model.byId[id];
    if (node.decls.length === 0) continue;
    const comment =
      node.slot === 'image'
        ? '  /* Image slot: replace the striped fill with your own asset. */\n'
        : node.slot === 'control'
          ? '  /* Control slot: swap in a real form control. */\n'
          : '';
    blocks.push(
      `.${classFor(prefix, node)} {\n${comment}${node.decls
        .map((decl) => `  ${decl.prop}: ${declValue(decl, model)};`)
        .join('\n')}\n}`
    );
  }
  return blocks.join('\n\n');
}

function markup(
  node: ModelNode,
  edits: Edits,
  prefix: string,
  indent: string
): string {
  const className = classFor(prefix, node);
  const plain = node.decls.length === 0 && node.parentId !== null;
  const attrs = [
    plain ? '' : ` class="${className}"`,
    node.tag === 'button' ? ' type="button"' : '',
    node.tag === 'a' ? ' href="#"' : '',
    node.slot === 'image' ? ' role="img" aria-label="Image placeholder"' : '',
  ].join('');
  const open = `${indent}<${node.tag}${attrs}>`;
  const close = `</${node.tag}>`;
  if (node.slot === 'text')
    return `${open}${escapeHtml(nodeText(node, edits))}${close}`;
  if (node.children.length === 0) return `${open}${close}`;
  const inner = node.children
    .map((child) => markup(child, edits, prefix, `${indent}  `))
    .join('\n');
  return `${open}\n${inner}\n${indent}${close}`;
}

export function componentHtml(
  model: Model,
  edits: Edits,
  prefix: string,
  indent = ''
) {
  return markup(model.root, edits, prefix, indent);
}

const indentBlock = (text: string, indent: string) =>
  text
    .split('\n')
    .map((line) => (line ? indent + line : line))
    .join('\n');

/** A complete, self-contained page: no scripts and no outside resources. */
export function htmlDocument(model: Model, edits: Edits, name: string): string {
  const prefix = classPrefix(name);
  const title = escapeHtml(name.trim() || DEFAULT_NAME);
  const pageCss = [
    'body {',
    '  margin: 0;',
    '  padding: 32px 16px;',
    '  background: #f5f8ff;',
    '  font-family: system-ui, sans-serif;',
    '}',
  ].join('\n');
  return [
    '<!doctype html>',
    '<html lang="en">',
    '  <head>',
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `    <title>${title}</title>`,
    '    <!-- Rebuilt with Layerwake. Placeholder content; original structure and tokens. -->',
    '    <style>',
    indentBlock(pageCss, '      '),
    '',
    indentBlock(componentCss(model, edits, prefix), '      '),
    '    </style>',
    '  </head>',
    '  <body>',
    componentHtml(model, edits, prefix, '    '),
    '  </body>',
    '</html>',
    '',
  ].join('\n');
}
