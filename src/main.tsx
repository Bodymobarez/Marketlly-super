import { createRoot } from "react-dom/client";
import { bootstrapDatabase } from "@marketly/core";
import App from "./app/App.tsx";
import "./styles/index.css";

async function start() {
  const result = await bootstrapDatabase();
  if (import.meta.env.DEV) {
    console.info("[Marketly DB]", result.status, result.message ?? "", {
      source: result.source,
      listings: result.listings,
      accounts: result.accounts,
    });
  }
  createRoot(document.getElementById("root")!).render(<App />);
}

void start();
