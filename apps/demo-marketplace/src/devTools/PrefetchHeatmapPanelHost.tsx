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
  const registeredRef = React.useRef(false);

  React.useEffect(() => {
    // simple in-memory event bus if not present
    if (!window.__TANSTACK_DEVTOOLS_EVENT_CLIENT__) {
      const subs = new Set<(e: ReporterEvent) => void>();
      window.__TANSTACK_DEVTOOLS_EVENT_CLIENT__ = {
        emit: (e) => subs.forEach((fn) => fn(e)),
        subscribe: (fn) => (subs.add(fn), () => subs.delete(fn)),
      };
    }

    if (registeredRef.current) return;
    registeredRef.current = true;

    registerPrefetchHeatmapPlugin({
      registerPanel: ({ mount }) => {
        if (ref.current) mount(ref.current);
      },
      subscribeToEvents: (_type, fn) =>
        window.__TANSTACK_DEVTOOLS_EVENT_CLIENT__!.subscribe(fn),
      sendToPage: (msg) => {
        if (msg.type === "router.overlay.toggle") {
          document.documentElement.toggleAttribute("data-tsr-heatmap", msg.enabled);
        }
      },
    });
  }, []);

  return <div ref={ref} style={{ minHeight: 240, overflow: "auto" }} />;
}
