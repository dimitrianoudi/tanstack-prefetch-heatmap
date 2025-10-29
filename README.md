# TanStack Prefetch Heatmap Devtools

[![npm](https://img.shields.io/npm/v/@dimano/ts-devtools-plugin-prefetch-heatmap.svg)](https://www.npmjs.com/package/@dimano/ts-devtools-plugin-prefetch-heatmap)
[![npm](https://img.shields.io/npm/v/@dimano/tsr-prefetch-reporter.svg)](https://www.npmjs.com/package/@dimano/tsr-prefetch-reporter)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://github.com/dimitrianoudi/tanstack-prefetch-heatmap/actions/workflows/ci.yml/badge.svg)

A tiny developer tooling experiment for **TanStack React Router** that visualizes and measures **link prefetch intent**, **hits**, and **waste**. It ships as:

- `@dimano/tsr-prefetch-reporter`: app-side helper that emits prefetch and navigation events, sets DOM data attributes for an optional overlay.
- `@dimano/ts-devtools-plugin-prefetch-heatmap`: Devtools plugin that aggregates events, shows counters and recent activity, and lets you toggle a color overlay.
- `apps/demo`: a React app with a small docked host to try the full flow.

**Goal**: help teams tune prefetch strategies and quantify waste versus wins.

---

## Using with TanStack Devtools (Marketplace)

### Option A — Marketplace installation

1. Install the reporter in your app:
   ```bash
   pnpm add @dimano/tsr-prefetch-reporter
   ```
2. Use `TrackedLink` for links you want to observe:
   ```tsx
   import { TrackedLink } from "@dimano/tsr-prefetch-reporter";

   <TrackedLink to="/invoices" preload="intent">Invoices</TrackedLink>
   ```
3. Open TanStack Devtools in your app; go to **Marketplace → Add to Devtools**; search **Prefetch Heatmap**; add it.
4. Open the **Prefetch Heatmap** panel; toggle **Enable overlay** to annotate links in page.

The official Devtools host imports the plugin’s **named** export, `registerPrefetchHeatmapPlugin`. No extra wiring is needed.

### Option B — Manual host wiring via `plugins` prop

If you embed Devtools yourself and want to render the panel explicitly:

**`src/main.tsx`**
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { PrefetchHeatmapPanelHost } from "./PrefetchHeatmapPanelHost";

const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
    <TanStackDevtools
      config={{ hideUntilHover: true }}
      plugins={[
        {
          name: "Prefetch Heatmap",
          render: <PrefetchHeatmapPanelHost />,
        },
      ]}
    />
  </React.StrictMode>
);
```

**`src/PrefetchHeatmapPanelHost.tsx`**
```tsx
import * as React from "react";
import registerPrefetchHeatmapPlugin, { type ReporterEvent } from "@dimano/ts-devtools-plugin-prefetch-heatmap";

declare global {
  interface Window {
    __TANSTACK_DEVTOOLS_EVENT_CLIENT__?: {
      emit: (e: ReporterEvent) => void;
      subscribe: (fn: (e: ReporterEvent) => void) => () => void;
    };
  }
}

export function PrefetchHeatmapPanelHost() {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!window.__TANSTACK_DEVTOOLS_EVENT_CLIENT__) {
      const subs = new Set<(e: ReporterEvent) => void>();
      window.__TANSTACK_DEVTOOLS_EVENT_CLIENT__ = {
        emit: (e) => subs.forEach((fn) => fn(e)),
        subscribe: (fn) => (subs.add(fn), () => subs.delete(fn)),
      };
    }

    registerPrefetchHeatmapPlugin({
      registerPanel: ({ mount }) => { if (ref.current) mount(ref.current); },
      subscribeToEvents: (_type, fn) => window.__TANSTACK_DEVTOOLS_EVENT_CLIENT__!.subscribe(fn),
      sendToPage: (msg) => {
        if (msg.type === "router.overlay.toggle") {
          document.documentElement.toggleAttribute("data-tsr-heatmap", msg.enabled);
        }
      },
    });
  }, []);

  return <div ref={ref} style={{ minHeight: 240, overflow: "auto" }} />;
}
```

---

## Using it in your app

### 1) Install
```bash
pnpm add @tanstack/react-router @dimano/tsr-prefetch-reporter
```

### 2) Wire a tracked link
```tsx
import { TrackedLink } from "@dimano/tsr-prefetch-reporter";
// normal usage; you can pass any props supported by TanStack Router's <Link />

<nav>
  <TrackedLink to="/invoices" preload="intent">Invoices</TrackedLink>
  <TrackedLink to="/customers" preload={true}>Customers</TrackedLink>
  <TrackedLink to="/reports" preload="intent">Reports</TrackedLink>
</nav>
```

### 3) Turn on the overlay
Open the Prefetch Heatmap panel in Devtools; toggle **Enable overlay**. The plugin sets `data-tsr-heatmap` on `<html>`; the reporter annotates links with `data-tsr-prefetch="pending|hit|waste"`; your overlay CSS will color them.

---

## Screenshots

Marketplace card; panel; and overlay colors.

![Prefetch Heatmap](https://raw.githubusercontent.com/dimitrianoudi/tanstack-prefetch-heatmap/main/assets/prefetch-heatmap-card.png)

---

## Repo layout

```
tanstack-prefetch-heatmap/
├─ packages/
│  ├─ tsr-prefetch-reporter/                 # @dimano/tsr-prefetch-reporter
│  └─ ts-devtools-plugin-prefetch-heatmap/   # @dimano/ts-devtools-plugin-prefetch-heatmap
└─ apps/
   └─ demo/                                  # Vite app; Dock host; example routes
```

---

## Requirements

- Node 18 or 20; LTS recommended  
- pnpm ≥ 9

---

## Quickstart for this repo

```bash
pnpm i
pnpm --dir apps/demo dev
# open the printed URL; usually http://localhost:5173
```

In the browser, hover the nav links, click to navigate, open the docked Prefetch Heatmap panel, and toggle the overlay.

---

## Scripts

At the repo root:

```bash
pnpm -r build                     # build packages; demo optional if configured
pnpm -r typecheck                 # typecheck everything
pnpm --dir apps/demo dev          # run the demo
pnpm --dir apps/demo preview      # preview the production build
```

Optional convenience:

```json
{
  "scripts": {
    "watch:libs": "pnpm -r --filter @dimano/* exec tsc -p tsconfig.json --watch",
    "predev": "pnpm -r --filter @dimano/* build",
    "dev": "pnpm --dir apps/demo dev"
  }
}
```

---

## Package entry points

Both packages export ESM from `dist` when published.

Example `package.json` fields:
```json
{
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" }
  },
  "sideEffects": ["dist/overlay-style.css"]
}
```

The plugin re-exports its public types:
```ts
export type { ReporterEvent, PrefetchTrigger } from "./types";
```

---

## Troubleshooting

- **Cannot find module or incorrect exports**: ensure `package.json` points `main` and `exports.import` to real files; rebuild; reinstall.
- **TypeScript cannot find `ReporterEvent`**: make sure the plugin re-exports the type from its entry and your consumer uses the published `dist` types.
- **Overlay does not color links**: confirm `<html data-tsr-heatmap>` is present and links have `data-tsr-prefetch` set by the reporter.
- **React root warnings**: create and reuse a single `createRoot` per panel container; avoid unmounting synchronously during StrictMode or HMR.
- **CI frozen lockfile**: in workflows use `pnpm install --no-frozen-lockfile`.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). PRs and issues welcome.

---

## License

MIT © Dimitris Anoudis
