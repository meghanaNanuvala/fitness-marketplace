import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";                // 👈 Tailwind v4 entry
import { ItemsProvider } from "./context/ItemsContext"; // 👈 if you’re using the shared items context

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <React.StrictMode>
    <ItemsProvider>
      <App />
    </ItemsProvider>
  </React.StrictMode>
);
