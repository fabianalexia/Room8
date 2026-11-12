// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FOUNDERS, LEGAL_ENTITY } from "../siteContent";
import { Mark, Wordmark } from "../ui/Logo";

const COLS = [
  { title: "Product", links: [["/#how-it-works", "How it works"], ["/#faq", "FAQ"], ["/register", "Sign up"], ["/login", "Log in"]] },
  { title: "Company", links: [["/#about", "About"], ["/schools", "For schools"], ["/changelog", "Changelog"]] },
  { title: "Compare", links: [["/vs/room8-vs-meetyourclass", "Room8 vs MeetYourClass"], ["/vs/room8-vs-zeemee", "Room8 vs ZeeMee"]] },
  { title: "Legal", links: [["/privacy", "Privacy policy"], ["/terms", "Terms of service"]] },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--bg-2)", padding: "56px 20px calc(var(--safe-b) + 32px)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 32 }}>
        <div style={{ gridColumn: "span 1", minWidth: 220 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8 }} aria-label="Room8 home">
            <Wordmark size={23} />
          </Link>
          <p className="r8-muted" style={{ fontSize: 14.5, marginTop: 14, maxWidth: 260 }}>Roommate matching for college students. Verified, campus only, free for students.</p>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="r8-eyebrow" style={{ marginBottom: 14 }}>{c.title}</p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {c.links.map(([to, label]) => (
                <li key={to}>
                  {to.includes("#")
                    ? <a href={to} className="r8-footer-link">{label}</a>
                    : <Link to={to} className="r8-footer-link">{label}</Link>}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div style={{ maxWidth: 1120, margin: "40px auto 0", paddingTop: 22, borderTop: "1px solid var(--line)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }} className="r8-faint">
        <span style={{ fontSize: 13.5 }}>© {new Date().getFullYear()} {LEGAL_ENTITY || "Room8"}. Built by {FOUNDERS.map((f) => f.name).join(" and ")}.</span>
        <span style={{ fontSize: 13.5 }}>We never sell your data.</span>
      </div>
      <style>{`.r8-footer-link { color: var(--text-2); font-size: 14.5px; transition: color .2s; } .r8-footer-link:hover { color: var(--text); }`}</style>
    </footer>
  );
}
