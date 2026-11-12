// src/pages/OnboardingSchoolPage.jsx: onboarding step 2 of 3 (also used to change school later)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, updateProfile } from "../api";
import OnboardShell from "../components/OnboardShell";
import { SchoolPicker } from "./SetupPage";
import Icon from "../ui/Icon";
import { OptionTile, Field } from "../ui/kit";

const HOUSING_OPTIONS = [
  { value: "on_campus", icon: "school", label: "On campus", sub: "Dorms and residence halls" },
  { value: "off_campus", icon: "home", label: "Off campus", sub: "Apartments and houses" },
  { value: "either", icon: "compass", label: "Either", sub: "Open to both" },
];
const ROOM_OPTIONS = [
  { value: "double", icon: "users", label: "Double", sub: "Shared room" },
  { value: "single", icon: "user", label: "Single", sub: "Private room" },
  { value: "suite", icon: "door", label: "Suite", sub: "Shared suite" },
  { value: "apartment", icon: "home", label: "Apartment", sub: "Apartment style" },
  { value: "any", icon: "sparkle", label: "Any", sub: "No preference" },
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
      setErr("Couldn't save that. Try again in a sec.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardShell step={2} title="School and housing" sub="You'll only see students from your own campus." onBack={() => navigate(-1)} onSkip={() => navigate("/onboarding/lifestyle")} error={err}
      cta={<button type="submit" form="r8-os" className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={loading || !(school || schoolInput)}>{loading ? "Saving..." : "Continue"}{!loading && <Icon name="arrowRight" size={20} />}</button>}>
      <form id="r8-os" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Field label="College or university"><SchoolPicker value={school} onChange={(s) => { setSchool(s); setSchoolInput(s); }} /></Field>
        <Field label="Where do you want to live?">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
            {HOUSING_OPTIONS.map((o) => <OptionTile key={o.value} {...o} selected={housing === o.value} onClick={() => setHousing(o.value)} />)}
          </div>
        </Field>
        <Field label="Room type">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 8 }}>
            {ROOM_OPTIONS.map((o) => <OptionTile key={o.value} {...o} selected={roomType === o.value} onClick={() => setRoomType(o.value)} />)}
          </div>
        </Field>
        <Field label="Monthly budget (optional)" htmlFor="os-budget"><input id="os-budget" className="r8-input" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. $900/mo" /></Field>
      </form>
    </OnboardShell>
  );
}

function buildFormData(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null) fd.append(k, v);
  }
  return fd;
}

// Kept for older imports
export function SectionLabel({ text }) { return <p className="r8-label" style={{ marginBottom: 10 }}>{text}</p>; }
export function OptionCard({ opt, selected, onClick }) { return <OptionTile label={opt.label} sub={opt.sub} selected={selected} onClick={onClick} />; }
