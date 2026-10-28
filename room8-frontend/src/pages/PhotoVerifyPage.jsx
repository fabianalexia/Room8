// Photo verification: consent -> random pose -> selfie -> pending manual review.
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser, setCurrentUser, getPhotoVerificationStatus,
  startPhotoVerification, submitPhotoVerification,
} from "../api";
import { PhotoVerifiedCheck } from "../components/VerifiedBadge";

const GOLD = "#f5a623";
const GOLD2 = "#f5c842";
const DARK = "#03040b";
const WHITE = "#ffffff";
const MUTED = "rgba(255,255,255,0.55)";
const BLUE = "#1D9BF0";
const JAKARTA = "'Plus Jakarta Sans', 'Inter', sans-serif";

const POSE_EMOJI = {
  peace_sign: "✌️", thumbs_up: "👍", three_fingers: "3️⃣", hand_on_head: "🙋", point_up: "☝️", wave: "👋",
};

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
    <div style={{ minHeight: "100dvh", background: DARK, color: WHITE, fontFamily: JAKARTA, padding: "calc(env(safe-area-inset-top,0px) + 20px) 20px calc(env(safe-area-inset-bottom,0px) + 110px)", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ alignSelf: "flex-start", background: "none", border: "none", color: MUTED, fontSize: 14, cursor: "pointer", padding: 0 }}>← Back</button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PhotoVerifiedCheck verified size={30} />
          <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>Photo verification</h1>
        </div>

        {err && <div style={errBox}>{err}</div>}

        {!state && !err && <p style={muted}>Loading…</p>}

        {(status === "approved" || state?.is_photo_verified) && (
          <Card>
            <h2 style={h2}>You're verified</h2>
            <p style={muted}>Your blue check now shows on your profile and swipe card.</p>
            <button style={primaryBtn} onClick={() => navigate("/profile")}>Back to profile</button>
          </Card>
        )}

        {status === "pending" && (
          <Card>
            <h2 style={h2}>Under review</h2>
            <p style={muted}>We're checking your selfie against your profile photos. This usually takes less than a day. We'll notify you when it's done.</p>
            <button style={ghostBtn} onClick={refresh}>Check status</button>
          </Card>
        )}

        {(status === "none" || status === "rejected") && !state?.is_photo_verified && (
          <Card>
            {status === "rejected" && (
              <div style={errBox}>Not approved: {state.reject_reason || "photo did not match"}. You can try again.</div>
            )}
            <h2 style={h2}>Show it's really you</h2>
            <p style={muted}>
              Take a quick selfie copying a pose we give you. A Room8 team member compares it to your profile photos, then you get a blue check.
            </p>
            {!user?.photo && (
              <p style={{ ...muted, color: "#fcd34d" }}>Add a profile photo first so we have something to compare to.</p>
            )}
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: MUTED, lineHeight: 1.5, cursor: "pointer" }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0 }} />
              <span>
                I agree that Room8 may collect a selfie to confirm my identity. It is reviewed by a person, used only for verification,
                never shown on my profile, and deleted as soon as the review is finished. See the <a href="/privacy" style={{ color: GOLD }}>Privacy Policy</a>.
              </span>
            </label>
            <button style={{ ...primaryBtn, opacity: consent && user?.photo && !busy ? 1 : 0.5 }} disabled={!consent || !user?.photo || busy} onClick={begin}>
              {busy ? "Starting…" : "Start verification"}
            </button>
          </Card>
        )}

        {status === "awaiting_selfie" && (
          <Card>
            <p style={{ ...muted, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 }}>Your pose</p>
            <div style={{ fontSize: 64, lineHeight: 1 }}>{POSE_EMOJI[state.pose_code] || "📸"}</div>
            <h2 style={{ ...h2, textAlign: "center" }}>{state.pose}</h2>
            <p style={muted}>Use your front camera, good lighting, and keep your whole face in frame. No filters or sunglasses.</p>

            {preview && <img src={preview} alt="Your selfie preview" style={{ width: "100%", borderRadius: 16, objectFit: "cover", maxHeight: 420 }} />}

            <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={pick} style={{ display: "none" }} />
            {!preview ? (
              <button style={primaryBtn} onClick={() => fileRef.current?.click()}>Take selfie</button>
            ) : (
              <>
                <button style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={submit}>{busy ? "Uploading…" : "Submit for review"}</button>
                <button style={ghostBtn} disabled={busy} onClick={() => fileRef.current?.click()}>Retake</button>
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 20px", borderRadius: 24, background: "linear-gradient(160deg,#0d1e3e,#08142a 45%,#050c1a)", border: "1px solid rgba(255,255,255,.08)", textAlign: "center" }}>
      {children}
    </div>
  );
}

const h2 = { margin: 0, fontSize: "1.2rem", fontWeight: 800, color: WHITE };
const muted = { margin: 0, color: MUTED, fontSize: 14, lineHeight: 1.55 };
const errBox = { width: "100%", boxSizing: "border-box", background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.35)", color: "#fca5a5", borderRadius: 12, padding: "10px 14px", fontSize: 13 };
const primaryBtn = { width: "100%", background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: DARK, border: "none", padding: "14px 20px", borderRadius: 12, fontWeight: 800, fontSize: "1rem", cursor: "pointer", fontFamily: JAKARTA };
const ghostBtn = { width: "100%", background: "transparent", color: "#7cc4f7", border: `1px solid ${BLUE}66`, padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: "0.92rem", cursor: "pointer", fontFamily: JAKARTA };
