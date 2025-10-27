# Contributing to `tanstack-prefetch-heatmap`

Thanks for wanting to contribute! 🎉  
This repo contains a small monorepo with:

- `packages/tsr-prefetch-reporter` – the lightweight reporter (emits events + adds DOM attrs)
- `packages/ts-devtools-plugin-prefetch-heatmap` – the DevTools plugin panel & overlay wiring
- `apps/demo` – a minimal app to exercise the reporter + plugin

We use **pnpm workspaces**, **TypeScript**, **React 19**, and **TanStack Router v1**.

---

## Prereqs

- **Node**: ≥ 18.18 (20.x recommended)
- **pnpm**: ≥ 8 (we install on CI via `pnpm/action-setup`)
- **Git**: any recent version

Recommended local setup:

```bash
corepack enable
# or install pnpm:
npm i -g pnpm
```

---

## Getting started

```bash
# 1) Install deps (workspace-aware)
pnpm i

# 2) Typecheck everything
pnpm -r typecheck

# 3) Build packages (dist/)
pnpm -r --filter "./packages/*" build

# 4) Run the demo
pnpm --dir apps/demo dev
```

Open the demo at the printed Vite URL (usually http://localhost:5173).  
Enable the overlay in the dock, hover links, and click to see intents/hits/waste.

---

## Workspace layout

```
.
├─ packages/
│  ├─ tsr-prefetch-reporter/              # emits devtools events & sets data attributes
│  └─ ts-devtools-plugin-prefetch-heatmap/ # DevTools panel UI + overlay bridge
├─ apps/
│  └─ demo/                               # simple app exercising both packages
├─ assets/                                # images used in READMEs or marketplace card
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
└─ .github/workflows/ci.yml
```

---

## Scripts you’ll use

### Root
```bash
pnpm -r typecheck                          # Type-check all projects
pnpm -r --filter "./packages/*" build      # Build both packages
pnpm --dir apps/demo dev                   # Run the demo (Vite)
pnpm --dir apps/demo build                 # Build demo for production (optional)
```

### In a specific package
```bash
cd packages/tsr-prefetch-reporter
pnpm build
pnpm typecheck
```

---

## Code style & conventions

- **TypeScript**: `strict: true`. Prefer explicit types on public APIs.
- **React**: 19+ with `react-jsx`. Avoid legacy patterns; use function components.
- **Events** (`ReporterEvent`) must match the exported types in `packages/ts-devtools-plugin-prefetch-heatmap/src/types.ts`.
- **No custom fields** on events unless we update the shared types.
- **Conventional Commits** for messages (e.g., `feat: …`, `fix: …`, `chore: …`).

---

## DevTools wiring (quick sanity)

- Reporter emits via the global bus:
  ```ts
  (window as any).__TANSTACK_DEVTOOLS_EVENT_CLIENT__?.emit?.(event)
  ```
- The demo’s **Devtools Dock** sets up that bus and registers the plugin.
- Toggle overlay = adds/removes `data-tsr-heatmap` on `<html>`.

If you don’t see the panel UI:
- Make sure the dock mounts and calls `registerPrefetchHeatmapPlugin`.
- Check the console for `[prefetch-heatmap]` logs.
- Confirm the demo renders a `<TrackedLink>`.

---

## Making changes

1) **Small change** in one package
```bash
# hack
pnpm -r typecheck
pnpm -r --filter "./packages/*" build
pnpm --dir apps/demo dev
```

2) **Change shared event types**  
Update `packages/ts-devtools-plugin-prefetch-heatmap/src/types.ts` first, then:
- Update reporter emit payloads
- Update panel/store to consume the new shape
- Rebuild, run the demo, verify

---

## Testing the overlay & metrics

- In the demo, turn on **Enable overlay** in the dock (adds `data-tsr-heatmap` to `<html>`).
- Hover link → **Intents** increments; row appears in **Recent events**.
- Click within TTL → **Hits** increments when navigation completes.
- Let hover expire (no click) → **Waste** increments after TTL.

---

## Linting / formatting

If you add ESLint/Prettier, keep it simple and consistent.  
(We currently rely on TypeScript strictness and small surface area.)

---

## CI

We run GitHub Actions to:

- Setup Node & pnpm
- Install with `pnpm install --no-frozen-lockfile`
- Typecheck & build
- Optional: demo build

If CI fails with:
- **pnpm missing** → ensure workflow includes `pnpm/action-setup@v4`
- **frozen lockfile** → use `--no-frozen-lockfile`
- **module not found** → verify package exports to `dist/*` and `pnpm -r build` ran

---

## Releasing (maintainers)

Packages are **published to npm** independently.

From each package directory:

```bash
# 1) Build
pnpm -w -r --filter "./packages/*" build

# 2) Bump version (patch/minor/major)
cd packages/tsr-prefetch-reporter
npm version patch -m "chore(release): tsr-prefetch-reporter %s"
npm publish --access public

cd ../ts-devtools-plugin-prefetch-heatmap
npm version patch -m "chore(release): ts-devtools-plugin-prefetch-heatmap %s"
npm publish --access public
```

> If you see `EUNSUPPORTEDPROTOCOL … workspace:*`, run versioning **inside** the package dir (not from the root) as shown above.

Update README badges if needed.

---

## Pull Requests

**Checklist**

- [ ] Feature/bugfix is scoped and explained in PR description
- [ ] `pnpm -r typecheck` passes
- [ ] `pnpm -r --filter "./packages/*" build` passes
- [ ] Demo works: overlay toggles, metrics change
- [ ] Docs updated (README/CHANGELOG as needed)

We’ll review for:
- API shape & event compatibility
- Clear names & types
- Minimal surface area and demo sanity

---

## Troubleshooting

- **“Cannot find module '@dimano/…'”**  
  Ensure the package is built (`dist/*`) and the demo depends on it in the workspace. Re-run `pnpm i` if you changed `exports`/`types` fields.

- **“No exported member”**  
  Re-export types from `src/index.tsx` and make sure `package.json` points `types` to `dist/index.d.ts`.

- **“Failed to resolve entry for package … incorrect exports”**  
  Set:
  ```json
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } }
  ```
  and rebuild.

- **Overlay not coloring**  
  Ensure `<html data-tsr-heatmap>` is present and links have `data-tsr-prefetch="pending|hit|waste"` from the reporter.

---

## License

By contributing, you agree your contributions are licensed under the project’s MIT License.

---

If anything is unclear or you hit a blocker, open an issue with:
- OS, Node, pnpm versions
- What you ran
- Logs/stacktraces
- Screenshot of the devtools dock (if UI-related)

Happy hacking! ✨
