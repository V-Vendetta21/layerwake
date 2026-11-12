# Layerwake capture format (schema version 1)

A capture is a UTF-8 JSON file describing one component at one viewport size. The extension writes it; the web app validates and reads it. The source of truth is [`lib/layerwake/schema.ts`](../../lib/layerwake/schema.ts) and [`lib/layerwake/css-values.ts`](../../lib/layerwake/css-values.ts).

## Example

```json
{
  "format": "layerwake-capture",
  "schemaVersion": 1,
  "capturedAt": "2026-01-15T10:30:00.000Z",
  "viewport": { "width": 1280, "height": 800, "devicePixelRatio": 2 },
  "limits": { "maxDepth": 8, "maxNodes": 200, "maxBytes": 524288 },
  "truncation": {
    "depth": false,
    "nodes": false,
    "bytes": false,
    "omittedNodes": 0,
    "inaccessibleFrames": 0
  },
  "root": {
    "tag": "article",
    "slot": "container",
    "box": { "x": 0, "y": 0, "width": 340, "height": 339 },
    "styles": {
      "display": "flex",
      "flex-direction": "column",
      "row-gap": "16px",
      "padding-top": "24px",
      "background-color": "#ffffff",
      "font-size": "15px"
    },
    "children": [
      {
        "tag": "h3",
        "slot": "text",
        "box": { "x": 25, "y": 81, "width": 290, "height": 32 },
        "styles": { "display": "block", "font-size": "28px", "font-weight": "700" },
        "textLength": 20,
        "children": []
      }
    ]
  }
}
```

## Top level

| Field           | Type   | Notes |
| --------------- | ------ | ----- |
| `format`        | string | Always `"layerwake-capture"`. Required. |
| `schemaVersion` | number | `1`. Required. Other versions are rejected with a message naming both versions. |
| `capturedAt`    | string | Optional ISO timestamp. |
| `viewport`      | object | `width`, `height` in CSS pixels, and `devicePixelRatio`. Required. |
| `limits`        | object | The limits the extension applied. Informational. |
| `truncation`    | object | What was left out. See below. |
| `root`          | node   | The selected element. Required. |

## Nodes

| Field        | Type     | Notes |
| ------------ | -------- | ----- |
| `tag`        | string   | A generic tag from the allowlist. Custom elements and unknown tags are written as `div`. `#text` marks a run of text that sits beside element siblings. |
| `slot`       | string   | `container`, `text`, `image` or `control`. |
| `box`        | object   | `x`, `y`, `width`, `height` in CSS pixels. `x` and `y` are offsets from the root's top-left corner. |
| `styles`     | object   | Allowlisted computed styles as strings. |
| `textLength` | number   | For text slots: the number of characters the element held. The text itself is never stored. |
| `omitted`    | string[] | Properties that had a value the format does not allow, such as a background image URL. |
| `children`   | node[]   | Only containers have children. |

Slots:

- **container**: an element with child elements.
- **text**: an element that holds only text, or a `#text` run.
- **image**: `img`, `svg`, `picture`, `video`, `canvas` and frames. Contents and sources are never read.
- **control**: `input`, `textarea`, `select`. Values are never read.

## Styles

Colors are normalized to `#rrggbb` or `#rrggbbaa`. Lengths are in `px`. To keep files small, the extension omits default values (zero padding, no shadow, transparent background and so on), records flex and grid properties only where they apply, and records inherited typography on the root and then only where a node differs from its parent.

| Group      | Properties |
| ---------- | ---------- |
| Layout     | `display`, `position`, `float`, `flex-direction`, `flex-wrap`, `justify-content`, `align-items`, `align-content`, `align-self`, `flex-grow`, `flex-shrink`, `flex-basis`, `row-gap`, `column-gap`, `grid-template-columns`, `grid-column-start`, `grid-column-end`, `grid-row-start`, `grid-row-end`, `overflow-x`, `overflow-y` |
| Spacing    | `padding-*`, `margin-*` (top, right, bottom, left) |
| Color      | `color`, `background-color`, `background-image` (gradients only), `opacity` |
| Typography | `font-family`, `font-size`, `font-weight`, `font-style`, `line-height`, `letter-spacing`, `text-align`, `text-transform`, `text-decoration-line`, `white-space`, `text-overflow`, `list-style-type` |
| Borders    | `border-*-width`, `border-*-style`, `border-*-color` (four sides), `border-*-radius` (four corners) |
| Shadows    | `box-shadow` |

## Limits and truncation

| Limit     | Value  | Behavior |
| --------- | ------ | -------- |
| Depth     | 8      | Deeper elements are skipped and `truncation.depth` is set. |
| Nodes     | 200    | Capture is breadth-first, so the deepest detail is trimmed first. `truncation.nodes` is set. |
| File size | 512 KB | The capture is retried with fewer nodes and `truncation.bytes` is set. |

`truncation.omittedNodes` counts skipped elements. `truncation.inaccessibleFrames` counts frames inside the selection; their content is never read. The app shows all of these next to the preview.

## What is never in a capture

Text content, form values, element attributes (ids, classes, `href`, `src`, `alt`, `data-*`), the page URL or title, asset URLs, scripts, stylesheets, cookies, storage and history.

## How the app validates an import

1. The file size is checked before the file is read, and again before parsing.
2. The JSON must parse, and `format` and `schemaVersion` must match.
3. Depth, node count, tag names, slot types and box numbers are checked. A structural problem rejects the file with a message naming the node.
4. Every style value goes through a per-property validator. Unknown properties and unreadable values are dropped and reported as a warning.
5. Any value that could load a resource or escape a declaration (`url(...)`, `image-set(...)`, `@import`, backslash escapes, `;`, `{`, `}`, `<`, `>`) rejects the whole file.
6. The validated capture is rebuilt from known fields only, so extra fields in the file are discarded.
