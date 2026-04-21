// src/pages/OnboardingSchoolPage.jsx  —  Step 2 of 3
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, updateProfile } from "../api";
import { SCHOOLS } from "../data/schools";
import { StepIndicator } from "./ProfileSetupPage";

const NAVY = "#0F2D5E";
const BLUE = "#2563EB";
const BORDER = "#E5E7EB";
const SURFACE = "#F8F9FA";
const MUTED = "#6B7280";
const TEXT = "#0A0A0A";

const HOUSING_OPTIONS = [
  { value: "on_campus",  emoji: "🏫", label: "On Campus",  sub: "Dorms & residence halls" },
  { value: "off_campus", emoji: "🏠", label: "Off Campus", sub: "Apartments & houses" },
  { value: "either",     emoji: "✓",  label: "Either",     sub: "Open to both" },
];

const ROOM_OPTIONS = [
  { value: "double",    emoji: "🛏️", label: "Double",    sub: "Shared room" },
  { value: "single",    emoji: "👤", label: "Single",    sub: "Private room" },
  { value: "suite",     emoji: "🏠", label: "Suite",     sub: "Shared suite" },
  { value: "apartment", emoji: "🏙️", label: "Apartment", sub: "Apt-style" },
  { value: "any",       emoji: "✓",  label: "Any",       sub: "No preference" },
];

export default function OnboardingSchoolPage() {
  const navigate = useNavigate();
  const user     = getCurrentUser();

  const [school,      setSchool]      = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [housing,     setHousing]     = useState("");
  const [roomType,    setRoomType]    = useState("");
  const [budget,      setBudget]      = useState("");
  const [loading,     setLoading]     = useState(false);
  const [err,         setErr]         = useState("");

  const schoolSuggestions = schoolInput.length > 1
    ? SCHOOLS.filter((s) => s.toLowerCase().includes(schoolInput.toLowerCase())).slice(0, 8)
    : [];

  const selectSchool = (s) => { setSchool(s); setSchoolInput(s); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setErr("");
    setLoading(true);
    try {
      const res = await updateProfile(user.id, buildFormData({
        school: school || schoolInput,
        housing_type: housing,
        room_type: roomType,
        budget,
      }));
      setCurrentUser({ ...user, ...res.user });
      navigate("/onboarding/lifestyle", { replace: true });
    } catch {
      setErr("Could not save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: SURFACE }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px" }}>

        <StepIndicator step={2} />

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.7rem", color: NAVY, marginBottom: 8, letterSpacing: "-0.025em" }}>
            School & Housing
          </h2>
          <p style={{ color: MUTED, margin: 0 }}>Connect with students at your college.</p>
        </div>

        {err && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA",
            borderRadius: 8, padding: "10px 14px",
            color: "#DC2626", fontSize: "0.88rem", marginBottom: 16,
          }}>{err}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* School search */}
          <div>
            <SectionLabel text="Your College or University" required />
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search for your school…"
                value={schoolInput}
                onChange={(e) => { setSchoolInput(e.target.value); setSchool(""); }}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = BLUE)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
                required
              />
              {schoolSuggestions.length > 0 && (
                <ul style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                  background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)", margin: "4px 0 0", padding: 0,
                  listStyle: "none", maxHeight: 240, overflowY: "auto",
                }}>
                  {schoolSuggestions.map((s) => (
                    <li key={s} onClick={() => selectSchool(s)} style={{
                      padding: "11px 14px", cursor: "pointer", fontSize: "0.92rem",
                      borderBottom: `1px solid ${BORDER}`, color: TEXT,
                      transition: "background 0.1s",
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = SURFACE)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {school && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#15803d", fontSize: "0.85rem" }}>✓</span>
                <span style={{ color: "#15803d", fontWeight: 600, fontSize: "0.85rem" }}>{school}</span>
              </div>
            )}
          </div>

          {/* Housing type */}
          <div>
            <SectionLabel text="Where are you looking to live?" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {HOUSING_OPTIONS.map((opt) => (
                <OptionCard key={opt.value} opt={opt} selected={housing === opt.value} onClick={() => setHousing(opt.value)} />
              ))}
            </div>
          </div>

          {/* Room type */}
          <div>
            <SectionLabel text="Room type preference?" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {ROOM_OPTIONS.map((opt) => (
                <OptionCard key={opt.value} opt={opt} selected={roomType === opt.value} onClick={() => setRoomType(opt.value)} compact />
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label style={labelStyle}>
              Monthly Housing Budget <span style={{ color: MUTED, fontWeight: 400 }}>(optional)</span>
            </label>
            <input type="text" placeholder="e.g. $900/mo" value={budget}
              onChange={(e) => setBudget(e.target.value)} style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = BLUE)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px",
            background: loading ? "#93A9C9" : NAVY,
            color: "#fff", border: "none",
            borderRadius: 8, fontWeight: 700, fontSize: "0.95rem",
            cursor: loading ? "default" : "pointer",
          }}>
            {loading ? "Saving…" : "Continue"}
          </button>

          <button type="button" onClick={() => navigate("/onboarding/lifestyle")}
            style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "0.88rem", textAlign: "center" }}>
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

export function SectionLabel({ text, required }) {
  return (
    <p style={{ fontWeight: 700, color: TEXT, marginBottom: 10, fontSize: "0.88rem", margin: "0 0 10px" }}>
      {text}{required && <span style={{ color: "#EF4444", marginLeft: 4 }}>*</span>}
    </p>
  );
}

export function OptionCard({ opt, selected, onClick, compact }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: compact ? "10px 4px" : "14px 8px",
      borderRadius: 10,
      border: `1.5px solid ${selected ? BLUE : BORDER}`,
      background: selected ? "#EFF6FF" : "#fff",
      cursor: "pointer", gap: 4,
      transition: "all 0.15s",
    }}>
      <span style={{ fontSize: compact ? "1.1rem" : "1.5rem" }}>{opt.emoji}</span>
      <span style={{ fontSize: compact ? "0.7rem" : "0.8rem", fontWeight: 700, color: selected ? NAVY : TEXT, textAlign: "center" }}>
        {opt.label}
      </span>
      {!compact && opt.sub && (
        <span style={{ fontSize: "0.68rem", color: MUTED, textAlign: "center" }}>{opt.sub}</span>
      )}
    </button>
  );
}

function buildFormData(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null) fd.append(k, v);
  }
  return fd;
}

const labelStyle = {
  display: "block", marginBottom: 6,
  fontSize: "0.83rem", fontWeight: 600, color: "#374151",
};

const inputStyle = {
  width: "100%", padding: "11px 13px",
  border: `1.5px solid #E5E7EB`, borderRadius: 8,
  fontSize: "0.92rem", outline: "none",
  fontFamily: "inherit", background: "#fff",
  boxSizing: "border-box", transition: "border-color 0.2s",
  color: "#0A0A0A",
};
