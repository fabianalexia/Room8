// src/pages/OnboardingLifestylePage.jsx  —  Step 3 of 3
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, updateProfile, markProfileComplete } from "../api";
import { StepIndicator } from "./ProfileSetupPage";
import { SectionLabel, OptionCard } from "./OnboardingSchoolPage";

const NAVY = "#0F2D5E";
const BLUE = "#2563EB";
const BORDER = "#E5E7EB";
const SURFACE = "#F8F9FA";
const MUTED = "#6B7280";

const QUESTIONS = [
  {
    key: "sleep_schedule",
    icon: "😴", label: "Sleep Schedule",
    options: [
      { value: "early_bird",  emoji: "🌅", label: "Early Bird",  sub: "Up by 7am" },
      { value: "night_owl",   emoji: "🌙", label: "Night Owl",   sub: "Up past midnight" },
      { value: "flexible",    emoji: "⏰", label: "Flexible",    sub: "Depends on the day" },
    ],
  },
  {
    key: "cleanliness",
    icon: "🧹", label: "Cleanliness",
    options: [
      { value: "very_clean", emoji: "✨", label: "Spotless",    sub: "Clean every day" },
      { value: "clean",      emoji: "🧹", label: "Clean",       sub: "Tidy weekly" },
      { value: "relaxed",    emoji: "😌", label: "Relaxed",     sub: "A little mess is fine" },
      { value: "messy",      emoji: "🤷", label: "Not Fussy",   sub: "Cleaning isn't priority" },
    ],
  },
  {
    key: "study_habits",
    icon: "📚", label: "Study Habits",
    options: [
      { value: "library",   emoji: "📚", label: "Library",     sub: "Out of the room" },
      { value: "in_room",   emoji: "📖", label: "In Room",     sub: "I study at my desk" },
      { value: "anywhere",  emoji: "💻", label: "Anywhere",    sub: "Wherever I land" },
      { value: "rarely",    emoji: "😅", label: "Rarely",      sub: "We're here for fun" },
    ],
  },
  {
    key: "guests",
    icon: "👥", label: "Having Guests Over",
    options: [
      { value: "never",        emoji: "🏠", label: "Never",        sub: "My room is my sanctuary" },
      { value: "occasionally", emoji: "👥", label: "Occasionally",  sub: "Friends sometimes" },
      { value: "often",        emoji: "🎉", label: "Often",        sub: "Love having people over" },
    ],
  },
  {
    key: "noise",
    icon: "🔊", label: "Noise Level",
    options: [
      { value: "silent",   emoji: "🤫", label: "Silent",   sub: "Library quiet please" },
      { value: "quiet",    emoji: "🔇", label: "Quiet",    sub: "Low background noise ok" },
      { value: "moderate", emoji: "🎵", label: "Moderate", sub: "Music & TV are fine" },
      { value: "lively",   emoji: "🎶", label: "Lively",   sub: "Bring the noise" },
    ],
  },
  {
    key: "social",
    icon: "😊", label: "Social Level",
    options: [
      { value: "very_social",  emoji: "🎭", label: "Very Social", sub: "Hangout every day" },
      { value: "social",       emoji: "😊", label: "Social",      sub: "Friendly, like my space" },
      { value: "private",      emoji: "🧘", label: "Private",     sub: "Respect my alone time" },
      { value: "very_private", emoji: "🚪", label: "Solo",        sub: "Keep to myself" },
    ],
  },
  {
    key: "partying",
    icon: "🎉", label: "Partying",
    options: [
      { value: "never",     emoji: "🙅", label: "Not for me", sub: "Party-free zone" },
      { value: "sometimes", emoji: "🎊", label: "Sometimes",  sub: "Weekends maybe" },
      { value: "often",     emoji: "🎉", label: "Often",      sub: "I like to have fun" },
    ],
  },
  {
    key: "smoking",
    icon: "🚬", label: "Smoking",
    options: [
      { value: "no",           emoji: "🚭", label: "Non-smoker",   sub: "No smoking please" },
      { value: "outside_only", emoji: "🌿", label: "Outside only", sub: "Keep it outside" },
      { value: "yes",          emoji: "🚬", label: "Smoker",       sub: "I smoke" },
    ],
  },
];

export default function OnboardingLifestylePage() {
  const navigate = useNavigate();
  const user     = getCurrentUser();

  const [prefs,      setPrefs]      = useState({});
  const [lookingFor, setLookingFor] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [err,        setErr]        = useState("");

  const setVal = (key, val) => setPrefs((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setErr("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("dorm_prefs",  JSON.stringify(prefs));
      fd.append("looking_for", lookingFor);

      const res = await updateProfile(user.id, fd);
      await markProfileComplete(user.id);
      setCurrentUser({ ...user, ...res.user, profile_complete: true });
      navigate("/app", { replace: true });
    } catch {
      setErr("Could not save preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const answeredCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div style={{ minHeight: "100vh", background: SURFACE }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 20px 60px" }}>

        <StepIndicator step={3} />

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.7rem", color: NAVY, marginBottom: 8, letterSpacing: "-0.025em" }}>
            Your Lifestyle
          </h2>
          <p style={{ color: MUTED, margin: 0 }}>
            These preferences help us find you a compatible roommate — not just any roommate.
          </p>
        </div>

        {err && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA",
            borderRadius: 8, padding: "10px 14px",
            color: "#DC2626", fontSize: "0.88rem", marginBottom: 16,
          }}>{err}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {QUESTIONS.map((q) => (
            <div key={q.key}>
              <SectionLabel text={`${q.icon} ${q.label}`} />
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(q.options.length, 4)}, 1fr)`,
                gap: 8,
              }}>
                {q.options.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    opt={opt}
                    selected={prefs[q.key] === opt.value}
                    onClick={() => setVal(q.key, opt.value)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Looking for */}
          <div>
            <SectionLabel text="What are you looking for in a roommate?" />
            <textarea
              rows={3}
              placeholder="Describe your ideal living situation and what matters most to you…"
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              style={{
                width: "100%", padding: "11px 13px",
                border: `1.5px solid ${BORDER}`,
                borderRadius: 8, fontSize: "0.92rem", fontFamily: "inherit",
                resize: "vertical", background: "#fff", boxSizing: "border-box",
                outline: "none", color: "#0A0A0A",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = BLUE)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>

          {/* Progress hint */}
          {answeredCount > 0 && answeredCount < QUESTIONS.length && (
            <p style={{ color: BLUE, fontSize: "0.82rem", textAlign: "center", margin: 0 }}>
              {answeredCount} of {QUESTIONS.length} answered — more answers = better matches
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px",
            background: loading ? "#93A9C9" : NAVY,
            color: "#fff", border: "none",
            borderRadius: 8, fontWeight: 700, fontSize: "0.95rem",
            cursor: loading ? "default" : "pointer",
          }}>
            {loading ? "Saving…" : "Find My Room8"}
          </button>

          <button type="button" onClick={async () => {
            if (user) {
              await markProfileComplete(user.id).catch(() => {});
              setCurrentUser({ ...user, profile_complete: true });
            }
            navigate("/app", { replace: true });
          }}
            style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "0.88rem", textAlign: "center" }}>
            Skip and start swiping
          </button>
        </form>
      </div>
    </div>
  );
}
