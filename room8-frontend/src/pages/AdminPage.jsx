// Admin panel: review photo verifications, control school unlocks, see reports.
// Access is enforced by the backend (ADMIN_EMAILS env var); this page just hides itself.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminMe, adminListVerifications, adminReviewVerification,
  adminListSchools, adminUpdateSchool, adminListReports,
} from "../api";

const GOLD = "#f5a623";
const DARK = "#03040b";
const WHITE = "#ffffff";
const MUTED = "rgba(255,255,255,0.55)";
const CARD = "#0b1630";
const BORDER = "rgba(255,255,255,0.09)";
const JAKARTA = "'Plus Jakarta Sans', 'Inter', sans-serif";

const REJECT_REASONS = [
  "Pose not shown",
  "Face not clearly visible",
  "Does not match profile photos",
  "Photo looks edited or is a screenshot",
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(null);
  const [tab, setTab] = useState("verify");

  useEffect(() => {
    getAdminMe().then((r) => setAllowed(!!r.is_admin)).catch(() => setAllowed(false));
  }, []);

  if (allowed === null) return <Page><p style={muted}>Loading…</p></Page>;
  if (!allowed) return <Page><p style={muted}>Not authorized.</p><button style={btn()} onClick={() => navigate("/app")}>Back</button></Page>;

  return (
    <Page>
      <h1 style={{ margin: "0 0 14px", fontSize: "1.5rem", fontWeight: 800 }}>Room8 Admin</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {[["verify", "Photo verifications"], ["schools", "Schools"], ["reports", "Reports"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} style={btn(tab === k ? "gold" : "ghost")}>{label}</button>
        ))}
      </div>
      {tab === "verify" && <Verifications />}
      {tab === "schools" && <Schools />}
      {tab === "reports" && <Reports />}
    </Page>
  );
}

function Verifications() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => adminListVerifications("pending").then(setRows).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const review = async (id, approve, reason) => {
    setBusyId(id);
    try {
      await adminReviewVerification(id, approve, reason);
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (e) { setErr(e.message); }
    finally { setBusyId(null); }
  };

  if (err) return <p style={{ color: "#fca5a5" }}>{err}</p>;
  if (!rows) return <p style={muted}>Loading…</p>;
  if (!rows.length) return <p style={muted}>No verifications waiting. <button style={linkBtn} onClick={load}>Refresh</button></p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={muted}>{rows.length} waiting. Approve only if the selfie shows the requested pose and clearly matches the profile photos. Selfies are deleted automatically after you decide.</p>
      {rows.map((v) => (
        <div key={v.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 800 }}>{v.user.name}</div>
              <div style={{ ...muted, fontSize: 12 }}>{v.user.email} · {v.user.school || "No school"}</div>
            </div>
            <div style={{ color: GOLD, fontWeight: 700, fontSize: 13 }}>Pose: {v.pose}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 8 }}>
            <figure style={fig}>
              {v.selfie_url ? <img src={v.selfie_url} alt="Verification selfie" style={img} /> : <div style={{ ...img, display: "grid", placeItems: "center", ...muted }}>Missing</div>}
              <figcaption style={cap}>Selfie</figcaption>
            </figure>
            {v.user.photos.slice(0, 5).map((p, i) => (
              <figure key={p} style={fig}>
                <img src={p} alt={`Profile photo ${i + 1}`} style={img} />
                <figcaption style={cap}>Profile {i + 1}</figcaption>
              </figure>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <button disabled={busyId === v.id} style={btn("green")} onClick={() => review(v.id, true)}>Approve</button>
            {REJECT_REASONS.map((r) => (
              <button key={r} disabled={busyId === v.id} style={btn("red")} onClick={() => review(v.id, false, r)}>Reject: {r}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Schools() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const [drafts, setDrafts] = useState({});

  const load = () => adminListSchools().then(setRows).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const update = async (s, changes) => {
    if (changes.is_unlocked === false && !window.confirm(`Re-lock ${s.name}? Students there will go back to the waitlist.`)) return;
    try {
      const next = await adminUpdateSchool(s.id, changes);
      setRows((r) => r.map((x) => (x.id === s.id ? next : x)));
    } catch (e) { setErr(e.message); }
  };

  if (err) return <p style={{ color: "#fca5a5" }}>{err}</p>;
  if (!rows) return <p style={muted}>Loading…</p>;
  if (!rows.length) return <p style={muted}>No schools yet. Schools appear once a student picks one.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={muted}>Counts include only verified students with a confirmed school email. A school unlocks automatically at its threshold, or you can unlock it now (for pilots like Whitman).</p>
      {rows.map((s) => {
        const pct = Math.min(100, Math.round((s.verified_count / Math.max(1, s.unlock_threshold)) * 100));
        return (
          <div key={s.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontWeight: 800 }}>{s.name}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: s.is_unlocked ? "#86efac" : "#fcd34d" }}>
                {s.is_unlocked ? `Live (${s.unlocked_by})` : "Waitlist"}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,.08)", margin: "10px 0 6px", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: GOLD }} />
            </div>
            <div style={{ ...muted, fontSize: 13 }}>{s.verified_count} of {s.unlock_threshold} verified students</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 }}>
              <label style={{ ...muted, fontSize: 13 }}>Threshold</label>
              <input type="number" min={1} value={drafts[s.id] ?? s.unlock_threshold}
                onChange={(e) => setDrafts((d) => ({ ...d, [s.id]: e.target.value }))}
                style={{ width: 80, background: DARK, color: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 8px" }} />
              <button style={btn("ghost")} onClick={() => update(s, { unlock_threshold: Number(drafts[s.id] ?? s.unlock_threshold) })}>Save</button>
              {s.is_unlocked
                ? <button style={btn("red")} onClick={() => update(s, { is_unlocked: false })}>Re-lock</button>
                : <button style={btn("green")} onClick={() => update(s, { is_unlocked: true })}>Unlock now</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Reports() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { adminListReports().then(setRows).catch((e) => setErr(e.message)); }, []);
  if (err) return <p style={{ color: "#fca5a5" }}>{err}</p>;
  if (!rows) return <p style={muted}>Loading…</p>;
  if (!rows.length) return <p style={muted}>No reports.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((r) => (
        <div key={r.id} style={card}>
          <div style={{ fontWeight: 800 }}>{r.reported.name || r.reported.email || `User ${r.reported.id}`}</div>
          <div style={{ ...muted, fontSize: 12 }}>Reported by {r.reporter.email} · {new Date(r.created_at).toLocaleString()}</div>
          <div style={{ marginTop: 6, fontSize: 14 }}><b>{r.reason}</b>{r.notes ? `: ${r.notes}` : ""}</div>
        </div>
      ))}
    </div>
  );
}

function Page({ children }) {
  return (
    <div style={{ minHeight: "100dvh", background: DARK, color: WHITE, fontFamily: JAKARTA, padding: "calc(env(safe-area-inset-top,0px) + 20px) 16px 120px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

const muted = { margin: 0, color: MUTED, fontSize: 14, lineHeight: 1.5 };
const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 14 };
const fig = { margin: 0 };
const img = { width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 10, background: "#111" };
const cap = { fontSize: 11, color: MUTED, marginTop: 4, textAlign: "center" };
const linkBtn = { background: "none", border: "none", color: GOLD, cursor: "pointer", textDecoration: "underline", fontSize: 14 };
function btn(kind = "ghost") {
  const map = {
    gold: { background: GOLD, color: DARK, border: "none" },
    ghost: { background: "transparent", color: WHITE, border: `1px solid ${BORDER}` },
    green: { background: "rgba(34,197,94,.15)", color: "#86efac", border: "1px solid rgba(34,197,94,.4)" },
    red: { background: "rgba(239,68,68,.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,.35)" },
  };
  return { ...map[kind], padding: "8px 14px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: JAKARTA };
}
