// Floating glass tab bar for the signed-in app
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser, getNotifications } from "../api";
import { haptic } from "../native";
import Icon from "../ui/Icon";

const TABS = [
  { label: "Discover", icon: "flame",   path: "/app" },
  { label: "Matches",  icon: "compass", path: "/discover" },
  { label: "Likes",    icon: "heart",   path: "/likes" },
  { label: "Chats",    icon: "chat",    path: "/messages" },
  { label: "Profile",  icon: "user",    path: "/profile" },
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

  // Onboarding screens get no tab bar
  if (["/setup", "/onboarding", "/profile/setup", "/verify", "/admin"].some((p) => pathname.startsWith(p))) return null;

  return (
    <nav aria-label="Main" style={{
      position: "fixed", left: 12, right: 12, bottom: "calc(10px + var(--safe-b))", zIndex: 500,
      maxWidth: 520, margin: "0 auto",
    }}>
      <div className="r8-glass" style={{
        height: 66, borderRadius: 24, display: "flex", alignItems: "stretch", padding: 6,
        background: "var(--glass-strong)", boxShadow: "var(--shadow-2)",
      }}>
        {TABS.map(({ label, icon, path }) => {
          const active = pathname === path || pathname.startsWith(path + "/");
          return (
            <button
              key={path}
              onClick={() => { if (!active) { haptic("light"); navigate(path); } }}
              aria-current={active ? "page" : undefined}
              style={{
                flex: 1, position: "relative", borderRadius: 18,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                color: active ? "var(--text)" : "var(--text-3)",
                transition: "color .25s",
              }}
            >
              {active && (
                <motion.span
                  layoutId="r8-tab-pill"
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  style={{ position: "absolute", inset: 0, borderRadius: 18, background: "var(--glass-2)", border: "1px solid var(--line)" }}
                />
              )}
              <span style={{ position: "relative", display: "inline-flex" }}>
                {active ? (
                  <span style={{ display: "inline-flex", filter: "drop-shadow(0 4px 10px rgba(140,158,255,.45))" }}>
                    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
                      <linearGradient id="r8-tab-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#45D9FF" /><stop offset=".45" stopColor="#8C9EFF" /><stop offset="1" stopColor="#FF5FA0" />
                      </linearGradient>
                    </svg>
                    <Icon name={icon} size={23} stroke={2} color="url(#r8-tab-grad)" />
                  </span>
                ) : (
                  <Icon name={icon} size={23} />
                )}
                {label === "Chats" && unread > 0 && (
                  <span className="r8-dot" style={{ position: "absolute", top: -6, right: -10 }}>{unread > 9 ? "9+" : unread}</span>
                )}
              </span>
              <span style={{ position: "relative", fontSize: 11, fontWeight: active ? 600 : 500, letterSpacing: "0.01em" }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
