// Native push registration for the iOS/Android app. No-op on the web.
import { API_URL, getToken } from "./api";
import { isNative } from "./native";

let started = false;

export async function registerNativePush(navigate) {
  if (!isNative || started || !getToken()) return;
  started = true;
  try {
    const { Capacitor } = await import("@capacitor/core");
    const { PushNotifications } = await import("@capacitor/push-notifications");

    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt") perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") return;

    await PushNotifications.addListener("registration", async ({ value }) => {
      try {
        localStorage.setItem("room8_device_token", value);
        await fetch(`${API_URL}/api/push/device`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ token: value, platform: Capacitor.getPlatform() }),
        });
      } catch (e) { console.warn("[push] token upload failed", e); }
    });
    await PushNotifications.addListener("registrationError", (e) => console.warn("[push] registration error", e));

    // Tapping a notification opens the screen it points to (e.g. /messages)
    await PushNotifications.addListener("pushNotificationActionPerformed", ({ notification }) => {
      const url = notification?.data?.url;
      if (url && url.startsWith("/") && navigate) navigate(url);
    });

    await PushNotifications.register();
  } catch (e) {
    started = false;
    console.warn("[push] native setup failed", e);
  }
}

// On logout: stop sending pushes for this install.
export async function unregisterNativePush(jwt = getToken()) {
  if (!isNative) return;
  const token = localStorage.getItem("room8_device_token");
  if (!token || !jwt) return;
  try {
    await fetch(`${API_URL}/api/push/device`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ token }),
    });
  } catch { /* offline: server cleans up dead tokens on next send */ }
  started = false;
}
