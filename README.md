# TanStack Prefetch Heatmap Devtools (monorepo)

A tiny developer-tooling experiment for **TanStack React Router** that visualizes and measures **link prefetch intent** vs **actual navigation**. It ships as:

- `@dimano/tsr-prefetch-reporter` – app-side helper that emits prefetch + navigation events.
- `@dimano/ts-devtools-plugin-prefetch-heatmap` – a Devtools panel that aggregates events and shows:
  - Prefetch count / success
  - Hit rate (prefetch that led to a click)
  - Wasted prefetches (expired)
  - Avg prefetch age & avg TTI
- `apps/demo` – a React app (Vite) with a docked Devtools host to try it end-to-end.

> Goal: help teams tune prefetch strategies (hover, intent, viewport) and quantify waste vs wins.

---

## Repo layout

```
tanstack-prefetch-heatmap/
├─ packages/
│  ├─ tsr-prefetch-reporter/                 # @dimano/tsr-prefetch-reporter
│  └─ ts-devtools-plugin-prefetch-heatmap/   # @dimano/ts-devtools-plugin-prefetch-heatmap
└─ apps/
   └─ demo/                                  # Vite app + Devtools dock host
```

---

## Requirements

- Node 18 or 20 (recommended: LTS)
- pnpm ≥ 9

---

## Quickstart (dev)

```bash
# from repo root
pnpm i
pnpm --dir apps/demo dev
# open http://localhost:5173
```

In the browser:
1. Hover the **Invoices / Customers / Reports** links (triggers prefetch intent).
2. Click around.
3. Open the dock at the bottom, select **Prefetch Heatmap**.
4. Toggle **Enable overlay** to annotate links in-page.

> With the current workspace setup the demo imports package **sources** directly, so rebuilding the libs is not required during dev.

---

## Scripts

At the repo root:

```bash
pnpm -r build          # build libs + demo
pnpm -r typecheck      # typecheck everything
pnpm --dir apps/demo dev      # run the demo (Vite)
pnpm --dir apps/demo preview  # preview the production build
```

Optional convenience (add to root `package.json` if you like):

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

## Using it in *your* app

### 1) Install
```bash
pnpm add @dimano/tsr-prefetch-reporter @dimano/ts-devtools-plugin-prefetch-heatmap @tanstack/react-router
```

### 2) Wire a tracked link
```tsx
import { TrackedLink } from "@dimano/tsr-prefetch-reporter";
import { useRouter, Link } from "@tanstack/react-router";

function Nav() {
  const router = useRouter();
  return (
    <nav>
      <Link to="/">Home</Link>
      <TrackedLink router={router} to="/invoices" preload="intent">Invoices</TrackedLink>
      <TrackedLink router={router} to="/customers" preload={true}>Customers</TrackedLink>
    </nav>
  );
}
```

### 3) Mount the Devtools panel (host)
Your devtools host should call the plugin’s default export once:

```tsx
import registerPrefetchHeatmapPlugin from "@dimano/ts-devtools-plugin-prefetch-heatmap";

registerPrefetchHeatmapPlugin({
  registerPanel: ({ mount }) => mount(document.getElementById("your-devtools-panel")!),
  subscribeToEvents: (_type, fn) => {
    // pipe events from your page -> devtools bus
    return () => {/* unsubscribe */}
  },
  sendToPage: (msg) => {
    // send commands (e.g. overlay toggle) back into the page if desired
  }
});
```

The demo app includes a minimal host you can reference: `apps/demo/src/devtools/Host.tsx`.

---

## Publishing (npm)

> Only needed if you want to publish the packages publicly under `@dimano`.

1. Ensure `package.json` of both packages point to **built** files (recommended for publish):

   ```json
   {
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "exports": { ".": { "import": "./dist/index.js", "types": "./dist/index.d.ts" } },
     "sideEffects": ["dist/overlay-style.css"]
   }
   ```

2. Build & publish:

   ```bash
   pnpm --filter @dimano/* build
   cd packages/tsr-prefetch-reporter && npm publish --access public
   cd ../ts-devtools-plugin-prefetch-heatmap && npm publish --access public
   ```

3. Keep peer ranges broad for compatibility (suggested):

   ```json
   "peerDependencies": {
     "react": ">=18.2.0 <20",
     "react-dom": ">=18.2.0 <20",
     "@tanstack/react-router": ">=1.0.0"
   }
   ```

---

## Troubleshooting

- **Vite: “Failed to resolve entry for package …”**  
  Ensure each package’s `package.json` “exports” points to real files. In dev we point at `src`; in publish at `dist`.

- **TypeScript: package has no exported member `ReporterEvent`**  
  The plugin re-exports the type at its root. If TS still can’t find it, ensure:
  - `packages/ts-devtools-plugin-prefetch-heatmap/src/index.tsx` has  
    `export type { ReporterEvent } from "./types";`
  - `package.json` `"types"` / `"exports.types"` point to a file that re-exports it (we use `src/index.d.ts`).

- **React DOM “already passed to createRoot” / unmount warnings**  
  Don’t call `createRoot` more than once per container and don’t unmount synchronously during StrictMode/HMR. The demo host and plugin already cache a `Root` per element.

- **Parcel + SWC native binding on macOS**  
  We switched the demo to Vite to avoid SWC native binaries. If you use Parcel elsewhere, either use Babel transformers or clear quarantine flags.

---

## License

MIT © Dimano
