// src/pages/SchoolsPage.jsx — University pitch page
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

const NAVY   = "#0F2D5E";
const GOLD   = "#F59E0B";
const GOLD_D = "#D97706";
const DARK   = "#050D1F";
const DARKER = "#030914";
const WHITE  = "#FFFFFF";
const MUTED  = "rgba(255,255,255,0.5)";
const MUTED2 = "rgba(255,255,255,0.7)";
const BORDER = "rgba(255,255,255,0.1)";
const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

function FadeUp({ children, delay = 0, style }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
      borderRadius: 100, padding: "6px 18px", marginBottom: 20,
    }}>
      <span style={{ fontSize: "0.64rem", fontWeight: 700, color: GOLD, fontFamily: BF, letterSpacing: "0.2em", textTransform: "uppercase" }}>
        {children}
      </span>
    </div>
  );
}

const PROBLEMS = [
  { icon: "😰", stat: "43%", label: "of students report housing-related stress affects their academic performance" },
  { icon: "💸", stat: "2x",  label: "higher roommate conflict rates when students are matched randomly by housing offices" },
  { icon: "⏱️", stat: "6wk", label: "average time students spend searching for compatible housing on their own" },
  { icon: "🚪", stat: "1in3", label: "students consider transferring or dropping out due to poor living situations" },
];

const HOW_IT_WORKS = [
  { n: "01", icon: "🏫", title: "We set up your campus", desc: "Room8 configures a verified campus environment for your institution. We use your official email domain to ensure only your enrolled students can join." },
  { n: "02", icon: "🔗", title: "Students join for free", desc: "You share a simple signup link. Students create profiles, answer lifestyle questions, and browse verified classmates — at zero cost to them." },
  { n: "03", icon: "📊", title: "You get insights", desc: "Your housing office receives aggregate data on student housing preferences, compatibility trends, and engagement — informing smarter housing policy." },
];

const PRICING = [
  {
    tier: "Free Pilot",
    price: "$0",
    period: "6-month trial",
    desc: "For universities ready to test Room8 with a cohort of students before committing.",
    features: [
      "Up to 200 students",
      "School-verified profiles",
      "Full swipe + matching engine",
      "Basic housing insights dashboard",
      "Email support",
    ],
    cta: "Apply for Pilot",
    highlight: false,
  },
  {
    tier: "Standard",
    price: "$5,000",
    period: "per year",
    desc: "For mid-size universities wanting full deployment and ongoing partnership.",
    features: [
      "Unlimited students",
      "Full compatibility engine",
      "Advanced insights dashboard",
      "Housing office admin portal",
      "Priority support + onboarding",
      "Co-branded welcome materials",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    tier: "Enterprise",
    price: "$15,000",
    period: "per year",
    desc: "For large universities or multi-campus systems requiring deep integration.",
    features: [
      "Everything in Standard",
      "Multi-campus support",
      "Custom data integrations (SIS/Banner)",
      "White-label option",
      "Dedicated account manager",
      "SLA + compliance documentation",
      "Annual housing research report",
    ],
    cta: "Contact Us",
    highlight: false,
  },
];

function PricingCard({ plan, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeUp delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: plan.highlight
            ? `linear-gradient(135deg, rgba(15,45,94,0.9), rgba(10,22,40,0.9))`
            : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${plan.highlight ? GOLD : BORDER}`,
          borderRadius: 20,
          padding: "36px 30px",
          height: "100%",
          boxSizing: "border-box",
          position: "relative",
          transition: "transform 0.2s, box-shadow 0.2s",
          transform: hov ? "translateY(-6px)" : "none",
          boxShadow: hov
            ? plan.highlight
              ? "0 24px 60px rgba(245,158,11,0.2), 0 8px 30px rgba(0,0,0,0.4)"
              : "0 24px 60px rgba(0,0,0,0.3)"
            : plan.highlight
            ? "0 8px 40px rgba(245,158,11,0.1)"
            : "none",
        }}
      >
        {plan.highlight && (
          <div style={{
            position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
            background: GOLD, color: DARK, fontWeight: 800, fontSize: "0.7rem",
            fontFamily: BF, letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "4px 16px", borderRadius: 100,
          }}>
            Most Popular
          </div>
        )}
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontFamily: HF, fontWeight: 700, fontSize: "1rem", color: plan.highlight ? GOLD : MUTED2 }}>
            {plan.tier}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
          <span style={{ fontFamily: HF, fontWeight: 900, fontSize: "2.4rem", color: WHITE }}>
            {plan.price}
          </span>
          <span style={{ color: MUTED, fontSize: "0.85rem", fontFamily: BF }}>{plan.period}</span>
        </div>
        <p style={{ color: MUTED, fontSize: "0.85rem", lineHeight: 1.65, margin: "0 0 24px", fontFamily: BF }}>
          {plan.desc}
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
          {plan.features.map((f) => (
            <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: GOLD, fontSize: "0.85rem", flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ color: MUTED2, fontSize: "0.87rem", fontFamily: BF, lineHeight: 1.5 }}>{f}</span>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          style={{
            display: "block", textAlign: "center",
            background: plan.highlight ? GOLD : "transparent",
            color: plan.highlight ? DARK : GOLD,
            border: plan.highlight ? "none" : `1.5px solid rgba(245,158,11,0.4)`,
            padding: "13px 24px", borderRadius: 10,
            fontWeight: 700, fontSize: "0.95rem", textDecoration: "none",
            fontFamily: HF,
            boxShadow: plan.highlight ? "0 6px 24px rgba(245,158,11,0.35)" : "none",
            transition: "background 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => { if (!plan.highlight) e.currentTarget.style.background = "rgba(245,158,11,0.1)"; }}
          onMouseLeave={e => { if (!plan.highlight) e.currentTarget.style.background = "transparent"; }}
        >
          {plan.cta}
        </a>
      </div>
    </FadeUp>
  );
}

export default function SchoolsPage() {
  const [form, setForm] = useState({
    name: "", title: "", institution: "", email: "", students: "", message: "",
  });
  const [status, setStatus] = useState(""); // "sending" | "sent" | "error"

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.institution || !form.email) return;
    setStatus("sending");
    const subject = encodeURIComponent(`Room8 Partnership Inquiry — ${form.institution}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nTitle: ${form.title || "N/A"}\nInstitution: ${form.institution}\nEmail: ${form.email}\nEnrolled Students: ${form.students || "N/A"}\n\nMessage:\n${form.message || "N/A"}`
    );
    window.location.href = `mailto:partner@room8app.com?subject=${subject}&body=${body}`;
    setTimeout(() => setStatus("sent"), 600);
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: WHITE,
    fontSize: "0.92rem", fontFamily: BF,
    boxSizing: "border-box", outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ background: DARKER, color: WHITE, fontFamily: BF, overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <section style={{
        background: `linear-gradient(160deg, ${DARKER} 0%, #071020 50%, ${NAVY} 100%)`,
        padding: "100px 24px 90px",
        position: "relative", overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }} />

        <FadeUp>
          <SectionLabel>For Universities &amp; Housing Offices</SectionLabel>
        </FadeUp>
        <FadeUp delay={0.1}>
          <h1 style={{
            fontFamily: HF, fontWeight: 900, margin: "0 auto 24px",
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            lineHeight: 1.06, letterSpacing: "-0.03em",
            maxWidth: 820, color: WHITE,
          }}>
            Give your students{" "}
            <span style={{ color: GOLD, textShadow: "0 0 40px rgba(245,158,11,0.4)" }}>
              better housing outcomes
            </span>
          </h1>
        </FadeUp>
        <FadeUp delay={0.2}>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: "clamp(1rem, 2vw, 1.2rem)",
            lineHeight: 1.75, maxWidth: 600, margin: "0 auto 44px", fontFamily: BF,
          }}>
            Room8 partners with universities to bring school-verified, lifestyle-matched roommate pairing to your campus — improving student wellbeing and reducing housing conflict from day one.
          </p>
        </FadeUp>
        <FadeUp delay={0.3}>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{
              background: GOLD, color: DARK, padding: "15px 36px",
              borderRadius: 10, fontWeight: 800, fontSize: "1rem",
              textDecoration: "none", fontFamily: HF,
              boxShadow: "0 8px 36px rgba(245,158,11,0.45)",
              transition: "transform 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              Request a Demo →
            </a>
            <a href="#pricing" style={{
              color: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(255,255,255,0.2)",
              padding: "14px 32px", borderRadius: 10, fontWeight: 600, fontSize: "1rem",
              textDecoration: "none", fontFamily: BF,
              backdropFilter: "blur(10px)", background: "rgba(255,255,255,0.04)",
            }}>
              View Pricing
            </a>
          </div>
        </FadeUp>
      </section>

      {/* ── THE PROBLEM ── */}
      <section style={{ background: "#071020", padding: "96px 24px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 60 }}>
            <SectionLabel>The Problem</SectionLabel>
            <h2 style={{
              fontFamily: HF, fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: WHITE, letterSpacing: "-0.025em", margin: "0 auto", maxWidth: 700, lineHeight: 1.2,
            }}>
              Student housing is broken — and it's hurting retention
            </h2>
            <p style={{ color: MUTED, fontSize: "1rem", lineHeight: 1.75, maxWidth: 580, margin: "20px auto 0", fontFamily: BF }}>
              Most universities still assign roommates randomly or leave students to find housing on their own through Facebook groups and word of mouth. The results are predictable — and preventable.
            </p>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 20 }}>
            {PROBLEMS.map((p, i) => (
              <FadeUp key={p.stat} delay={i * 0.1}>
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                  borderRadius: 16, padding: "28px 24px", textAlign: "center",
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: 12 }}>{p.icon}</div>
                  <div style={{
                    fontFamily: HF, fontWeight: 900, fontSize: "2.2rem",
                    color: GOLD, lineHeight: 1, marginBottom: 10,
                    textShadow: "0 0 20px rgba(245,158,11,0.4)",
                  }}>{p.stat}</div>
                  <p style={{ color: MUTED, fontSize: "0.82rem", lineHeight: 1.6, margin: 0, fontFamily: BF }}>
                    {p.label}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.45} style={{ textAlign: "center", marginTop: 28 }}>
            <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "0.72rem", fontFamily: BF, margin: 0 }}>
              Sources: National Housing Survey 2024; Journal of College Student Development, Vol. 63
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── OUR SOLUTION ── */}
      <section style={{ background: DARKER, padding: "96px 24px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="schools-two-col">
            <FadeUp>
              <SectionLabel>Our Solution</SectionLabel>
              <h2 style={{
                fontFamily: HF, fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                color: WHITE, letterSpacing: "-0.025em", lineHeight: 1.2, margin: "0 0 20px",
              }}>
                Intelligent matching,<br />built for your campus
              </h2>
              <p style={{ color: MUTED, fontSize: "1rem", lineHeight: 1.78, margin: "0 0 20px", fontFamily: BF }}>
                Room8 uses a deep compatibility engine — matching students on sleep schedules, study habits, cleanliness, noise tolerance, social vibe, and more. Not just interests. The things that actually determine whether two people can share a space.
              </p>
              <p style={{ color: MUTED, fontSize: "1rem", lineHeight: 1.78, margin: 0, fontFamily: BF }}>
                Every profile is verified to your institution via email domain. Only enrolled students at your school can see and match with each other. Privacy, safety, and community — all built in.
              </p>
            </FadeUp>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "🎯", title: "Deep Lifestyle Compatibility", desc: "10-factor preference matching goes far beyond \"interests\" to predict actual living harmony." },
                { icon: "🏫", title: "School-Verified Only",        desc: "Email domain verification ensures your campus pool stays closed to non-students." },
                { icon: "🛡️", title: "Built-In Safety Tools",       desc: "Reporting, blocking, and moderation — safety is a feature, not an afterthought." },
                { icon: "📊", title: "Housing Insights Dashboard",  desc: "Aggregate anonymized data helps your housing office make smarter decisions." },
              ].map((item, i) => (
                <FadeUp key={item.title} delay={0.1 + i * 0.08}>
                  <div style={{
                    display: "flex", gap: 16, alignItems: "flex-start",
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                    borderRadius: 14, padding: "18px 20px",
                    transition: "border-color 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                  >
                    <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontFamily: HF, fontWeight: 700, fontSize: "0.95rem", color: WHITE, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ color: MUTED, fontSize: "0.83rem", lineHeight: 1.6, fontFamily: BF }}>{item.desc}</div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS FOR SCHOOLS ── */}
      <section style={{ background: "#071020", padding: "96px 24px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 64 }}>
            <SectionLabel>How It Works</SectionLabel>
            <h2 style={{
              fontFamily: HF, fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: WHITE, letterSpacing: "-0.025em", margin: 0, lineHeight: 1.2,
            }}>
              Up and running in days, not months
            </h2>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 28 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <FadeUp key={s.n} delay={i * 0.12}>
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                  borderRadius: 20, padding: "36px 28px",
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${NAVY}, #1e4a8a)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 20, boxShadow: "0 6px 24px rgba(15,45,94,0.4)",
                    position: "relative",
                  }}>
                    <span style={{ fontFamily: HF, fontWeight: 900, fontSize: "1rem", color: WHITE }}>{s.n}</span>
                    <div style={{
                      position: "absolute", top: -3, right: -3,
                      width: 14, height: 14, borderRadius: "50%",
                      background: GOLD, boxShadow: "0 2px 8px rgba(245,158,11,0.6)",
                    }} />
                  </div>
                  <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>{s.icon}</div>
                  <h3 style={{ fontFamily: HF, fontWeight: 700, fontSize: "1.1rem", color: WHITE, margin: "0 0 10px" }}>{s.title}</h3>
                  <p style={{ color: MUTED, fontSize: "0.9rem", lineHeight: 1.72, margin: 0, fontFamily: BF }}>{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: DARKER, padding: "96px 24px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 64 }}>
            <SectionLabel>Pricing</SectionLabel>
            <h2 style={{
              fontFamily: HF, fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: WHITE, letterSpacing: "-0.025em", margin: "0 0 16px", lineHeight: 1.2,
            }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: MUTED, fontSize: "1rem", fontFamily: BF, maxWidth: 480, margin: "0 auto" }}>
              Start free. Scale when you're ready. No hidden fees, no per-student charges after the pilot.
            </p>
          </FadeUp>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 24, alignItems: "start" }}>
            {PRICING.map((plan, i) => (
              <PricingCard key={plan.tier} plan={plan} delay={i * 0.1} />
            ))}
          </div>

          <FadeUp delay={0.3} style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ color: MUTED, fontSize: "0.85rem", fontFamily: BF }}>
              All plans include FERPA-compliant data handling. Custom contracts available for public universities.{" "}
              <a href="#contact" style={{ color: GOLD, textDecoration: "none" }}>Contact us</a> to discuss.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section id="contact" style={{ background: "#071020", padding: "96px 24px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <FadeUp style={{ textAlign: "center", marginBottom: 52 }}>
            <SectionLabel>Get In Touch</SectionLabel>
            <h2 style={{
              fontFamily: HF, fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: WHITE, letterSpacing: "-0.025em", margin: "0 0 16px", lineHeight: 1.2,
            }}>
              Let's bring Room8 to your campus
            </h2>
            <p style={{ color: MUTED, fontSize: "1rem", fontFamily: BF, maxWidth: 500, margin: "0 auto" }}>
              Fill out the form below and our team will be in touch within one business day.
            </p>
          </FadeUp>

          {status === "sent" ? (
            <FadeUp>
              <div style={{
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 16, padding: "48px 32px", textAlign: "center",
              }}>
                <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: HF, fontWeight: 800, color: "#86efac", margin: "0 0 10px", fontSize: "1.4rem" }}>
                  Message received!
                </h3>
                <p style={{ color: "rgba(134,239,172,0.7)", fontFamily: BF, margin: 0 }}>
                  We'll reach out to {form.email} within one business day.
                </p>
              </div>
            </FadeUp>
          ) : (
            <FadeUp delay={0.1}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-two-col">
                  <div>
                    <label style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 6, fontFamily: BF, letterSpacing: "0.05em" }}>
                      Your Name *
                    </label>
                    <input
                      name="name" value={form.name} onChange={update} required
                      placeholder="Dr. Jane Smith"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    />
                  </div>
                  <div>
                    <label style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 6, fontFamily: BF, letterSpacing: "0.05em" }}>
                      Title / Role
                    </label>
                    <input
                      name="title" value={form.title} onChange={update}
                      placeholder="Director of Residential Life"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 6, fontFamily: BF, letterSpacing: "0.05em" }}>
                    Institution *
                  </label>
                  <input
                    name="institution" value={form.institution} onChange={update} required
                    placeholder="University of Example"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-two-col">
                  <div>
                    <label style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 6, fontFamily: BF, letterSpacing: "0.05em" }}>
                      Institutional Email *
                    </label>
                    <input
                      name="email" type="email" value={form.email} onChange={update} required
                      placeholder="jsmith@university.edu"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                    />
                  </div>
                  <div>
                    <label style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 6, fontFamily: BF, letterSpacing: "0.05em" }}>
                      Enrolled Students
                    </label>
                    <select
                      name="students" value={form.students} onChange={update}
                      style={{ ...inputStyle }}
                    >
                      <option value="">Select range…</option>
                      <option value="under_2k">Under 2,000</option>
                      <option value="2k_5k">2,000 – 5,000</option>
                      <option value="5k_15k">5,000 – 15,000</option>
                      <option value="15k_30k">15,000 – 30,000</option>
                      <option value="over_30k">Over 30,000</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 6, fontFamily: BF, letterSpacing: "0.05em" }}>
                    Message
                  </label>
                  <textarea
                    name="message" value={form.message} onChange={update}
                    rows={4}
                    placeholder="Tell us about your institution's housing challenges and what you're looking for in a partner…"
                    style={{ ...inputStyle, resize: "vertical" }}
                    onFocus={e => e.target.style.borderColor = "rgba(245,158,11,0.5)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    background: status === "sending" ? "rgba(245,158,11,0.5)" : GOLD,
                    color: DARK, border: "none", padding: "15px",
                    borderRadius: 10, fontWeight: 800, fontSize: "1rem",
                    cursor: status === "sending" ? "default" : "pointer",
                    fontFamily: HF, marginTop: 4,
                    boxShadow: status === "sending" ? "none" : "0 6px 28px rgba(245,158,11,0.4)",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={e => { if (status !== "sending") e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                >
                  {status === "sending" ? "Sending…" : "Send Inquiry →"}
                </button>

                <p style={{ color: MUTED, fontSize: "0.78rem", fontFamily: BF, textAlign: "center", margin: 0 }}>
                  Or email us directly at{" "}
                  <a href="mailto:partner@room8app.com" style={{ color: GOLD, textDecoration: "none" }}>
                    partner@room8app.com
                  </a>
                </p>
              </form>
            </FadeUp>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #061840 100%)`,
        padding: "80px 24px", textAlign: "center",
        borderTop: `1px solid ${BORDER}`,
      }}>
        <FadeUp>
          <p style={{ color: "rgba(245,158,11,0.7)", fontFamily: BF, fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 16px" }}>
            Room8 for Universities
          </p>
          <h2 style={{ fontFamily: HF, fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 3rem)", color: WHITE, letterSpacing: "-0.025em", margin: "0 0 16px", lineHeight: 1.15 }}>
            Better roommates. Happier students. Stronger retention.
          </h2>
          <p style={{ color: MUTED, fontSize: "1rem", fontFamily: BF, maxWidth: 480, margin: "0 auto 36px" }}>
            Join our growing network of campus partners. The pilot is free — the results speak for themselves.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{
              background: GOLD, color: DARK, padding: "14px 34px", borderRadius: 10,
              fontWeight: 800, fontSize: "0.95rem", textDecoration: "none", fontFamily: HF,
              boxShadow: "0 6px 28px rgba(245,158,11,0.4)",
            }}>Apply for Free Pilot</a>
            <Link to="/" style={{
              color: "rgba(255,255,255,0.7)", border: "1.5px solid rgba(255,255,255,0.15)",
              padding: "13px 28px", borderRadius: 10, fontWeight: 600,
              fontSize: "0.95rem", textDecoration: "none", fontFamily: BF,
            }}>Back to Home</Link>
          </div>
        </FadeUp>
      </section>

      <style>{`
        @media (max-width: 700px) {
          .schools-two-col { grid-template-columns: 1fr !important; gap: 40px !important; }
          .form-two-col    { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
