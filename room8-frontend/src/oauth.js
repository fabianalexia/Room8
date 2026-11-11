// Starts Google/LinkedIn sign-in. On the web it's a normal redirect.
// In the native app, Google blocks sign-in inside embedded webviews, so we open
// the system browser and come back through the com.swiperoom8.app:// deep link
// with a one-time code that /api/auth/app-exchange trades for a JWT.
import { API_URL, setToken, setCurrentUser } from "./api";
import { isNative } from "./native";

export const APP_SCHEME = "com.swiperoom8.app";

export async function startOAuth(provider) {
  if (!isNative) {
    window.location.href = `${API_URL}/api/auth/${provider}`;
    return;
  }
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url: `${API_URL}/api/auth/${provider}?app=1`, presentationStyle: "popover" });
}

// Called from initNative(): handles the deep link the backend redirects to.
export async function listenForOAuthReturn(navigate) {
  if (!isNative) return;
  const { App } = await import("@capacitor/app");
  App.addListener("appUrlOpen", async ({ url }) => {
    if (!url || !url.startsWith(`${APP_SCHEME}://auth/callback`)) return;
    try { (await import("@capacitor/browser")).Browser.close(); } catch { /* already closed */ }

    const params = new URL(url.replace(`${APP_SCHEME}://`, "https://app/")).searchParams;
    const error = params.get("error");
    const code = params.get("code");
    if (error || !code) {
      navigate(`/login?oauth_error=${encodeURIComponent(error || "oauth_failed")}`);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/app-exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.access_token) throw new Error(data.error || "Sign-in failed");
      setToken(data.access_token);
      setCurrentUser(data.user);
      navigate(data.user?.profile_complete ? "/app" : "/setup", { replace: true });
    } catch (e) {
      navigate(`/login?oauth_error=${encodeURIComponent(e.message)}`);
    }
  });
}
