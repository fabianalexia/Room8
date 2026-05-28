// src/pages/PrivacyPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const NAVY   = "#0F2D5E";
const GOLD   = "#F59E0B";
const DARK   = "#050D1F";
const DARKER = "#030914";
const WHITE  = "#FFFFFF";
const MUTED  = "rgba(255,255,255,0.55)";
const BORDER = "rgba(255,255,255,0.08)";
const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontFamily: HF, fontWeight: 700, fontSize: "1.15rem",
        color: GOLD, margin: "0 0 12px", letterSpacing: "-0.01em",
      }}>
        {title}
      </h2>
      <div style={{
        color: "rgba(255,255,255,0.8)", fontSize: "0.92rem",
        lineHeight: 1.8, fontFamily: BF,
      }}>
        {children}
      </div>
    </section>
  );
}

function Ul({ items }) {
  return (
    <ul style={{ margin: "8px 0 0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => (
        <li key={i} style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.92rem", lineHeight: 1.7, fontFamily: BF }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DARKER} 0%, #071020 60%, ${NAVY} 100%)`,
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
        top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 80px", position: "relative" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <Link to="/" style={{
            color: MUTED, textDecoration: "none", fontSize: "0.85rem",
            fontFamily: BF, display: "inline-flex", alignItems: "center", gap: 6,
            marginBottom: 28,
          }}>
            ← Back to Room8
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{
              fontFamily: HF, fontWeight: 800, fontSize: "1.4rem",
              color: WHITE, letterSpacing: "-0.02em",
            }}>
              room<span style={{ color: GOLD }}>8</span>
            </div>
          </div>

          <h1 style={{
            fontFamily: HF, fontWeight: 800, fontSize: "2rem",
            color: WHITE, margin: "0 0 12px", letterSpacing: "-0.03em",
          }}>
            Privacy Policy
          </h1>
          <p style={{ color: MUTED, fontFamily: BF, fontSize: "0.88rem", margin: 0 }}>
            Effective date: June 1, 2026
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: BORDER, marginBottom: 40 }} />

        {/* Intro */}
        <p style={{
          color: "rgba(255,255,255,0.75)", fontFamily: BF,
          fontSize: "0.95rem", lineHeight: 1.8, marginBottom: 40,
        }}>
          Room8 ("we," "us," or "our") is a student roommate-matching platform. This Privacy Policy
          explains how we collect, use, and protect your information when you use Room8 at{" "}
          <a href="https://swiperoom8.com" style={{ color: GOLD }}>swiperoom8.com</a>. By using Room8,
          you agree to the practices described here.
        </p>

        <Section title="1. Information We Collect">
          <p style={{ margin: "0 0 10px" }}>
            We collect only the information you voluntarily provide when you create and maintain your profile:
          </p>
          <Ul items={[
            "Name and email address (collected at registration)",
            "School or university",
            "Age and year in school",
            "Major or field of study",
            "Profile photo and any additional photos you upload",
            "Housing preferences (on-campus/off-campus, room type, budget)",
            "Bio and \"looking for\" description",
            "Messages exchanged with matched users",
            "Swipe history (likes and skips) used to generate matches",
          ]} />
          <p style={{ margin: "12px 0 0" }}>
            We do not access, retrieve, or store any data from your university's records systems.
          </p>
        </Section>

        <Section title="2. How We Use Your Information">
          <Ul items={[
            "Roommate matching — we use your profile and preferences to surface compatible matches",
            "School verification — your .edu email is used to verify you are an enrolled student",
            "Messaging — messages are stored to deliver them to the recipient and display your conversation history",
            "Account management — your email is used for password resets, security notices, and product updates",
            "Safety and moderation — reports and block actions are processed to keep the platform safe",
          ]} />
        </Section>

        <Section title="3. Who We Share Your Information With">
          <p style={{ margin: "0 0 10px" }}>
            <strong style={{ color: WHITE }}>We do not sell your data.</strong> We do not share your
            personal information with advertisers, data brokers, or third-party marketers.
          </p>
          <p style={{ margin: "0 0 10px" }}>
            We share information in the following limited circumstances:
          </p>
          <Ul items={[
            "University housing offices — when you and another student mutually confirm each other as roommates using the \"Confirm Roommate\" feature, we send a summary of both students' profiles (name, email, school, class year, major, housing preferences) to the housing office at your school. This notification is sent only when both students have confirmed, and only at your initiation.",
            "Service providers — we use Cloudinary for photo storage and hosting. Photos you upload are stored on Cloudinary's infrastructure subject to their privacy policy.",
            "Legal compliance — we may disclose information if required by law or to protect the safety of users.",
          ]} />
        </Section>

        <Section title="4. FERPA Notice">
          <p style={{ margin: "0 0 10px" }}>
            The Family Educational Rights and Privacy Act (FERPA) protects the privacy of student
            education records held by educational institutions. Room8 is an independent platform —
            we are not affiliated with any university and we do not access university records.
          </p>
          <p style={{ margin: 0 }}>
            All information in your Room8 profile is information you have chosen to share with us
            directly. We do not obtain data from your school's student information system, registrar,
            or any other university database. The housing office notification described in Section 3
            is sent based solely on data you provided to Room8, not from university records.
          </p>
        </Section>

        <Section title="5. Data Security">
          <Ul items={[
            "All data is transmitted over HTTPS/TLS encryption",
            "Passwords are hashed using industry-standard algorithms (bcrypt via Werkzeug) — we never store plaintext passwords",
            "Our database is hosted on a managed cloud provider with encryption at rest",
            "Authentication tokens are short-lived (24 hours) and invalidated on password change",
          ]} />
          <p style={{ margin: "12px 0 0" }}>
            While we take security seriously, no system is 100% secure. We encourage you to use a
            strong, unique password and to contact us immediately if you suspect unauthorized access
            to your account.
          </p>
        </Section>

        <Section title="6. Your Rights and Choices">
          <Ul items={[
            "Update your profile — you can edit your profile information at any time from the Profile tab",
            "Delete your account — you can request account deletion by emailing us at partner@swiperoom8.com. We will delete your profile, photos, and messages within 30 days.",
            "Data access and portability — you can request a copy of the data we hold about you by emailing partner@swiperoom8.com",
            "Opt out of housing notifications — if you do not want your information shared with your housing office, do not use the \"Confirm Roommate\" feature",
          ]} />
        </Section>

        <Section title="7. Data Retention">
          <p style={{ margin: 0 }}>
            We retain your account data for as long as your account is active. If you request deletion,
            we will remove your personal data within 30 days. Aggregated, anonymized analytics data
            (with no personally identifying information) may be retained indefinitely.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p style={{ margin: 0 }}>
            Room8 is intended for users who are 18 years of age or older, or who have parental or
            guardian consent. We do not knowingly collect personal information from children under 13.
            If you believe a child under 13 has provided us with personal information, please contact us
            and we will delete it promptly.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p style={{ margin: 0 }}>
            We may update this Privacy Policy from time to time. When we do, we will update the
            effective date at the top of this page. Continued use of Room8 after a policy update
            constitutes your acceptance of the updated terms.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p style={{ margin: 0 }}>
            If you have questions about this Privacy Policy or want to exercise your rights, contact us at:{" "}
            <a href="mailto:partner@swiperoom8.com" style={{ color: GOLD }}>
              partner@swiperoom8.com
            </a>
          </p>
        </Section>

        {/* Footer links */}
        <div style={{
          marginTop: 48, paddingTop: 24,
          borderTop: `1px solid ${BORDER}`,
          display: "flex", gap: 24, flexWrap: "wrap",
        }}>
          <Link to="/terms" style={{ color: MUTED, fontSize: "0.85rem", fontFamily: BF, textDecoration: "none" }}>
            Terms of Service
          </Link>
          <Link to="/" style={{ color: MUTED, fontSize: "0.85rem", fontFamily: BF, textDecoration: "none" }}>
            Back to Room8
          </Link>
        </div>
      </div>
    </div>
  );
}
