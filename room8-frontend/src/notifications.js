// notifications.js — browser notification helpers (both local + Web Push)

import { API_URL, getToken } from "./api";

// ── Local (in-tab) notifications ──────────────────────────────────────────────

export function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function sendNotification(title, body, options = {}) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon:  "/icon.png",
      badge: "/icon.png",
      ...options,
    });
  } catch (e) {
    console.warn("Notification failed:", e);
  }
}

// ── Web Push ───────────────────────────────────────────────────────────────────

/** Convert a base64url VAPID public key to the Uint8Array the browser needs. */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw     = window.atob(base64);
  const output  = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Register /sw.js as the service worker.
 * Safe to call multiple times — returns the existing registration if already done.
 */
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return reg;
  } catch (e) {
    console.warn("[push] SW registration failed:", e);
    return null;
  }
}

/**
 * Ask for notification permission.
 * Returns true if granted, false otherwise.
 */
export async function requestPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/**
 * Subscribe the browser to Web Push and POST the subscription to the backend.
 * Requires VITE_VAPID_PUBLIC_KEY to be set (base64url-encoded raw EC public key).
 *
 * Safe to call multiple times — re-sends the existing subscription if already subscribed.
 */
export async function subscribeToPush() {
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidKey) return; // VAPID not configured — skip silently

  const token = getToken();
  if (!token) return; // Not logged in

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    await fetch(`${API_URL}/api/push/subscribe`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        Authorization:   `Bearer ${token}`,
      },
      body: JSON.stringify(subscription.toJSON()),
    });
  } catch (e) {
    // NotAllowedError = user denied; ignore gracefully
    if (e?.name !== "NotAllowedError") {
      console.warn("[push] subscribeToPush failed:", e);
    }
  }
}
