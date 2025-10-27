export type PrefetchTrigger = "hover" | "focus";

export type PrefetchRequestEvent = {
  type: "router.prefetch.request";
  href: string;
  routeId: string;
  trigger: PrefetchTrigger;
  at: number;
  atts?: Record<string, unknown>;
};

export type NavigationCompleteEvent = {
  type: "router.nav.complete";
  href: string;
  routeId: string;
  at: number;
};

export type OverlayToggleEvent = {
  type: "router.overlay.toggle";
  enabled: boolean;
};

export type ReporterEvent =
  | PrefetchRequestEvent
  | NavigationCompleteEvent
  | OverlayToggleEvent;
