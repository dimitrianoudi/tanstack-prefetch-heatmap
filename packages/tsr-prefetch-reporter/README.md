# @dimano/tsr-prefetch-reporter

A tiny link component that visualizes prefetch intent vs. clicks for TanStack React Router apps.  
It renders a real `<a>` (so DOM events are reliable), navigates via the router, and sets
`data-tsr-prefetch="pending|hit|waste"` so a Devtools overlay (or your CSS) can color links.

[![npm](https://img.shields.io/npm/v/@dimano/tsr-prefetch-reporter.svg)](https://www.npmjs.com/package/@dimano/tsr-prefetch-reporter)
[![min+gzip](https://img.shields.io/bundlephobia/minzip/@dimano/tsr-prefetch-reporter)](https://bundlephobia.com/package/@dimano/tsr-prefetch-reporter)
[![downloads](https://img.shields.io/npm/dm/@dimano/tsr-prefetch-reporter.svg)](https://www.npmjs.com/package/@dimano/tsr-prefetch-reporter)
![types](https://img.shields.io/badge/TypeScript-types-blue?logo=typescript)
[![license](https://img.shields.io/npm/l/@dimano/tsr-prefetch-reporter.svg)](#license)

<p align="center">
  <img alt="Prefetch Heatmap demo" src="https://raw.githubusercontent.com/dimitrianoudi/tanstack-prefetch-heatmap/main/assets/prefetch-heatmap-card.png" width="520" />
</p>

## Install

```bash
# peer deps: react, react-dom, @tanstack/react-router
npm i @dimano/tsr-prefetch-reporter
# or
pnpm add @dimano/tsr-prefetch-reporter
```

**Peers**

- `react` >= 18  
- `react-dom` >= 18  
- `@tanstack/react-router` >= 1.0.0

## Quick start

```tsx
import { TrackedLink } from "@dimano/tsr-prefetch-reporter";

export function Nav() {
  return (
    <nav>
      {/* short TTL so states are obvious in dev */}
      <TrackedLink to="/" ttlMs={4000}>Home</TrackedLink>
      <TrackedLink to="/invoices" ttlMs={4000}>Invoices</TrackedLink>
      <TrackedLink to="/customers" ttlMs={4000}>Customers</TrackedLink>
      <TrackedLink to="/reports" ttlMs={4000}>Reports</TrackedLink>
    </nav>
  );
}
```

### What it does

- On hover/focus/touch → sets `data-tsr-prefetch="pending"`  
- If clicked within `ttlMs` → `data-tsr-prefetch="hit"`  
- If not clicked within `ttlMs` → `data-tsr-prefetch="waste"`  

Use these attributes in your own CSS or pair it with the **Prefetch Heatmap Devtools plugin** to get a pretty overlay.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `to` | `any` | — | Destination for TanStack Router (same shape you pass to `router.navigate`). |
| `params` | `any` | — | Route params (optional). |
| `search` | `any` | — | Route search (optional). |
| `hash` | `string` | — | URL hash (optional). |
| `from` | `any` | — | Starting route (optional). |
| `replace` | `boolean` | `false` | Replace history instead of push. |
| `ttlMs` | `number` | `15000` | How long a prefetch is “hot” before turning into `"waste"`. |
| `intent` | `Array<"hover" \| "focus" \| "touch">` | `["hover","focus","touch"]` | Which interactions count as intent. |
| `onPrefetchIntent` | `(href: string) => void` | — | Optional analytics hook when intent starts. |
| `...anchorProps` | All standard `<a>` props | — | `className`, `target`, `rel`, etc. |

**Data attributes set:**

- `data-tsr-prefetch="pending" | "hit" | "waste"`

## Styling (optional)

If you’re not using the Devtools plugin’s CSS, a minimal example:

```css
:root {
  --tsr-pending: #f59e0b; /* amber */
  --tsr-hit:     #22c55e; /* green */
  --tsr-waste:   #ef4444; /* red */
}

a[data-tsr-prefetch] { outline-offset: 2px; transition: box-shadow .15s, outline-color .15s; }
a[data-tsr-prefetch="pending"] { outline: 2px dashed var(--tsr-pending); box-shadow: 0 0 0 3px rgba(245,158,11,.25); }
a[data-tsr-prefetch="hit"]     { outline: 2px solid  var(--tsr-hit);     box-shadow: 0 0 0 3px rgba(34,197,94,.25); }
a[data-tsr-prefetch="waste"]   { outline: 2px solid  var(--tsr-waste);   box-shadow: 0 0 0 3px rgba(239,68,68,.22); }
```

## Contributing

```bash
git clone https://github.com/dimitrianoudi/tanstack-prefetch-heatmap
cd tanstack-prefetch-heatmap
pnpm i
pnpm -r --filter "./packages/*" build

# run the demo app
pnpm --dir apps/demo dev
```

Please open issues/PRs in the monorepo:

- Issues: https://github.com/dimitrianoudi/tanstack-prefetch-heatmap/issues  
- PRs: https://github.com/dimitrianoudi/tanstack-prefetch-heatmap/pulls

## License

MIT © Dimano
