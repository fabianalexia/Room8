// src/pages/ChangelogPage.jsx: dated list of what shipped (audit D5.3, D5.5)
// Dates come from the repo's commit history. Add new entries at the top.
import React from "react";

const NAVY = "#0F2D5E", GOLD = "#F59E0B", BORD = "#E5E7EB";
const HF = "'Outfit', sans-serif", BF = "'Inter', sans-serif";

const ENTRIES = [
  { date: "2026-11-10", items: ["Homepage now explains how school verification works, plus a new FAQ, founder section and comparison pages"] },
  { date: "2026-10-28", items: ["Groundwork for per-school launches, so a campus can open once enough verified students join", "Photo verification with a hand-checked pose selfie and a verified badge", "Groundwork for the iPhone app"] },
  { date: "2026-07-19", items: ["Lifestyle preferences added to signup", "Delete account fixes"] },
  { date: "2026-06-03", items: ["Redesigned swipe screen with full-size photos", "Compatibility is now the default tab"] },
  { date: "2026-05-28", items: ["Push notifications for new messages and matches", "Message timestamps and read status"] },
  { date: "2026-05-27", items: ["Privacy policy and terms of service", "Account deletion", "Add your school even if it isn't in the list"] },
  { date: "2026-05-26", items: ["Real-time messaging", "Roommate confirmations sent to your school's housing office", "Washington state schools added to the school list"] },
  { date: "2026-05-18", items: ["Sign up and log in with Google or LinkedIn"] },
  { date: "2026-05-17", items: ["Verified student badges", "Full-screen profiles and a match celebration screen"] },
];

const fmt = d => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function ChangelogPage() {
  return (
    <main style={{ background: "#F8F9FA", padding: "120px 20px 96px", fontFamily: BF }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontFamily: HF, fontWeight: 800, fontSize: "clamp(2rem,4.5vw,3rem)", color: NAVY, letterSpacing: "-0.025em", margin: "0 0 12px" }}>Changelog</h1>
        <p style={{ color: "#334155", fontSize: "1.02rem", lineHeight: 1.7, margin: "0 0 40px" }}>What we've shipped on Room8, newest first.</p>
        {ENTRIES.map(e => (
          <section key={e.date} style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 20, marginBottom: 32 }}>
            <h2 style={{ fontFamily: HF, fontWeight: 700, fontSize: "1.1rem", color: NAVY, margin: "0 0 8px" }}>
              <time dateTime={e.date}>{fmt(e.date)}</time>
            </h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.75, fontSize: "0.95rem" }}>
              {e.items.map(i => <li key={i}>{i}</li>)}
            </ul>
          </section>
        ))}
        <p style={{ color: "#64748B", fontSize: "0.85rem", borderTop: `1px solid ${BORD}`, paddingTop: 20 }}>Room8 started as a student project at The Evergreen State College in 2024.</p>
      </div>
    </main>
  );
}
