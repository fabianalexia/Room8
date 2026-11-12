// src/pages/ComparePage.jsx: honest Room8 vs X pages (audit D5.3)
// Competitor facts come from their public sites as checked in November 2026.
// Re-check before each school year and update CHECKED.
import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Icon from "../ui/Icon";

const CHECKED = "November 2026";

const ROOM8 = {
  focus: "Roommate matching only",
  verification: "School .edu email you confirm by email. Optional selfie in a requested pose, checked by hand, for a verified badge",
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
      { q: "Which one verifies students more strictly?", a: "Room8 requires a school .edu email you confirm by email, and offers a hand-checked selfie for a verified badge. MeetYourClass uses manual student verification. Check each site for current details." },
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
      { q: "How does Room8 check that people are students?", a: "You sign up with your school .edu email and confirm it with the code or link we send. You can also take a quick selfie in the pose we ask for, which our team checks by hand, to get a verified badge." },
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
    <main style={{ position: "relative", overflow: "hidden", padding: "calc(var(--safe-t) + 124px) 20px 110px" }}>
      <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 560, height: 560, top: -240, right: -180 }} />
      <article style={{ position: "relative", maxWidth: 920, margin: "0 auto" }}>
        <span className="r8-sticker r8-sticker--pill" style={{ marginBottom: 18 }}>Honest comparison</span>
        <h1 style={{ fontSize: "clamp(40px, 7vw, 72px)", lineHeight: 1, letterSpacing: "-0.045em", margin: "0 0 20px" }}>
          Room8 vs <span className="r8-iri-text">{rival.name}</span>
        </h1>
        <p className="r8-muted" style={{ fontSize: 18, lineHeight: 1.6, margin: "0 0 36px", maxWidth: 720 }}>{rival.intro}</p>

        <div className="r8-card cmp-table" style={{ overflowX: "auto", borderRadius: 28, padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr>
                <th style={th}></th>
                <th style={th}><span className="r8-iri-text">Room8</span></th>
                <th style={th}>{rival.name}</th>
              </tr>
            </thead>
            <tbody>
              {LABELS.map(([key, label], i) => (
                <tr key={key} style={{ borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <th scope="row" style={{ ...td, fontWeight: 600, color: "var(--text)", width: "24%" }}>{label}</th>
                  <td style={{ ...td, color: "var(--text)" }}>{ROOM8[key]}</td>
                  <td style={td}>{rival.rows[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="cmp-stack" style={{ display: "grid", gap: 10 }}>
          {LABELS.map(([key, label]) => (
            <div key={key} className="r8-card" style={{ borderRadius: 22, padding: "16px 18px" }}>
              <p className="r8-eyebrow" style={{ marginBottom: 10 }}>{label}</p>
              <p style={{ fontSize: 15, lineHeight: 1.5, margin: "0 0 10px" }}><strong className="r8-iri-text">Room8</strong><br />{ROOM8[key]}</p>
              <p className="r8-muted" style={{ fontSize: 15, lineHeight: 1.5, margin: 0, paddingTop: 10, borderTop: "1px solid var(--line)" }}><strong style={{ color: "var(--text)" }}>{rival.name}</strong><br />{rival.rows[key]}</p>
            </div>
          ))}
        </div>
        <p className="r8-muted" style={{ fontSize: 13, margin: "12px 4px 44px" }}>
          {rival.name} details are from their public website, checked {CHECKED}. If something changed, email <a href="mailto:partner@swiperoom8.com" style={{ color: "var(--accent)" }}>partner@swiperoom8.com</a> and we'll fix it.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 52 }}>
          <div className="r8-card" style={card}><h2 style={h2}>Pick {rival.name} if</h2><p className="r8-muted" style={p}>{rival.pickThem}</p></div>
          <div className="r8-glass" style={{ ...card, boxShadow: "0 0 0 1.5px var(--accent)" }}><h2 style={h2}>Pick Room8 if</h2><p className="r8-muted" style={p}>{rival.pickUs}</p></div>
        </div>

        <h2 style={{ fontSize: 30, marginBottom: 18 }}>Common questions</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {rival.faqs.map((f) => (
            <details key={f.q} className="r8-card r8-faq" style={{ borderRadius: 22, padding: "18px 22px" }}>
              <summary style={{ fontWeight: 600, fontSize: 17, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, listStyle: "none" }}>
                {f.q}<span className="r8-faq-chev" style={{ display: "flex", color: "var(--text-2)" }}><Icon name="chevronDown" size={20} /></span>
              </summary>
              <p className="r8-muted" style={{ ...p, marginTop: 10 }}>{f.a}</p>
            </details>
          ))}
        </div>

        <div style={{ marginTop: 44, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to="/register" className="r8-btn r8-btn--primary r8-btn--lg">Try Room8 free<Icon name="arrowRight" size={20} /></Link>
          <Link to="/#faq" className="r8-btn r8-btn--glass r8-btn--lg">More questions</Link>
        </div>
      </article>
      <style>{`.cmp-stack{display:none!important}@media(max-width:640px){.cmp-table{display:none}.cmp-stack{display:grid!important}}.r8-faq summary::-webkit-details-marker{display:none}.r8-faq[open] .r8-faq-chev{transform:rotate(180deg)}.r8-faq-chev{transition:transform .25s}`}</style>
    </main>
  );
}

const th = { textAlign: "left", padding: "18px 20px", fontSize: 16, fontWeight: 700, borderBottom: "1px solid var(--line)" };
const td = { textAlign: "left", verticalAlign: "top", padding: "16px 20px", fontSize: 15, lineHeight: 1.55, color: "var(--text-2)" };
const card = { padding: 24, borderRadius: 26 };
const h2 = { fontSize: 20, margin: "0 0 8px" };
const p = { fontSize: 16, lineHeight: 1.6, margin: 0 };
