// src/pages/ComparePage.jsx: honest Room8 vs X pages (audit D5.3)
// Competitor facts come from their public sites as checked in November 2026.
// Re-check before each school year and update CHECKED.
import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";

const NAVY = "#0F2D5E", BLUE = "#2563EB", GOLD = "#F59E0B", MUTED = "#64748B", BORD = "#E5E7EB";
const HF = "'Outfit', sans-serif", BF = "'Inter', sans-serif";
const CHECKED = "November 2026";

const ROOM8 = {
  focus: "Roommate matching only",
  verification: "School .edu email you confirm by link. Optional selfie in a requested pose, checked by hand, for a verified badge",
  matching: "Compatibility score on sleep schedule, study habits, cleanliness and noise tolerance",
  pool: "Shows students from your own school first",
  apps: "Works in any phone or laptop browser. Native iPhone app in progress",
  price: "Free for students",
  size: "New. Early access opened in 2026",
};

const RIVALS = {
  "room8-vs-meetyourclass": {
    name: "MeetYourClass",
    intro: "MeetYourClass and Room8 both help college students find a roommate before they arrive, both are free, and both check that you're a student. The difference is focus: MeetYourClass is a wider tool for researching colleges and finding friends, and Room8 is built only for roommate matching.",
    rows: {
      focus: "Researching colleges, finding friends and finding roommates",
      verification: "Manual student verification",
      matching: "Browse by lifestyle, major and 100+ filters",
      pool: "Students at the college you pick",
      apps: "See their site",
      price: "Free",
      size: "Says hundreds of thousands of students across 1,500+ colleges",
    },
    pickThem: "You want one place to research colleges and meet friends, or your school isn't on Room8 yet.",
    pickUs: "You care most about living with someone whose sleep, study, cleanliness and noise habits match yours, and you'd rather see a compatibility score than set filters yourself.",
    faqs: [
      { q: "Is Room8 free like MeetYourClass?", a: "Yes. Room8 is free for students." },
      { q: "Which one verifies students more strictly?", a: "Room8 requires a school .edu email you confirm by link, and offers a hand-checked selfie for a verified badge. MeetYourClass uses manual student verification. Check each site for current details." },
      { q: "Can I use both?", a: "Yes. Nothing stops you from having a profile on both." },
    ],
  },
  "room8-vs-zeemee": {
    name: "ZeeMee",
    intro: "ZeeMee is the biggest social app for students choosing a college, with friends, roommates and campus life in one place. Room8 is much smaller and does one thing: match you with a compatible roommate from your school.",
    rows: {
      focus: "Social app for students choosing a college: friends, roommates and campus life",
      verification: "See their site",
      matching: "Find friends and roommates inside a wider campus community",
      pool: "Students at your college",
      apps: "Native iOS and Android apps",
      price: "See their site",
      size: "Says 3M+ students and 3,000+ schools. 4.7 App Store rating",
    },
    pickThem: "You're still choosing a college and want to explore campus life and meet lots of people, not just a roommate.",
    pickUs: "You already know your school and want a roommate matched on daily habits, not a social feed.",
    faqs: [
      { q: "Is Room8 a replacement for ZeeMee?", a: "Not really. ZeeMee is a full social app for college life. Room8 only does roommate matching, so plenty of students could use both." },
      { q: "Does Room8 have a mobile app?", a: "Room8 works in your phone browser today. A native iPhone app is in progress." },
      { q: "How does Room8 check that people are students?", a: "You sign up with your school .edu email and confirm the link we send. You can also take a quick selfie in the pose we ask for, which our team checks by hand, to get a verified badge." },
    ],
  },
};

const LABELS = [
  ["focus", "What it's for"],
  ["verification", "How students are verified"],
  ["matching", "How matching works"],
  ["pool", "Who you see"],
  ["apps", "Where it runs"],
  ["price", "Price for students"],
  ["size", "Size"],
];

export default function ComparePage() {
  const { slug } = useParams();
  const rival = RIVALS[slug];
  if (!rival) return <Navigate to="/" replace />;

  return (
    <main style={{ background: "#F8F9FA", padding: "120px 20px 96px", fontFamily: BF }}>
      <article style={{ maxWidth: 920, margin: "0 auto" }}>
        <h1 style={{ fontFamily: HF, fontWeight: 800, fontSize: "clamp(2rem,4.5vw,3rem)", color: NAVY, letterSpacing: "-0.025em", margin: "0 0 18px" }}>
          Room8 vs {rival.name}
        </h1>
        <p style={{ color: "#334155", fontSize: "1.05rem", lineHeight: 1.75, margin: "0 0 36px" }}>{rival.intro}</p>

        <div style={{ overflowX: "auto", background: "#fff", border: `1px solid ${BORD}`, borderRadius: 16 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr>
                <th style={th}></th>
                <th style={{ ...th, color: GOLD }}>Room8</th>
                <th style={th}>{rival.name}</th>
              </tr>
            </thead>
            <tbody>
              {LABELS.map(([key, label]) => (
                <tr key={key}>
                  <th scope="row" style={{ ...td, fontWeight: 700, color: NAVY, width: "24%" }}>{label}</th>
                  <td style={td}>{ROOM8[key]}</td>
                  <td style={td}>{rival.rows[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: MUTED, fontSize: "0.8rem", margin: "10px 0 40px" }}>
          {rival.name} details are from their public website, checked {CHECKED}. If something changed, email partner@swiperoom8.com and we'll fix it.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18, marginBottom: 48 }}>
          <div style={card}><h2 style={h2}>Pick {rival.name} if</h2><p style={p}>{rival.pickThem}</p></div>
          <div style={card}><h2 style={h2}>Pick Room8 if</h2><p style={p}>{rival.pickUs}</p></div>
        </div>

        <h2 style={{ ...h2, fontSize: "1.5rem", marginBottom: 16 }}>Common questions</h2>
        {rival.faqs.map(f => (
          <details key={f.q} style={{ background: "#fff", border: `1px solid ${BORD}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
            <summary style={{ fontFamily: HF, fontWeight: 700, color: NAVY, cursor: "pointer" }}>{f.q}</summary>
            <p style={{ ...p, marginTop: 10 }}>{f.a}</p>
          </details>
        ))}

        <div style={{ marginTop: 40, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link to="/register" style={{ background: GOLD, color: "#050D1F", padding: "14px 32px", borderRadius: 10, fontWeight: 800, textDecoration: "none", fontFamily: HF }}>Try Room8 free →</Link>
          <Link to="/#faq" style={{ color: BLUE, padding: "14px 8px", fontWeight: 600, textDecoration: "none" }}>More questions</Link>
        </div>
      </article>
    </main>
  );
}

const th = { textAlign: "left", padding: "14px 16px", borderBottom: `1px solid ${BORD}`, fontFamily: HF, fontSize: "1rem", color: NAVY };
const td = { textAlign: "left", verticalAlign: "top", padding: "14px 16px", borderBottom: `1px solid ${BORD}`, fontSize: "0.92rem", lineHeight: 1.6, color: "#334155" };
const card = { background: "#fff", border: `1px solid ${BORD}`, borderRadius: 16, padding: "22px 22px" };
const h2 = { fontFamily: HF, fontWeight: 700, fontSize: "1.15rem", color: NAVY, margin: "0 0 8px" };
const p = { color: "#334155", fontSize: "0.95rem", lineHeight: 1.7, margin: 0 };
