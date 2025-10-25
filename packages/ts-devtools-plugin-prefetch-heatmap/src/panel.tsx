import * as React from "react";
import { createStore } from "./store";
import type { ReporterEvent } from "./types";
import "./overlay-style.css";

type Props = {
  subscribe: (fn: (ev: ReporterEvent) => void) => () => void;
  sendToPage?: (msg: ReporterEvent) => void;
};

export function PrefetchHeatmapPanel({ subscribe, sendToPage }: Props) {
  const [ttl, setTtl] = React.useState(60_000);
  const [rows, setRows] = React.useState<ReturnType<ReturnType<typeof createStore>["exportRows"]>>([]);
  const storeRef = React.useRef(createStore(ttl));

  React.useEffect(() => {
    storeRef.current = createStore(ttl);
    setRows(storeRef.current.exportRows());
  }, [ttl]);

  React.useEffect(() => {
    return subscribe((ev) => {
      storeRef.current.ingest(ev);
      setRows(storeRef.current.exportRows());
    });
  }, [subscribe]);

  const [overlay, setOverlay] = React.useState(false);
  const toggleOverlay = () => {
    const next = !overlay;
    setOverlay(next);
    sendToPage?.({ type: "router.overlay.toggle", enabled: next });
  };

  return (
    <div style={{ padding: 12, fontFamily: "ui-sans-serif, system-ui" }}>
      <h3 style={{ margin: 0 }}>Router Prefetch Heatmap</h3>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
        <label>TTL: ms</label>
        <input type="number" value={ttl} min={0} step={1000} onChange={e => setTtl(Number(e.target.value))} />
        <button onClick={toggleOverlay}>{overlay ? "Disable overlay" : "Enable overlay"}</button>
      </div>

      <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Route</th>
            <th>Prefetches</th>
            <th>Hit rate</th>
            <th>Wasted</th>
            <th>Avg Age: ms</th>
            <th>Avg TTI: ms</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const hitRate = r.prefetches ? Math.round((r.hitOnNav / r.prefetches) * 100) : 0;
            return (
              <tr key={r.routeId}>
                <td>{r.routeId}</td>
                <td style={{ textAlign: "center" }}>{r.prefetches}</td>
                <td style={{ textAlign: "center" }}>{hitRate}%</td>
                <td style={{ textAlign: "center" }}>{r.wasted}</td>
                <td style={{ textAlign: "center" }}>{Math.round(r.avgPrefetchAgeMs)}</td>
                <td style={{ textAlign: "center" }}>{Math.round(r.avgTTIMs)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Tip: turn on overlay, hover links, click around, watch the table update live.
      </p>
    </div>
  );
}
