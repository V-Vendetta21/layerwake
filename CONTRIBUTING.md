# Contributing

Thanks for your interest in Layerwake.

## Setup

Node 24 is recommended. The project uses npm.

```bash
npm install
```

```bash
npm run dev
```

## Before you open a pull request

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npm run build && npm run build:extension
```

If you changed capture, import, preview or export behavior, also run the browser check (see the README for the Playwright setup):

```bash
npm run verify:layerwake
```

## Ground rules

- A capture must never contain page text, attributes, form values or URLs.
- Imports are untrusted. New style properties need a validator in `lib/layerwake/css-values.ts` and a test.
- The preview and the exports are generated from the same model in `lib/layerwake/model.ts`. Keep it that way.
- Keep changes small and say what you verified.

## Commit convention

`category(scope): message`, using one of `feat`, `fix`, `refactor`, `docs`, `build`, `test`, `ci`, `chore`. For example: `feat(export): add text-shadow`.
