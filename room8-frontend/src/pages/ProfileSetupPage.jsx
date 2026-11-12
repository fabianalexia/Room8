// src/pages/ProfileSetupPage.jsx: onboarding step 1 of 3
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCurrentUser, setCurrentUser, updateProfile } from "../api";
import OnboardShell from "../components/OnboardShell";
import Icon from "../ui/Icon";
import { Field } from "../ui/kit";

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
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, []); // eslint-disable-line

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
      setErr("Couldn't save that. Try again in a sec.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardShell step={1} title="Your profile" sub="Help future roommates get to know you." onSkip={() => navigate("/onboarding/school")} error={err}
      cta={<button type="submit" form="r8-ps" className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={loading}>{loading ? "Saving..." : "Continue"}{!loading && <Icon name="arrowRight" size={20} />}</button>}>
      <form id="r8-ps" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => fileRef.current?.click()} aria-label="Add a profile photo"
            style={{ width: 132, height: 132, borderRadius: "50%", overflow: "hidden", position: "relative", background: "var(--glass)", border: photoPreview ? "3px solid transparent" : "2px dashed var(--line-2)", boxShadow: photoPreview ? "var(--glow)" : "none" }}>
            {photoPreview ? <img src={photoPreview} alt="Your photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text-2)" }}>
                  <span style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--iri)", color: "#0E0F12", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="camera" size={22} /></span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Add photo</span>
                </span>}
          </motion.button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
        </div>
        <Field label="About me" htmlFor="ps-bio"><textarea id="ps-bio" className="r8-textarea" name="bio" rows={3} value={form.bio} onChange={update} placeholder="your vibe, your hobbies, what you're like to live with." /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
          <Field label="Age" htmlFor="ps-age"><input id="ps-age" className="r8-input" type="number" name="age" min="16" max="35" placeholder="20" value={form.age} onChange={update} inputMode="numeric" /></Field>
          <Field label="Year" htmlFor="ps-year">
            <select id="ps-year" className="r8-select" name="class_year" value={form.class_year} onChange={update}>
              <option value="">Select</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Major" htmlFor="ps-major"><input id="ps-major" className="r8-input" name="major" placeholder="Computer science, nursing, business..." value={form.major} onChange={update} /></Field>
      </form>
    </OnboardShell>
  );
}

// Kept for older imports
export function StepIndicator() { return null; }
