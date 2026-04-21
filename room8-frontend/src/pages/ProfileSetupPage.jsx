// src/pages/ProfileSetupPage.jsx  —  Step 1 of 3
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, updateProfile } from "../api";

const NAVY = "#0F2D5E";
const BLUE = "#2563EB";
const BORDER = "#E5E7EB";
const SURFACE = "#F8F9FA";
const MUTED = "#6B7280";
const TEXT = "#0A0A0A";

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate Student", "Other"];

export default function ProfileSetupPage() {
  const navigate   = useNavigate();
  const user       = getCurrentUser();
  const fileRef    = useRef(null);

  const [form, setForm] = useState({ bio: "", age: "", class_year: "", major: "" });
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setErr("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("bio",        form.bio);
      fd.append("age",        form.age);
      fd.append("class_year", form.class_year);
      fd.append("major",      form.major);
      if (photoFile) fd.append("photo", photoFile);

      const res     = await updateProfile(user.id, fd);
      setCurrentUser({ ...user, ...res.user });
      navigate("/onboarding/school", { replace: true });
    } catch {
      setErr("Could not save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: SURFACE }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 20px" }}>

        {/* Step indicator */}
        <StepIndicator step={1} />

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{
            fontWeight: 800, fontSize: "1.7rem",
            color: NAVY, marginBottom: 8, letterSpacing: "-0.025em",
          }}>
            Your Profile
          </h2>
          <p style={{ color: MUTED, margin: 0 }}>Help future roommates get to know you.</p>
        </div>

        {/* Photo upload */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: 100, height: 100, borderRadius: "50%",
              background: photoPreview ? `url(${photoPreview}) center/cover` : "#EFF6FF",
              border: `2px dashed ${photoPreview ? "transparent" : "#BFDBFE"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {!photoPreview && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 4 }}>📷</div>
              </div>
            )}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
            style={{ marginTop: 10, background: "none", border: "none", color: BLUE, fontWeight: 600, fontSize: "0.88rem", cursor: "pointer" }}>
            {photoPreview ? "Change Photo" : "Add Profile Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
        </div>

        {err && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA",
            borderRadius: 8, padding: "10px 14px",
            color: "#DC2626", fontSize: "0.88rem", marginBottom: 16,
          }}>{err}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <label style={labelStyle}>About Me</label>
            <textarea
              name="bio" rows={3}
              placeholder="Describe your vibe — sleep schedule, hobbies, what you're like to live with…"
              value={form.bio} onChange={update}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) => (e.target.style.borderColor = BLUE)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Age</label>
              <input type="number" name="age" min="16" max="35" placeholder="20" value={form.age} onChange={update} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = BLUE)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
            </div>
            <div>
              <label style={labelStyle}>Year in School</label>
              <select name="class_year" value={form.class_year} onChange={update} style={inputStyle}>
                <option value="">Select…</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Major / Field of Study</label>
            <input type="text" name="major" placeholder="e.g. Computer Science, Nursing, Business" value={form.major} onChange={update} style={inputStyle}
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
            marginTop: 4,
          }}>
            {loading ? "Saving…" : "Continue"}
          </button>

          <button type="button" onClick={() => navigate("/onboarding/school")}
            style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "0.88rem", textAlign: "center" }}>
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}

export function StepIndicator({ step, total = 3 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <React.Fragment key={n}>
          <div style={{
            width: n === step ? 28 : 10, height: 8, borderRadius: 4,
            background: n <= step ? NAVY : "#E5E7EB",
            transition: "all 0.3s",
          }} />
        </React.Fragment>
      ))}
      <span style={{ marginLeft: 8, color: MUTED, fontSize: "0.8rem", fontWeight: 500 }}>
        {step} of {total}
      </span>
    </div>
  );
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
