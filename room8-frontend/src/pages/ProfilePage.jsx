// src/pages/ProfilePage.jsx: your profile, photos, roommate preferences and account
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser, setCurrentUser, getProfile, updateProfile, addPhoto, removePhoto, logout, deleteAccount, removeToken } from "../api";
import VerifiedBadge, { PhotoVerifiedCheck } from "../components/VerifiedBadge";
import ProfileSheet from "../components/ProfileSheet";
import Icon from "../ui/Icon";
import { Avatar, Sheet, TopBar } from "../ui/kit";

const YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate Student", "Other"];

const PREF_QUESTIONS = [
  { key: "sleep_schedule", icon: "moon", label: "Sleep schedule", options: [
    { value: "early_bird", label: "Early bird" }, { value: "night_owl", label: "Night owl" }, { value: "flexible", label: "Flexible" } ] },
  { key: "cleanliness", icon: "sparkle", label: "Cleanliness", options: [
    { value: "very_clean", label: "Spotless" }, { value: "clean", label: "Tidy weekly" }, { value: "relaxed", label: "A little mess is fine" }, { value: "messy", label: "Not fussy" } ] },
  { key: "study_habits", icon: "book", label: "Study habits", options: [
    { value: "library", label: "Library" }, { value: "in_room", label: "At my desk" }, { value: "anywhere", label: "Anywhere" }, { value: "rarely", label: "Rarely" } ] },
  { key: "guests", icon: "door", label: "Guests", options: [
    { value: "never", label: "Never" }, { value: "occasionally", label: "Sometimes" }, { value: "often", label: "Often" } ] },
  { key: "noise", icon: "volume", label: "Noise", options: [
    { value: "silent", label: "Silent" }, { value: "quiet", label: "Quiet" }, { value: "moderate", label: "Music is fine" }, { value: "lively", label: "Bring the noise" } ] },
  { key: "social", icon: "users", label: "Social vibe", options: [
    { value: "very_social", label: "Very social" }, { value: "social", label: "Social" }, { value: "private", label: "Private" }, { value: "very_private", label: "Keep to myself" } ] },
  { key: "partying", icon: "party", label: "Partying", options: [
    { value: "never", label: "Not for me" }, { value: "sometimes", label: "Sometimes" }, { value: "often", label: "Often" } ] },
  { key: "smoking", icon: "leaf", label: "Smoking", options: [
    { value: "no", label: "Smoke-free" }, { value: "outside_only", label: "Outside only" }, { value: "yes", label: "Smoker" } ] },
  { key: "move_in_timeline", icon: "calendar", label: "Move-in timeline", options: [
    { value: "asap", label: "ASAP" }, { value: "this_month", label: "This month" }, { value: "next_month", label: "Next month" }, { value: "semester", label: "Next semester" }, { value: "flexible", label: "No rush" } ] },
  { key: "housing_type", icon: "home", label: "Housing", options: [
    { value: "dorm", label: "Dorm" }, { value: "suite", label: "Campus suite" }, { value: "off_campus_apt", label: "Off-campus apartment" }, { value: "house", label: "Off-campus house" }, { value: "any", label: "Open to anything" } ] },
];

const TOTAL_PREFS = PREF_QUESTIONS.length;

function Card({ title, right, children, style }) {
  return (
    <section className="r8-card" style={{ padding: 20, borderRadius: 26, ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 10 }}>
          {title && <h2 style={{ fontSize: 19 }}>{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

function Row({ icon, label, sub, onClick, danger, right }) {
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "12px 4px", textAlign: "left", color: danger ? "var(--danger)" : "var(--text)" }}>
      <span style={{ width: 40, height: 40, borderRadius: 13, background: danger ? "rgba(255,90,110,.12)" : "var(--glass-2)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name={icon} size={19} /></span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 600, fontSize: 15.5 }}>{label}</span>
        {sub && <span className="r8-faint" style={{ display: "block", fontSize: 13 }}>{sub}</span>}
      </span>
      {right ?? <Icon name="chevron" size={18} color="var(--text-3)" />}
    </button>
  );
}

export default function ProfilePage() {
  const navigate   = useNavigate();
  const user       = getCurrentUser();
  const photoRef   = useRef(null);
  const galleryRef = useRef(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [preview, setPreview] = useState(false);

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

  const applyUserData = (u) => {
    const nameParts = (u.name || "").split(" ");
    setForm({
      first_name: u.first_name || nameParts[0] || "",
      last_name:  u.last_name  || nameParts.slice(1).join(" ") || "",
      bio:        u.bio        || "",
      age:        u.age        || "",
      location:   u.location   || "",
      budget:     u.budget     || "",
      major:      u.major      || "",
      class_year: u.class_year || "",
    });
    setPrimary(u.photo || null);
    setPhotos(u.photos || []);
    setPrefs(u.dorm_prefs || {});
    setLookingFor(u.looking_for || "");
  };

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    // Seed from localStorage immediately (instant, may be incomplete for older sessions)
    applyUserData(user);
    // Always fetch fresh from API — source of truth for dorm_prefs, looking_for, etc.
    getProfile(user.id)
      .then(full => {
        applyUserData(full);
        setCurrentUser({ ...user, ...full });
      })
      .catch(() => {}); // keep localStorage values if offline / error
  }, []); // eslint-disable-line

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(""); setSuccess("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== "") fd.append(k, v); });
      const res = await updateProfile(user.id, fd);
      const updated = { ...user, ...res.user };
      setCurrentUser(updated);
      applyUserData(res.user);
      setSuccess("Saved. Looking good.");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setErr(e.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrefs = async () => {
    setPrefSaving(true); setPrefSuccess(""); setErr("");
    try {
      const fd = new FormData();
      fd.append("dorm_prefs", JSON.stringify(prefs));
      fd.append("looking_for", lookingFor);
      const res = await updateProfile(user.id, fd);
      const updated = { ...user, ...res.user };
      setCurrentUser(updated);
      // Reflect the saved values back into state so UI stays in sync
      setPrefs(res.user.dorm_prefs || {});
      setLookingFor(res.user.looking_for || "");
      setPrefSuccess("Preferences saved.");
      setTimeout(() => setPrefSuccess(""), 4000);
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

  const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false);
  const [deleting,           setDeleting]           = useState(false);
  const [deleteErr,          setDeleteErr]          = useState("");
  const [deleteConfirmText,  setDeleteConfirmText]  = useState("");

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteErr("");
    try {
      await deleteAccount();
      removeToken();
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    } catch (e) {
      setDeleteErr(e?.message || "Could not delete account. Please try again.");
      setDeleting(false);
    }
  };

  if (!user) return null;

  const displayName = [form.first_name, form.last_name].filter(Boolean).join(" ") || user.name || user.email;
  const answeredCount = Object.values(prefs).filter(Boolean).length;

  const handleInvite = () => {
    const link = `${window.location.origin}/register`;
    const done = () => { setInviteCopied(true); setTimeout(() => setInviteCopied(false), 2500); };
    if (navigator.share) { navigator.share({ title: "Room8", text: "Find a roommate who actually fits how you live.", url: link }).catch(() => {}); return; }
    navigator.clipboard.writeText(link).then(done).catch(() => {});
  };

  const strength = Math.round(((primary ? 1 : 0) + (photos.length > 1 ? 1 : 0) + (form.bio ? 1 : 0) + (lookingFor ? 1 : 0) + Math.min(1, answeredCount / 6) + (user.is_photo_verified ? 1 : 0)) / 6 * 100);
  const me = { ...user, name: displayName, firstName: form.first_name || displayName, photo: primary, photos: photos.filter((p) => p !== primary), bio: form.bio, age: form.age, major: form.major, class_year: form.class_year, dorm_prefs: prefs, looking_for: lookingFor };

  return (
    <div className="r8-app-page" style={{ position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 420, height: 420, top: -220, right: -180 }} />
      <div aria-hidden="true" className="r8-aura r8-aura--b" style={{ width: 340, height: 340, top: 160, left: -220 }} />
      <TopBar title="Profile" right={<button className="r8-btn r8-btn--glass r8-btn--sm" onClick={() => setPreview(true)}><Icon name="eye" size={17} />Preview</button>} />

      <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", padding: "4px 16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Identity */}
        <section className="r8-card" style={{ padding: "26px 20px 22px", borderRadius: 30, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <button onClick={() => photoRef.current?.click()} aria-label="Change profile photo" style={{ position: "relative", borderRadius: "50%" }}>
            <Avatar src={primary} name={displayName} size={112} ring />
            <span style={{ position: "absolute", right: 2, bottom: 4, width: 34, height: 34, borderRadius: "50%", background: "var(--iri)", color: "#0E0F12", border: "3px solid var(--elev)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="camera" size={16} stroke={2.2} /></span>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePrimaryPhoto} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <h2 style={{ fontSize: 28 }}>{displayName}{form.age ? <span style={{ fontWeight: 500, color: "var(--text-2)" }}>, {form.age}</span> : null}</h2>
            <PhotoVerifiedCheck verified={user.is_photo_verified} size={22} />
          </div>
          {user.school && <p className="r8-muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15 }}><Icon name="school" size={16} />{user.school}</p>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
            <VerifiedBadge isStudent={user.is_verified_student} size="md" />
            {!user.edu_verified && !(user.is_verified_student && user.email_verified) && (
              <button className="r8-badge" style={{ height: 28, fontSize: 13, padding: "0 11px", cursor: "pointer", color: "var(--text)" }} onClick={() => navigate("/verify/student")}><Icon name="mail" size={14} />Verify school email</button>
            )}
            {!user.is_photo_verified && (
              <button className="r8-badge" style={{ height: 28, fontSize: 13, padding: "0 11px", cursor: "pointer", color: "var(--text)" }} onClick={() => navigate("/verify/photo")}><Icon name="verified" size={14} />Get photo verified</button>
            )}
          </div>

          <div style={{ width: "100%", marginTop: 14, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Profile strength</span>
              <span className="r8-muted">{strength >= 100 ? "maxed out" : `${strength}%`}</span>
            </div>
            <div style={{ height: 8, borderRadius: 8, background: "var(--glass-2)", overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${strength}%` }} transition={{ type: "spring", stiffness: 90, damping: 20 }} style={{ height: "100%", borderRadius: 8, background: "var(--iri)" }} />
            </div>
            {strength < 100 && <p className="r8-faint" style={{ fontSize: 13, marginTop: 8 }}>Full profiles with 2+ photos and lifestyle answers get way more matches.</p>}
          </div>
        </section>

        <AnimatePresence>
          {(success || err || uploading) && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {success && <div className="r8-success">{success}</div>}
              {err && <div className="r8-error">{err}</div>}
              {uploading && <div className="r8-chip" style={{ height: 40 }}><span className="r8-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Uploading photo</div>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photos */}
        <Card title="Photos" right={<span className="r8-faint" style={{ fontSize: 13 }}>{photos.length} added</span>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
            {photos.map((url) => (
              <motion.div layout key={url} style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: 18, overflow: "hidden", border: "1px solid var(--line)", background: "var(--elev-2)" }}>
                <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={() => handleRemovePhoto(url)} aria-label="Remove photo" style={{ position: "absolute", top: 6, right: 6, width: 30, height: 30, borderRadius: "50%", background: "rgba(14,15,18,.6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)" }}><Icon name="x" size={15} stroke={2.4} /></button>
                {url === primary && <span className="r8-sticker r8-sticker--pill" style={{ position: "absolute", left: 6, bottom: 8, fontSize: 11, padding: "4px 9px" }}>main</span>}
              </motion.div>
            ))}
            <button onClick={() => galleryRef.current?.click()} style={{ aspectRatio: "3 / 4", borderRadius: 18, border: "1.5px dashed var(--line-2)", background: "var(--glass)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--text-2)" }}>
              <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--iri)", color: "#0E0F12", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" size={20} stroke={2.4} /></span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Add photo</span>
              <input ref={galleryRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAddGalleryPhoto} />
            </button>
          </div>
        </Card>

        {/* About */}
        <form onSubmit={handleSave}>
          <Card title="About you" right={!editing
            ? <button type="button" className="r8-btn r8-btn--glass r8-btn--sm" onClick={() => setEditing(true)}><Icon name="edit" size={16} />Edit</button>
            : <span className="r8-badge r8-badge--iri">Editing</span>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                <PField label="First name" name="first_name" value={form.first_name} onChange={update} disabled={!editing} />
                <PField label="Last name" name="last_name" value={form.last_name} onChange={update} disabled={!editing} />
              </div>
              <PField label="Bio" name="bio" value={form.bio} onChange={update} disabled={!editing} multiline placeholder="your vibe in a few lines. classes, hobbies, the stuff you'd want a roommate to know." />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                <PField label="Age" name="age" type="number" value={form.age} onChange={update} disabled={!editing} />
                <div className="r8-field">
                  <label className="r8-label" htmlFor="pf-year">Year</label>
                  <select id="pf-year" name="class_year" value={form.class_year} onChange={update} disabled={!editing} className="r8-select" style={{ opacity: editing ? 1 : .75 }}>
                    <option value="">Select</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <PField label="Major" name="major" value={form.major} onChange={update} disabled={!editing} />
                <PField label="Location" name="location" value={form.location} onChange={update} disabled={!editing} placeholder="e.g. Olympia, WA" />
              </div>
              <PField label="Monthly budget" name="budget" value={form.budget} onChange={update} disabled={!editing} placeholder="e.g. $900/mo" />
              <AnimatePresence>
                {editing && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ display: "flex", gap: 10, overflow: "hidden" }}>
                    <button type="submit" disabled={saving} className="r8-btn r8-btn--primary" style={{ flex: 1 }}>{saving ? "Saving..." : "Save changes"}</button>
                    <button type="button" onClick={() => setEditing(false)} className="r8-btn r8-btn--glass">Cancel</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </form>

        {/* Lifestyle */}
        <Card title="How you live" right={<span className="r8-badge r8-badge--iri">{answeredCount}/{TOTAL_PREFS}</span>}>
          {prefSuccess && <div className="r8-success" style={{ marginBottom: 14 }}>{prefSuccess}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {PREF_QUESTIONS.map((q) => (
              <div key={q.key}>
                <p style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14.5, marginBottom: 10 }}><Icon name={q.icon} size={17} />{q.label}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {q.options.map((o) => {
                    const on = prefs[q.key] === o.value;
                    return (
                      <motion.button key={o.value} type="button" whileTap={{ scale: 0.95 }} aria-pressed={on}
                        onClick={() => setPrefs((p) => ({ ...p, [q.key]: on ? "" : o.value }))}
                        className="r8-chip r8-chip--select" style={{ height: 40, fontSize: 14 }}>
                        {o.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="r8-field">
              <label className="r8-label" htmlFor="pf-looking">What you're looking for in a roommate</label>
              <textarea id="pf-looking" className="r8-textarea" rows={3} value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="quiet weeknights, splits groceries, down for a movie on fridays..." />
            </div>
            <button onClick={handleSavePrefs} disabled={prefSaving} className="r8-btn r8-btn--primary r8-btn--block">{prefSaving ? "Saving..." : "Save preferences"}</button>
          </div>
        </Card>

        {/* Settings */}
        <Card style={{ padding: "8px 16px" }}>
          <Row icon="school" label="School and housing" sub="Change your school or housing type" onClick={() => navigate("/onboarding/school")} />
          <Row icon="users" label="Invite friends" sub="Room8 gets better with more people from your school" onClick={handleInvite} right={inviteCopied ? <span className="r8-badge r8-badge--iri"><Icon name="check" size={13} />Copied</span> : undefined} />
          <Row icon="shield" label="Privacy policy" onClick={() => navigate("/privacy")} />
          <Row icon="logout" label="Log out" onClick={handleLogout} />
          <Row icon="trash" label="Delete account" danger onClick={() => { setDeleteErr(""); setDeleteConfirmText(""); setShowDeleteConfirm(true); }} />
        </Card>
      </div>

      {preview && <ProfileSheet person={me} onClose={() => setPreview(false)} />}

      <Sheet open={showDeleteConfirm} onClose={() => { if (!deleting) { setShowDeleteConfirm(false); setDeleteConfirmText(""); } }} title="Delete your account?" labelledBy="r8-delete-title">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p className="r8-muted" style={{ fontSize: 15 }}>This permanently deletes your profile, photos, matches and messages. <b style={{ color: "var(--danger)" }}>This can't be undone.</b></p>
          {deleteErr && <div className="r8-error">{deleteErr}</div>}
          <div className="r8-field">
            <label className="r8-label" htmlFor="pf-del">Type DELETE to confirm</label>
            <input id="pf-del" className="r8-input" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="DELETE" disabled={deleting} style={{ letterSpacing: "0.06em", fontWeight: 700 }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="r8-btn r8-btn--glass" style={{ flex: 1 }} onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }} disabled={deleting}>Cancel</button>
            <button className="r8-btn r8-btn--danger" style={{ flex: 1 }} onClick={handleDeleteAccount} disabled={deleting || deleteConfirmText !== "DELETE"}>{deleting ? "Deleting..." : "Delete forever"}</button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function PField({ label, name, value, onChange, disabled, multiline, type = "text", placeholder }) {
  const id = `pf-${name}`;
  return (
    <div className="r8-field">
      <label className="r8-label" htmlFor={id}>{label}</label>
      {multiline
        ? <textarea id={id} name={name} value={value} onChange={onChange} disabled={disabled} rows={3} placeholder={placeholder} className="r8-textarea" style={{ opacity: disabled ? .8 : 1 }} />
        : <input id={id} name={name} type={type} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} className="r8-input" style={{ opacity: disabled ? .8 : 1 }} />}
    </div>
  );
}
