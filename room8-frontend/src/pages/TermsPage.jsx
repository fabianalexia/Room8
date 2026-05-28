// src/pages/TermsPage.jsx
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

export default function TermsPage() {
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
            Terms of Service
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
          These Terms of Service ("Terms") govern your use of Room8, operated by Room8 ("we," "us," or "our"),
          accessible at{" "}
          <a href="https://swiperoom8.com" style={{ color: GOLD }}>swiperoom8.com</a>. By creating an account
          or using Room8, you agree to these Terms. If you do not agree, do not use the platform.
        </p>

        <Section title="1. Eligibility">
          <p style={{ margin: "0 0 10px" }}>
            You must be at least 18 years old to use Room8 without restriction. If you are between the
            ages of 13 and 17, you may only use Room8 with the express consent of a parent or legal
            guardian who agrees to these Terms on your behalf.
          </p>
          <p style={{ margin: 0 }}>
            You represent that all information you provide during registration is accurate and that you
            are currently enrolled at or affiliated with the school listed on your profile.
          </p>
        </Section>

        <Section title="2. Account Responsibilities">
          <Ul items={[
            "You are responsible for keeping your login credentials secure. Do not share your password with anyone.",
            "You are responsible for all activity that occurs under your account.",
            "If you believe your account has been compromised, contact us immediately at partner@swiperoom8.com.",
            "You may only create one account per person.",
          ]} />
        </Section>

        <Section title="3. Acceptable Use">
          <p style={{ margin: "0 0 10px" }}>
            Room8 is a platform for connecting students seeking roommates. You agree not to:
          </p>
          <Ul items={[
            "Create a fake, misleading, or impersonating profile",
            "Harass, threaten, bully, or intimidate other users",
            "Send unsolicited promotional messages or spam",
            "Post content that is illegal, obscene, defamatory, or violates the rights of others",
            "Attempt to gain unauthorized access to other accounts or our systems",
            "Use the platform for any commercial solicitation or non-roommate-related purposes",
            "Scrape, copy, or systematically extract data from Room8",
          ]} />
        </Section>

        <Section title="4. No Guarantee of Roommate Match">
          <p style={{ margin: 0 }}>
            Room8 facilitates connections between students but does not guarantee that you will find
            a roommate. We make no representations about the accuracy of other users' profiles or the
            compatibility of any match. It is your responsibility to exercise your own judgment when
            deciding to room with another person.
          </p>
        </Section>

        <Section title="5. In-Person Interactions">
          <p style={{ margin: "0 0 10px" }}>
            Room8 is an online platform. Any in-person meetings, housing arrangements, lease agreements,
            or other real-world interactions that result from connections made on Room8 are entirely
            between you and the other user.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: WHITE }}>Room8 is not responsible for any in-person interactions,
            incidents, disputes, injuries, damages, or losses that occur between matched users.</strong>{" "}
            We strongly encourage you to exercise caution, meet in public places first, and involve
            your university's housing office in any formal housing arrangement.
          </p>
        </Section>

        <Section title="6. Housing Office Notifications">
          <p style={{ margin: 0 }}>
            When you use the "Confirm Roommate" feature, you consent to Room8 notifying your university's
            housing office of the confirmed roommate pair. This notification includes basic profile
            information (name, email, school, housing preferences) for both students. See our{" "}
            <Link to="/privacy" style={{ color: GOLD }}>Privacy Policy</Link> for details.
          </p>
        </Section>

        <Section title="7. Content You Post">
          <p style={{ margin: "0 0 10px" }}>
            You retain ownership of the content you post (photos, bio, messages). By posting content on
            Room8, you grant us a limited, non-exclusive, royalty-free license to store and display that
            content as necessary to operate the platform.
          </p>
          <p style={{ margin: 0 }}>
            You are solely responsible for any content you post. Do not post content you do not have
            the right to share.
          </p>
        </Section>

        <Section title="8. Account Suspension and Termination">
          <p style={{ margin: "0 0 10px" }}>
            We reserve the right to suspend or permanently terminate any account that:
          </p>
          <Ul items={[
            "Violates these Terms or our community standards",
            "Is reported multiple times for harassment or abusive behavior",
            "Is found to contain false or misleading information",
            "Engages in any activity that threatens the safety of other users or the integrity of the platform",
          ]} />
          <p style={{ margin: "12px 0 0" }}>
            In serious cases involving safety threats, we may take immediate action without prior notice.
          </p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p style={{ margin: 0 }}>
            Room8 is provided "as is" and "as available" without warranties of any kind, express or
            implied. We do not warrant that the platform will be uninterrupted, error-free, or free of
            harmful components. Your use of Room8 is at your own risk.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p style={{ margin: 0 }}>
            To the fullest extent permitted by law, Room8 and its operators shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from your use of
            the platform, including but not limited to damages resulting from in-person interactions with
            other users, loss of data, or service interruptions.
          </p>
        </Section>

        <Section title="11. Changes to These Terms">
          <p style={{ margin: 0 }}>
            We may update these Terms from time to time. When we do, we will update the effective date
            above. Continued use of Room8 after an update constitutes your acceptance of the revised
            Terms.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p style={{ margin: 0 }}>
            Questions about these Terms? Contact us at:{" "}
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
          <Link to="/privacy" style={{ color: MUTED, fontSize: "0.85rem", fontFamily: BF, textDecoration: "none" }}>
            Privacy Policy
          </Link>
          <Link to="/" style={{ color: MUTED, fontSize: "0.85rem", fontFamily: BF, textDecoration: "none" }}>
            Back to Room8
          </Link>
        </div>
      </div>
    </div>
  );
}
