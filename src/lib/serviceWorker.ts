import { useSyncExternalStore } from "react";

/**
 * Registers the offline service worker (production builds only) and lets
 * the app offer an update when a new version has been downloaded.
 */

let applyUpdate: (() => void) | null = null;
const listeners = new Set<() => void>();

function setUpdate(apply: () => void) {
  applyUpdate = apply;
  listeners.forEach((listener) => listener());
}

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    let registration: ServiceWorkerRegistration;
    try {
      registration = await navigator.serviceWorker.register("./sw.js");
    } catch {
      return; // The app still works online.
    }

    let updating = false;
    const offer = (worker: ServiceWorker) =>
      setUpdate(() => {
        updating = true;
        worker.postMessage("skipWaiting");
      });

    if (registration.waiting && navigator.serviceWorker.controller) {
      offer(registration.waiting);
    }
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      worker?.addEventListener("statechange", () => {
        if (
          worker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          offer(worker);
        }
      });
    });

    // Reload once the new version takes over. Answers are already saved.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (updating) location.reload();
    });
  });
}

/** A function that installs the new version, or null if there is none. */
export function useUpdate(): (() => void) | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => applyUpdate,
  );
}
