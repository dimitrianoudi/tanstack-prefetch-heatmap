# TanStack React Devtools Marketplace Demo (pnpm + Vite + TypeScript)

A minimal scaffold to try **@tanstack/react-devtools** locally with **Vite** and **TypeScript**, using **pnpm** — including the **Marketplace** to add third-party plugins.

---

## Prerequisites
- Node ≥ 18
- pnpm ≥ 9

---

## Quickstart

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints (usually http://localhost:5173).  
**Open Devtools:** hover the right edge of the page or press **`d`**.

---

## Add a plugin from the Marketplace

1. Open the Devtools dock in the app.
2. Go to **Marketplace → Add to Devtools**.
3. Search for a plugin (e.g. **“Prefetch Heatmap”**) and click **Add**.
4. Select the new panel to use it. Some plugins expose an **overlay** toggle.

> When added through the Marketplace, the Devtools host resolves the plugin import automatically — no manual imports are needed in this demo.

---

## What’s included

- **Devtools dock** mounted in `src/main.tsx`
- **Vite plugin** `@tanstack/devtools-vite` enabled in `vite.config.ts`
- **TypeScript** configured with `"moduleResolution": "NodeNext"` (friendly with modern bundlers)
- Simple example page you can extend while testing plugins

---

## Key files

**`src/main.tsx`** (Devtools dock mounted once at the root)
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { TanStackDevtools } from "@tanstack/react-devtools";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <TanStackDevtools config={{ hideUntilHover: true }} />
  </React.StrictMode>
);
```

**`vite.config.ts`** (enable the Devtools Vite plugin)
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { devtools } from "@tanstack/devtools-vite";

export default defineConfig({
  plugins: [react(), devtools()],
});
```

---

## Build & Preview

```bash
pnpm build
pnpm preview
```

---

## Notes / Tips

- You don’t need React Query or Router just to open the **core** Devtools dock; add frameworks or third-party plugins as needed.
- If you add a plugin **manually** (without Marketplace), pass it via the `plugins` prop:
  ```tsx
  // Example (only if you host a panel yourself)
  <TanStackDevtools
    plugins={[
      { name: "My Plugin", render: <MyPluginHost /> },
    ]}
  />
  ```
- If the dock doesn’t appear, ensure the Vite plugin is enabled and there’s no duplicate Devtools mount in your app.

---

## License

MIT
