import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import { PrefetchHeatmapPanel } from "./panel";
import type { ReporterEvent } from "./types";
import "./overlay-style.css";

export default function registerPrefetchHeatmapPlugin(host: {
  registerPanel: (tab: { id: string; title: string; mount: (el: HTMLElement) => void }) => void;
  subscribeToEvents: (type: "router.*" | "*", fn: (e: ReporterEvent) => void) => () => void;
  sendToPage?: (msg: ReporterEvent) => void;
}) {
  host.registerPanel({
    id: "prefetch-heatmap",
    title: "Prefetch Heatmap",
    mount: (el) => {
      const anyEl = el as unknown as { __root?: Root };
      if (!anyEl.__root) {
        anyEl.__root = createRoot(el);
      }
      anyEl.__root.render(
        <PrefetchHeatmapPanel
          subscribe={(fn) => host.subscribeToEvents("router.*", fn)}
          sendToPage={host.sendToPage}
        />
      );
    }
  });
}

export type { ReporterEvent } from "./types";