import type { ReporterEvent, PrefetchTrigger } from "./types";

export type LocalEvent =
  | { type: "router.prefetch.request"; href: string; routeId: string; trigger: PrefetchTrigger; ts: number }
  | { type: "router.nav.complete";     href: string; routeId: string; ts: number };

export type PrefetchState = {
  ttlMs: number;
  counts: { intent: number; hit: number; waste: number };
  recent: LocalEvent[];
};

type Listener = (s: PrefetchState) => void;

export function createPrefetchStore(initialTtlMs = 4000) {
  let state: PrefetchState = {
    ttlMs: initialTtlMs,
    counts: { intent: 0, hit: 0, waste: 0 },
    recent: [],
  };

  const listeners = new Set<Listener>();

  const pending = new Map<string, { ts: number; timeout: number }[]>();

  function notify() {
    listeners.forEach((l) => l(state));
  }

  function setTtlMs(next: number) {
    state = { ...state, ttlMs: next };
    notify();
  }

  function subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function getState() {
    return state;
  }

  function pushRecent(ev: LocalEvent) {
    state = { ...state, recent: [ev, ...state.recent].slice(0, 20) };
  }

  function onRequest(href: string, routeId: string, trigger: PrefetchTrigger, ts: number) {
    state = { ...state, counts: { ...state.counts, intent: state.counts.intent + 1 } };

    const list = pending.get(href) ?? [];
    const timeout = window.setTimeout(() => {
      const cur = pending.get(href) ?? [];
      cur.shift();
      if (cur.length) pending.set(href, cur);
      else pending.delete(href);

      state = { ...state, counts: { ...state.counts, waste: state.counts.waste + 1 } };
      notify();
    }, state.ttlMs);
    list.push({ ts, timeout });
    pending.set(href, list);

    pushRecent({ type: "router.prefetch.request", href, routeId, trigger, ts });
    notify();
  }

  function onNavComplete(href: string, routeId: string, ts: number) {
    const list = pending.get(href);
    if (list && list.length) {
      const entry = list.shift()!;
      clearTimeout(entry.timeout);
      if (list.length) pending.set(href, list);
      else pending.delete(href);

      state = { ...state, counts: { ...state.counts, hit: state.counts.hit + 1 } };
    }

    pushRecent({ type: "router.nav.complete", href, routeId, ts });
    notify();
  }

  function handle(e: ReporterEvent) {
    const now = Date.now();
    if (e.type === "router.prefetch.request") {
      onRequest(e.href, e.routeId, e.trigger, now);
      return;
    }
    if (e.type === "router.nav.complete") {
      onNavComplete(e.href, e.routeId, now);
      return;
    }
  }

  return {
    getState,
    subscribe,
    setTtlMs,
    handle,
  };
}
