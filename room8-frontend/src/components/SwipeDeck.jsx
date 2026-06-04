import React, { useState, useEffect, useRef } from "react";
import {
  getCurrentUser, getCandidates, likeUser, skipUser,
  reportUser, blockUser, resendVerification,
} from "../api";
import { sendNotification } from "../notifications";
import VerifiedBadge from "./VerifiedBadge";

// ─── Palette ─────────────────────────────────────────────────────
const GOLD   = "#f5a623";
const GOLD2  = "#f5c842";
const DARK   = "#03040b";
const NAVY   = "#0F2D5E";
const WHITE  = "#ffffff";
const MUTED  = "rgba(255,255,255,0.45)";
const BORDER = "rgba(255,255,255,0.08)";
const JAKARTA = "'Plus Jakarta Sans', 'Inter', sans-serif";
const BEBAS   = "'Bebas Neue', cursive";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Demo profiles (fallback when no API candidates) ─────────────
const DEMO_PROFILES = [
  {
    id: "d1", name: "Maya Chen", firstName: "Maya", initials: "MC",
    sub: "UCLA · Junior · Computer Science", pct: 94, photo: null, isMatch: true,
    tags: [
      { label: "✓ Verified", bg: "rgba(34,197,94,.15)",  border: "rgba(34,197,94,.35)",  color: "#86efac" },
      { label: "CS Major",   bg: "rgba(59,130,246,.15)", border: "rgba(59,130,246,.35)", color: "#93c5fd" },
      { label: "Night Owl",  bg: "rgba(139,92,246,.15)", border: "rgba(139,92,246,.35)", color: "#c4b5fd" },
      { label: "Clean",      bg: "rgba(245,158,11,.15)", border: "rgba(245,158,11,.35)", color: "#fcd34d" },
    ],
  },
  {
    id: "d2", name: "Jordan Lee", firstName: "Jordan", initials: "JL",
    sub: "USC · Sophomore · Business", pct: 81, photo: null, isMatch: false,
    tags: [
      { label: "✓ Verified", bg: "rgba(34,197,94,.15)",  border: "rgba(34,197,94,.35)",  color: "#86efac" },
      { label: "Business",   bg: "rgba(59,130,246,.15)", border: "rgba(59,130,246,.35)", color: "#93c5fd" },
      { label: "Early Bird", bg: "rgba(139,92,246,.15)", border: "rgba(139,92,246,.35)", color: "#c4b5fd" },
      { label: "Relaxed",    bg: "rgba(245,158,11,.15)", border: "rgba(245,158,11,.35)", color: "#fcd34d" },
    ],
  },
  {
    id: "d3", name: "Priya Nair", firstName: "Priya", initials: "PN",
    sub: "NYU · Senior · Psychology", pct: 88, photo: null, isMatch: true,
    tags: [
      { label: "✓ Verified", bg: "rgba(34,197,94,.15)",  border: "rgba(34,197,94,.35)",  color: "#86efac" },
      { label: "Psychology", bg: "rgba(59,130,246,.15)", border: "rgba(59,130,246,.35)", color: "#93c5fd" },
      { label: "Flexible",   bg: "rgba(139,92,246,.15)", border: "rgba(139,92,246,.35)", color: "#c4b5fd" },
      { label: "Spotless",   bg: "rgba(245,158,11,.15)", border: "rgba(245,158,11,.35)", color: "#fcd34d" },
    ],
  },
  {
    id: "d4", name: "Marcus Webb", firstName: "Marcus", initials: "MW",
    sub: "Stanford · Junior · Engineering", pct: 76, photo: null, isMatch: false,
    tags: [
      { label: "✓ Verified",  bg: "rgba(34,197,94,.15)",  border: "rgba(34,197,94,.35)",  color: "#86efac" },
      { label: "Engineering", bg: "rgba(59,130,246,.15)", border: "rgba(59,130,246,.35)", color: "#93c5fd" },
      { label: "Night Owl",   bg: "rgba(139,92,246,.15)", border: "rgba(139,92,246,.35)", color: "#c4b5fd" },
      { label: "Casual",      bg: "rgba(245,158,11,.15)", border: "rgba(245,158,11,.35)", color: "#fcd34d" },
    ],
  },
  {
    id: "d5", name: "Sofia Reyes", firstName: "Sofia", initials: "SR",
    sub: "MIT · Freshman · Biology", pct: 91, photo: null, isMatch: true,
    tags: [
      { label: "✓ Verified", bg: "rgba(34,197,94,.15)",  border: "rgba(34,197,94,.35)",  color: "#86efac" },
      { label: "Biology",    bg: "rgba(59,130,246,.15)", border: "rgba(59,130,246,.35)", color: "#93c5fd" },
      { label: "Early Bird", bg: "rgba(139,92,246,.15)", border: "rgba(139,92,246,.35)", color: "#c4b5fd" },
      { label: "Clean",      bg: "rgba(245,158,11,.15)", border: "rgba(245,158,11,.35)", color: "#fcd34d" },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────
const COMPAT_KEYS = ["sleep_schedule","cleanliness","study_habits","guests","noise","social","partying","smoking"];
const SLEEP_MAP   = { early_bird: "Early Bird", night_owl: "Night Owl", flexible: "Flexible" };
const CLEAN_MAP   = { very_clean: "Spotless", clean: "Clean", relaxed: "Relaxed", messy: "Casual" };

function getCompatPercent(myP, theirP) {
  if (!myP || !theirP) return null;
  const match = COMPAT_KEYS.filter((k) => myP[k] && myP[k] === theirP[k]).length;
  return Math.round((match / COMPAT_KEYS.length) * 100);
}
function shortSchool(name) {
  if (!name) return null;
  const a = { "New York University (NYU)": "NYU", "Massachusetts Institute of Technology": "MIT" };
  return a[name] || (name.length > 20 ? name.slice(0, 18) + "…" : name);
}
function candidateToCard(c, viewerPrefs) {
  const prefs = c.dorm_prefs || {};
  const pct   = getCompatPercent(viewerPrefs, prefs);
  const tags  = [];
  if (c.is_verified_student) tags.push({ label: "✓ Verified", bg: "rgba(34,197,94,.15)",  border: "rgba(34,197,94,.35)",  color: "#86efac" });
  if (c.major)               tags.push({ label: c.major.slice(0,14), bg: "rgba(59,130,246,.15)", border: "rgba(59,130,246,.35)", color: "#93c5fd" });
  if (prefs.sleep_schedule && SLEEP_MAP[prefs.sleep_schedule]) tags.push({ label: SLEEP_MAP[prefs.sleep_schedule], bg: "rgba(139,92,246,.15)", border: "rgba(139,92,246,.35)", color: "#c4b5fd" });
  if (prefs.cleanliness && CLEAN_MAP[prefs.cleanliness])       tags.push({ label: CLEAN_MAP[prefs.cleanliness],   bg: "rgba(245,158,11,.15)", border: "rgba(245,158,11,.35)", color: "#fcd34d" });
  const parts = (c.name || "").split(" ");
  return {
    ...c,
    firstName: parts[0] || c.name,
    initials:  parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
    sub:       [c.class_year, c.major, shortSchool(c.school)].filter(Boolean).join(" · "),
    pct,
    tags:      tags.slice(0, 4),
    isMatch:   false,
  };
}

// ─── Report reasons ───────────────────────────────────────────────
const REPORT_REASONS = [
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "fake",          label: "Fake profile" },
  { value: "harassment",    label: "Harassment" },
  { value: "spam",          label: "Spam" },
  { value: "other",         label: "Other" },
];

function ReportModal({ person, userId, onClose, onDone }) {
  const [reason, setReason]         = useState("inappropriate");
  const [notes, setNotes]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await reportUser(userId, person.id, reason, notes);
      setDone(true);
      setTimeout(onDone, 1200);
    } catch { onClose(); } finally { setSubmitting(false); }
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,.7)",backdropFilter:"blur(8px)" }} onClick={onClose}>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#0A1628",borderRadius:20,padding:"28px 24px 32px",width:"calc(100% - 40px)",maxWidth:480,maxHeight:"90vh",overflowY:"auto",border:`1px solid ${BORDER}`,boxSizing:"border-box" }} onClick={(e)=>e.stopPropagation()}>
        {done ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:"2.5rem",marginBottom:12}}>✅</div>
            <p style={{color:WHITE,fontWeight:700,fontFamily:JAKARTA}}>Report submitted</p>
            <p style={{color:MUTED,fontSize:"0.88rem",fontFamily:JAKARTA}}>We'll review this profile shortly.</p>
          </div>
        ) : (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{color:WHITE,fontWeight:800,margin:0,fontFamily:JAKARTA}}>Report {person.name?.split(" ")[0]}</h3>
              <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",color:WHITE,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem"}}>✕</button>
            </div>
            <p style={{color:MUTED,fontSize:"0.85rem",marginBottom:16,fontFamily:JAKARTA}}>Why are you reporting this profile?</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
              {REPORT_REASONS.map((r) => (
                <button key={r.value} onClick={()=>setReason(r.value)} style={{padding:"12px 16px",borderRadius:8,textAlign:"left",background:reason===r.value?"rgba(245,158,11,.15)":"rgba(255,255,255,.05)",border:`1.5px solid ${reason===r.value?GOLD:BORDER}`,color:reason===r.value?GOLD:MUTED,fontWeight:reason===r.value?700:400,cursor:"pointer",fontSize:"0.9rem",fontFamily:JAKARTA}}>
                  {r.label}
                </button>
              ))}
            </div>
            <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Additional details (optional)…" rows={2} style={{width:"100%",background:"rgba(255,255,255,.05)",border:`1.5px solid ${BORDER}`,borderRadius:8,color:WHITE,padding:"10px 14px",fontSize:"0.88rem",fontFamily:JAKARTA,resize:"none",outline:"none",boxSizing:"border-box",marginBottom:18}} />
            <button onClick={handleSubmit} disabled={submitting} style={{width:"100%",padding:"13px",background:submitting?"rgba(245,158,11,.5)":GOLD,color:DARK,border:"none",borderRadius:8,fontWeight:700,fontSize:"0.95rem",cursor:submitting?"default":"pointer",fontFamily:JAKARTA}}>
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Profile Modal (full-screen detail view) ──────────────────────
export function ProfileModal({ person, onClose }) {
  const [activePhoto, setActivePhoto] = useState(0);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const allPhotos = [person.photo, ...(person.photos || [])].filter(Boolean);
  const prefs     = person.dorm_prefs || {};

  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:"#07111f",overflowY:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",msOverflowStyle:"none"}} className="r8-profile-modal">
      <div style={{maxWidth:640,margin:"0 auto",paddingBottom:48}}>
        <div style={{position:"relative",height:"52vh",minHeight:280}}>
          {allPhotos.length > 0 ? (
            <img src={allPhotos[activePhoto]} alt={person.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={(e)=>{e.target.onerror=null;e.target.src="/default-avatar.png";}} />
          ) : (
            <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#0A1628,#0F2D5E)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:"5rem",opacity:0.2}}>👤</span>
            </div>
          )}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(7,17,31,1) 0%,rgba(7,17,31,.3) 50%,transparent 100%)"}} />
          <button onClick={onClose} style={{position:"absolute",top:16,left:16,display:"flex",alignItems:"center",gap:6,background:"rgba(0,0,0,.55)",border:"1px solid rgba(255,255,255,.18)",color:WHITE,cursor:"pointer",fontSize:"0.88rem",fontWeight:600,padding:"8px 14px",borderRadius:20,backdropFilter:"blur(8px)",fontFamily:JAKARTA}}>← Back</button>
          {allPhotos.length > 1 && (
            <div style={{position:"absolute",bottom:10,left:12,right:12,display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>
              {allPhotos.map((p,i)=>(
                <img key={i} src={p} alt="" onClick={()=>setActivePhoto(i)} style={{width:44,height:44,borderRadius:8,objectFit:"cover",border:`2px solid ${i===activePhoto?GOLD:"rgba(255,255,255,.25)"}`,cursor:"pointer",flexShrink:0,opacity:i===activePhoto?1:.65,transition:"all .15s"}} onError={(e)=>{e.target.onerror=null;e.target.src="/default-avatar.png";}} />
              ))}
            </div>
          )}
          <div style={{position:"absolute",bottom:allPhotos.length>1?64:18,left:18,right:18}}>
            <div style={{display:"flex",alignItems:"baseline",gap:10}}>
              <h2 style={{margin:0,color:WHITE,fontSize:"clamp(1.6rem,6vw,2rem)",fontWeight:800,letterSpacing:"-0.025em",textShadow:"0 2px 12px rgba(0,0,0,.6)",fontFamily:JAKARTA}}>{person.name}</h2>
              {person.age && <span style={{color:"rgba(255,255,255,.7)",fontSize:"1.3rem",fontFamily:JAKARTA}}>{person.age}</span>}
            </div>
            <div style={{marginTop:6}}><VerifiedBadge isStudent={person.is_verified_student} size="sm" /></div>
            {(person.class_year||person.major) && <p style={{margin:"4px 0 0",color:"rgba(255,255,255,.65)",fontSize:"0.86rem",fontFamily:JAKARTA}}>{[person.class_year,person.major].filter(Boolean).join(" · ")}</p>}
          </div>
        </div>
        <div style={{padding:"18px 18px 36px"}}>
          {person.school && (
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.25)",borderRadius:8,padding:"5px 12px",marginBottom:16}}>
              <span style={{fontSize:"0.78rem"}}>🏫</span>
              <span style={{color:"rgba(245,158,11,.9)",fontSize:"0.82rem",fontWeight:600,fontFamily:JAKARTA}}>{person.school}</span>
            </div>
          )}
          {person.bio && (
            <div style={{marginBottom:20}}>
              <p style={{margin:"0 0 8px",color:"rgba(255,255,255,.4)",fontSize:"0.68rem",fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:JAKARTA}}>About</p>
              <p style={{margin:0,color:"rgba(255,255,255,.82)",fontSize:"0.92rem",lineHeight:1.68,fontFamily:JAKARTA}}>{person.bio}</p>
            </div>
          )}
          {person.looking_for && (
            <div style={{background:"rgba(245,158,11,.06)",border:"1px solid rgba(245,158,11,.18)",borderRadius:12,padding:"14px 16px"}}>
              <p style={{margin:"0 0 6px",color:"rgba(245,158,11,.65)",fontSize:"0.68rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:JAKARTA}}>Looking For</p>
              <p style={{margin:0,color:"rgba(255,255,255,.75)",fontSize:"0.9rem",lineHeight:1.62,fontStyle:"italic",fontFamily:JAKARTA}}>"{person.looking_for}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Match Overlay ────────────────────────────────────────────────
function MatchOverlay({ user, card, onChat, onKeepSwiping }) {
  const userInitials = (user?.name || "").split(" ").map((p)=>p[0]).join("").slice(0,2).toUpperCase() || "?";
  return (
    <div style={{
      position:"absolute",inset:0,zIndex:100,
      background:"rgba(3,4,11,.92)",
      backdropFilter:"blur(2px)",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      padding:"0 28px",
      animation:"fadeInOverlay .25s ease",
    }}>
      {/* Avatars + heart */}
      <div style={{display:"flex",alignItems:"center",marginBottom:28}}>
        <div style={{width:72,height:72,borderRadius:"50%",border:"3px solid "+GOLD,background:user?.photo?`url(${user.photo}) center/cover`:"linear-gradient(135deg,#1a3a6e,#0d1e3e)",display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontWeight:700,fontSize:"1.3rem",fontFamily:JAKARTA,marginRight:-16,zIndex:1,boxShadow:"0 0 24px rgba(245,166,35,.4)"}}>
          {!user?.photo && userInitials}
        </div>
        <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${GOLD},${GOLD2})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",zIndex:2,boxShadow:`0 0 20px rgba(245,166,35,.6)`,flexShrink:0}}>❤</div>
        <div style={{width:72,height:72,borderRadius:"50%",border:"3px solid "+GOLD,background:card?.photo?`url(${card.photo}) center/cover`:"linear-gradient(135deg,#1a3a6e,#0d1e3e)",display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontWeight:700,fontSize:"1.3rem",fontFamily:JAKARTA,marginLeft:-16,zIndex:1,boxShadow:"0 0 24px rgba(245,166,35,.4)"}}>
          {!card?.photo && (card?.initials || "?")}
        </div>
      </div>

      {/* Heading */}
      <h1 style={{fontFamily:BEBAS,fontSize:"3.2rem",letterSpacing:"0.08em",color:WHITE,margin:"0 0 6px",lineHeight:1,textAlign:"center"}}>
        It's a <span style={{color:GOLD}}>Match!</span>
      </h1>
      <p style={{color:"rgba(255,255,255,.6)",fontSize:"0.9rem",fontFamily:JAKARTA,margin:"0 0 36px",textAlign:"center",lineHeight:1.5}}>
        You and {card?.firstName} both liked each other
      </p>

      {/* Buttons */}
      <button onClick={onChat} style={{
        width:"100%",maxWidth:280,padding:"14px",marginBottom:12,
        background:`linear-gradient(135deg,${GOLD},${GOLD2})`,
        border:"none",borderRadius:40,
        color:DARK,fontWeight:700,fontSize:"1rem",fontFamily:JAKARTA,
        cursor:"pointer",
        boxShadow:`0 8px 28px rgba(245,166,35,.45)`,
        letterSpacing:"0.02em",
      }}>Start Chatting →</button>
      <button onClick={onKeepSwiping} style={{
        width:"100%",maxWidth:280,padding:"13px",
        background:"transparent",
        border:"1.5px solid rgba(255,255,255,.2)",
        borderRadius:40,color:"rgba(255,255,255,.6)",
        fontWeight:600,fontSize:"0.95rem",fontFamily:JAKARTA,
        cursor:"pointer",
      }}>Keep Swiping</button>
    </div>
  );
}

// ─── Canvas helpers ───────────────────────────────────────────────
const NEBULAS = [
  { xp:.15, yp:.25, color:[30,55,130],   op:.13, rx:180, ry:90  },
  { xp:.82, yp:.62, color:[130,40,80],   op:.09, rx:140, ry:80  },
  { xp:.50, yp:.08, color:[60,30,140],   op:.10, rx:200, ry:70  },
  { xp:.05, yp:.72, color:[20,80,60],    op:.08, rx:120, ry:90  },
  { xp:.90, yp:.18, color:[200,120,30],  op:.07, rx:110, ry:70  },
  { xp:.55, yp:.78, color:[40,90,160],   op:.07, rx:160, ry:80  },
];
const CONST_SHAPES = [
  [[.08,.12],[.12,.18],[.10,.25],[.15,.20],[.18,.14]],
  [[.72,.08],[.78,.06],[.76,.14],[.82,.10]],
  [[.28,.55],[.34,.52],[.38,.58],[.32,.62]],
  [[.60,.32],[.66,.28],[.70,.35],[.64,.40],[.68,.44]],
  [[.04,.42],[.09,.47],[.06,.53],[.13,.50]],
  [[.85,.72],[.89,.68],[.92,.74],[.88,.80],[.84,.76]],
];

function initStars(w, h) {
  const arr = [];
  const add = (n, rMin, rDr, baseMin, baseDr, amber) => {
    for (let i = 0; i < n; i++) arr.push({ x: Math.random()*w, y: Math.random()*h, r: rMin+Math.random()*rDr, phase: Math.random()*Math.PI*2, speed: .002+Math.random()*.006, base: baseMin+Math.random()*baseDr, amber });
  };
  add(220, .15, .50, .40, .50, false);
  add(60,  .50, .50, .50, .40, false);
  add(18, 1.00, .60, .60, .35, false);
  add(14,  .40, .80, .40, .50, true);
  return arr;
}

function mkShot(w, h, golden) {
  const ang = -Math.PI/6 + (Math.random()-.5)*(Math.PI/4);
  const spd = 6 + Math.random()*6;
  return { x:Math.random()*w*.8+w*.1, y:Math.random()*h*.3, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, life:1, decay:.022+Math.random()*.01, len:55+Math.random()*70, golden };
}

// ─── Star Canvas ──────────────────────────────────────────────────
function StarCanvas({ triggerRef }) {
  const cvRef  = useRef(null);
  const dataRef = useRef({ stars:[], shots:[], frame:0, w:0, h:0 });

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let rafId;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = cv.offsetWidth, h = cv.offsetHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      Object.assign(dataRef.current, { w, h, stars: initStars(w, h) });
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();

    triggerRef.current = {
      triggerMatch: () => {
        const { w, h } = dataRef.current;
        for (let i = 0; i < 7; i++) setTimeout(() => dataRef.current.shots.push(mkShot(w, h, i < 3)), i * 110);
      },
      triggerSuperLike: () => {
        const { w, h } = dataRef.current;
        for (let i = 0; i < 2; i++) setTimeout(() => dataRef.current.shots.push(mkShot(w, h, false)), i * 110);
      },
    };

    const draw = () => {
      const { w, h, stars, shots } = dataRef.current;
      const dpr = window.devicePixelRatio || 1;
      const f = ++dataRef.current.frame;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.fillStyle = "#03040b";
      ctx.fillRect(0, 0, w, h);

      // Nebulas
      for (const nb of NEBULAS) {
        const [nx, ny] = [nb.xp*w, nb.yp*h];
        ctx.save();
        ctx.translate(nx, ny);
        ctx.scale(1, nb.ry/nb.rx);
        const g = ctx.createRadialGradient(0,0,0,0,0,nb.rx);
        const [r,gr,b] = nb.color;
        g.addColorStop(0, `rgba(${r},${gr},${b},${nb.op})`);
        g.addColorStop(1, `rgba(${r},${gr},${b},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0,0,nb.rx,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }

      // Stars
      for (const s of stars) {
        const a = s.base * (.5 + .5*Math.sin(f*s.speed+s.phase));
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle = s.amber ? `rgba(255,200,90,${a})` : `rgba(210,225,255,${a})`;
        ctx.fill();
      }

      // Constellations
      for (const shape of CONST_SHAPES) {
        const pts = shape.map(([xp,yp]) => [xp*w, yp*h]);
        ctx.strokeStyle = "rgba(190,215,255,0.055)";
        ctx.lineWidth = .55;
        ctx.beginPath();
        pts.forEach(([x,y],i) => i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y));
        ctx.stroke();
        for (const [x,y] of pts) {
          ctx.beginPath(); ctx.arc(x,y,1.6,0,Math.PI*2);
          ctx.fillStyle = "rgba(210,230,255,0.5)"; ctx.fill();
        }
      }

      // Shooting stars
      dataRef.current.shots = shots.filter(s => s.life > 0);
      for (const s of dataRef.current.shots) {
        const spd = Math.hypot(s.vx, s.vy);
        const [tx, ty] = [s.x - s.vx/spd*s.len, s.y - s.vy/spd*s.len];
        const g = ctx.createLinearGradient(s.x,s.y,tx,ty);
        const c = s.golden ? "255,200,90" : "210,225,255";
        g.addColorStop(0, `rgba(${c},${s.life})`);
        g.addColorStop(1, `rgba(${c},0)`);
        ctx.strokeStyle = g; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(tx,ty); ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x,s.y,2,0,Math.PI*2);
        ctx.fillStyle = `rgba(${c},${s.life})`; ctx.fill();
        s.x += s.vx; s.y += s.vy; s.life -= s.decay;
      }

      // Ambient shooting star
      if (f % 300 === 0 && Math.random() < .7)
        dataRef.current.shots.push(mkShot(dataRef.current.w, dataRef.current.h, false));

      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  return <canvas ref={cvRef} style={{ position:"absolute",inset:0,width:"100%",height:"100%",zIndex:0,display:"block" }} />;
}

// ─── Action Buttons ───────────────────────────────────────────────
function PassButton({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      width:62,height:62,borderRadius:"50%",flexShrink:0,
      background: hov ? "rgba(239,68,68,.15)" : "rgba(255,255,255,.06)",
      border: `1.5px solid ${hov?"#ef4444":"rgba(255,255,255,.18)"}`,
      color: hov ? "#ef4444" : "rgba(255,255,255,.6)",
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:"1.5rem",cursor:"pointer",
      boxShadow: hov ? "0 0 24px rgba(239,68,68,.3)" : "0 4px 20px rgba(0,0,0,.3)",
      transition:"all .2s",
    }}>✕</button>
  );
}
function SuperButton({ onClick, popped }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      width:54,height:54,borderRadius:"50%",flexShrink:0,
      background: "rgba(59,130,246,.12)",
      border: `1.5px solid ${hov?"#60a5fa":"rgba(59,130,246,.4)"}`,
      color: hov ? "#93c5fd" : "#60a5fa",
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:"1.25rem",cursor:"pointer",
      boxShadow: hov ? "0 0 20px rgba(59,130,246,.3)" : "0 4px 16px rgba(0,0,0,.25)",
      transition:"all .2s",
      transform: popped ? "scale(1.2)" : "scale(1)",
    }}>⭐</button>
  );
}
function LikeButton({ onClick }) {
  const [hov, setHov]   = useState(false);
  const [pop, setPop]   = useState(false);
  const handleClick = () => {
    setPop(true);
    setTimeout(() => setPop(false), 500);
    onClick();
  };
  return (
    <button onClick={handleClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{
      width:78,height:78,borderRadius:"50%",flexShrink:0,
      background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
      border:"none",
      color:DARK,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:"2rem",cursor:"pointer",
      boxShadow:`0 8px 32px rgba(245,166,35,${hov?.6:.45})`,
      transition:"box-shadow .2s, transform .15s",
      transform: pop ? "scale(1.18)" : hov ? "scale(1.05)" : "scale(1)",
      animation: pop ? "springPop .45s cubic-bezier(.34,1.56,.64,1)" : "none",
    }}>♥</button>
  );
}

// ─── Main SwipeDeck ───────────────────────────────────────────────
export default function SwipeDeck() {
  const user        = getCurrentUser();
  const viewerPrefs = user?.dorm_prefs || {};

  const [candidates,  setCandidates]  = useState([]);
  const [idx,         setIdx]         = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [showMatch,   setShowMatch]   = useState(false);
  const [matchCard,   setMatchCard]   = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const [resendSent,   setResendSent]   = useState(false);
  const [superPop,     setSuperPop]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [swiping,      setSwiping]      = useState(false);

  const cardRef     = useRef(null);
  const likeRef     = useRef(null);
  const nopeRef     = useRef(null);
  const menuRef     = useRef(null);
  const dragRef     = useRef({ active:false, startX:0, startY:0 });
  const triggerRef  = useRef(null);

  // ── Load candidates ──────────────────────────────────────────
  const load = (reset=false) => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    getCandidates(user.id, reset)
      .then((d) => { setCandidates(d); setIdx(0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(false); }, []); // eslint-disable-line

  // Use demo profiles when no real candidates
  const deck    = candidates.length > 0 ? candidates.map((c) => candidateToCard(c, viewerPrefs)) : DEMO_PROFILES;
  const usesDemo = candidates.length === 0;
  const current = idx < deck.length ? deck[idx] : null;

  // ── Direct-DOM transform helpers ─────────────────────────────
  const applyXY = (x, y, tr) => {
    if (!cardRef.current) return;
    const rot = Math.max(-18, Math.min(18, x/20));
    cardRef.current.style.transition = tr || "none";
    cardRef.current.style.transform  = `translate(${x}px,${y}px) rotate(${rot}deg)`;
    if (likeRef.current) likeRef.current.style.opacity  = x > 0 ? Math.min(1, x/60)  : 0;
    if (nopeRef.current) nopeRef.current.style.opacity  = x < 0 ? Math.min(1,-x/60)  : 0;
  };
  const resetCard = () => applyXY(0, 0, "none");

  // ── Swipe logic ───────────────────────────────────────────────
  const doSwipe = async (dir, candidate) => {
    if (swiping || !candidate) return;
    setSwiping(true);
    const flyX = dir === "right" ? 700 : -700;
    applyXY(flyX, -80, "transform .35s ease-in");
    await sleep(350);
    setIdx((p) => p + 1);
    resetCard();
    setSwiping(false);

    if (usesDemo) {
      // Demo mode: simulate match based on isMatch flag
      if (dir === "right" && candidate.isMatch) {
        await sleep(220);
        setMatchCard(candidate);
        setShowMatch(true);
        triggerRef.current?.triggerMatch();
      }
      return;
    }

    // Real API
    try {
      if (dir === "right") {
        const res = await likeUser(user.id, candidate.id);
        if (res?.matched) {
          await sleep(220);
          setMatchCard(candidate);
          setShowMatch(true);
          triggerRef.current?.triggerMatch();
          sendNotification("You have a new match on Room8!", `You and ${candidate.firstName} liked each other.`);
        }
      } else {
        await skipUser(user.id, candidate.id);
      }
    } catch (err) { console.error(err); }
  };

  const doSuperLike = async () => {
    if (!current) return;
    setSuperPop(true);
    setTimeout(() => setSuperPop(false), 500);
    triggerRef.current?.triggerSuperLike();
    await doSwipe("right", current);
  };

  // ── Pointer drag ──────────────────────────────────────────────
  const onPtrDown = (e) => {
    if (swiping || !current || e.target.closest("[data-menu]")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { active:true, startX:e.clientX, startY:e.clientY };
    applyXY(0, 0, "none");
  };
  const onPtrMove = (e) => {
    if (!dragRef.current.active) return;
    const x = e.clientX - dragRef.current.startX;
    const y = e.clientY - dragRef.current.startY;
    applyXY(x, y, "none");
    dragRef.current.lastX = x;
    dragRef.current.lastY = y;
  };
  const onPtrUp = (e) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const x = dragRef.current.lastX || 0;
    if (Math.abs(x) > 105) {
      doSwipe(x > 0 ? "right" : "left", current);
    } else {
      applyXY(0, 0, "transform .5s cubic-bezier(.34,1.56,.64,1)");
    }
  };

  // ── Button swipe ──────────────────────────────────────────────
  const btnSwipe = (dir) => doSwipe(dir, current);

  // ── Menu close on outside click ───────────────────────────────
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  // ── Render helpers ────────────────────────────────────────────
  const CARD_W = "min(420px, calc(100vw - 40px))";
  const CARD_H = "min(calc(100vh - 220px), 78vh)";

  const renderDeck = () => {
    if (!current) return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:500,textAlign:"center",padding:32}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:`rgba(245,158,11,.12)`,border:`1px solid rgba(245,158,11,.35)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",marginBottom:16}}>✓</div>
        <p style={{color:WHITE,fontSize:"1.05rem",fontWeight:700,margin:"0 0 8px",fontFamily:JAKARTA}}>You've seen everyone!</p>
        <p style={{color:MUTED,fontSize:"0.88rem",marginBottom:24,fontFamily:JAKARTA}}>Check back later for new profiles.</p>
        <button onClick={()=>load(true)} style={{background:GOLD,color:DARK,border:"none",padding:"12px 28px",borderRadius:8,fontWeight:700,fontSize:"0.95rem",cursor:"pointer",fontFamily:JAKARTA,boxShadow:"0 4px 20px rgba(245,158,11,.35)"}}>Refresh</button>
      </div>
    );

    const ghost = (t, s, r, op) => (
      <div style={{ position:"absolute",inset:0,borderRadius:28,background:"linear-gradient(160deg,#0d1e3e,#08142a 45%,#050c1a)",border:"1px solid rgba(255,255,255,.06)",transform:`translateY(${t}px) scale(${s}) rotate(${r}deg)`,opacity:op,pointerEvents:"none" }} />
    );

    const photo = current.profilePhoto || current.photo || null;

    return (
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
        {/* Card stack */}
        <div style={{position:"relative",width:CARD_W,height:CARD_H,flexShrink:0,maxWidth:"100%",overflow:"hidden",borderRadius:28}}>
          {ghost(18,.94, 2,.3)}
          {ghost( 9,.97,-1,.5)}

          {/* Main card */}
          <div
            ref={cardRef}
            onPointerDown={onPtrDown}
            onPointerMove={onPtrMove}
            onPointerUp={onPtrUp}
            style={{
              position:"absolute",inset:0,
              borderRadius:28,
              background:"linear-gradient(160deg,#0d1e3e 0%,#08142a 45%,#050c1a 100%)",
              border:"1px solid rgba(255,255,255,.08)",
              boxShadow:"0 24px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.03)",
              cursor:"grab",userSelect:"none",touchAction:"none",
              willChange:"transform",overflow:"hidden",
            }}
          >
            {/* LIKE hint */}
            <div ref={likeRef} style={{position:"absolute",top:28,right:20,zIndex:31,border:"3px solid "+GOLD,color:GOLD,borderRadius:8,padding:"4px 14px",fontFamily:BEBAS,fontSize:"1.8rem",letterSpacing:2,opacity:0,pointerEvents:"none",textShadow:`0 0 20px rgba(245,166,35,.8)`}}>LIKE</div>
            {/* NOPE hint */}
            <div ref={nopeRef} style={{position:"absolute",top:28,left:20,zIndex:31,border:"3px solid #ef4444",color:"#ef4444",borderRadius:8,padding:"4px 14px",fontFamily:BEBAS,fontSize:"1.8rem",letterSpacing:2,opacity:0,pointerEvents:"none",textShadow:"0 0 20px rgba(239,68,68,.8)"}}>NOPE</div>

            {/* Top row */}
            <div style={{position:"absolute",top:0,left:0,right:0,padding:"16px 16px 0",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:30}}>
              {current.pct !== null && current.pct !== undefined ? (
                <div style={{background:"rgba(245,166,35,.18)",border:"1px solid rgba(245,166,35,.45)",borderRadius:20,padding:"4px 12px",display:"flex",alignItems:"center",gap:4}}>
                  <span style={{color:GOLD2,fontWeight:800,fontSize:"0.88rem",fontFamily:JAKARTA}}>{current.pct}%</span>
                  <span style={{color:"rgba(245,166,35,.7)",fontSize:"0.68rem",fontWeight:600,fontFamily:JAKARTA}}>match</span>
                </div>
              ) : <div />}
              {/* 3-dot menu */}
              <div ref={menuRef} data-menu="true" style={{position:"relative"}}>
                <button onClick={(e)=>{e.stopPropagation();setMenuOpen(v=>!v);}} style={{background:"rgba(3,4,11,.6)",border:"1px solid rgba(255,255,255,.12)",color:WHITE,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)"}}>⋯</button>
                {menuOpen && (
                  <div onClick={(e)=>e.stopPropagation()} style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#0e1f3d",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,.6)",minWidth:148,zIndex:30}}>
                    {[{label:"Report 🚩",fn:()=>{setMenuOpen(false);setReportTarget(candidates[idx]||current);}},{label:"Block 🚫",fn:async()=>{setMenuOpen(false);setIdx(p=>p+1);if(!usesDemo)try{await blockUser(user.id,candidates[idx].id);}catch(e){console.error(e);}}}].map(item=>(
                      <button key={item.label} onClick={(e)=>{e.stopPropagation();item.fn();}} style={{display:"block",width:"100%",padding:"11px 16px",background:"none",border:"none",color:"#f87171",fontSize:"0.85rem",cursor:"pointer",textAlign:"left",fontFamily:JAKARTA}}>{item.label}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Photo zone — full bleed, or initials fallback */}
            <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,overflow:"hidden",borderRadius:28}}>
              {photo ? (
                <img
                  src={photo} alt={current.name} draggable={false}
                  onError={(e)=>{ e.target.onerror=null; e.target.style.display="none"; }}
                  style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"contain",background:"#0F2D5E",pointerEvents:"none"}}
                />
              ) : (
                <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#1a3560,#0d1e3e)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,.08)",border:"2px solid rgba(245,166,35,.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",color:"rgba(255,255,255,.65)",fontFamily:JAKARTA,fontWeight:700}}>
                    {current.initials || "?"}
                  </div>
                </div>
              )}
              {/* Gradient scrim */}
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:140,background:"linear-gradient(to top,#08142a 0%,transparent 100%)",pointerEvents:"none"}} />
            </div>

            {/* Info zone — overlaps scrim */}
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px"}}>
              <h2 style={{margin:"0 0 3px",fontFamily:JAKARTA,fontSize:26,fontWeight:700,color:WHITE,lineHeight:1.15,textShadow:"0 2px 8px rgba(0,0,0,.5)"}}>{current.name}</h2>
              <p style={{margin:"0 0 12px",fontFamily:JAKARTA,fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.5}}>{current.sub || "\u00a0"}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {current.tags.map((t,i)=>(
                  <span key={i} style={{background:t.bg,border:`1px solid ${t.border}`,color:t.color,padding:"4px 11px",borderRadius:20,fontSize:"0.7rem",fontWeight:600,fontFamily:JAKARTA}}>{t.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Match overlay — inside card stack */}
          {showMatch && matchCard && (
            <MatchOverlay
              user={user}
              card={matchCard}
              onChat={()=>{ setShowMatch(false); }}
              onKeepSwiping={()=>setShowMatch(false)}
            />
          )}
        </div>

        {/* Action buttons */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:18,marginTop:26,marginBottom:70,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
          <PassButton  onClick={()=>btnSwipe("left")} />
          <SuperButton onClick={doSuperLike} popped={superPop} />
          <LikeButton  onClick={()=>btnSwipe("right")} />
        </div>
      </div>
    );
  };

  return (
    <div style={{
      flex:1,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
      width:"100%",height:"100%",
      paddingTop:80,paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 80px)",
      position:"relative",overflow:"clip",
      boxSizing:"border-box",background:DARK,
    }}>
      {/* Canvas */}
      <StarCanvas triggerRef={triggerRef} />

      {/* Top bar */}
      <div style={{position:"absolute",top:0,left:0,right:0,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:50,background:"rgba(3,4,11,.85)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
        <span style={{fontSize:"1.4rem",fontFamily:BEBAS,color:GOLD,letterSpacing:"0.1em",flexShrink:0}}>ROOM8</span>
        {user?.school && (
          <span style={{background:"rgba(245,158,11,.12)",color:"rgba(245,158,11,.85)",padding:"4px 12px",borderRadius:6,fontSize:"0.72rem",fontWeight:600,border:"1px solid rgba(245,158,11,.25)",maxWidth:"calc(100% - 120px)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:JAKARTA}}>
            {shortSchool(user.school)}
          </span>
        )}
        {user && (
          <div style={{width:34,height:34,borderRadius:"50%",background:user.photo?`url(${user.photo}) center/cover`:NAVY,display:"flex",alignItems:"center",justifyContent:"center",color:WHITE,fontWeight:700,fontSize:"0.85rem",flexShrink:0,border:"2px solid rgba(245,158,11,.4)",fontFamily:JAKARTA}}>
            {!user.photo && (user.name?.[0]?.toUpperCase()||"?")}
          </div>
        )}
      </div>

      {/* Email banner */}
      {user && user.email_verified === false && (
        <div style={{position:"absolute",top:64,left:0,right:0,zIndex:90,background:"rgba(245,158,11,.12)",borderBottom:"1px solid rgba(245,158,11,.25)",padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <span style={{color:"rgba(245,158,11,.9)",fontSize:"0.8rem",fontWeight:600,fontFamily:JAKARTA}}>⚠ Please verify your email — check your inbox</span>
          <button onClick={async()=>{try{await resendVerification(user.id);setResendSent(true);setTimeout(()=>setResendSent(false),4000);}catch(e){console.error(e);}}} style={{background:"none",border:"1px solid rgba(245,158,11,.4)",color:GOLD,padding:"4px 12px",borderRadius:6,fontSize:"0.75rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:JAKARTA}}>
            {resendSent ? "Sent ✓" : "Resend"}
          </button>
        </div>
      )}

      {/* Content */}
      <div style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center",width:"100%",maxWidth:"100vw",overflow:"hidden"}}>
        {loading ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
            <div style={{width:36,height:36,border:"2.5px solid rgba(255,255,255,.1)",borderTop:`2.5px solid ${GOLD}`,borderRadius:"50%",animation:"r8spin .8s linear infinite"}} />
            <p style={{color:MUTED,fontSize:"0.9rem",fontFamily:JAKARTA}}>Finding roommates…</p>
          </div>
        ) : !user ? (
          <p style={{color:MUTED,fontFamily:JAKARTA}}>Please log in to browse candidates.</p>
        ) : renderDeck()}
      </div>

      {/* Report modal */}
      {reportTarget && (
        <ReportModal person={reportTarget} userId={user.id} onClose={()=>setReportTarget(null)}
          onDone={()=>{setReportTarget(null);setIdx(p=>p+1);}} />
      )}

      {/* Profile modal */}
      {profileModal && <ProfileModal person={profileModal} onClose={()=>setProfileModal(null)} />}

      <style>{`
        @keyframes r8spin { to { transform: rotate(360deg); } }
        @keyframes fadeInOverlay { from { opacity:0; } to { opacity:1; } }
        @keyframes springPop { 0%{transform:scale(1)} 40%{transform:scale(1.22)} 70%{transform:scale(.95)} 100%{transform:scale(1)} }
        .r8-pulse-ring-outer { animation: r8pulseOut 2.4s ease-in-out infinite; }
        .r8-pulse-ring-inner { animation: r8pulseIn  2.4s ease-in-out infinite .5s; }
        @keyframes r8pulseOut { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.09);opacity:.2} }
        @keyframes r8pulseIn  { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.07);opacity:.25} }
        .r8-profile-modal::-webkit-scrollbar { display:none; }
        @keyframes slideDown { from{opacity:0;transform:translateX(-50%) translateY(-12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>
    </div>
  );
}
