# @dimano/ts-devtools-plugin-prefetch-heatmap

[![npm](https://img.shields.io/npm/v/@dimano/ts-devtools-plugin-prefetch-heatmap.svg)](https://www.npmjs.com/package/@dimano/ts-devtools-plugin-prefetch-heatmap)
[![min+gzip](https://img.shields.io/bundlephobia/minzip/@dimano/ts-devtools-plugin-prefetch-heatmap)](https://bundlephobia.com/package/@dimano/ts-devtools-plugin-prefetch-heatmap)
[![downloads](https://img.shields.io/npm/dm/@dimano/ts-devtools-plugin-prefetch-heatmap.svg)](https://www.npmjs.com/package/@dimano/ts-devtools-plugin-prefetch-heatmap)
![types](https://img.shields.io/badge/TypeScript-types-blue?logo=typescript)
[![license](https://img.shields.io/npm/l/@dimano/ts-devtools-plugin-prefetch-heatmap.svg)](#license)

A Devtools plugin that overlays **prefetch wins vs. waste** for **TanStack React Router** apps.  
Pairs with `@dimano/tsr-prefetch-reporter` to mark links and shows a panel with simple metrics.

<p align="center">
  <img alt="Prefetch Heatmap demo" src="https://raw.githubusercontent.com/dimitrianoudi/tanstack-prefetch-heatmap/main/assets/prefetch-heatmap-card.png" width="520" />
</p>

## Install

```bash
# peer deps: react & react-dom
npm i @dimano/ts-devtools-plugin-prefetch-heatmap
# or
pnpm add @dimano/ts-devtools-plugin-prefetch-heatmap
```

**Peers**

- `react` >= 18  
- `react-dom` >= 18

> The plugin **includes CSS**. It’s imported automatically by the plugin entry.

## Usage

### 1) Use the reporter’s `TrackedLink` in your app

```tsx
import { TrackedLink } from "@dimano/tsr-prefetch-reporter";

<nav>
  <TrackedLink to="/" ttlMs={4000}>Home</TrackedLink>
  <TrackedLink to="/invoices" ttlMs={4000}>Invoices</TrackedLink>
  <TrackedLink to="/customers" ttlMs={4000}>Customers</TrackedLink>
</nav>
```

### 2) Register the plugin with your Devtools host

```tsx
// devtools host
import registerPrefetchHeatmapPlugin from "@dimano/ts-devtools-plugin-prefetch-heatmap";

// Your devtools host should provide registerPanel + an event bus
registerPrefetchHeatmapPlugin({
  registerPanel: (tab) => {
    // mount the React panel into your dock UI
    tab.mount(document.getElementById("devtools-panel")!);
  },
  subscribeToEvents: (_type, fn) => {
    // connect your reporter events; return unsubscribe
    // demo host wires this to window.postMessage / internal bus
    return () => {};
  },
  sendToPage: (msg) => {
    // overlay toggle handler (HTML attribute for CSS)
    if (msg.type === "router.overlay.toggle") {
      document.documentElement.toggleAttribute("data-tsr-heatmap", msg.enabled);
    }
  }
});
```

### Overlay CSS (already included)

Plugin entry imports `overlay-style.css` for you, which colors links when the HTML
element has `data-tsr-heatmap`:

```css
html[data-tsr-heatmap] a[data-tsr-prefetch="pending"] { outline:2px dashed #f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,.25); }
html[data-tsr-heatmap] a[data-tsr-prefetch="hit"]     { outline:2px solid  #22c55e; box-shadow:0 0 0 3px rgba(34,197,94,.25); }
html[data-tsr-heatmap] a[data-tsr-prefetch="waste"]   { outline:2px solid  #ef4444; box-shadow:0 0 0 3px rgba(239,68,68,.22); }
```

The panel’s “Enable overlay” toggle sends `{ type: "router.overlay.toggle", enabled: boolean }`
to your host via `sendToPage`, which should set/remove the `<html data-tsr-heatmap>` attribute.

## API (plugin registration)

The default export is a function that expects a small **host** object:

| Prop | Type | Required | Description |
| --- | --- | :--: | --- |
| `registerPanel` | `(tab: { id: string; title: string; mount: (el: HTMLElement) => void }) => void` | ✅ | Host calls this to add the panel; it receives a `mount` to render into. |
| `subscribeToEvents` | `(type: "router.*" \| "*", fn: (e: ReporterEvent) => void) => () => void` | ✅ | Connect the panel to your page event bus (from the reporter). Return an unsubscribe. |
| `sendToPage` | `(msg: ReporterEvent) => void` | ❌ | Optional: where the panel sends overlay toggles etc. |

> `ReporterEvent` is exported from the plugin as a type if you need it.

## Contributing

```bash
git clone https://github.com/dimitrianoudi/tanstack-prefetch-heatmap
cd tanstack-prefetch-heatmap
pnpm i

# build packages
pnpm -r --filter "./packages/*" build

# run the demo
pnpm --dir apps/demo dev
```

- Issues: https://github.com/dimitrianoudi/tanstack-prefetch-heatmap/issues  
- PRs: https://github.com/dimitrianoudi/tanstack-prefetch-heatmap/pulls

### Marketplace

To list this plugin in the **TanStack Devtools Marketplace**, open a PR adding it to the registry.

## License

MIT © Dimano
