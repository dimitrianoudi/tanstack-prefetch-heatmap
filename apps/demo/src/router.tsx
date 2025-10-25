import * as React from "react";
import {
  RouterProvider,
  Link,
  Outlet,
  createRouter,
  createRootRoute,
  createRoute,
  useLoaderData,
} from "@tanstack/react-router";
import { TrackedLink } from "@dimano/tsr-prefetch-reporter";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function loadInvoices() { await wait(400);  return { total: 12,  at: Date.now() }; }
async function loadCustomers() { await wait(1200); return { total: 182, at: Date.now() }; }
async function loadReports() { await wait(2000);  return { points: 900, at: Date.now() }; }

const rootRoute = createRootRoute({
  component: () => (
    <>
      <nav className="nav">
        {/* Keep one plain Link for contrast */}
        <Link to="/" className="link">Home</Link>

        {/* Tracked links – short TTL so you see pending→hit/waste quickly */}
        <TrackedLink to="/invoices"  ttlMs={4000}>Invoices</TrackedLink>
        <TrackedLink to="/customers" ttlMs={4000}>Customers</TrackedLink>
        <TrackedLink to="/reports"   ttlMs={4000}>Reports</TrackedLink>
      </nav>
      <main><Outlet /></main>
      <footer>Toggle overlay in the Devtools panel, then hover/click the links.</footer>
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <div className="card">
      <h2>Home</h2>
      <p>Hover and click links to see the Prefetch Heatmap colors.</p>
    </div>
  ),
});

const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices",
  loader: loadInvoices,
  component: () => {
    const data = useLoaderData({ from: invoicesRoute.id }) as Awaited<ReturnType<typeof loadInvoices>>;
    return (
      <div className="card">
        <h2>Invoices</h2>
        <p>Total: {data.total}</p>
        <small>Loaded at {new Date(data.at).toLocaleTimeString()}</small>
      </div>
    );
  },
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customers",
  loader: loadCustomers,
  component: () => {
    const data = useLoaderData({ from: customersRoute.id }) as Awaited<ReturnType<typeof loadCustomers>>;
    return (
      <div className="card">
        <h2>Customers</h2>
        <p>Total: {data.total}</p>
        <small>Loaded at {new Date(data.at).toLocaleTimeString()}</small>
      </div>
    );
  },
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  loader: loadReports,
  component: () => {
    const data = useLoaderData({ from: reportsRoute.id }) as Awaited<ReturnType<typeof loadReports>>;
    return (
      <div className="card">
        <h2>Reports</h2>
        <p>Chart points: {data.points}</p>
        <small>Loaded at {new Date(data.at).toLocaleTimeString()}</small>
      </div>
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  invoicesRoute,
  customersRoute,
  reportsRoute,
]);

export const router = createRouter({ routeTree });

export function AppRouter() {
  return <RouterProvider router={router} />;
}
