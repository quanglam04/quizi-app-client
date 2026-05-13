import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            fontSize: "14px",
            padding: "12px 16px",
          },
          success: {
            iconTheme: { primary: "#38bdf8", secondary: "#0f172a" },
            style: {
              border: "1px solid rgba(56,189,248,0.3)",
            },
          },
          error: {
            iconTheme: { primary: "#f87171", secondary: "#0f172a" },
            style: {
              border: "1px solid rgba(248,113,113,0.3)",
            },
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
);
