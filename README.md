# Layerwake

**See how interfaces are built. Make them your own.**

Layerwake is a browser-based tool for designers and frontend developers. Capture one UI component, inspect the spacing, type and color decisions behind it, rebuild your own variant in a live preview, and export design tokens and clean starter code.

**Capture → Inspect → Rebuild → Export**

It runs entirely in the browser. There is no account, no server, no API key and no upload: a capture is a JSON file on your computer.

## Run the app

Node 24 is recommended (`.nvmrc` pins it). Node 20.9 or newer also works.

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

| Route        | What it is                                                    |
| ------------ | ------------------------------------------------------------- |
| `/`          | Home, with a live sample, **Try demo** and **Import capture** |
| `/workspace` | The editor (add `?demo=1` to open the demo)                   |
| `/demo`      | An original demo card you can capture with the extension      |

### Build for static hosting

```bash
npm run build
```

The static site is written to `out/`. Any static host can serve it.

## Install the capture extension

The extension is a small Manifest V3 extension for Chrome and other Chromium browsers (Edge, Brave, Arc). It asks only for `activeTab` and `scripting`, so it can touch a page only after you click its button on that tab.

```bash
npm run build:extension
```

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and select the `extension/dist` folder.
4. Pin **Layerwake Capture** to the toolbar.

## Walkthrough

1. Start the app and open `/demo`.
2. Click the Layerwake toolbar button, then **Capture component**.
3. Hover the weather card until the outline wraps it, then click. `↑` and `↓` move to the parent or first child, `Enter` picks, `Esc` cancels.
4. Read the capture summary and choose **Download Layerwake JSON**.
5. Open `/workspace` and drop the file on the page, or use **Import capture**.
6. Select `headline` in the layer tree. The same layer is outlined in the preview, and the inspector shows its measured values.
7. Select `root` and change **Corner radius**, or select `action` and change **Fill**. The preview updates as you type. **As measured** shows the original for comparison, and **Reset changes** undoes everything.
8. Switch **Rebuild width test** to **Compact** to see whether your variant overflows.
9. Open **Export**. Copy the CSS variables, download the tokens JSON, or download a self-contained HTML/CSS file and open it in a new tab.

No extension? **Try demo** loads a ready-made capture of the same card.

## What a capture contains

A capture describes one component at one viewport size. The full format is documented in [docs/layerwake/capture-format.md](docs/layerwake/capture-format.md).

| Included                                      | Never included                                  |
| --------------------------------------------- | ----------------------------------------------- |
| Viewport size, each layer's position and size | Page text, form values, attributes              |
| Generic tag names (`div`, `button`, `h2` …)   | The page address, links, image and font URLs    |
| An allowlist of computed styles               | Scripts, stylesheets, cookies, browsing history |
| The length of each piece of text              |                                                 |

Limits: 8 levels deep, 200 layers, 512 KB. A capture that hits a limit is trimmed, and both the extension and the app say so.

Imports are treated as untrusted. The app checks size, schema, structure and every style value against a narrow allowlist, rejects any value that could load a resource, renders with its own elements and structured styles, and escapes edited text in exports. The preview and the exports are generated from the same model, so they agree.

## Commands

| Command                    | What it does                                                               |
| -------------------------- | -------------------------------------------------------------------------- |
| `npm run dev`              | Start the app locally                                                      |
| `npm run build`            | Build the static site into `out/`                                          |
| `npm run build:extension`  | Build the extension into `extension/dist`                                  |
| `npm test`                 | Unit tests for capture validation, the CSS allowlist and export escaping   |
| `npm run typecheck`        | TypeScript check                                                           |
| `npm run lint`             | ESLint                                                                     |
| `npm run verify:layerwake` | Browser run of the whole loop against `out/` (needs Playwright, see below) |
| `npm run demo:capture`     | Regenerate the bundled demo capture from the live demo page                |

The two browser scripts need Playwright, which is not a project dependency:

```bash
npm i --no-save playwright && npx playwright install chromium
```

## Where things live

```
app/                      routes (/, /workspace, /demo) and layerwake.css (CSS custom properties)
components/layerwake/     workspace, tree, inspector, preview renderer, export panel
lib/layerwake/
  schema.ts               capture format, limits and tag allowlist
  css-values.ts           the CSS property and value allowlist
  validate.ts             import validation
  collect.ts              DOM capture (used by the extension)
  model.ts                normalized component model, layout rules, tokens
  export.ts               CSS variables, tokens JSON, HTML/CSS
extension/                Manifest V3 extension (popup + picker)
docs/layerwake/           capture format reference
```

## Known limitations

- One component, one viewport. A capture cannot tell which values were authored as fixed, fluid or responsive, so the rebuild is an approximation. The width test exercises the rebuild, not the source page.
- Flex, grid and block stacks are rebuilt. Tables, `display: contents`, floats and sticky positioning are simplified, and absolute positioning is pinned to its measured offset. Each case is flagged in the preview and on the layer.
- Grid columns are rebuilt as proportional `fr` tracks. Grid rows, named areas and auto-placement details are not captured.
- Not captured: pseudo-elements, transforms, transitions, filters, hover and focus states, media queries, shadow DOM content and frame content.
- Images, SVGs, video, canvas and frames become striped placeholder slots. Form controls become empty boxes. Background images are dropped; gradients are kept.
- Text is replaced by neutral placeholder copy of similar length, so wrapping can differ slightly from the source. Fonts are referenced by name only and are never downloaded.
- Editing works on tokens. A spacing or color value shared by several layers changes everywhere it is used; the inspector shows how many layers share it.
- Chromium browsers only. The extension cannot run on browser pages, the extension store or built-in viewers.
- Out of scope for this release: screenshot analysis, full-page reconstruction, crawling a URL, accounts, cloud projects and framework-specific code export.

## Contribution ideas

Good first changes, roughly from small to large:

- Add a property to the allowlist (for example `text-shadow` or `aspect-ratio`): one validator in `css-values.ts`, one declaration in `model.ts`, one test.
- Improve inferred names in `nameNodes` (for example, detect avatars or dividers).
- Capture `::before` and `::after` as extra layers.
- Add per-layer overrides so a shared token can be split.
- Add syntax highlighting to the code view.
- Support dark canvas backgrounds in the preview for light-on-dark components.

Please keep the privacy rule intact: a capture must never contain page copy, attributes or URLs. See [CONTRIBUTING.md](CONTRIBUTING.md) for the repository's general workflow.

## License and attribution

[MIT](LICENCE.md).

Layerwake was built on top of a fork of [Motion-Primitives](https://github.com/ibelick/motion-primitives) by ibelick, which is MIT licensed. Its site pages and components have been removed, but the project setup and Git history descend from it, so the original copyright notice in `LICENCE.md` is kept.
