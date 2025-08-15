import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Layout from "./layout";
import ErrorPage from "./error-page";
import Settings from "./routes/settings";
import { TauriProvider } from "./context/TauriProvider";
import "./styles.css";
import { SettingsProvider } from "./context/SettingsProvider";
import Device from "./routes/device";
import SerialMonitor from "./routes/serial-monitor";
import Locator from "./routes/locator";
import ErrorProvider from "./utils/error";
import Metrics from "./routes/metrics";
import { TooltipProvider } from "@/components/ui/tooltip";

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <SerialMonitor />,
      },
      {
        path: "/device",
        element: <Device />,
      },
      {
        path: "/metrics",
        element: <Metrics />,
      },
      {
        path: "/locator",
        element: <Locator />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TauriProvider>
      <SettingsProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
          <ErrorProvider />
        </TooltipProvider>
      </SettingsProvider>
    </TauriProvider>
  </React.StrictMode>,
);
