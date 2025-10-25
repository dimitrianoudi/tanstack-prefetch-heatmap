export type ReporterEvent =
  | { type: "router.prefetch.request"; routeId: string; href: string; trigger: string; at: number }
  | { type: "router.prefetch.result"; routeId: string; href: string; ok: boolean; status?: number | string; at: number }
  | { type: "router.nav.complete"; routeId: string; href: string; at: number; ttiMs?: number; hadPrefetch?: boolean; prefetchAgeMs?: number }
  | { type: "router.overlay.toggle"; enabled: boolean };
