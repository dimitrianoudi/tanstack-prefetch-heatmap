import * as React from "react";
import type { ReporterEvent, PrefetchTrigger } from "./types";

type LocalEvent =
  | { type: "router.prefetch.request"; href: string; routeId: string; trigger: PrefetchTrigger; ts: number }
  | { type: "router.nav.complete";     href: string; routeId: string; ts: number };

export function PrefetchHeatmapPanel(props: {
  subscribe: (fn: (e: ReporterEvent) => void) => () => void;
  sendToPage?: (e: ReporterEvent) => void;
}) {
  const { subscribe, sendToPage } = props;

  const [ttlMs, setTtlMs] = React.useState<number>(4000);
  const [enabled, setEnabled] = React.useState(false);
  const [counts, setCounts] = React.useState({ intent: 0, hit: 0, waste: 0 });
  const [recent, setRecent] = React.useState<LocalEvent[]>([]);

  const pendingRef = React.useRef(
    new Map<string, { ts: number; timeout: number }[]>()
  );

  const addRecent = React.useCallback((ev: LocalEvent) => {
    setRecent((arr) => [ev, ...arr].slice(0, 20));
  }, []);

  React.useEffect(() => {
    return subscribe((raw) => {
      const now = Date.now();

      if (raw.type === "router.prefetch.request") {
        setCounts((c) => ({ ...c, intent: c.intent + 1 }));

        const list = pendingRef.current.get(raw.href) ?? [];
        const timeout = window.setTimeout(() => {
          const cur = pendingRef.current.get(raw.href) ?? [];
          cur.shift();
          if (cur.length) pendingRef.current.set(raw.href, cur);
          else pendingRef.current.delete(raw.href);
          setCounts((c) => ({ ...c, waste: c.waste + 1 }));
        }, ttlMs);
        list.push({ ts: now, timeout });
        pendingRef.current.set(raw.href, list);

        addRecent({
          type: "router.prefetch.request",
          href: raw.href,
          routeId: raw.routeId,
          trigger: raw.trigger,
          ts: now,
        });
      }

      if (raw.type === "router.nav.complete") {
        const list = pendingRef.current.get(raw.href);
        if (list && list.length) {
          const entry = list.shift()!;
          clearTimeout(entry.timeout);
          if (list.length) pendingRef.current.set(raw.href, list);
          else pendingRef.current.delete(raw.href);
          setCounts((c) => ({ ...c, hit: c.hit + 1 }));
        }

        addRecent({
          type: "router.nav.complete",
          href: raw.href,
          routeId: raw.routeId,
          ts: now,
        });
      }
    });
  }, [subscribe, ttlMs, addRecent]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    sendToPage?.({ type: "router.overlay.toggle", enabled: next });
  };

  return (
    <div style={{ padding: 12, fontFamily: "ui-sans-serif, system-ui", lineHeight: 1.3 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={enabled} onChange={toggle} />
          Enable overlay
        </label>
        <label style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12, color: "#374151" }}>
          TTL (ms):
          <input
            type="number"
            min={500}
            step={500}
            value={ttlMs}
            onChange={(e) => setTtlMs(Number(e.currentTarget.value || 0))}
            style={{ width: 90, padding: "4px 6px", border: "1px solid #e5e7eb", borderRadius: 6 }}
            title="Time window to count a request+nav as a hit"
          />
        </label>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <Card title="Intents" value={counts.intent} />
        <Card title="Hits" value={counts.hit} />
        <Card title="Waste" value={counts.waste} />
      </div>

      <h3 style={{ marginTop: 16, fontSize: 14, color: "#111827" }}>Recent events</h3>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <Th>When</Th>
              <Th>Type</Th>
              <Th>Trigger</Th>
              <Th>Href</Th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr>
                <Td colSpan={4} style={{ textAlign: "center", color: "#6b7280" }}>
                  Interact with links to see events…
                </Td>
              </tr>
            ) : (
              recent.map((e, i) => (
                <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <Td>{formatTime(e.ts)}</Td>
                  <Td><TypeBadge type={e.type} /></Td>
                  <Td>{e.type === "router.prefetch.request" ? e.trigger : "—"}</Td>
                  <Td style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: 360 }}>
                    {e.href}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ textAlign: "left", padding: "8px 10px", fontWeight: 600, color: "#374151" }}>{children}</th>;
}

function Td(
  { children, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>
) {
  return <td {...rest} style={{ padding: "8px 10px", verticalAlign: "top" }}>{children}</td>;
}

function TypeBadge({ type }: { type: LocalEvent["type"] }) {
  const map: Record<string, string> = {
    "router.prefetch.request": "#f59e0b",
    "router.nav.complete":     "#22c55e",
  };
  const label = type === "router.prefetch.request" ? "request" : "nav";
  return (
    <span style={{
      background: map[type],
      color: "#111827",
      padding: "2px 6px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      textTransform: "capitalize",
    }}>
      {label}
    </span>
  );
}

function formatTime(ts: number) {
  try { return new Date(ts).toLocaleTimeString(); } catch { return ""; }
}
