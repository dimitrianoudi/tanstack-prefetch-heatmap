import type { EmitFn, ReporterEvent } from "./types";

declare global {
  interface Window {
    __TANSTACK_DEVTOOLS_EVENT_CLIENT__?: { emit: EmitFn };
  }
}

export const defaultEmit: EmitFn = (ev: ReporterEvent) => {
  if (window.__TANSTACK_DEVTOOLS_EVENT_CLIENT__?.emit) {
    window.__TANSTACK_DEVTOOLS_EVENT_CLIENT__!.emit(ev);
    return;
  }
  window.postMessage({ __tanstackDevtools: true, payload: ev }, "*");
};
