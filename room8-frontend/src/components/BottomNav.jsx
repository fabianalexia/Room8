// Bottom tab bar for the signed-in app: Home, Messages, Profile
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, getNotifications } from "../api";
import { haptic } from "../native";
import Icon from "../ui/Icon";

const TABS = [
  { label: "Home",     icon: "home", paths: ["/app", "/discover", "/likes"], to: "/app" },
  { label: "Messages", icon: "chat", paths: ["/messages"], to: "/messages" },
  { label: "Profile",  icon: "user", paths: ["/profile"], to: "/profile" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!getCurrentUser()) return;
    const fetchUnread = () => {
      getNotifications()
        .then((n) => setUnread(Array.isArray(n) ? n.filter((x) => !x.read).length : 0))
        .catch(() => {});
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 30_000);
    return () => clearInterval(id);
  }, []);

  if (["/setup", "/onboarding", "/profile/setup", "/verify", "/admin"].some((p) => pathname.startsWith(p))) return null;

  return (
    <nav aria-label="Main" style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 500,
      background: "color-mix(in srgb, var(--bg) 92%, transparent)",
      WebkitBackdropFilter: "blur(20px) saturate(160%)", backdropFilter: "blur(20px) saturate(160%)",
      borderTop: "1px solid var(--line)",
      paddingBottom: "var(--safe-b)",
    }}>
      <div style={{ height: 64, maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "stretch" }}>
        {TABS.map(({ label, icon, paths, to }) => {
          const active = paths.some((p) => pathname === p || pathname.startsWith(p + "/"));
          return (
            <button
              key={to}
              onClick={() => { if (pathname !== to) { haptic("light"); navigate(to); } }}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: active ? "var(--text)" : "var(--text-3)", transition: "color .2s" }}
            >
              <span style={{ position: "relative", display: "inline-flex" }}>
                <Icon name={icon} size={26} stroke={active ? 2.2 : 1.8} fill={active ? "currentColor" : "none"} />
                {label === "Messages" && unread > 0 && (
                  <span className="r8-dot" style={{ position: "absolute", top: -6, right: -10 }}>{unread > 9 ? "9+" : unread}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
