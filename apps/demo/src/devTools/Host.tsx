import * as React from "react";
import registerPrefetchHeatmapPlugin from "@dimano/ts-devtools-plugin-prefetch-heatmap";
import type { ReporterEvent } from "@dimano/ts-devtools-plugin-prefetch-heatmap";

type Subscriber = (e: ReporterEvent) => void;

export function DevtoolsDock() {
  const [open, setOpen] = React.useState(true);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const subs = React.useRef<Set<Subscriber>>(new Set());
  const registeredRef = React.useRef(false);

  React.useEffect(() => {
    window.__TANSTACK_DEVTOOLS_EVENT_CLIENT__ = {
      emit: (e: ReporterEvent) => { for (const fn of subs.current) fn(e); }
    };
    const onMsg = (e: MessageEvent) => {
      if (e.data?.__tanstackDevtools) {
        const ev = e.data.payload as ReporterEvent;
        for (const fn of subs.current) fn(ev);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  React.useEffect(() => {
    if (!panelRef.current || registeredRef.current) return;
    registeredRef.current = true;

    const hostApi = {
      registerPanel(tab: { id: string; title: string; mount: (el: HTMLElement) => void }) {
        tab.mount(panelRef.current!);
      },
      subscribeToEvents: (_type: "router.*" | "*", fn: Subscriber) => {
        subs.current.add(fn); return () => subs.current.delete(fn);
      },
      sendToPage: (msg: ReporterEvent) => {
        if (msg.type === "router.overlay.toggle") {
          document.documentElement.toggleAttribute("data-tsr-heatmap", msg.enabled);
        }
      }
    };

    registerPrefetchHeatmapPlugin(hostApi);
  }, []);

  return (
    <>
      <button id="devtools-toggle" onClick={() => setOpen(o => !o)}>
        {open ? "Hide Devtools" : "Show Devtools"}
      </button>

      <section
        id="devtools-dock"
        aria-label="Devtools Dock"
        aria-hidden={!open}
        style={{ display: open ? "flex" : "none" }}
      >
        <header><strong>TanStack Devtools - Demo Host</strong></header>
        <main ref={panelRef} />
      </section>
    </>
  );
}
