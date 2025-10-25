export type PrefetchTrigger = "hover" | "focus" | "viewport" | "programmatic";

export type PrefetchRequestEvent = {
  type: "router.prefetch.request";
  routeId: string;
  href: string;
  trigger: PrefetchTrigger;
  at: number;
};

export type PrefetchResultEvent = {
  type: "router.prefetch.result";
  routeId: string;
  href: string;
  ok: boolean;
  status?: number | "timeout" | "cancelled" | "error";
  at: number;
};

export type NavigationCompleteEvent = {
  type: "router.nav.complete";
  routeId: string;
  href: string;
  at: number;
  ttiMs?: number;
  hadPrefetch?: boolean;
  prefetchAgeMs?: number;
};

export type OverlayToggleEvent = {
  type: "router.overlay.toggle";
  enabled: boolean;
};

export type ReporterEvent =
  | PrefetchRequestEvent
  | PrefetchResultEvent
  | NavigationCompleteEvent
  | OverlayToggleEvent;

export type EmitFn = (ev: ReporterEvent) => void;

export type ReporterOptions = {
  emit?: EmitFn;
  staleTimeMs?: number;
  enableOverlay?: boolean;
  computeTTI?: () => Promise<number>;
};
