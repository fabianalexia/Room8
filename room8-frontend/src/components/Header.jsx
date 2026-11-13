// src/components/Header.jsx: floating glass header for the public site
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, logout as apiLogout } from "../api";
import { Wordmark } from "../ui/Logo";
import Icon from "../ui/Icon";

const PUBLIC_LINKS = [
  { to: "/#how-it-works", label: "Features" },
  { to: "/#safety", label: "Safety" },
  { to: "/schools", label: "For Colleges" },
];
const APP_LINKS = [
  { to: "/app", label: "Discover" },
  { to: "/likes", label: "Likes" },
  { to: "/messages", label: "Chats" },
  { to: "/profile", label: "Profile" },
];

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = getCurrentUser();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = user ? APP_LINKS : PUBLIC_LINKS;
  const handleLogout = () => { apiLogout(); setOpen(false); navigate("/"); };

  return (
    <>
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 900, paddingTop: "var(--safe-t)",
        background: "color-mix(in srgb, var(--bg) 90%, transparent)", WebkitBackdropFilter: "blur(20px) saturate(160%)", backdropFilter: "blur(20px) saturate(160%)",
        boxShadow: scrolled ? "0 1px 0 var(--line)" : "none", transition: "box-shadow .3s" }}>
        <nav aria-label="Main" style={{
          maxWidth: 1200, margin: "0 auto", height: 72,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 20px",
        }}>
          <Link to="/" aria-label="Room8 home" style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
            <Wordmark size={27} />
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="r8-hdr-links" style={{ display: "flex", alignItems: "center", gap: 2, marginRight: 10 }}>
            {links.map((l) => {
              const active = !l.to.includes("#") && pathname === l.to;
              return (
                <Link key={l.to} to={l.to} className="r8-hdr-link" style={{ padding: "8px 18px", whiteSpace: "nowrap", fontSize: 15, fontWeight: 500, color: active ? "var(--text)" : "var(--text-2)", transition: "color .2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "var(--text-2)"; }}>
                  {l.label}
                </Link>
              );
            })}
          </div>

            <div className="r8-hdr-cta" style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {user ? (
                <><Link to="/app" className="r8-btn r8-btn--dark r8-btn--sm">Open app</Link><button className="r8-btn r8-btn--soft r8-btn--sm r8-hdr-login" onClick={handleLogout}>Log out</button></>
              ) : (
                <>
                  <Link to="/login" className="r8-hdr-login" style={{ display: "inline-flex", alignItems: "center", height: 46, padding: "0 14px", fontSize: 15, fontWeight: 500, color: "var(--text-2)" }}>Log in</Link>
                  <Link to="/register" className="r8-btn r8-btn--dark" style={{ height: 46, padding: "0 22px", fontSize: 15 }}>Get the App</Link>
                </>
              )}
            </div>
            <button className="r8-icon-btn r8-icon-btn--round r8-hdr-menu" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} style={{ display: "none" }}>
              <Icon name={open ? "x" : "menu"} size={22} />
            </button>
          </div>
        </nav>
      </header>
      <style>{`
        @media (max-width: 900px) { .r8-hdr-login { display: none !important; } .r8-hdr-link { padding: 8px 10px !important; font-size: 14px !important; } } @media (max-width: 520px) { .r8-hdr-links { display: none !important; } .r8-hdr-menu { display: inline-flex !important; } .r8-hdr-cta .r8-btn { height: 40px !important; padding: 0 16px !important; font-size: 14px !important; } }
      `}</style>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ position: "fixed", inset: 0, zIndex: 880, background: "color-mix(in srgb, var(--bg) 88%, transparent)", WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)", padding: "calc(var(--safe-t) + 96px) 24px 32px", display: "flex", flexDirection: "column" }}>
            <nav aria-label="Mobile" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[...(user ? APP_LINKS : [{ to: "/", label: "Home" }, ...PUBLIC_LINKS])].map((l, i) => (
                <motion.div key={l.to} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, type: "spring", stiffness: 300, damping: 28 }}>
                  <Link to={l.to} onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 4px", fontFamily: "var(--display)", fontWeight: 700, fontSize: 32, letterSpacing: "-0.03em", borderBottom: "1px solid var(--line)" }}>
                    {l.label}<Icon name="arrowRight" size={22} color="var(--text-3)" />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              {user ? (
                <button className="r8-btn r8-btn--glass r8-btn--lg r8-btn--block" onClick={handleLogout}><Icon name="logout" size={20} />Log out</button>
              ) : (
                <>
                  <Link to="/register" onClick={() => setOpen(false)} className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block">Get the App</Link>
                  <Link to="/login" onClick={() => setOpen(false)} className="r8-btn r8-btn--soft r8-btn--lg r8-btn--block">Log In</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
