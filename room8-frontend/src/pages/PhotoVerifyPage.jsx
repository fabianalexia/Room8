// Photo verification: consent, random pose, selfie, then manual review.
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getCurrentUser, setCurrentUser, getPhotoVerificationStatus,
  startPhotoVerification, submitPhotoVerification,
} from "../api";
import OnboardShell from "../components/OnboardShell";
import Icon from "../ui/Icon";
import { EmptyState } from "../ui/kit";

export default function PhotoVerifyPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const fileRef = useRef(null);

  const [state, setState] = useState(null);   // server status object
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const refresh = () =>
    getPhotoVerificationStatus()
      .then((s) => {
        setState(s);
        if (s.is_photo_verified && user && !user.is_photo_verified) {
          setCurrentUser({ ...user, is_photo_verified: true });
        }
      })
      .catch((e) => setErr(e.message));

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    refresh();
  }, []); // eslint-disable-line

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const begin = async () => {
    setErr(""); setBusy(true);
    try { setState(await startPhotoVerification()); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    setErr(""); setBusy(true);
    try {
      setState(await submitPhotoVerification(file));
      setFile(null); setPreview(null);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const status = state?.status;

  return (
    <OnboardShell label="Photo verification" onBack={() => navigate(-1)} title="Prove it's really you" sub="Get the verified check on your profile so people know you're real." error={err}>
      {!state && !err && <div className="r8-skel" style={{ height: 260, borderRadius: 28 }} />}

      {(status === "approved" || state?.is_photo_verified) && (
        <div className="r8-card">
          <EmptyState icon="verified" title="You're verified" body="Your check now shows on your profile and your swipe card."
            action={<button className="r8-btn r8-btn--primary" onClick={() => navigate("/profile")}>Back to profile</button>} />
        </div>
      )}

      {status === "pending" && (
        <div className="r8-card">
          <EmptyState icon="clock" title="Under review" body="A real person on our team is comparing your selfie to your photos. Usually less than a day. We'll notify you."
            action={<button className="r8-btn r8-btn--glass" onClick={refresh}><Icon name="refresh" size={17} />Check status</button>} />
        </div>
      )}

      {(status === "none" || status === "rejected") && !state?.is_photo_verified && (
        <div className="r8-card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
          {status === "rejected" && <div className="r8-error">Not approved: {state.reject_reason || "the photo didn't match"}. You can try again.</div>}
          <div style={{ display: "flex", gap: 14 }}>
            {[["camera", "Take a selfie", "copy a pose we give you"], ["users", "We check it", "a person compares it to your photos"], ["verified", "Get the check", "it shows on your profile"]].map(([ic, t, d], i) => (
              <div key={t} style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ width: 48, height: 48, borderRadius: 16, background: i === 2 ? "var(--iri)" : "var(--glass-2)", color: i === 2 ? "#0E0F12" : "var(--text)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={ic} size={22} /></span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{t}</span>
                <span className="r8-faint" style={{ fontSize: 12.5, lineHeight: 1.35 }}>{d}</span>
              </div>
            ))}
          </div>
          {!user?.photo && <div className="r8-error" style={{ color: "var(--warn)", background: "rgba(255,200,96,.10)", borderColor: "rgba(255,200,96,.3)" }}>Add a profile photo first so we have something to compare to.</div>}
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, color: "var(--text-2)", lineHeight: 1.5, cursor: "pointer", padding: 14, borderRadius: 16, background: "var(--glass)", border: "1px solid var(--line)" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2, width: 20, height: 20, flexShrink: 0, accentColor: "#8C9EFF" }} />
            <span>I agree Room8 can collect a selfie to confirm who I am. A person reviews it, it's only used for verification, it's never shown on my profile, and it's deleted as soon as the review is done. <a href="/privacy" style={{ color: "var(--text)", textDecoration: "underline", fontWeight: 600 }}>Privacy policy</a></span>
          </label>
          <button className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={!consent || !user?.photo || busy} onClick={begin}>{busy ? "Starting..." : "Start verification"}</button>
        </div>
      )}

      {status === "awaiting_selfie" && (
        <div className="r8-card" style={{ padding: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
          <p className="r8-eyebrow">Your pose</p>
          <motion.div initial={{ scale: 0.6, rotate: -12 }} animate={{ scale: 1, rotate: -4 }} transition={{ type: "spring", stiffness: 400, damping: 14 }}
            className="r8-sticker" style={{ padding: "14px 22px", fontSize: 24, fontWeight: 800, fontFamily: "var(--display)", letterSpacing: "-0.02em", flexDirection: "row", gap: 10 }}>
            <Icon name="camera" size={24} stroke={2.2} />{state.pose}
          </motion.div>
          <p className="r8-muted" style={{ fontSize: 15 }}>Front camera, good light, whole face in frame. No filters or sunglasses.</p>
          {preview && <img src={preview} alt="Your selfie preview" style={{ width: "100%", borderRadius: 24, objectFit: "cover", maxHeight: 440, border: "1px solid var(--line)" }} />}
          <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={pick} style={{ display: "none" }} />
          {!preview ? (
            <button className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" onClick={() => fileRef.current?.click()}><Icon name="camera" size={20} />Take selfie</button>
          ) : (
            <>
              <button className="r8-btn r8-btn--primary r8-btn--lg r8-btn--block" disabled={busy} onClick={submit}>{busy ? "Uploading..." : "Submit for review"}</button>
              <button className="r8-btn r8-btn--glass r8-btn--block" disabled={busy} onClick={() => fileRef.current?.click()}>Retake</button>
            </>
          )}
        </div>
      )}
    </OnboardShell>
  );
}
