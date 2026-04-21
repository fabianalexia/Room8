import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GOLD    = "#F59E0B";
const DARK    = "#050D1F";
const INACTIVE = "rgba(255,255,255,0.35)";

const FlameIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD : INACTIVE}>
    <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
  </svg>
);

const GridIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD : INACTIVE}>
    <path d="M4 5v5h5V5H4zm0 9v5h5v-5H4zm9-9v5h5V5h-5zm0 9v5h5v-5h-5z"/>
  </svg>
);

const HeartIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD : INACTIVE}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const ChatIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD : INACTIVE}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </svg>
);

const PersonIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD : INACTIVE}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const TABS = [
  { label: "Swipe",    Icon: FlameIcon,  path: "/app"      },
  { label: "Discover", Icon: GridIcon,   path: "/discover" },
  { label: "Likes",    Icon: HeartIcon,  path: "/likes"    },
  { label: "Messages", Icon: ChatIcon,   path: "/messages" },
  { label: "Profile",  Icon: PersonIcon, path: "/profile"  },
];

export default function BottomNav() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      height: "calc(64px + env(safe-area-inset-bottom, 0px))",
      background: DARK,
      borderTop: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "stretch",
      zIndex: 500,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {TABS.map(({ label, Icon, path }) => {
        const active = !!path && (pathname === path || pathname.startsWith(path + "/"));
        return (
          <button
            key={label}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              cursor: "pointer",
              position: "relative",
              WebkitTapHighlightColor: "transparent",
              transition: "opacity 0.1s",
            }}
          >
            {/* Active indicator */}
            {active && (
              <div style={{
                position: "absolute",
                top: 0, left: "20%", right: "20%",
                height: 2,
                background: GOLD,
                borderRadius: "0 0 2px 2px",
                boxShadow: `0 0 8px ${GOLD}`,
              }} />
            )}

            <Icon active={active} />

            <span style={{
              fontSize: "0.6rem",
              fontWeight: active ? 700 : 500,
              letterSpacing: 0.3,
              color: active ? GOLD : INACTIVE,
              textTransform: "uppercase",
              lineHeight: 1,
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
