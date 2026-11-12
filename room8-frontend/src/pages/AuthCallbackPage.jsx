// src/pages/AuthCallbackPage.jsx
// Receives the JWT from the OAuth backend redirect and logs the user in.
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setToken, getMe, setCurrentUser } from "../api";
import { Mark } from "../ui/Logo";
import { EmptyState } from "../ui/kit";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error || !token) {
      setErr(
        error === "no_email"
          ? "Your account doesn't have an accessible email address. Please register manually."
          : "That sign-in didn't finish. Try again, or use your email and password."
      );
      return;
    }

    setToken(token);

    // Fetch full user data now that the token is stored
    getMe()
      .then((res) => {
        const user = res?.user ?? res;
        setCurrentUser(user);
        navigate(user?.profile_complete === true ? "/app" : "/setup", { replace: true });
      })
      .catch(() => {
        // Token stored but /me failed — let ProtectedRoute handle it
        navigate("/app", { replace: true });
      });
  }, []); // eslint-disable-line

  return (
    <div className="r8-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 420, height: 420, top: -160, right: -160 }} />
      {err ? (
        <div className="r8-card" style={{ maxWidth: 420, width: "100%" }}>
          <EmptyState icon="lock" title="Sign-in didn't work" body={err} action={<button className="r8-btn r8-btn--primary" onClick={() => navigate("/login", { replace: true })}>Back to log in</button>} />
        </div>
      ) : (
        <div role="status" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ animation: "r8pulse 1.4s ease-in-out infinite" }}><Mark size={72} /></div>
          <p className="r8-muted" style={{ fontSize: 15 }}>Signing you in</p>
          <style>{`@keyframes r8pulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(.92); opacity: .7 } }`}</style>
        </div>
      )}
    </div>
  );
}
