import * as React from "react";
import { TrackedLink } from "@dimano/tsr-prefetch-reporter";

export default function App() {
  return (
    <section style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Prefetch Heatmap demo</h1>
      <p>Hover links to trigger prefetch intent, click within TTL for hits, wait past TTL for waste.</p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <TrackedLink to="/invoices" ttlMs={3000} style={btn}>Invoices</TrackedLink>
        <TrackedLink to="/customers" ttlMs={3000} style={btn}>Customers</TrackedLink>
        <TrackedLink to="/reports"   ttlMs={3000} style={btn}>Reports</TrackedLink>
      </div>

      <small style={{ color: "#6b7280", display: "block", marginTop: 8 }}>
        Tip: open the Devtools dock and enable the Prefetch Heatmap overlay.
      </small>
    </section>
  );
}

const btn: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#111827",
  color: "white",
  textDecoration: "none",
  fontWeight: 600,
};
