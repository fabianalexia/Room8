// src/pages/ProfilePage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, updateProfile, addPhoto, removePhoto, logout } from "../api";

const NAVY   = "#0F2D5E";
const GOLD   = "#F59E0B";
const DARK   = "#050D1F";
const DARKER = "#030914";
const WHITE  = "#FFFFFF";
const BORDER = "rgba(255,255,255,0.1)";
const SURFACE = "rgba(255,255,255,0.05)";
const MUTED  = "rgba(255,255,255,0.45)";
const TEXT   = "#FFFFFF";

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate Student", "Other"];

const PREF_QUESTIONS = [
  {
    key: "sleep_schedule", icon: "😴", label: "Sleep Schedule",
    options: [
      { value: "early_bird",  label: "Early Bird — up by 7am" },
      { value: "night_owl",   label: "Night Owl — up past midnight" },
      { value: "flexible",    label: "Flexible" },
    ],
  },
  {
    key: "cleanliness", icon: "🧹", label: "Cleanliness",
    options: [
      { value: "very_clean", label: "Spotless — clean every day" },
      { value: "clean",      label: "Clean — tidy weekly" },
      { value: "relaxed",    label: "Relaxed — a little mess is fine" },
      { value: "messy",      label: "Not fussy" },
    ],
  },
  {
    key: "study_habits", icon: "📚", label: "Study Habits",
    options: [
      { value: "library",  label: "Library — I study out of the room" },
      { value: "in_room",  label: "In Room — at my desk" },
      { value: "anywhere", label: "Anywhere — wherever I land" },
      { value: "rarely",   label: "Rarely — we're here for fun" },
    ],
  },
  {
    key: "guests", icon: "👥", label: "Guests",
    options: [
      { value: "never",        label: "Never — my room is my sanctuary" },
      { value: "occasionally", label: "Occasionally — friends sometimes" },
      { value: "often",        label: "Often — love having people over" },
    ],
  },
  {
    key: "noise", icon: "🔊", label: "Noise Level",
    options: [
      { value: "silent",   label: "Silent — library quiet please" },
      { value: "quiet",    label: "Quiet — low background ok" },
      { value: "moderate", label: "Moderate — music & TV fine" },
      { value: "lively",   label: "Lively — bring the noise" },
    ],
  },
  {
    key: "social", icon: "😊", label: "Social Vibe",
    options: [
      { value: "very_social",  label: "Very Social — hangout every day" },
      { value: "social",       label: "Social — friendly, like my space" },
      { value: "private",      label: "Private — respect my alone time" },
      { value: "very_private", label: "Solo — keep to myself" },
    ],
  },
  {
    key: "partying", icon: "🎉", label: "Partying",
    options: [
      { value: "never",     label: "Not for me" },
      { value: "sometimes", label: "Sometimes — weekends maybe" },
      { value: "often",     label: "Often — I like to have fun" },
    ],
  },
  {
    key: "smoking", icon: "🚬", label: "Smoking",
    options: [
      { value: "no",           label: "Non-smoker — no smoking please" },
      { value: "outside_only", label: "Outside only" },
      { value: "yes",          label: "Smoker" },
    ],
  },
  {
    key: "move_in_timeline", icon: "📅", label: "Move-In Timeline",
    options: [
      { value: "asap",       label: "ASAP — looking now" },
      { value: "this_month", label: "This month" },
      { value: "next_month", label: "Next month" },
      { value: "semester",   label: "Next semester" },
      { value: "flexible",   label: "Flexible — no rush" },
    ],
  },
  {
    key: "housing_type", icon: "🏠", label: "Housing Preference",
    options: [
      { value: "dorm",           label: "On-campus dorm" },
      { value: "suite",          label: "On-campus suite / apartment" },
      { value: "off_campus_apt", label: "Off-campus apartment" },
      { value: "house",          label: "Off-campus house" },
      { value: "any",            label: "Open to anything" },
    ],
  },
];

function ProfileAvatar({ src, name, size = 96 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: src ? `url(${src}) center/cover` : NAVY,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: WHITE, fontWeight: 800, fontSize: size * 0.35,
      flexShrink: 0,
      border: `3px solid rgba(245,158,11,0.5)`,
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    }}>
      {!src && (name?.[0]?.toUpperCase() || "?")}
    </div>
  );
}

function Section({ title, children, collapsible, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${BORDER}`,
      borderRadius: 12, marginBottom: 12, overflow: "hidden",
    }}>
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 20px",
          cursor: collapsible ? "pointer" : "default",
          borderBottom: (!collapsible || open) ? `1px solid ${BORDER}` : "none",
        }}
        onClick={() => collapsible && setOpen((v) => !v)}
      >
        <p style={{
          color: "rgba(245,158,11,0.8)", fontWeight: 700, fontSize: "0.8rem",
          letterSpacing: "0.08em", textTransform: "uppercase", margin: 0,
        }}>
          {title}
        </p>
        {collapsible && (
          <span style={{
            color: MUTED, fontSize: "0.85rem",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s", display: "inline-block",
          }}>▼</span>
        )}
      </div>
      {(!collapsible || open) && (
        <div style={{ padding: "16px 20px" }}>{children}</div>
      )}
    </div>
  );
}

function Field({ label, name, value, onChange, disabled, multiline, type = "text", placeholder }) {
  const base = {
    width: "100%", padding: "10px 12px",
    background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 8,
    color: disabled ? MUTED : WHITE,
    fontSize: "0.92rem", fontFamily: "inherit",
    boxSizing: "border-box", outline: "none",
    transition: "border-color 0.15s",
  };
  return (
    <div>
      <label style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 5 }}>
        {label}
      </label>
      {multiline
        ? <textarea name={name} value={value} onChange={onChange} disabled={disabled}
            rows={3} placeholder={placeholder} style={{ ...base, resize: "vertical" }}
            onFocus={(e) => { if (!disabled) e.target.style.borderColor = "rgba(245,158,11,0.5)"; }}
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
        : <input name={name} type={type} value={value} onChange={onChange} disabled={disabled}
            placeholder={placeholder} style={base}
            onFocus={(e) => { if (!disabled) e.target.style.borderColor = "rgba(245,158,11,0.5)"; }}
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
      }
    </div>
  );
}

function FieldSelect({ label, name, value, onChange, disabled, children }) {
  return (
    <div>
      <label style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 5 }}>
        {label}
      </label>
      <select name={name} value={value} onChange={onChange} disabled={disabled} style={{
        width: "100%", padding: "10px 12px",
        background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
        border: `1.5px solid ${BORDER}`,
        borderRadius: 8, color: disabled ? MUTED : WHITE,
        fontSize: "0.92rem", fontFamily: "inherit",
        boxSizing: "border-box", outline: "none",
      }}>
        {children}
      </select>
    </div>
  );
}

const TOTAL_PREFS = PREF_QUESTIONS.length;

export default function ProfilePage() {
  const navigate   = useNavigate();
  const user       = getCurrentUser();
  const photoRef   = useRef(null);
  const galleryRef = useRef(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const [form, setForm] = useState({
    first_name: "", last_name: "", bio: "", age: "",
    location: "", budget: "", major: "", class_year: "",
  });
  const [photos,    setPhotos]    = useState([]);
  const [primary,   setPrimary]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success,   setSuccess]   = useState("");
  const [err,       setErr]       = useState("");
  const [editing,   setEditing]   = useState(false);

  const [prefs,      setPrefs]      = useState({});
  const [lookingFor, setLookingFor] = useState("");
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const nameParts = (user.name || "").split(" ");
    setForm({
      first_name: user.first_name || nameParts[0] || "",
      last_name:  user.last_name  || nameParts.slice(1).join(" ") || "",
      bio:        user.bio        || "",
      age:        user.age        || "",
      location:   user.location   || "",
      budget:     user.budget     || "",
      major:      user.major      || "",
      class_year: user.class_year || "",
    });
    setPrimary(user.photo || null);
    setPhotos(user.photos || []);
    setPrefs(user.dorm_prefs || {});
    setLookingFor(user.looking_for || "");
  }, []); // eslint-disable-line

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(""); setSuccess("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
      const res = await updateProfile(user.id, fd);
      setCurrentUser({ ...user, ...res.user });
      setPrimary(res.user.photo);
      setPhotos(res.user.photos || []);
      setSuccess("Profile saved!");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrefs = async () => {
    setPrefSaving(true); setPrefSuccess("");
    try {
      const fd = new FormData();
      fd.append("dorm_prefs", JSON.stringify(prefs));
      fd.append("looking_for", lookingFor);
      const res = await updateProfile(user.id, fd);
      setCurrentUser({ ...user, ...res.user });
      setPrefSuccess("Preferences saved!");
      setTimeout(() => setPrefSuccess(""), 3000);
    } catch (e) {
      setErr(e.message || "Could not save preferences.");
    } finally {
      setPrefSaving(false);
    }
  };

  const handlePrimaryPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await updateProfile(user.id, fd);
      setCurrentUser({ ...user, ...res.user });
      setPrimary(res.user.photo);
      setPhotos(res.user.photos || []);
    } catch { setErr("Could not upload photo."); }
    finally { setUploading(false); }
  };

  const handleAddGalleryPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try {
      const res = await addPhoto(user.id, file);
      setCurrentUser({ ...user, ...res.user });
      setPhotos(res.user.photos || []);
    } catch { setErr("Could not upload photo."); }
    finally { setUploading(false); }
  };

  const handleRemovePhoto = async (url) => {
    setUploading(true); setErr("");
    try {
      const res = await removePhoto(user.id, url);
      setCurrentUser({ ...user, ...res.user });
      setPrimary(res.user.photo);
      setPhotos(res.user.photos || []);
    } catch { setErr("Could not remove photo."); }
    finally { setUploading(false); }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  if (!user) return null;

  const displayName = [form.first_name, form.last_name].filter(Boolean).join(" ") || user.name || user.email;
  const answeredCount = Object.values(prefs).filter(Boolean).length;

  const handleInvite = () => {
    const link = `${window.location.origin}/register`;
    navigator.clipboard.writeText(link).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    });
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: `linear-gradient(180deg, #030914 0%, #071020 100%)`,
      overflowY: "auto", paddingBottom: 80,
    }}>
      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #061840 100%)`,
        height: 120,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px", position: "relative" }}>

        {/* Avatar row */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: -48, marginBottom: 20 }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => photoRef.current?.click()}>
            <ProfileAvatar src={primary} name={displayName} size={96} />
            <div style={{
              position: "absolute", bottom: 2, right: 2, width: 26, height: 26,
              borderRadius: "50%", background: GOLD,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", border: `2px solid #030914`,
              color: DARK,
            }}>📷</div>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePrimaryPhoto} />
          </div>
          <div style={{ flex: 1, paddingBottom: 6 }}>
            <h2 style={{ margin: 0, color: WHITE, fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
              {displayName}
            </h2>
            {user.school && (
              <p style={{ margin: "4px 0 0", color: "rgba(245,158,11,0.8)", fontSize: "0.85rem", fontWeight: 600 }}>
                {user.school}
              </p>
            )}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} style={{
              background: "transparent", border: `1px solid rgba(245,158,11,0.4)`,
              color: GOLD, padding: "8px 18px", borderRadius: 8, fontWeight: 600,
              cursor: "pointer", fontSize: "0.88rem",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >Edit</button>
          )}
        </div>

        {/* Alerts */}
        {success   && <Alert type="success">{success}</Alert>}
        {err       && <Alert type="error">{err}</Alert>}
        {uploading && <p style={{ color: GOLD, fontSize: "0.85rem", marginBottom: 10 }}>Uploading…</p>}

        {/* Photo gallery */}
        <Section title="Photos">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {photos.map((url) => (
              <div key={url} style={{ position: "relative", paddingBottom: "100%", borderRadius: 10, overflow: "hidden" }}>
                <img src={url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => handleRemovePhoto(url)} style={{
                  position: "absolute", top: 6, right: 6,
                  background: "rgba(0,0,0,0.65)", border: "none",
                  color: WHITE, width: 24, height: 24, borderRadius: "50%",
                  cursor: "pointer", fontSize: "0.75rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
                {url === primary && (
                  <div style={{
                    position: "absolute", bottom: 6, left: 6,
                    background: GOLD, color: DARK, fontSize: "0.62rem",
                    fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                  }}>Main</div>
                )}
              </div>
            ))}
            <div onClick={() => galleryRef.current?.click()} style={{
              paddingBottom: "100%", position: "relative",
              borderRadius: 10, border: `2px dashed rgba(255,255,255,0.15)`,
              cursor: "pointer", background: "rgba(255,255,255,0.03)",
            }}>
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", color: "rgba(245,158,11,0.5)", gap: 4,
              }}>
                <span style={{ fontSize: "1.5rem" }}>+</span>
                <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Add Photo</span>
              </div>
              <input ref={galleryRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAddGalleryPhoto} />
            </div>
          </div>
        </Section>

        {/* Profile form */}
        <form onSubmit={handleSave}>
          <Section title="About">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Field label="First Name" name="first_name" value={form.first_name} onChange={update} disabled={!editing} />
              <Field label="Last Name"  name="last_name"  value={form.last_name}  onChange={update} disabled={!editing} />
            </div>
            <Field label="Bio" name="bio" value={form.bio} onChange={update} disabled={!editing} multiline placeholder="Describe your vibe…" />
          </Section>

          <Section title="Details">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Age" name="age" type="number" value={form.age} onChange={update} disabled={!editing} />
              <FieldSelect label="Year in School" name="class_year" value={form.class_year} onChange={update} disabled={!editing}>
                <option value="">Select…</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </FieldSelect>
              <Field label="Major" name="major" value={form.major} onChange={update} disabled={!editing} />
              <Field label="Location" name="location" value={form.location} onChange={update} disabled={!editing} placeholder="e.g. Brooklyn, NY" />
              <Field label="Monthly Budget" name="budget" value={form.budget} onChange={update} disabled={!editing} placeholder="e.g. $900/mo" />
            </div>
          </Section>

          {editing && (
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, background: saving ? "rgba(245,158,11,0.4)" : GOLD, color: DARK, border: "none",
                padding: "13px", borderRadius: 8, fontWeight: 700,
                fontSize: "0.95rem", cursor: saving ? "default" : "pointer",
                boxShadow: saving ? "none" : "0 4px 20px rgba(245,158,11,0.35)",
              }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} style={{
                background: "transparent", color: MUTED, border: `1px solid ${BORDER}`,
                padding: "13px 22px", borderRadius: 8, fontWeight: 600,
                fontSize: "0.9rem", cursor: "pointer",
              }}>Cancel</button>
            </div>
          )}
        </form>

        {/* School & housing shortcut */}
        <Section title="School & Housing">
          <button onClick={() => navigate("/onboarding/school")} style={{
            width: "100%", background: "rgba(255,255,255,0.04)",
            border: `1px solid ${BORDER}`,
            color: WHITE, padding: "13px 16px",
            borderRadius: 8, textAlign: "left", cursor: "pointer",
            fontSize: "0.92rem", fontWeight: 600,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            transition: "background 0.15s, border-color 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.08)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = BORDER; }}
          >
            <span>Update School & Housing Preferences</span>
            <span style={{ color: "rgba(245,158,11,0.7)" }}>›</span>
          </button>
        </Section>

        {/* Roommate Preferences */}
        <Section
          title={`Roommate Preferences${answeredCount > 0 ? ` · ${answeredCount}/${TOTAL_PREFS}` : ""}`}
          collapsible
          defaultOpen={answeredCount === 0}
        >
          {prefSuccess && <Alert type="success" style={{ marginBottom: 14 }}>{prefSuccess}</Alert>}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {PREF_QUESTIONS.map((q) => (
              <div key={q.key}>
                <label style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 5 }}>
                  {q.icon} {q.label}
                </label>
                <select
                  value={prefs[q.key] || ""}
                  onChange={(e) => setPrefs((p) => ({ ...p, [q.key]: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 12px",
                    background: "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${BORDER}`,
                    borderRadius: 8, color: prefs[q.key] ? WHITE : MUTED,
                    fontSize: "0.92rem", fontFamily: "inherit",
                    boxSizing: "border-box", outline: "none",
                  }}
                >
                  <option value="">Select…</option>
                  {q.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <label style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 5 }}>
                What are you looking for in a roommate?
              </label>
              <textarea
                rows={3}
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                placeholder="Describe your ideal living situation…"
                style={{
                  width: "100%", padding: "10px 12px",
                  background: "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${BORDER}`,
                  borderRadius: 8, color: WHITE,
                  fontSize: "0.92rem", fontFamily: "inherit",
                  boxSizing: "border-box", outline: "none", resize: "vertical",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
              />
            </div>

            <button onClick={handleSavePrefs} disabled={prefSaving} style={{
              background: prefSaving ? "rgba(245,158,11,0.4)" : GOLD, color: DARK, border: "none",
              padding: "13px", borderRadius: 8, fontWeight: 700,
              fontSize: "0.92rem", cursor: prefSaving ? "default" : "pointer",
              boxShadow: prefSaving ? "none" : "0 4px 20px rgba(245,158,11,0.35)",
            }}>
              {prefSaving ? "Saving…" : "Save Roommate Preferences"}
            </button>
          </div>
        </Section>

        {/* Invite Friends */}
        <div style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 12, padding: "20px",
          marginBottom: 12,
        }}>
          <p style={{ color: GOLD, fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px" }}>
            Invite Friends
          </p>
          <p style={{ color: MUTED, fontSize: "0.85rem", margin: "0 0 14px", lineHeight: 1.5 }}>
            Know someone looking for a roommate? Share Room8 — it's free.
          </p>
          <button onClick={handleInvite} style={{
            background: inviteCopied ? "rgba(34,197,94,0.2)" : GOLD,
            color: inviteCopied ? "#86efac" : DARK,
            border: inviteCopied ? "1px solid rgba(34,197,94,0.4)" : "none",
            padding: "10px 22px", borderRadius: 8,
            fontWeight: 700, fontSize: "0.88rem",
            cursor: "pointer",
            transition: "background 0.2s",
            boxShadow: inviteCopied ? "none" : "0 4px 16px rgba(245,158,11,0.3)",
          }}>
            {inviteCopied ? "✓ Link Copied!" : "Copy Invite Link"}
          </button>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          width: "100%", marginTop: 4,
          background: "transparent",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#F87171", padding: "13px",
          borderRadius: 8, fontWeight: 700,
          fontSize: "0.92rem", cursor: "pointer",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

function Alert({ type, children, style }) {
  const isSuccess = type === "success";
  return (
    <div style={{
      background: isSuccess ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
      border: `1px solid ${isSuccess ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
      color: isSuccess ? "#86efac" : "#F87171",
      padding: "10px 14px", borderRadius: 8, marginBottom: 12,
      fontSize: "0.88rem", ...style,
    }}>
      {children}
    </div>
  );
}
