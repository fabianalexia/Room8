// src/pages/OnboardingLifestylePage.jsx: onboarding step 3 of 3
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, setCurrentUser, updateProfile, markProfileComplete } from "../api";
import OnboardShell from "../components/OnboardShell";
import { LifestyleQuestions, LIFESTYLE_QUESTIONS as QUESTIONS } from "./SetupPage";
import Icon from "../ui/Icon";
import { Field } from "../ui/kit";

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
      setErr("Couldn't save that. Try again in a sec.");
    } finally {
      setLoading(false);
    }
  };

  const answeredCount = Object.values(prefs).filter(Boolean).length;

  const skip = async () => {
    if (user) { await markProfileComplete(user.id).catch(() => {}); setCurrentUser({ ...user, profile_complete: true }); }
    navigate("/app", { replace: true });
  };
  return (
    <OnboardShell step={3} title="How you live" sub="This is how we find people you'd actually get along with." onBack={() => navigate(-1)} onSkip={skip} error={err}
      cta={<button type="submit" form="r8-ol" className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={loading}>{loading ? "Saving..." : "Find my roommate"}{!loading && <Icon name="sparkle" size={20} />}</button>}>
      <form id="r8-ol" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <span className="r8-badge r8-badge--iri" style={{ alignSelf: "flex-start" }}>{answeredCount} of {QUESTIONS.length} answered{answeredCount > 0 && answeredCount < QUESTIONS.length ? ", more answers means better matches" : ""}</span>
        <LifestyleQuestions prefs={prefs} setPref={setVal} />
        <Field label="What you're looking for in a roommate" htmlFor="ol-look">
          <textarea id="ol-look" className="r8-textarea" rows={3} value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} placeholder="quiet weeknights, splits groceries, down for a movie on fridays..." />
        </Field>
      </form>
    </OnboardShell>
  );
}
