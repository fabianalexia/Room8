// Browser push notification helpers

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
      icon: "/icon.png",
      badge: "/icon.png",
      ...options,
    });
  } catch (e) {
    console.warn("Notification failed:", e);
  }
}
