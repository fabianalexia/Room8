// "Sign in with Apple": only rendered inside the iOS app (App Store rule 4.8).
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { API_URL, setToken, setCurrentUser } from "../api";

export default function AppleSignInButton({ onError }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  if (Capacitor.getPlatform() !== "ios") return null;

  const signIn = async () => {
    setBusy(true);
    try {
      const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
      const { response } = await SignInWithApple.authorize({
        clientId: "com.swiperoom8.app",
        redirectURI: "https://swiperoom8.com/auth/callback",
        scopes: "email name",
      });
      const res = await fetch(`${API_URL}/api/auth/apple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity_token: response.identityToken,
          first_name: response.givenName || "",
          last_name: response.familyName || "",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.access_token) throw new Error(data.error || "Apple sign-in failed");
      setToken(data.access_token);
      setCurrentUser(data.user);
      navigate(data.user?.profile_complete ? "/app" : "/setup", { replace: true });
    } catch (e) {
      // Code 1001 = user cancelled the Apple sheet; not an error worth showing
      if (!String(e?.message || e).includes("1001")) onError?.(e.message || "Apple sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={signIn} disabled={busy} className="r8-btn r8-btn--lg r8-btn--block" style={{ background: "var(--text)", color: "var(--bg)", opacity: busy ? 0.6 : 1 }}>
      <svg width="16" height="19" viewBox="0 0 814 1000" aria-hidden="true"><path fill="currentColor" d="M788 341c-6 4-108 62-108 190 0 148 130 200 134 201-1 3-21 72-69 142-43 62-88 124-156 124s-86-40-164-40c-77 0-104 41-167 41s-106-57-156-128C44 788 0 664 0 546 0 356 124 255 246 255c65 0 119 43 160 43 39 0 100-45 174-45 28 0 129 3 208 88zM554 159c31-37 53-88 53-139 0-7-1-14-2-20-50 2-110 34-146 76-28 32-55 83-55 135 0 8 1 16 2 18 3 1 9 2 14 2 45 0 101-30 134-72z"/></svg>
      {busy ? "Signing in" : "Sign in with Apple"}
    </button>
  );
}
