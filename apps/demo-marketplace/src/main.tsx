import React from "react";
import ReactDOM from "react-dom/client";
import { RouterRoot } from "./router";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { PrefetchHeatmapPanelHost } from "./devTools/PrefetchHeatmapPanelHost";

const rootEl = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <RouterRoot />

    <TanStackDevtools
      config={{ hideUntilHover: true }}
      plugins={[{ name: "Prefetch Heatmap", render: <PrefetchHeatmapPanelHost /> }]}
    />
  </React.StrictMode>
);
