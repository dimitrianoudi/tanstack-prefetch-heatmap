import * as React from "react";
import registerPrefetchHeatmapPlugin from "@dimano/ts-devtools-plugin-prefetch-heatmap";
import type { ReporterEvent } from "@dimano/ts-devtools-plugin-prefetch-heatmap";

export function DevtoolsDock() {
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const w = window as any;

    if (!w.__TANSTACK_DEVTOOLS_EVENT_CLIENT__) {
      const subs = new Set<(e: any) => void>();
      w.__TANSTACK_DEVTOOLS_EVENT_CLIENT__ = {
        emit: (e: any) => subs.forEach((fn) => fn(e)),
        subscribe: (fn: (e: any) => void) => {
          subs.add(fn);
          return () => subs.delete(fn);
        },
      };
    }

    const disposers: Array<() => void> = [];

    registerPrefetchHeatmapPlugin({
      registerPanel: ({ mount }) => {
        const tryMount = () => {
          if (panelRef.current) mount(panelRef.current);
          else {
            const id = setTimeout(tryMount, 0);
            disposers.push(() => clearTimeout(id));
          }
        };
        tryMount();
      },
      subscribeToEvents: (_type: "router.*" | "*", fn: (e: any) => void) => {
        return (w.__TANSTACK_DEVTOOLS_EVENT_CLIENT__ as {
          subscribe: (fn: (e: any) => void) => () => void;
        }).subscribe(fn);
      },
      sendToPage: (msg: ReporterEvent) => {
        if (msg.type === "router.overlay.toggle") {
          document.documentElement.toggleAttribute("data-tsr-heatmap", msg.enabled);
        }
      },
    });

    return () => {
      disposers.forEach((d) => d());
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        width: 380,
        maxHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          padding: "8px 10px",
          fontWeight: 600,
          fontFamily: "ui-sans-serif, system-ui",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        TanStack Devtools — Prefetch Heatmap
      </div>
      <div ref={panelRef} style={{ minHeight: 240, overflow: "auto" }} />
    </div>
  );
}

export default DevtoolsDock;
