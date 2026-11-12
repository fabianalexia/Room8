// src/pages/SetupPage.jsx: 5-step profile setup with smooth step transitions
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, setCurrentUser, updateProfile, markProfileComplete } from "../api";
import { SCHOOLS } from "../data/schools";
import Icon from "../ui/Icon";
import { Mark } from "../ui/Logo";
import { OptionTile, Field } from "../ui/kit";

const TOTAL_STEPS = 5;
const STEP_LABELS = ["Basics", "School", "About you", "Lifestyle", "Photo"];
const CLASS_YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate Student", "Other"];

const HOUSING_OPTIONS = [
  { value: "on_campus", icon: "school", label: "On campus", sub: "Dorms and residence halls" },
  { value: "off_campus", icon: "home", label: "Off campus", sub: "Apartments and houses" },
  { value: "either", icon: "compass", label: "Either", sub: "Open to both" },
];
const ROOM_OPTIONS = [
  { value: "double", icon: "users", label: "Double", sub: "Shared room" },
  { value: "single", icon: "user", label: "Single", sub: "Private room" },
  { value: "suite", icon: "door", label: "Suite", sub: "Suite style" },
  { value: "apartment", icon: "home", label: "Apartment", sub: "Apartment style" },
  { value: "any", icon: "sparkle", label: "Any", sub: "No preference" },
];

export const LIFESTYLE_QUESTIONS = [
  { key: "sleep_schedule", icon: "moon", label: "When do you sleep?", options: [
    { value: "early_bird", icon: "sun", label: "Early bird", sub: "Up by 7am" },
    { value: "night_owl", icon: "moon", label: "Night owl", sub: "Up past midnight" },
    { value: "flexible", icon: "clock", label: "Flexible", sub: "Depends on the day" } ] },
  { key: "cleanliness", icon: "sparkle", label: "How clean are you?", options: [
    { value: "very_clean", icon: "sparkle", label: "Spotless", sub: "Clean every day" },
    { value: "clean", icon: "sparkle", label: "Tidy", sub: "Clean weekly" },
    { value: "relaxed", icon: "broom", label: "Relaxed", sub: "A little mess is fine" },
    { value: "messy", icon: "broom", label: "Not fussy", sub: "Cleaning isn't a priority" } ] },
  { key: "study_habits", icon: "book", label: "Where do you study?", options: [
    { value: "library", icon: "book", label: "Library", sub: "Out of the room" },
    { value: "in_room", icon: "book", label: "In my room", sub: "At my desk" },
    { value: "anywhere", icon: "compass", label: "Anywhere", sub: "Wherever I land" },
    { value: "rarely", icon: "party", label: "Rarely", sub: "We're here for fun" } ] },
  { key: "guests", icon: "door", label: "Guests over?", options: [
    { value: "never", icon: "door", label: "Never", sub: "My room is my sanctuary" },
    { value: "occasionally", icon: "users", label: "Sometimes", sub: "Friends now and then" },
    { value: "often", icon: "party", label: "Often", sub: "Love having people over" } ] },
  { key: "noise", icon: "volume", label: "Noise level", options: [
    { value: "silent", icon: "quiet", label: "Silent", sub: "Library quiet" },
    { value: "quiet", icon: "quiet", label: "Quiet", sub: "Low background is ok" },
    { value: "moderate", icon: "music", label: "Moderate", sub: "Music and TV are fine" },
    { value: "lively", icon: "volume", label: "Lively", sub: "Bring the noise" } ] },
  { key: "social", icon: "users", label: "Social vibe", options: [
    { value: "very_social", icon: "party", label: "Very social", sub: "Hang out every day" },
    { value: "social", icon: "users", label: "Social", sub: "Friendly, like my space" },
    { value: "private", icon: "coffee", label: "Private", sub: "Respect my alone time" },
    { value: "very_private", icon: "door", label: "Solo", sub: "Keep to myself" } ] },
  { key: "partying", icon: "party", label: "Partying", options: [
    { value: "never", icon: "coffee", label: "Not for me", sub: "Party-free zone" },
    { value: "sometimes", icon: "party", label: "Sometimes", sub: "Weekends maybe" },
    { value: "often", icon: "party", label: "Often", sub: "I like to have fun" } ] },
  { key: "smoking", icon: "leaf", label: "Smoking", options: [
    { value: "no", icon: "leaf", label: "Smoke-free", sub: "No smoking please" },
    { value: "outside_only", icon: "smoke", label: "Outside only", sub: "Keep it outside" },
    { value: "yes", icon: "smoke", label: "Smoker", sub: "I smoke" } ] },
];

function Heading({ title, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h1 style={{ fontSize: "clamp(30px, 8vw, 38px)", marginBottom: 8 }}>{title}</h1>
      <p className="r8-muted" style={{ fontSize: 16 }}>{sub}</p>
    </div>
  );
}

function Step1({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Heading title="First, the basics" sub="So future roommates know who they're talking to." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <Field label="First name" htmlFor="s-first"><input id="s-first" className="r8-input" name="first_name" value={data.first_name} onChange={update} placeholder="Emma" autoComplete="given-name" /></Field>
        <Field label="Last name" htmlFor="s-last"><input id="s-last" className="r8-input" name="last_name" value={data.last_name} onChange={update} placeholder="Chen" autoComplete="family-name" /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
        <Field label="Age" htmlFor="s-age"><input id="s-age" className="r8-input" type="number" name="age" value={data.age} onChange={update} placeholder="20" min="16" max="35" inputMode="numeric" /></Field>
        <Field label="Year" htmlFor="s-year">
          <select id="s-year" className="r8-select" name="class_year" value={data.class_year} onChange={update}>
            <option value="">Select</option>
            {CLASS_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Major" htmlFor="s-major"><input id="s-major" className="r8-input" name="major" value={data.major} onChange={update} placeholder="Computer science, nursing, business..." /></Field>
    </div>
  );
}

export function SchoolPicker({ value, onChange }) {
  const [q, setQ] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const suggestions = q.length > 1 ? SCHOOLS.filter((s) => s.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];
  if (custom) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input className="r8-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Type your school's full name" autoFocus aria-label="School name" />
        <button type="button" className="r8-btn r8-btn--ghost r8-btn--sm" style={{ alignSelf: "flex-start", padding: 0 }} onClick={() => { setCustom(false); onChange(""); }}><Icon name="back" size={16} />Back to the list</button>
      </div>
    );
  }
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Icon name="school" size={19} color="var(--text-3)" style={{ position: "absolute", left: 16, top: 16 }} />
        <input className="r8-input" value={q} style={{ paddingLeft: 46 }} aria-label="Search for your school" autoComplete="off"
          onChange={(e) => { setQ(e.target.value); onChange(""); setOpen(true); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder="Search for your school" />
      </div>
      <AnimatePresence>
        {open && q.length > 1 && (
          <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="r8-card" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50, listStyle: "none", margin: 0, padding: 6, maxHeight: 260, overflowY: "auto", borderRadius: 18, boxShadow: "var(--shadow-2)" }}>
            {suggestions.map((s) => (
              <li key={s} onMouseDown={() => { setQ(s); onChange(s); setOpen(false); }} style={{ padding: "12px 12px", borderRadius: 12, cursor: "pointer", fontSize: 15 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--glass-2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>{s}</li>
            ))}
            <li onMouseDown={() => { setCustom(true); onChange(""); setOpen(false); }} style={{ padding: "12px 12px", borderRadius: 12, cursor: "pointer", fontSize: 15, color: "var(--text)", textDecoration: "underline", fontWeight: 600 }}>My school isn't listed</li>
          </motion.ul>
        )}
      </AnimatePresence>
      {value && <p style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 14, color: "var(--success)" }}><Icon name="check" size={16} stroke={2.4} />{value}</p>}
    </div>
  );
}

function Step2({ data, update, setData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <Heading title="Your school" sub="You'll only match with students from your campus." />
      <Field label="College or university"><SchoolPicker value={data.school} onChange={(s) => setData((p) => ({ ...p, school: s }))} /></Field>
      <Field label="Where do you want to live?">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {HOUSING_OPTIONS.map((o) => <OptionTile key={o.value} {...o} selected={data.housing_type === o.value} onClick={() => setData((p) => ({ ...p, housing_type: o.value }))} />)}
        </div>
      </Field>
      <Field label="Room type">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 8 }}>
          {ROOM_OPTIONS.map((o) => <OptionTile key={o.value} {...o} selected={data.room_type === o.value} onClick={() => setData((p) => ({ ...p, room_type: o.value }))} />)}
        </div>
      </Field>
      <Field label="Monthly budget (optional)" htmlFor="s-budget"><input id="s-budget" className="r8-input" name="budget" value={data.budget} onChange={update} placeholder="e.g. $900/mo" /></Field>
    </div>
  );
}

function Step3({ data, update }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Heading title="Your vibe" sub="A couple lines go a long way. Be yourself." />
      <Field label="Bio" htmlFor="s-bio" help={`${(data.bio || "").length}/300`}>
        <textarea id="s-bio" className="r8-textarea" name="bio" value={data.bio} onChange={update} rows={4} maxLength={300} placeholder="cs major, gym in the morning, will absolutely make you pasta at 1am." />
      </Field>
      <Field label="What you're looking for in a roommate" htmlFor="s-look">
        <textarea id="s-look" className="r8-textarea" name="looking_for" value={data.looking_for} onChange={update} rows={3} placeholder="someone tidy who's down for a movie night but respects quiet hours." />
      </Field>
    </div>
  );
}

export function LifestyleQuestions({ prefs, setPref }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {LIFESTYLE_QUESTIONS.map((q) => (
        <div key={q.key}>
          <p style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 16, marginBottom: 10 }}><Icon name={q.icon} size={18} />{q.label}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
            {q.options.map((o) => <OptionTile key={o.value} {...o} selected={prefs[q.key] === o.value} onClick={() => setPref(q.key, o.value)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Step4({ data, setData }) {
  const prefs = data.dorm_prefs || {};
  const answered = Object.values(prefs).filter(Boolean).length;
  return (
    <div>
      <Heading title="How you live" sub="This is how we find people you'd actually get along with." />
      <div className="r8-badge r8-badge--iri" style={{ marginBottom: 20 }}>{answered} of {LIFESTYLE_QUESTIONS.length} answered</div>
      <LifestyleQuestions prefs={prefs} setPref={(k, v) => setData((p) => ({ ...p, dorm_prefs: { ...p.dorm_prefs, [k]: v } }))} />
    </div>
  );
}

function Step5({ data, setData }) {
  const fileRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setData((prev) => {
      if (prev.photoPreview) URL.revokeObjectURL(prev.photoPreview);
      return { ...prev, photoFile: file, photoPreview: URL.createObjectURL(file) };
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <Heading title="Show your face" sub="Profiles with a real photo get way more matches." />
      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => fileRef.current?.click()} aria-label="Choose a profile photo"
        style={{ width: 220, aspectRatio: "3 / 4", borderRadius: 32, overflow: "hidden", position: "relative", background: data.photoPreview ? "var(--elev)" : "var(--glass)", border: data.photoPreview ? "3px solid transparent" : "2px dashed var(--line-2)", boxShadow: data.photoPreview ? "var(--shadow-2)" : "none" }}>
        {data.photoPreview ? (
          <img src={data.photoPreview} alt="Your photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-2)" }}>
            <span style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--iri)", color: "#0E0F12", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--glow)" }}><Icon name="camera" size={28} stroke={2} /></span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Tap to add a photo</span>
          </span>
        )}
      </motion.button>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {data.photoPreview && <button type="button" className="r8-btn r8-btn--glass r8-btn--sm" style={{ marginTop: 16 }} onClick={() => fileRef.current?.click()}><Icon name="refresh" size={16} />Change photo</button>}
      <p className="r8-faint" style={{ fontSize: 13.5, marginTop: 16 }}>You can add more photos from your profile anytime.</p>
    </div>
  );
}

export default function SetupPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState({
    first_name: user?.first_name || "", last_name: user?.last_name || "", age: "", class_year: "", major: "",
    school: "", housing_type: "", room_type: "", budget: "", bio: "", looking_for: "",
    dorm_prefs: {}, photoFile: null, photoPreview: null,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => () => { if (data.photoPreview) URL.revokeObjectURL(data.photoPreview); }, []); // eslint-disable-line
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const update = (e) => setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const next = () => { setErr(""); setDir(1); setStep((s) => Math.min(s + 1, TOTAL_STEPS)); };
  const back = () => { setErr(""); setDir(-1); setStep((s) => Math.max(s - 1, 1)); };

  const handleFinish = async () => {
    if (!user) { navigate("/login"); return; }
    setErr("");
    setLoading(true);
    try {
      const fd = new FormData();
      ["first_name", "last_name", "age", "class_year", "major", "school", "housing_type", "room_type", "budget", "bio", "looking_for"]
        .forEach((f) => { if (data[f]) fd.append(f, data[f]); });
      if (data.dorm_prefs && Object.keys(data.dorm_prefs).length > 0) fd.append("dorm_prefs", JSON.stringify(data.dorm_prefs));
      if (data.photoFile) fd.append("photo", data.photoFile);
      let updatedUser = user;
      try {
        const res = await updateProfile(user.id, fd);
        if (res?.user) updatedUser = res.user;
      } catch (e) {
        const m = e?.message?.toLowerCase() || "";
        const photoOnly = m.includes("photo") || m.includes("cloudinary") || m.includes("upload");
        if (!photoOnly) { setErr(e?.message || "Something went wrong."); setLoading(false); return; }
        setErr("Profile saved. The photo didn't upload, so add one from your profile later.");
      }
      await markProfileComplete(user.id);
      setCurrentUser({ ...user, ...updatedUser, profile_complete: true });
      window.location.href = "/app";
    } catch (e) {
      setErr(e?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) { navigate("/login"); return; }
    try { await markProfileComplete(user.id); setCurrentUser({ ...user, profile_complete: true }); } catch { /* best effort */ }
    window.location.href = "/app";
  };

  const steps = [
    <Step1 key={1} data={data} update={update} />,
    <Step2 key={2} data={data} update={update} setData={setData} />,
    <Step3 key={3} data={data} update={update} />,
    <Step4 key={4} data={data} setData={setData} />,
    <Step5 key={5} data={data} setData={setData} />,
  ];

  return (
    <div ref={scrollRef} className="r8-page" style={{ position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ position: "fixed", width: 460, height: 460, top: -220, right: -200 }} />
      <div aria-hidden="true" className="r8-aura r8-aura--b" style={{ position: "fixed", width: 380, height: 380, bottom: -160, left: -200 }} />

      <header style={{ position: "sticky", top: 0, zIndex: 20, padding: "calc(var(--safe-t) + 12px) 20px 12px", background: "color-mix(in srgb, var(--bg) 80%, transparent)", WebkitBackdropFilter: "var(--blur)", backdropFilter: "var(--blur)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            {step > 1
              ? <button className="r8-icon-btn r8-icon-btn--round" onClick={back} aria-label="Back"><Icon name="back" size={22} /></button>
              : <Mark size={36} />}
            <span className="r8-eyebrow">{STEP_LABELS[step - 1]}</span>
            <button className="r8-btn r8-btn--ghost r8-btn--sm" onClick={handleSkip}>Skip</button>
          </div>
          <div style={{ display: "flex", gap: 6 }} aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
            {STEP_LABELS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: "var(--line-2)", overflow: "hidden" }}>
                <motion.div initial={false} animate={{ width: i < step ? "100%" : "0%" }} transition={{ type: "spring", stiffness: 200, damping: 30 }} style={{ height: "100%", background: "var(--iri)" }} />
              </div>
            ))}
          </div>
        </div>
      </header>

      <main style={{ position: "relative", maxWidth: 560, margin: "0 auto", padding: "20px 20px 140px" }}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} custom={dir}
            initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}>
            {steps[step - 1]}
          </motion.div>
        </AnimatePresence>
        {err && <div className="r8-error" style={{ marginTop: 18 }}>{err}</div>}
      </main>

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20, padding: "16px 20px calc(var(--safe-b) + 18px)", background: "linear-gradient(180deg, transparent, var(--bg) 38%)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {step < TOTAL_STEPS ? (
            <button className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" onClick={next}>Continue<Icon name="arrowRight" size={20} /></button>
          ) : (
            <button className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" onClick={handleFinish} disabled={loading}>{loading ? "Saving..." : "Find my roommate"}{!loading && <Icon name="sparkle" size={20} />}</button>
          )}
        </div>
      </div>
    </div>
  );
}
