// Native-only polish for the Capacitor iOS/Android shell. Safe no-ops on the web.
import { Capacitor } from "@capacitor/core";

export const isNative = Capacitor.isNativePlatform();

export async function initNative() {
  if (!isNative) return;
  document.documentElement.classList.add("r8-native");
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
  } catch { /* plugin unavailable */ }
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch { /* plugin unavailable */ }
}

// Light tap on every swipe, stronger buzz on a match
export async function haptic(kind = "light") {
  if (!isNative) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (kind === "match") await Haptics.notification({ type: NotificationType.Success });
    else await Haptics.impact({ style: kind === "medium" ? ImpactStyle.Medium : ImpactStyle.Light });
  } catch { /* plugin unavailable */ }
}
