import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layout";
import ErrorPage from "./error-page";
import Settings from "./routes/settings";
import { TauriProvider } from "./context/TauriProvider";
import "./styles.css";
import { SettingsProvider } from "./context/SettingsProvider";
import Device from "./routes/device";
import SerialMonitor from "./routes/serial-monitor";
import ErrorProvider from "./utils/error";

const router = createBrowserRouter([
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
        path: "/plot",
        element: <SerialMonitor />,
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
        <RouterProvider router={router} />
        <ErrorProvider />
      </SettingsProvider>
    </TauriProvider>
  </React.StrictMode>
);
