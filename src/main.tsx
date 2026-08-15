import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const BUILD_ID = (import.meta.env.VITE_BUILD_ID as string | undefined) ?? "";

const showFatal = (title: string, error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  const stack = error instanceof Error ? error.stack : "";
  console.error("Dinodash bootstrap failure:", error);
  document.body.innerHTML = `<main style="min-height:100vh;display:grid;place-items:center;background:#d8c9a6;color:#263327;font-family:system-ui,sans-serif;padding:24px"><section style="width:min(720px,100%);background:#f5edcf;border-radius:24px;padding:28px;box-shadow:0 12px 40px #0002"><div style="font-size:12px;font-weight:900;letter-spacing:.25em">DINODASH DIAGNOSTIC</div><h1 style="font-size:24px;margin:10px 0">${title}</h1><p style="font-weight:700;word-break:break-word">${message}</p><pre style="white-space:pre-wrap;word-break:break-word;max-height:45vh;overflow:auto;background:#fff9e8;padding:14px;border-radius:12px;font-size:12px">${stack}</pre><p style="font-size:12px;opacity:.7">Build: ${BUILD_ID || "unknown"}</p></section></main>`;
};

window.addEventListener("error", (event) => console.error("Dinodash runtime error", event.error || event.message));
window.addEventListener("unhandledrejection", (event) => console.error("Dinodash unhandled rejection", event.reason));

const rootElement = document.getElementById("root");
if (!rootElement) {
  showFatal("Root element missing", new Error("#root was not found in index.html"));
} else {
  try {
    const root = createRoot(rootElement);
    root.render(createElement(StrictMode, null, createElement(App)));
  } catch (error) {
    showFatal("React bootstrap failed", error);
  }
}
