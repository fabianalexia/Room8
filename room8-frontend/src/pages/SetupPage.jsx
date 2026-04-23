// src/pages/SetupPage.jsx — unified 4-step profile setup
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, updateProfile, markProfileComplete } from "../api";
import { SCHOOLS } from "../data/schools";

const NAVY   = "#0F2D5E";
const GOLD   = "#F59E0B";
const DARK   = "#050D1F";
const DARKER = "#030914";
const WHITE  = "#FFFFFF";
const MUTED  = "rgba(255,255,255,0.45)";
const BORDER = "rgba(255,255,255,0.1)";
const SURFACE = "rgba(255,255,255,0.05)";
const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

const TOTAL_STEPS = 4;

const CLASS_YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate Student", "Other"];

const HOUSING_OPTIONS = [
  { value: "on_campus",  emoji: "🏫", label: "On Campus",  sub: "Dorms & residence halls" },
  { value: "off_campus", emoji: "🏠", label: "Off Campus", sub: "Apartments & houses" },
  { value: "either",     emoji: "✓",  label: "Either",     sub: "Open to both" },
];

const ROOM_OPTIONS = [
  { value: "double",    emoji: "🛏️", label: "Double",    sub: "Shared room" },
  { value: "single",    emoji: "👤", label: "Single",    sub: "Private room" },
  { value: "suite",     emoji: "🏠", label: "Suite",     sub: "Suite-style" },
  { value: "apartment", emoji: "🏙️", label: "Apartment", sub: "Apt-style" },
  { value: "any",       emoji: "✓",  label: "Any",       sub: "No preference" },
];

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        {["Basic Info", "Housing", "About You", "Photo"].map((label, i) => {
          const n = i + 1;
          const done    = n < step;
          const current = n === step;
          return (
            <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done ? GOLD : current ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.07)",
                border: current ? `2px solid ${GOLD}` : done ? `2px solid ${GOLD}` : `2px solid rgba(255,255,255,0.12)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.72rem", fontWeight: 700,
                color: done ? DARK : current ? GOLD : MUTED,
                transition: "all 0.3s",
              }}>
                {done ? "✓" : n}
              </div>
              <span style={{
                fontSize: "0.65rem", fontWeight: current ? 700 : 400,
                color: current ? GOLD : done ? "rgba(245,158,11,0.6)" : MUTED,
                fontFamily: BF, letterSpacing: 0.3,
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Track */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%`,
          background: `linear-gradient(90deg, ${GOLD}, rgba(245,158,11,0.6))`,
          borderRadius: 2, transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}

// ── Reusable option card ──────────────────────────────────────────────────────
function OptionCard({ opt, selected, onClick, compact }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: compact ? "10px 6px" : "14px 8px",
      borderRadius: 10,
      border: `1.5px solid ${selected ? GOLD : BORDER}`,
      background: selected ? "rgba(245,158,11,0.1)" : SURFACE,
      cursor: "pointer", gap: 4,
      transition: "all 0.15s",
    }}>
      <span style={{ fontSize: compact ? "1.1rem" : "1.4rem" }}>{opt.emoji}</span>
      <span style={{
        fontSize: compact ? "0.68rem" : "0.78rem", fontWeight: 700,
        color: selected ? GOLD : WHITE, textAlign: "center", fontFamily: BF,
      }}>
        {opt.label}
      </span>
      {!compact && opt.sub && (
        <span style={{ fontSize: "0.65rem", color: MUTED, textAlign: "center", fontFamily: BF }}>{opt.sub}</span>
      )}
    </button>
  );
}

// ── Step 1: Basic Info ────────────────────────────────────────────────────────
function Step1({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <StepHeading
        title="Tell us about yourself"
        sub="Help future roommates get to know you."
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="First name">
          <Input name="first_name" value={data.first_name} onChange={update} placeholder="Emma" />
        </Field>
        <Field label="Last name">
          <Input name="last_name" value={data.last_name} onChange={update} placeholder="Chen" />
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Age">
          <Input type="number" name="age" value={data.age} onChange={update} placeholder="20" min="16" max="35" />
        </Field>
        <Field label="Year in school">
          <select
            name="class_year" value={data.class_year} onChange={update}
            style={inputStyle}
          >
            <option value="">Select…</option>
            {CLASS_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Major / Field of study">
        <Input name="major" value={data.major} onChange={update} placeholder="e.g. Computer Science, Nursing, Business" />
      </Field>
    </div>
  );
}

// ── Step 2: Housing Prefs ─────────────────────────────────────────────────────
function Step2({ data, update, setData }) {
  const [schoolInput, setSchoolInput] = useState(data.school || "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = schoolInput.length > 1
    ? SCHOOLS.filter((s) => s.toLowerCase().includes(schoolInput.toLowerCase())).slice(0, 8)
    : [];

  const selectSchool = (s) => {
    setSchoolInput(s);
    setData((prev) => ({ ...prev, school: s }));
    setShowSuggestions(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <StepHeading
        title="School & housing"
        sub="Connect with students at your campus."
      />

      {/* School search */}
      <Field label="Your college or university" required>
        <div style={{ position: "relative" }}>
          <Input
            value={schoolInput}
            onChange={(e) => {
              setSchoolInput(e.target.value);
              setData((prev) => ({ ...prev, school: "" }));
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search for your school…"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
              background: "#0E1F3D", border: `1px solid rgba(245,158,11,0.2)`,
              borderRadius: 10, boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              listStyle: "none", margin: 0, padding: "4px 0",
              maxHeight: 220, overflowY: "auto",
            }}>
              {suggestions.map((s) => (
                <li key={s} onMouseDown={() => selectSchool(s)} style={{
                  padding: "10px 16px", cursor: "pointer",
                  fontSize: "0.9rem", color: WHITE, fontFamily: BF,
                  transition: "background 0.1s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        {data.school && (
          <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "#86efac", fontFamily: BF }}>
            ✓ {data.school}
          </p>
        )}
      </Field>

      {/* Housing type */}
      <Field label="Where are you looking to live?">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {HOUSING_OPTIONS.map((opt) => (
            <OptionCard key={opt.value} opt={opt}
              selected={data.housing_type === opt.value}
              onClick={() => setData((prev) => ({ ...prev, housing_type: opt.value }))}
            />
          ))}
        </div>
      </Field>

      {/* Room type */}
      <Field label="Room type preference?">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {ROOM_OPTIONS.map((opt) => (
            <OptionCard key={opt.value} opt={opt} compact
              selected={data.room_type === opt.value}
              onClick={() => setData((prev) => ({ ...prev, room_type: opt.value }))}
            />
          ))}
        </div>
      </Field>

      {/* Budget */}
      <Field label={<>Monthly budget <span style={{ color: MUTED, fontWeight: 400 }}>(optional)</span></>}>
        <Input name="budget" value={data.budget} onChange={update} placeholder="e.g. $900/mo" />
      </Field>
    </div>
  );
}

// ── Step 3: Bio ───────────────────────────────────────────────────────────────
function Step3({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <StepHeading
        title="About you"
        sub="Let potential roommates know your vibe."
      />
      <Field label="Bio">
        <textarea
          name="bio" value={data.bio} onChange={update} rows={4}
          placeholder="Describe your lifestyle — sleep schedule, hobbies, what you're like to live with…"
          style={{ ...inputStyle, resize: "vertical" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = BORDER)}
        />
      </Field>
      <Field label="What are you looking for in a roommate?">
        <textarea
          name="looking_for" value={data.looking_for} onChange={update} rows={3}
          placeholder="Describe your ideal living situation and what matters most to you…"
          style={{ ...inputStyle, resize: "vertical" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = BORDER)}
        />
      </Field>
    </div>
  );
}

// ── Step 4: Photo ─────────────────────────────────────────────────────────────
function Step4({ data, setData }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setData((prev) => ({
      ...prev,
      photoFile: file,
      photoPreview: URL.createObjectURL(file),
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
      <StepHeading
        title="Add a profile photo"
        sub="Profiles with photos get 3× more connections."
        center
      />

      {/* Avatar preview */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          width: 140, height: 140, borderRadius: "50%", cursor: "pointer",
          background: data.photoPreview
            ? `url(${data.photoPreview}) center/cover`
            : "rgba(15,45,94,0.6)",
          border: data.photoPreview
            ? `3px solid ${GOLD}`
            : `2px dashed rgba(245,158,11,0.4)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "opacity 0.2s",
          boxShadow: data.photoPreview ? `0 0 28px rgba(245,158,11,0.25)` : "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {!data.photoPreview && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 4 }}>📷</div>
            <div style={{ fontSize: "0.72rem", color: MUTED, fontFamily: BF }}>Tap to upload</div>
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

      <button type="button" onClick={() => fileRef.current?.click()} style={{
        background: "none", border: `1px solid rgba(245,158,11,0.3)`,
        color: GOLD, padding: "9px 22px", borderRadius: 8,
        fontWeight: 600, fontSize: "0.88rem", cursor: "pointer", fontFamily: BF,
        transition: "all 0.15s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        {data.photoPreview ? "Change photo" : "Choose photo"}
      </button>

      <p style={{ color: MUTED, fontSize: "0.8rem", fontFamily: BF, margin: 0 }}>
        You can always update this later in your profile.
      </p>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function StepHeading({ title, sub, center }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: 4 }}>
      <h2 style={{
        fontFamily: HF, fontWeight: 800, fontSize: "1.45rem",
        color: WHITE, margin: "0 0 6px", letterSpacing: "-0.02em",
      }}>
        {title}
      </h2>
      <p style={{ color: MUTED, margin: 0, fontSize: "0.88rem", fontFamily: BF }}>{sub}</p>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div>
      <label style={{
        display: "block", marginBottom: 7,
        fontSize: "0.78rem", fontWeight: 600,
        color: "rgba(255,255,255,0.55)", fontFamily: BF, letterSpacing: "0.04em",
      }}>
        {label}
        {required && <span style={{ color: GOLD, marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ onChange, ...props }) {
  return (
    <input
      {...props}
      onChange={onChange}
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
      onBlur={(e) => (e.target.style.borderColor = BORDER)}
    />
  );
}

const inputStyle = {
  width: "100%", padding: "11px 14px",
  border: `1.5px solid ${BORDER}`,
  borderRadius: 10, fontSize: "0.92rem", outline: "none",
  fontFamily: BF, background: "rgba(255,255,255,0.05)",
  boxSizing: "border-box", transition: "border-color 0.2s",
  color: WHITE,
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SetupPage() {
  const navigate = useNavigate();
  const user     = getCurrentUser();

  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    first_name:   user?.first_name || "",
    last_name:    user?.last_name  || "",
    age:          "",
    class_year:   "",
    major:        "",
    school:       "",
    housing_type: "",
    room_type:    "",
    budget:       "",
    bio:          "",
    looking_for:  "",
    photoFile:    null,
    photoPreview: null,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const update = (e) => setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const next = () => { setErr(""); setStep((s) => Math.min(s + 1, TOTAL_STEPS)); };
  const back = () => { setErr(""); setStep((s) => Math.max(s - 1, 1)); };

  const handleFinish = async () => {
    if (!user) { navigate("/login"); return; }
    setErr("");
    setLoading(true);
    try {
      const fd = new FormData();
      const fields = ["first_name", "last_name", "age", "class_year", "major",
                      "school", "housing_type", "room_type", "budget", "bio", "looking_for"];
      fields.forEach((f) => { if (data[f]) fd.append(f, data[f]); });
      if (data.photoFile) fd.append("photo", data.photoFile);

      const res = await updateProfile(user.id, fd);
      await markProfileComplete(user.id);
      setCurrentUser({ ...user, ...res.user, profile_complete: true });
      navigate("/app", { replace: true });
    } catch (e) {
      setErr(e?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      await markProfileComplete(user.id);
      setCurrentUser({ ...user, profile_complete: true });
    } catch { /* best-effort */ }
    navigate("/app", { replace: true });
  };

  const stepComponent = [
    <Step1 key={1} data={data} update={update} />,
    <Step2 key={2} data={data} update={update} setData={setData} />,
    <Step3 key={3} data={data} update={update} />,
    <Step4 key={4} data={data} setData={setData} />,
  ][step - 1];

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${DARKER} 0%, #071020 55%, ${NAVY} 100%)`,
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "48px 20px 60px",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)",
        top: "40%", left: "50%", transform: "translate(-50%,-50%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%", maxWidth: 520, position: "relative",
      }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-block",
            fontFamily: HF, fontWeight: 800, fontSize: "1.3rem",
            color: WHITE, letterSpacing: "-0.02em",
          }}>
            room<span style={{ color: GOLD }}>8</span>
          </div>
          <p style={{ color: MUTED, fontSize: "0.8rem", marginTop: 4, fontFamily: BF }}>
            Let's set up your profile
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 20,
          padding: "36px 36px 32px",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        }}>
          <ProgressBar step={step} />

          {/* Step content */}
          {stepComponent}

          {/* Error */}
          {err && (
            <div style={{
              marginTop: 16,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "10px 14px",
              color: "#F87171", fontSize: "0.85rem", fontFamily: BF,
            }}>
              {err}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {step > 1 && (
              <button type="button" onClick={back} style={{
                flex: "0 0 auto", padding: "13px 20px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: MUTED,
                fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                fontFamily: BF, transition: "all 0.15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                ← Back
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button type="button" onClick={next} style={{
                flex: 1, padding: "13px",
                background: GOLD, color: DARK,
                border: "none", borderRadius: 10,
                fontWeight: 800, fontSize: "0.95rem", cursor: "pointer",
                fontFamily: HF, boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
                transition: "all 0.15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                Continue →
              </button>
            ) : (
              <button type="button" onClick={handleFinish} disabled={loading} style={{
                flex: 1, padding: "13px",
                background: loading ? "rgba(245,158,11,0.5)" : GOLD,
                color: loading ? "rgba(5,13,31,0.5)" : DARK,
                border: "none", borderRadius: 10,
                fontWeight: 800, fontSize: "0.95rem",
                cursor: loading ? "default" : "pointer",
                fontFamily: HF,
                boxShadow: loading ? "none" : "0 4px 20px rgba(245,158,11,0.35)",
                transition: "all 0.15s",
              }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
              >
                {loading ? "Saving…" : "Find My Room8 →"}
              </button>
            )}
          </div>

          {/* Skip */}
          <button type="button" onClick={handleSkip} style={{
            display: "block", width: "100%", marginTop: 14,
            background: "none", border: "none",
            color: MUTED, fontSize: "0.82rem", cursor: "pointer",
            fontFamily: BF, textAlign: "center",
          }}>
            Skip setup, I'll do this later
          </button>
        </div>

        <p style={{
          textAlign: "center", marginTop: 20,
          fontSize: "0.72rem", color: "rgba(255,255,255,0.18)", fontFamily: BF,
        }}>
          Step {step} of {TOTAL_STEPS} — you can update everything from your profile
        </p>
      </div>
    </div>
  );
}
