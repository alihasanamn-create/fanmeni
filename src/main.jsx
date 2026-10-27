import React from "react";
import ReactDOM from "react-dom/client";

import { Toaster } from "react-hot-toast";

import "@fontsource/plus-jakarta-sans";
import "./index.css";
import "./live-mobile.css";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />

    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "16px",
          background: "#fff",
          color: "#111827",
          border: "1px solid #E5E7EB",
          boxShadow:
            "0 10px 25px rgba(0,0,0,.08)",
        },
        success: {
          iconTheme: {
            primary: "#059669",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#DC2626",
            secondary: "#fff",
          },
        },
      }}
    />
  </React.StrictMode>
);