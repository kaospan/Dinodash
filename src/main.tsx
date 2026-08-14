import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const BUILD_ID = (import.meta.env.VITE_BUILD_ID as string | undefined) ?? "";
const LEGACY_STORAGE_PREFIX = "stone-age-";
const CURRENT_STORAGE_PREFIX = "phoneage-";

const migrateLegacyStorageKeys = () => {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(LEGACY_STORAGE_PREFIX))
      .forEach((legacyKey) => {
        const currentKey = CURRENT_STORAGE_PREFIX + legacyKey.slice(LEGACY_STORAGE_PREFIX.length);
        if (localStorage.getItem(currentKey) == null) {
          const value = localStorage.getItem(legacyKey);
          if (value != null) localStorage.setItem(currentKey, value);
        }
      });
  } catch {
    // Storage is optional.
  }
};

const reloadOnceForBuild = () => {
  if (!BUILD_ID || !import.meta.env.PROD) return;
  try {
    const lastBuildKey = "dinodash-last-build-id";
    const reloadKey = `dinodash-reloaded-${BUILD_ID}`;
    if ((localStorage.getItem(lastBuildKey) ?? "") !== BUILD_ID) {
      localStorage.setItem(lastBuildKey, BUILD_ID);
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, "1");
        window.location.reload();
      }
    }
  } catch {
    // Ignore private/incognito storage failures.
  }
};

const installRuntimeErrorGuard = () => {
  window.addEventListener("error", (event) => {
    console.error("Dinodash runtime error", event.error || event.message);
  });
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Dinodash unhandled rejection", event.reason);
  });
};

migrateLegacyStorageKeys();
installRuntimeErrorGuard();

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Dinodash root element not found");

  reloadOnceForBuild();
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // Development-only helpers are loaded after React mounts. Solver/lab tooling can therefore
  // never prevent the production game from booting.
  if (import.meta.env.DEV) {
    void import("@/lib/referenceSeeder").then(({ seedDefaultReferences }) => seedDefaultReferences());
  }
} catch (error) {
  console.error("Dinodash bootstrap failure", error);
  document.body.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;background:#d8c9a6;color:#263327;font-family:system-ui,sans-serif;padding:24px;text-align:center">
      <section style="max-width:420px;background:#f5edcf;border-radius:24px;padding:28px;box-shadow:0 12px 40px #0002">
        <div style="font-size:12px;font-weight:900;letter-spacing:.25em">DINODASH</div>
        <h1 style="font-size:24px;margin:10px 0">Unable to start the game</h1>
        <p style="margin:0 0 18px">Refresh to try loading the latest version.</p>
        <button onclick="location.reload()" style="border:0;border-radius:14px;background:#263327;color:white;padding:12px 22px;font-weight:800">REFRESH</button>
      </section>
    </main>`;
}
