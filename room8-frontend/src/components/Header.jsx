// src/components/Header.jsx — Dark glass rebrand
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout as apiLogout } from "../api";
import logoImg from "../assets/images/logo.png";

const GOLD    = "#F59E0B";
const GOLD_D  = "#D97706";
const NAVY    = "#0F2D5E";
const DARK    = "#050D1F";
const WHITE   = "#FFFFFF";
const MUTED   = "rgba(255,255,255,0.55)";
const BORDER  = "rgba(255,255,255,0.08)";

const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

export default function Header() {
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const user       = getCurrentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const close = () => setDrawerOpen(false);
  const handleLogout = () => { apiLogout(); close(); navigate("/"); };

  return (
    <>
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 900,
        background: scrolled
          ? "rgba(5,13,31,0.92)"
          : "rgba(5,13,31,0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${scrolled ? BORDER : "transparent"}`,
        transition: "background 0.3s, border-color 0.3s",
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.3)" : "none",
      }}>
        {/* Thin gold/blue accent rule at very bottom of header */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.25) 30%, rgba(37,99,235,0.2) 70%, transparent 100%)",
          opacity: scrolled ? 1 : 0.4,
          transition: "opacity 0.3s",
        }} />
        <nav style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: 68,
          maxWidth: 1200,
          margin: "0 auto",
        }}>

          {/* ── Logo ── */}
          <Link
            to="/"
            onClick={close}
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}
          >
            <img
              src={logoImg}
              alt="Room8"
              style={{
                height: 34, width: "auto", objectFit: "contain",
                filter: "brightness(0) invert(1)",
                opacity: 0.92,
              }}
            />
            <span style={{
              fontFamily: HF,
              fontWeight: 800,
              fontSize: "1.15rem",
              color: GOLD,
              letterSpacing: "0.06em",
            }}>
              ROOM8
            </span>
          </Link>

          {/* ── Desktop center nav ── */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            position: "absolute", left: "50%", transform: "translateX(-50%)",
          }} className="desk-nav">
            {!user ? (
              <>
                <GlassNavLink to="/#how-it-works" label="How It Works" />
                <GlassNavLink to="/schools" label="For Schools" />
              </>
            ) : (
              <>
                <GlassNavLink to="/app"       label="Swipe"    />
                <GlassNavLink to="/discover"  label="Discover" />
                <GlassNavLink to="/messages"  label="Messages" />
              </>
            )}
          </div>

          {/* ── Desktop right actions ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="desk-actions">
            {!user ? (
              <>
                <Link to="/login" style={{
                  color: MUTED, textDecoration: "none",
                  fontWeight: 500, fontSize: "0.9rem",
                  fontFamily: BF,
                  padding: "8px 16px", borderRadius: 8,
                  transition: "color 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = WHITE}
                  onMouseLeave={e => e.currentTarget.style.color = MUTED}
                >
                  Log In
                </Link>
                <Link to="/register" style={{
                  background: GOLD,
                  color: DARK,
                  padding: "9px 22px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  fontFamily: HF,
                  textDecoration: "none",
                  transition: "background 0.15s, transform 0.15s",
                  boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = GOLD_D; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.transform = "none"; }}
                >
                  Sign Up Free
                </Link>
              </>
            ) : (
              <button onClick={handleLogout} style={{
                background: "transparent",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: "8px 18px",
                color: MUTED,
                fontWeight: 600,
                fontSize: "0.88rem",
                fontFamily: BF,
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = WHITE; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; }}
              >
                Log Out
              </button>
            )}
          </div>

          {/* ── Hamburger (mobile) ── */}
          <button
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            onClick={() => setDrawerOpen(v => !v)}
            style={{
              background: "none", border: "none",
              cursor: "pointer", padding: 8,
              flexDirection: "column", gap: 5,
            }}
            className="ham-btn"
          >
            {[
              drawerOpen ? "translateY(7px) rotate(45deg)"  : "none",
              "none",
              drawerOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            ].map((t, i) => (
              <span key={i} style={{
                display: "block", width: 22, height: 2,
                background: GOLD, borderRadius: 2,
                transition: "transform 0.25s, opacity 0.25s",
                transform: t,
                opacity: i === 1 && drawerOpen ? 0 : 1,
              }} />
            ))}
          </button>
        </nav>
      </header>

      {/* ── Mobile backdrop ── */}
      <div
        onClick={close}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 950,
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
          transition: "opacity 0.25s",
        }}
      />

      {/* ── Mobile drawer ── */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(300px, 85vw)",
        background: "rgba(5,13,31,0.97)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderLeft: `1px solid ${BORDER}`,
        zIndex: 960,
        transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        padding: "0 0 32px",
        overflowY: "auto",
      }}>
        {/* Drawer header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px",
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src={logoImg} alt="Room8" style={{ height: 28, filter: "brightness(0) invert(1)", opacity: 0.9 }} />
            <span style={{ fontFamily: HF, fontWeight: 800, fontSize: "1rem", color: GOLD }}>ROOM8</span>
          </div>
          <button onClick={close} style={{
            background: "rgba(255,255,255,0.08)", border: "none",
            color: WHITE, width: 34, height: 34, borderRadius: "50%",
            cursor: "pointer", fontSize: "1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {!user ? (
            <>
              <DLink to="/"        label="Home"         onClick={close} />
              <DLink to="/schools" label="For Schools"  onClick={close} />
              <DLink to="/login"   label="Log In"       onClick={close} />
              <div style={{ padding: "12px 20px" }}>
                <Link to="/register" onClick={close} style={{
                  display: "block", background: GOLD,
                  color: DARK, padding: "13px 20px",
                  borderRadius: 10, fontWeight: 700,
                  fontSize: "0.95rem", textDecoration: "none",
                  textAlign: "center", fontFamily: HF,
                  boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
                }}>
                  Sign Up Free
                </Link>
              </div>
            </>
          ) : (
            <>
              <DLink to="/app"      label="Swipe"    onClick={close} />
              <DLink to="/discover" label="Discover" onClick={close} />
              <DLink to="/likes"    label="Likes"    onClick={close} />
              <DLink to="/messages" label="Messages" onClick={close} />
              <DLink to="/profile"  label="Profile"  onClick={close} />
            </>
          )}
        </nav>

        {user && (
          <div style={{ padding: "0 20px" }}>
            <button onClick={handleLogout} style={{
              width: "100%", padding: "12px",
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: 8, color: "#F87171",
              fontWeight: 700, fontSize: "0.95rem",
              cursor: "pointer", fontFamily: BF,
            }}>
              Log Out
            </button>
          </div>
        )}
      </div>

      <style>{`
        .ham-btn { display: none; }
        @media (max-width: 768px) {
          .desk-nav     { display: none !important; }
          .desk-actions { display: none !important; }
          .ham-btn      { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function GlassNavLink({ to, label }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to.includes("#") && pathname === "/");
  return (
    <Link
      to={to}
      style={{
        color: active ? WHITE : MUTED,
        textDecoration: "none",
        fontWeight: active ? 600 : 400,
        fontSize: "0.9rem",
        fontFamily: BF,
        padding: "8px 14px",
        borderRadius: 8,
        transition: "color 0.15s, background 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={e => { e.currentTarget.style.color = WHITE; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={e => { e.currentTarget.style.color = active ? WHITE : MUTED; e.currentTarget.style.background = "transparent"; }}
    >
      {label}
    </Link>
  );
}

function DLink({ to, label, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} onClick={onClick} style={{
      display: "flex", alignItems: "center",
      padding: "13px 24px", textDecoration: "none",
      color: active ? WHITE : MUTED,
      fontWeight: active ? 600 : 400,
      fontSize: "1rem", fontFamily: BF,
      background: active ? "rgba(245,158,11,0.1)" : "transparent",
      borderLeft: `3px solid ${active ? GOLD : "transparent"}`,
      transition: "background 0.15s",
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = WHITE; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = MUTED; } }}
    >
      {label}
    </Link>
  );
}
