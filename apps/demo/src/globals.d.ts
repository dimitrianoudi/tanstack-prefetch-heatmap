import type { ReporterEvent } from "@dimano/ts-devtools-plugin-prefetch-heatmap";

declare global {
  interface Window {
    __TANSTACK_DEVTOOLS_EVENT_CLIENT__?: {
      emit: (e: ReporterEvent) => void;
    };
  }
}
export {};