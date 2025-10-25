import type { ReporterEvent } from "./types";

export type RouteStats = {
  routeId: string;
  prefetches: number;
  successes: number;
  failures: number;
  wasted: number;
  clicks: number;
  hitOnNav: number;
  avgPrefetchAgeMs: number;
  avgTTIMs: number;
};

export function createStore(ttlMs = 60_000) {
  const stats = new Map<string, RouteStats>();
  const pendingPrefetch = new Map<string, number>();

  function get(rid: string): RouteStats {
    if (!stats.has(rid)) {
      stats.set(rid, {
        routeId: rid, prefetches: 0, successes: 0, failures: 0, wasted: 0,
        clicks: 0, hitOnNav: 0, avgPrefetchAgeMs: 0, avgTTIMs: 0
      });
    }
    return stats.get(rid)!;
  }

  function ingest(ev: ReporterEvent) {
    if (ev.type === "router.prefetch.request") {
      get(ev.routeId).prefetches++;
      pendingPrefetch.set(ev.href, ev.at);
    } else if (ev.type === "router.prefetch.result") {
      const s = get(ev.routeId);
      ev.ok ? s.successes++ : s.failures++;
    } else if (ev.type === "router.nav.complete") {
      const s = get(ev.routeId);
      s.clicks++;
      if (ev.hadPrefetch) s.hitOnNav++;
      if (typeof ev.prefetchAgeMs === "number") {
        const prev = s.avgPrefetchAgeMs;
        s.avgPrefetchAgeMs = prev === 0 ? ev.prefetchAgeMs : (prev + ev.prefetchAgeMs) / 2;
      }
      if (typeof ev.ttiMs === "number") {
        const prev = s.avgTTIMs;
        s.avgTTIMs = prev === 0 ? ev.ttiMs : (prev + ev.ttiMs) / 2;
      }
      for (const [href, at] of [...pendingPrefetch.entries()]) {
        if (performance.now() - at > ttlMs) {
          pendingPrefetch.delete(href);
          s.wasted++;
        }
      }
    }
  }

  function exportRows() {
    return [...stats.values()].sort((a, b) => b.prefetches - a.prefetches);
  }

  return { ingest, exportRows };
}
