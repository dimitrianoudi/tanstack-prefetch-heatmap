import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { PrefetchHeatmapPanel } from "./panel";
import type { ReporterEvent } from "./types";

function asReporterEvent(e: any): ReporterEvent | null {
  if (!e || typeof e !== "object") return null;
  if (e.type === "router.prefetch.request") {
    if (typeof e.href === "string" && typeof e.routeId === "string" && (e.trigger === "hover" || e.trigger === "focus") && typeof e.at === "number") {
      return e as ReporterEvent;
    }
    return null;
  }
  if (e.type === "router.nav.complete") {
    if (typeof e.href === "string" && typeof e.routeId === "string" && typeof e.at === "number") {
      return e as ReporterEvent;
    }
    return null;
  }
  if (e.type === "router.overlay.toggle") {
    if (typeof e.enabled === "boolean") return e as ReporterEvent;
    return null;
  }
  return null;
}

function ErrorBoundary(props: { children: React.ReactNode }) {
  const [err, setErr] = React.useState<Error | null>(null);
  if (err) {
    return (
      <div style={{ padding: 12, fontFamily: "ui-sans-serif" }}>
        <div style={{ fontWeight: 700, color: "#b91c1c" }}>Prefetch Heatmap crashed</div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{String(err.stack || err.message || err)}</pre>
      </div>
    );
  }
  return (
    <React.Suspense fallback={<div style={{ padding: 12 }}>Loading Prefetch Heatmap…</div>}>
      <Inner setErr={setErr}>{props.children}</Inner>
    </React.Suspense>
  );
}
function Inner({ setErr, children }: { setErr: (e: Error) => void; children: React.ReactNode }) {
  React.useEffect(() => {
    const onError = (e: any) => setErr(e instanceof Error ? e : new Error(String(e)));
    return () => {};
  }, [setErr]);
  return <>{children}</>;
}

export default function registerPrefetchHeatmapPlugin(host: {
  registerPanel: (tab: { id: string; title: string; mount: (el: HTMLElement) => void }) => void;
  subscribeToEvents: (type: "router.*" | "*", fn: (e: any) => void) => () => void;
  sendToPage?: (msg: ReporterEvent) => void;
}) {
  host.registerPanel({
    id: "prefetch-heatmap",
    title: "Prefetch Heatmap",
    mount: (el) => {
      el.innerHTML = `<div style="padding:12px;font-family:ui-sans-serif;color:#374151">Mounting Prefetch Heatmap…</div>`;
      const anyEl = el as unknown as { __root?: Root };
      if (!anyEl.__root) {
        anyEl.__root = createRoot(el);
      }

      console.log("[prefetch-heatmap] mount called");

      const subscribe = (fn: (e: ReporterEvent) => void) => {
        return host.subscribeToEvents("router.*", (raw: any) => {
          const ev = asReporterEvent(raw);
          if (!ev) return;
          if ((window as any).__PREFETCH_LOG__ < 3 || (window as any).__PREFETCH_LOG__ === undefined) {
            (window as any).__PREFETCH_LOG__ = ((window as any).__PREFETCH_LOG__ ?? 0) + 1;
            console.log("[prefetch-heatmap] event", ev);
          }
          fn(ev);
        });
      };

      try {
        anyEl.__root.render(
          <ErrorBoundary>
            <PrefetchHeatmapPanel
              subscribe={subscribe}
              sendToPage={host.sendToPage}
            />
          </ErrorBoundary>
        );
      } catch (e) {
        el.innerHTML = `<div style="padding:12px;font-family:ui-sans-serif;color:#b91c1c">Render error: ${String(e)}</div>`;
        console.error("[prefetch-heatmap] render error", e);
      }
    },
  });
}

export type { ReporterEvent, PrefetchTrigger } from "./types";