// src/pages/ChangelogPage.jsx: dated list of what shipped (audit D5.3, D5.5)
// Dates come from the repo's commit history. Add new entries at the top.
import React from "react";

const ENTRIES = [
  { date: "2026-11-11", items: ["A brand new look: new logo, light and dark mode that follows your phone, smoother swipes and a full scrollable profile view", "Rebuilt onboarding, chats, likes and profile screens"] },
  { date: "2026-11-10", items: ["Homepage now explains how school verification works, plus a new FAQ, founder section and comparison pages"] },
  { date: "2026-10-28", items: ["Groundwork for per school launches, so a campus can open once enough verified students join", "Photo verification with a hand checked pose selfie and a verified badge", "Groundwork for the iPhone app"] },
  { date: "2026-07-19", items: ["Lifestyle preferences added to signup", "Delete account fixes"] },
  { date: "2026-06-03", items: ["Redesigned swipe screen with full size photos", "Compatibility is now the default tab"] },
  { date: "2026-05-28", items: ["Push notifications for new messages and matches", "Message timestamps and read status"] },
  { date: "2026-05-27", items: ["Privacy policy and terms of service", "Account deletion", "Add your school even if it isn't in the list"] },
  { date: "2026-05-26", items: ["Real time messaging", "Roommate confirmations sent to your school's housing office", "Washington state schools added to the school list"] },
  { date: "2026-05-18", items: ["Sign up and log in with Google or LinkedIn"] },
  { date: "2026-05-17", items: ["Verified student badges", "Full screen profiles and a match celebration screen"] },
];

const fmt = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default function ChangelogPage() {
  return (
    <main style={{ position: "relative", overflow: "hidden", padding: "calc(var(--safe-t) + 124px) 20px 110px" }}>
      <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 520, height: 520, top: -220, left: -180 }} />
      <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
        <span className="r8-sticker r8-sticker--pill" style={{ marginBottom: 18 }}>What's new</span>
        <h1 style={{ fontSize: "clamp(44px, 8vw, 80px)", lineHeight: 1, letterSpacing: "-0.05em", margin: "0 0 14px" }}>Changelog</h1>
        <p className="r8-muted" style={{ fontSize: 18, margin: "0 0 48px" }}>What we've shipped on Room8, newest first.</p>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
          <span aria-hidden="true" style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "var(--line)", borderRadius: 2 }} />
          {ENTRIES.map((e, i) => (
            <li key={e.date} style={{ position: "relative", paddingLeft: 40, marginBottom: 34 }}>
              <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 4, width: 16, height: 16, borderRadius: 99, background: i === 0 ? "var(--iri)" : "var(--glass-2)", border: "2px solid var(--bg)", boxShadow: "0 0 0 1px var(--line)" }} />
              <h2 style={{ fontSize: 17, margin: "0 0 10px", color: i === 0 ? "var(--text)" : "var(--text-2)" }}>
                <time dateTime={e.date}>{fmt(e.date)}</time>
              </h2>
              <div className="r8-card" style={{ borderRadius: 22, padding: "16px 20px" }}>
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.65, fontSize: 16 }}>
                  {e.items.map((it) => <li key={it} style={{ marginBottom: 4 }}>{it}</li>)}
                </ul>
              </div>
            </li>
          ))}
        </ol>
        <p className="r8-muted" style={{ fontSize: 14, borderTop: "1px solid var(--line)", paddingTop: 22, marginTop: 10 }}>Room8 started as a student project at The Evergreen State College in 2024.</p>
      </div>
    </main>
  );
}
