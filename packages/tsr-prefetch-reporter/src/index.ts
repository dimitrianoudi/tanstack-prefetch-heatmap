import { defaultEmit } from "./bridge";
import type {
  ReporterOptions,
  PrefetchTrigger,
  PrefetchRequestEvent,
  PrefetchResultEvent,
  NavigationCompleteEvent
} from "./types";

export type { ReporterOptions, PrefetchTrigger } from "./types";

type MinimalRouter = {
  preload?: (href: string) => Promise<unknown>;
  navigate?: (opts: { to: string } | string) => Promise<void> | void;
  resolve?: (href: string) => { id: string } | undefined;
};

export function createPrefetchReporter(router: MinimalRouter, opts: ReporterOptions = {}) {
  const emit = opts.emit ?? defaultEmit;
  const staleTimeMs = opts.staleTimeMs ?? 60_000;
  const prefetchTimes = new Map<string, number>();

  async function reportPrefetch(href: string, trigger: PrefetchTrigger) {
    const id = router.resolve?.(href)?.id ?? href;
    const req: PrefetchRequestEvent = {
      type: "router.prefetch.request",
      routeId: id,
      href,
      trigger,
      at: performance.now()
    };
    prefetchTimes.set(href, req.at);
    emit(req);

    if (router.preload) {
      try {
        await router.preload(href);
        emit({ type: "router.prefetch.result", routeId: id, href, ok: true, at: performance.now() });
      } catch {
        emit({ type: "router.prefetch.result", routeId: id, href, ok: false, status: "error", at: performance.now() });
      }
    }
  }

  async function measureTTI(): Promise<number> {
    await new Promise(r => requestAnimationFrame(() => r(null)));
    await new Promise(r => setTimeout(r, 0));
    return 0;
  }

  async function reportNavigation(href: string) {
    const id = router.resolve?.(href)?.id ?? href;
    const start = performance.now();
    const navPromise = typeof router.navigate === "function"
      ? Promise.resolve(router.navigate(typeof href === "string" ? href : { to: href }))
      : Promise.resolve();

    await navPromise;
    const tti = await measureTTI();

    const completedAt = performance.now();
    const prefetchedAt = prefetchTimes.get(href);
    const age = prefetchedAt ? completedAt - prefetchedAt : undefined;
    const hadPrefetch = typeof age === "number" && age >= 0 && age <= staleTimeMs;

    const ev: NavigationCompleteEvent = {
      type: "router.nav.complete",
      routeId: id,
      href,
      at: completedAt,
      ttiMs: completedAt - start + tti,
      hadPrefetch,
      prefetchAgeMs: age
    };
    emit(ev);
  }

  function setOverlay(enabled: boolean) {
    emit({ type: "router.overlay.toggle", enabled });
    if (enabled) document.documentElement.setAttribute("data-tsr-heatmap", "");
    else document.documentElement.removeAttribute("data-tsr-heatmap");
  }

  return { reportPrefetch, reportNavigation, setOverlay };
}
