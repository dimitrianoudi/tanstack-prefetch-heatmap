import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import App from "./App";

const Root = createRootRoute({
  component: () => (
    <>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </>
  ),
});

const Index = createRoute({
  getParentRoute: () => Root,
  path: "/",
  component: App,
});

const Invoices = createRoute({
  getParentRoute: () => Root,
  path: "/invoices",
  component: () => <div style={{ padding: 24 }}>Invoices page</div>,
});

const Customers = createRoute({
  getParentRoute: () => Root,
  path: "/customers",
  component: () => <div style={{ padding: 24 }}>Customers page</div>,
});

const Reports = createRoute({
  getParentRoute: () => Root,
  path: "/reports",
  component: () => <div style={{ padding: 24 }}>Reports page</div>,
});

const routeTree = Root.addChildren([Index, Invoices, Customers, Reports]);
export const router = createRouter({ routeTree });

export function RouterRoot() {
  return <RouterProvider router={router} />;
}
