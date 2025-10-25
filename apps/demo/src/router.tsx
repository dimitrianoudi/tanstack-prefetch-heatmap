import * as React from "react";
import {
  RouterProvider,
  Link,
  Outlet,
  useRouter,
  createRouter,
  createRootRoute,
  createRoute,
} from "@tanstack/react-router";
const TrackedLink = (props: any) => <Link {...props} />;

function delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }

async function loadInvoices() { await delay(400);  return { total: 12,  lastUpdated: new Date().toISOString() }; }
async function loadCustomers() { await delay(1200); return { total: 182, lastUpdated: new Date().toISOString() }; }
async function loadReports()  { await delay(2000); return { chartPoints: 900, lastUpdated: new Date().toISOString() }; }

function RootLayout() {
  const router = useRouter();
  return (
    <>
      <nav>
        <Link to="/" className="link">Home</Link>
        <TrackedLink router={router} to="/invoices" preload="intent">Invoices</TrackedLink>
        <TrackedLink router={router} to="/customers" preload={true}>Customers</TrackedLink>
        <TrackedLink router={router} to="/reports" preload="intent">Reports</TrackedLink>
      </nav>
      <main><Outlet /></main>
      <footer>Try hovering links; then click. Toggle overlay in the Devtools dock.</footer>
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <div className="card">
      <h2>Home</h2>
      <p>This is a tiny app wired to the Prefetch Heatmap.</p>
    </div>
  ),
});

const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/invoices",
  loader: loadInvoices,
  component: () => {
    const data = invoicesRoute.useLoaderData() as Awaited<ReturnType<typeof loadInvoices>>;
    return (
      <div className="card">
        <h2>Invoices</h2>
        <p>Total; {data.total}</p>
        <small>Loaded at {new Date(data.lastUpdated).toLocaleTimeString()}</small>
      </div>
    );
  },
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customers",
  loader: loadCustomers,
  component: () => {
    const data = customersRoute.useLoaderData() as Awaited<ReturnType<typeof loadCustomers>>;
    return (
      <div className="card">
        <h2>Customers</h2>
        <p>Total; {data.total}</p>
        <small>Loaded at {new Date(data.lastUpdated).toLocaleTimeString()}</small>
      </div>
    );
  },
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  loader: loadReports,
  component: () => {
    const data = reportsRoute.useLoaderData() as Awaited<ReturnType<typeof loadReports>>;
    return (
      <div className="card">
        <h2>Reports</h2>
        <p>Chart points; {data.chartPoints}</p>
        <small>Loaded at {new Date(data.lastUpdated).toLocaleTimeString()}</small>
      </div>
    );
  },
});

const routeTree = rootRoute.addChildren([homeRoute, invoicesRoute, customersRoute, reportsRoute]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
