// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

const DARK   = "#050D1F";
const GOLD   = "#F59E0B";
const MUTED  = "rgba(255,255,255,0.38)";
const BORDER = "rgba(255,255,255,0.07)";
const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

export default function Footer() {
  return (
    <footer style={{
      background: DARK,
      borderTop: `1px solid ${BORDER}`,
      padding: "36px 24px",
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>
        <span style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1rem", fontFamily: HF, letterSpacing: "-0.01em" }}>
          Room8
        </span>

        <nav style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <a href="/#purpose" style={linkStyle}>Mission</a>
          <a href="/#how-it-works" style={linkStyle}>How It Works</a>
          <Link to="/schools" style={linkStyle}>For Schools</Link>
          <Link to="/register" style={linkStyle}>Sign Up</Link>
        </nav>

        <p style={{ color: MUTED, fontSize: "0.8rem", margin: 0, fontFamily: BF }}>
          © {new Date().getFullYear()} Room8. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

const linkStyle = {
  color: MUTED,
  textDecoration: "none",
  fontSize: "0.85rem",
  fontWeight: 500,
  fontFamily: "'Inter', sans-serif",
  transition: "color 0.15s",
  cursor: "pointer",
};
