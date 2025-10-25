import * as React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { AppRouter } from "./router";
import { DevtoolsDock } from "./devTools/Host";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppRouter />
    <DevtoolsDock />
  </React.StrictMode>
);
