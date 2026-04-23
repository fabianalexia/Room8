// src/Home.jsx — Cinematic atmosphere: fog, cursor, parallax, word-reveal
import React, {
  useRef, useEffect, useState, useCallback,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser } from "./api";
import {
  motion, useScroll, useTransform, useInView,
  animate, useMotionValue, useSpring,
} from "framer-motion";
import * as THREE from "three";

/* ─── Brand tokens ──────────────────────────────────────────────── */
const DARK   = "#050D1F";
const NAVY   = "#0F2D5E";
const BLUE   = "#2563EB";
const GOLD   = "#F59E0B";
const GOLD_D = "#D97706";
const WHITE  = "#FFFFFF";
const MUTED  = "#94A3B8";
const SURF   = "#F8F9FA";
const BORD   = "#E5E7EB";
const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

/* ─── Static data ───────────────────────────────────────────────── */
const MOCK_PROFILES = [
  { name: "Priya S.",  school: "Stanford University",       major: "Computer Science", compat: 94, initials: "PS", grad: "135deg,#3b82f6,#1d4ed8",   tags: ["Early Bird 🌅","Clean ✨"] },
  { name: "James K.",  school: "Harvard University",        major: "Economics",        compat: 88, initials: "JK", grad: "135deg,#10b981,#065f46",   tags: ["Night Owl 🦉","Quiet 📚"] },
  { name: "Sofia M.",  school: "UCLA",                      major: "Design",           compat: 91, initials: "SM", grad: "135deg,#8b5cf6,#5b21b6",   tags: ["Social 🎉","Tidy ✅"]    },
  { name: "Tyler B.",  school: "University of Michigan",    major: "Engineering",      compat: 86, initials: "TB", grad: "135deg,#f59e0b,#b45309",   tags: ["Gym 💪","Chill 😌"]      },
];
const UNIVERSITIES = [
  "Stanford University","Harvard University","MIT","UCLA","University of Michigan",
  "New York University","Georgetown University","Boston University","Duke University",
  "USC","Northwestern","Cornell University","Yale University","Columbia University",
  "UChicago","Vanderbilt","Emory University","UC Berkeley","Notre Dame","UNC Chapel Hill",
];
const FEATURES = [
  { icon:"🏫", title:"School Verified",    desc:"Every profile is verified to your institution. Only real students from your campus — zero impostors, zero strangers.", badge:"Campus Only"  },
  { icon:"🎯", title:"Deep Compatibility", desc:"We match on sleep schedules, study habits, cleanliness, and noise tolerance — the things that actually matter when you share a space.", badge:"AI Matched"  },
  { icon:"🔒", title:"Built-In Safety",    desc:"Verified profiles, built-in reporting, and block tools. Your wellbeing is a core feature of Room8, not an afterthought.", badge:"Trusted & Safe" },
  { icon:"💬", title:"Instant Messaging",  desc:"Mutual match? Start chatting immediately. No housing office emails, no awkward Facebook group posts.", badge:"Real-Time"    },
];
const STEPS = [
  { n:"01", icon:"👤", title:"Build Your Profile",     desc:"Add your photo, bio, school, and living preferences in under 5 minutes. Be honest — better profile = better match." },
  { n:"02", icon:"🔍", title:"Discover Your Campus",   desc:"Browse verified students from your school. Our algorithm shows your strongest compatibility matches first."         },
  { n:"03", icon:"✨", title:"Match & Move In",         desc:"Swipe right, get a mutual match, and start the conversation. From first match to move-in day — Room8 is with you." },
];
const TESTIMONIALS = [
  { quote:"Room8 is what dorm housing should have always been. Found my junior year apartment roommate in a week. Same sleep schedule, same study habits — we get along perfectly.",           name:"Maya R.",      school:"University of Michigan", year:"Junior",            stars:5 },
  { quote:"As a Resident Life coordinator, I recommend Room8 to every incoming student. The school verification gives us — and parents — genuine peace of mind.",                            name:"Dr. James T.", school:"Boston University",       year:"Resident Director", stars:5 },
  { quote:"I was nervous about going off-campus. Room8's compatibility score was spot-on. Eight months in, zero conflicts about cleaning or noise. I couldn't ask for a better roommate.",    name:"Carlos M.",    school:"UCLA",                     year:"Senior",            stars:5 },
];

/* ══════════════════════════════════════════════════════════════════
   CUSTOM CURSOR — trailing gold ring
══════════════════════════════════════════════════════════════════ */
function CustomCursor() {
  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);

  // Ring lags with spring
  const ringX = useSpring(rawX, { stiffness: 90, damping: 22 });
  const ringY = useSpring(rawY, { stiffness: 90, damping: 22 });

  const [hov, setHov] = useState(false);
  const [click, setClick] = useState(false);

  // Centered offset transforms
  const dotTX  = useTransform(rawX,  v => v - 3);
  const dotTY  = useTransform(rawY,  v => v - 3);
  const ringTX = useTransform(ringX, v => v - 16);
  const ringTY = useTransform(ringY, v => v - 16);

  useEffect(() => {
    const onMove = (e) => { rawX.set(e.clientX); rawY.set(e.clientY); };
    const onDown = () => setClick(true);
    const onUp   = () => setClick(false);
    const onOver = (e) => {
      const el = e.target;
      setHov(!!(el.closest("a,button") || ["INPUT","TEXTAREA","SELECT"].includes(el.tagName)));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    document.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      document.removeEventListener("mouseover", onOver);
    };
  }, [rawX, rawY]);

  return (
    <>
      {/* Dot */}
      <motion.div
        style={{
          position:"fixed", left:0, top:0, pointerEvents:"none", zIndex:99999,
          x: dotTX, y: dotTY,
          width: 6, height: 6, borderRadius:"50%",
          background: hov ? GOLD : "rgba(255,255,255,0.9)",
        }}
        animate={{ scale: click ? 0.5 : hov ? 1.8 : 1 }}
        transition={{ type:"spring", stiffness:400, damping:18 }}
      />
      {/* Ring */}
      <motion.div
        style={{
          position:"fixed", left:0, top:0, pointerEvents:"none", zIndex:99998,
          x: ringTX, y: ringTY,
          borderRadius:"50%",
          border: `1.5px solid ${hov ? GOLD : "rgba(245,158,11,0.5)"}`,
        }}
        animate={{
          width:  click ? 20 : hov ? 44 : 32,
          height: click ? 20 : hov ? 44 : 32,
          opacity: click ? 0.6 : 1,
        }}
        transition={{ type:"spring", stiffness:240, damping:22 }}
      />
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════
   THREE.JS PARTICLE CANVAS — pulsing stars + network
══════════════════════════════════════════════════════════════════ */
function ParticleCanvas({ mouseRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.offsetWidth || window.innerWidth;
    const H = canvas.offsetHeight || window.innerHeight;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Blue-indigo particles
    const N = 160, pts = [], flat = [];
    for (let i = 0; i < N; i++) {
      const x=(Math.random()-0.5)*20, y=(Math.random()-0.5)*11, z=(Math.random()-0.5)*7;
      pts.push({x,y,z}); flat.push(x,y,z);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.Float32BufferAttribute(flat,3));
    const pMat = new THREE.PointsMaterial({ color:0x3b82f6, size:0.058, transparent:true, opacity:0.85, blending:THREE.AdditiveBlending, depthWrite:false });
    const pointsMesh = new THREE.Points(pGeo, pMat);

    // Network lines (precomputed)
    const lineFlat=[], THRESH=3.6;
    for (let i=0;i<N;i++) for (let j=i+1;j<N;j++){
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, dz=pts[i].z-pts[j].z;
      if (dx*dx+dy*dy+dz*dz < THRESH*THRESH)
        lineFlat.push(pts[i].x,pts[i].y,pts[i].z, pts[j].x,pts[j].y,pts[j].z);
    }
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineFlat,3));
    const linesMesh = new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color:0x1d4ed8, transparent:true, opacity:0.14, blending:THREE.AdditiveBlending, depthWrite:false }));

    // Gold accent particles
    const gFlat=[];
    for (let i=0;i<40;i++) gFlat.push((Math.random()-0.5)*18,(Math.random()-0.5)*9,(Math.random()-0.5)*3+1);
    const gGeo = new THREE.BufferGeometry();
    gGeo.setAttribute("position", new THREE.Float32BufferAttribute(gFlat,3));
    const gMat = new THREE.PointsMaterial({ color:0xf59e0b, size:0.045, transparent:true, opacity:0.55, blending:THREE.AdditiveBlending, depthWrite:false });
    const goldMesh = new THREE.Points(gGeo, gMat);

    const group = new THREE.Group();
    group.add(pointsMesh); group.add(linesMesh);
    scene.add(group); scene.add(goldMesh);

    const onResize = () => {
      const w=canvas.offsetWidth, h=canvas.offsetHeight;
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
    };
    window.addEventListener("resize", onResize);

    let raf;
    const clock = new THREE.Clock();
    const loop = () => {
      const t = clock.getElapsedTime();
      group.rotation.y = t*0.022;
      group.rotation.x = t*0.011;
      goldMesh.rotation.z = t*0.008;

      // Pulsing opacity
      pMat.opacity = 0.65 + Math.sin(t*1.3)*0.22;
      gMat.opacity = 0.38 + Math.sin(t*1.9+1.2)*0.18;

      const mx=(mouseRef.current?.x||0)*2.2;
      const my=-(mouseRef.current?.y||0)*1.1;
      camera.position.x += (mx-camera.position.x)*0.025;
      camera.position.y += (my-camera.position.y)*0.025;
      camera.lookAt(0,0,0);
      renderer.render(scene,camera);
      raf=requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",onResize);
      renderer.dispose();
    };
  }, [mouseRef]);

  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />;
}

/* ══════════════════════════════════════════════════════════════════
   FOG LAYERS — VERY VISIBLE animated mist
══════════════════════════════════════════════════════════════════ */
function FogLayers() {
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1, overflow:"hidden" }}>
      {/* MASSIVE white/blue fog blob — upper left, very obvious */}
      <motion.div
        animate={{ x:[-60,80,-60], opacity:[0.55,0.85,0.55] }}
        transition={{ duration:18, repeat:Infinity, ease:"easeInOut" }}
        style={{
          position:"absolute", width:"80%", height:"70%", top:"-20%", left:"-10%",
          background:"radial-gradient(ellipse at 40% 50%, rgba(120,160,255,0.28) 0%, rgba(37,99,235,0.15) 40%, transparent 70%)",
          filter:"blur(40px)",
        }}
      />
      {/* BRIGHT blue orb — center-right, very visible */}
      <motion.div
        animate={{ x:[50,-70,50], y:[-20,30,-20], opacity:[0.5,0.9,0.5] }}
        transition={{ duration:22, repeat:Infinity, ease:"easeInOut" }}
        style={{
          position:"absolute", width:"55%", height:"60%", top:"10%", right:"-5%",
          background:"radial-gradient(ellipse at 50% 50%, rgba(99,148,255,0.35) 0%, rgba(37,99,235,0.18) 45%, transparent 70%)",
          filter:"blur(36px)",
        }}
      />
      {/* WHITE mist streak — horizontal, sweeping */}
      <motion.div
        animate={{ x:[-120,120,-120], opacity:[0.2,0.55,0.2] }}
        transition={{ duration:15, repeat:Infinity, ease:"easeInOut" }}
        style={{
          position:"absolute", width:"160%", height:"18%", top:"38%", left:"-30%",
          background:"radial-gradient(ellipse 100% 100% at 50% 50%, rgba(200,220,255,0.22) 0%, rgba(100,150,255,0.1) 50%, transparent 70%)",
          filter:"blur(50px)",
        }}
      />
      {/* GOLD atmospheric haze — glowing pulse */}
      <motion.div
        animate={{ opacity:[0.2,0.65,0.2], scale:[0.85,1.15,0.85] }}
        transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }}
        style={{
          position:"absolute", width:"60%", height:"55%", top:"15%", left:"20%",
          background:"radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.06) 50%, transparent 70%)",
          filter:"blur(45px)",
        }}
      />
      {/* Deep blue floor fog */}
      <motion.div
        animate={{ x:[-30,40,-30], opacity:[0.7,1,0.7] }}
        transition={{ duration:25, repeat:Infinity, ease:"easeInOut" }}
        style={{
          position:"absolute", width:"120%", height:"50%", bottom:"-10%", left:"-10%",
          background:"radial-gradient(ellipse 90% 100% at 50% 100%, rgba(15,45,94,0.75) 0%, rgba(5,13,31,0.5) 50%, transparent 80%)",
          filter:"blur(28px)",
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SHOOTING STAR — light streak across the hero
══════════════════════════════════════════════════════════════════ */
function ShootingStar({ delay = 0, top = "28%", angle = -20 }) {
  return (
    <motion.div
      initial={{ x:"-20vw", opacity:0 }}
      animate={{ x:"120vw", opacity:[0, 1, 1, 0] }}
      transition={{ duration:1.4, delay, repeat:Infinity, repeatDelay:6 + delay, ease:"easeIn" }}
      style={{
        position:"absolute", top, left:0,
        width:200, height:1.5,
        background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.9), rgba(245,158,11,0.8), transparent)",
        transform:`rotate(${angle}deg)`,
        transformOrigin:"left center",
        zIndex:4, pointerEvents:"none",
        boxShadow:"0 0 8px rgba(255,255,255,0.6), 0 0 20px rgba(245,158,11,0.5)",
        borderRadius:2,
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION DIVIDER — shimmer line that scans on entry
══════════════════════════════════════════════════════════════════ */
function SectionDivider({ dark = false }) {
  return (
    <div style={{ position:"relative", height:1, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)", overflow:"hidden" }}>
      <motion.div
        initial={{ x:"-100%" }}
        whileInView={{ x:"220%" }}
        viewport={{ once:true, margin:"0px" }}
        transition={{ duration:1.6, ease:[0.4,0,0.2,1] }}
        style={{
          position:"absolute", top:0, bottom:0, width:"45%",
          background:`linear-gradient(90deg, transparent, ${dark ? "rgba(245,158,11,0.45)" : "rgba(245,158,11,0.4)"}, rgba(37,99,235,0.2), transparent)`,
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   WORD REVEAL — each word rises from a clip mask on scroll
══════════════════════════════════════════════════════════════════ */
function WordReveal({ text, containerStyle, wordStyle, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-40px" });
  return (
    <div
      ref={ref}
      style={{ display:"flex", flexWrap:"wrap", columnGap:"0.28em", rowGap:"0.05em", ...containerStyle }}
    >
      {text.split(" ").map((word, i) => (
        <span key={i} style={{ overflow:"hidden", display:"inline-block" }}>
          <motion.span
            initial={{ y:"110%", opacity:0 }}
            animate={inView ? { y:0, opacity:1 } : {}}
            transition={{ duration:0.75, delay: delay + i*0.09, ease:[0.16,1,0.3,1] }}
            style={{ display:"inline-block", ...wordStyle }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PARALLAX SECTION — content shifts subtly as you scroll through
══════════════════════════════════════════════════════════════════ */
function ParallaxSection({ children, style, strength = 22 }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target:ref, offset:["start end","end start"] });
  const y = useTransform(scrollYProgress, [0,1], [-strength, strength]);
  return (
    <section ref={ref} style={{ ...style, overflow:"hidden" }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   FLOATING 3D PROFILE CARD — glow + fog emergence
══════════════════════════════════════════════════════════════════ */
function FloatingCard({ data, posStyle, factor, floatDur, initDelay, mouseX, mouseY }) {
  const px = useSpring(useTransform(mouseX, v=>v*factor*80), { stiffness:55, damping:22 });
  const py = useSpring(useTransform(mouseY, v=>v*factor*42), { stiffness:55, damping:22 });

  return (
    <motion.div
      style={{ position:"absolute", ...posStyle, zIndex:3, x:px, y:py }}
      initial={{ opacity:0, scale:0.78, filter:"blur(16px)" }}
      animate={{ opacity:1, scale:1, filter:"blur(0px)" }}
      transition={{ duration:1.1, delay:initDelay, ease:[0.16,1,0.3,1] }}
    >
      {/* Neon glow halo — very visible */}
      <div style={{
        position:"absolute", inset:-18,
        borderRadius:28,
        background:"radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.45) 0%, rgba(99,148,255,0.2) 50%, transparent 75%)",
        pointerEvents:"none",
        filter:"blur(18px)",
        zIndex:-1,
      }} />

      <motion.div
        animate={{ y:[0,-14,0], rotateZ:[-0.7,0.7,-0.7] }}
        transition={{ duration:floatDur, repeat:Infinity, ease:"easeInOut", delay:initDelay*0.4, repeatType:"mirror" }}
        style={{
          width:200,
          background:"rgba(4,10,24,0.88)",
          backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)",
          border:"1.5px solid rgba(99,148,255,0.55)",
          borderRadius:20, padding:"18px 16px",
          boxShadow:"0 0 0 1px rgba(99,148,255,0.2), 0 0 24px rgba(37,99,235,0.55), 0 0 60px rgba(37,99,235,0.25), 0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
          position:"relative",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{
            width:42, height:42, borderRadius:"50%", flexShrink:0,
            background:`linear-gradient(${data.grad})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"0.82rem", fontWeight:800, color:WHITE, fontFamily:HF,
            boxShadow:"0 4px 14px rgba(0,0,0,0.35)",
          }}>{data.initials}</div>
          <div>
            <div style={{ color:WHITE, fontWeight:700, fontSize:"0.86rem", fontFamily:HF, lineHeight:1.2 }}>{data.name}</div>
            <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.7rem", marginTop:2, fontFamily:BF }}>{data.school}</div>
          </div>
        </div>
        <div style={{ display:"inline-block", marginBottom:10, background:"rgba(37,99,235,0.2)", border:"1px solid rgba(59,130,246,0.3)", borderRadius:6, padding:"3px 8px", fontSize:"0.68rem", color:"#93c5fd", fontFamily:BF }}>{data.major}</div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
          {data.tags.map(t => (
            <div key={t} style={{ fontSize:"0.63rem", padding:"2px 7px", borderRadius:5, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.55)", fontFamily:BF }}>{t}</div>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.22)", borderRadius:10, padding:"7px 12px" }}>
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.7rem", fontFamily:BF }}>Compatibility</span>
          <span style={{ color:GOLD, fontWeight:900, fontSize:"1.05rem", fontFamily:HF }}>{data.compat}%</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Counter ────────────────────────────────────────────────────── */
function Counter({ to, suffix="" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-80px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const n = parseInt(to);
    if (isNaN(n)) { setVal(to); return; }
    const ctrl = animate(0, n, { duration:1.8, ease:[0.16,1,0.3,1], onUpdate: v => setVal(Math.floor(v)) });
    return ctrl.stop;
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── FadeUp — cinematic scale + blur ───────────────────────────── */
function FadeUp({ children, delay=0, style, from=44 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-56px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity:0, y:from, scale:0.975, filter:"blur(8px)" }}
      animate={inView ? { opacity:1, y:0, scale:1, filter:"blur(0px)" } : {}}
      transition={{ duration:0.85, delay, ease:[0.16,1,0.3,1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ─── Marquee ────────────────────────────────────────────────────── */
function Marquee({ items }) {
  const list = [...items,...items];
  return (
    <div style={{ overflow:"hidden", maskImage:"linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%)", WebkitMaskImage:"linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%)" }}>
      <motion.div
        animate={{ x:["0%","-50%"] }}
        transition={{ duration:34, repeat:Infinity, ease:"linear" }}
        style={{ display:"flex", gap:0, width:"max-content" }}
      >
        {list.map((item,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"0 30px" }}>
            <span style={{ color:GOLD, fontSize:"0.42rem", opacity:0.65 }}>◆</span>
            <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.85rem", fontWeight:500, fontFamily:BF, whiteSpace:"nowrap", letterSpacing:"0.02em" }}>{item}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Feature Card ───────────────────────────────────────────────── */
function FeatureCard({ f, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeUp delay={delay}>
      <motion.div
        onMouseEnter={()=>setHov(true)}
        onMouseLeave={()=>setHov(false)}
        animate={{ y:hov?-7:0 }}
        transition={{ type:"spring", stiffness:280, damping:20 }}
        style={{
          background:WHITE, border:`1.5px solid ${hov?GOLD:BORD}`, borderRadius:20,
          padding:"36px 30px", height:"100%", cursor:"default",
          boxShadow:hov ? "0 20px 60px rgba(245,158,11,0.13), 0 4px 20px rgba(0,0,0,0.06)" : "0 4px 20px rgba(0,0,0,0.04)",
          transition:"border-color 0.25s, box-shadow 0.25s",
        }}
      >
        <motion.div
          animate={{ scale:hov?1.12:1, rotate:hov?6:0 }}
          transition={{ type:"spring", stiffness:300 }}
          style={{
            width:56, height:56, borderRadius:14, fontSize:"1.6rem",
            background:hov ? `linear-gradient(135deg,${GOLD},${GOLD_D})` : "linear-gradient(135deg,#FEF3C7,#FDE68A)",
            display:"flex", alignItems:"center", justifyContent:"center",
            marginBottom:22, boxShadow:hov?"0 8px 24px rgba(245,158,11,0.4)":"none",
            transition:"background 0.25s, box-shadow 0.25s",
          }}
        >{f.icon}</motion.div>
        <div style={{
          display:"inline-block", marginBottom:14,
          background:hov?"rgba(245,158,11,0.1)":"rgba(37,99,235,0.06)",
          border:`1px solid ${hov?"rgba(245,158,11,0.25)":"rgba(37,99,235,0.12)"}`,
          borderRadius:100, padding:"3px 11px",
          fontSize:"0.66rem", fontWeight:700, color:hov?GOLD_D:BLUE,
          letterSpacing:"0.12em", fontFamily:BF, textTransform:"uppercase",
          transition:"all 0.25s",
        }}>{f.badge}</div>
        <h3 style={{ fontFamily:HF, fontWeight:700, fontSize:"1.12rem", color:NAVY, margin:"0 0 10px", lineHeight:1.3 }}>{f.title}</h3>
        <p style={{ color:MUTED, fontSize:"0.92rem", lineHeight:1.72, margin:0, fontFamily:BF }}>{f.desc}</p>
      </motion.div>
    </FadeUp>
  );
}

/* ─── Testimonial Card ───────────────────────────────────────────── */
function TestimonialCard({ t, dir, delay }) {
  return (
    <motion.div
      initial={{ opacity:0, x:dir==="left"?-56:dir==="right"?56:0, y:dir==="center"?44:0, filter:"blur(8px)" }}
      whileInView={{ opacity:1, x:0, y:0, filter:"blur(0px)" }}
      viewport={{ once:true, margin:"-50px" }}
      transition={{ duration:0.8, delay, ease:[0.16,1,0.3,1] }}
      whileHover={{ y:-5 }}
      style={{
        background:WHITE, border:`1px solid ${BORD}`, borderRadius:20,
        padding:"32px 28px", height:"100%",
        boxShadow:"0 4px 28px rgba(0,0,0,0.06)",
        display:"flex", flexDirection:"column",
      }}
    >
      <div style={{ width:44, height:3, background:`linear-gradient(90deg,${GOLD},${GOLD_D})`, borderRadius:2, marginBottom:22 }} />
      <div style={{ display:"flex", gap:3, marginBottom:16 }}>
        {[...Array(t.stars)].map((_,i)=>(
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={GOLD}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        ))}
      </div>
      <p style={{ color:"#1E293B", fontSize:"0.95rem", lineHeight:1.78, margin:"0 0 24px", fontStyle:"italic", flex:1, fontFamily:BF }}>"{t.quote}"</p>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", flexShrink:0, background:`linear-gradient(135deg,${NAVY},${BLUE})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", fontWeight:700, color:WHITE, fontFamily:HF }}>
          {t.name.split(" ").map(w=>w[0]).join("")}
        </div>
        <div>
          <div style={{ fontWeight:700, color:NAVY, fontSize:"0.9rem", fontFamily:HF }}>{t.name}</div>
          <div style={{ color:MUTED, fontSize:"0.78rem", marginTop:1, fontFamily:BF }}>{t.year} · {t.school}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate  = useNavigate();
  const user      = getCurrentUser();
  const handleStart = () => navigate(user ? "/app" : "/register");

  // Mouse tracking
  const mouseRaw = useRef({ x:0, y:0 });
  const mouseX   = useMotionValue(0);
  const mouseY   = useMotionValue(0);
  const onHeroMouse = useCallback((e) => {
    const x=(e.clientX/window.innerWidth -0.5)*2;
    const y=(e.clientY/window.innerHeight-0.5)*2;
    mouseRaw.current={x,y}; mouseX.set(x); mouseY.set(y);
  },[mouseX,mouseY]);

  // Hero parallax on scroll
  const heroRef = useRef(null);
  const { scrollYProgress:heroP } = useScroll({ target:heroRef, offset:["start start","end start"] });
  const heroY  = useTransform(heroP,[0,1],[0,140]);
  const heroOp = useTransform(heroP,[0,0.6],[1,0]);

  // Cursor CSS: hide native cursor only on desktop
  useEffect(() => {
    document.body.classList.add("r8-cursor-page");
    return () => document.body.classList.remove("r8-cursor-page");
  }, []);

  return (
    <div style={{ fontFamily:BF, color:"#0A0A0A", overflowX:"hidden" }}>

      {/* Fixed custom cursor */}
      <CustomCursor />

      {/* ════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        onMouseMove={onHeroMouse}
        style={{
          position:"relative", minHeight:"100vh",
          background:"linear-gradient(180deg, #000000 0%, #020818 35%, #061028 65%, #0F2D5E 100%)",
          overflow:"hidden",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}
      >
        {/* Three.js stars */}
        <ParticleCanvas mouseRef={mouseRaw} />

        {/* VERY VISIBLE fog mist layers */}
        <FogLayers />

        {/* Shooting stars */}
        <ShootingStar delay={2}  top="22%" angle={-15} />
        <ShootingStar delay={8}  top="45%" angle={-10} />
        <ShootingStar delay={14} top="30%" angle={-20} />

        {/* Vignette — breathing */}
        <motion.div
          animate={{ opacity:[0.5,0.72,0.5] }}
          transition={{ duration:7, repeat:Infinity, ease:"easeInOut" }}
          style={{
            position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
            background:"radial-gradient(ellipse 70% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        {/* Floating profile cards */}
        <div className="hero-cards">
          <FloatingCard data={MOCK_PROFILES[0]} posStyle={{ top:"16%",left:"4%"  }} factor={0.025} floatDur={5.2} initDelay={0.3}  mouseX={mouseX} mouseY={mouseY} />
          <FloatingCard data={MOCK_PROFILES[1]} posStyle={{ top:"11%",right:"4%" }} factor={0.038} floatDur={4.8} initDelay={0.55} mouseX={mouseX} mouseY={mouseY} />
          <FloatingCard data={MOCK_PROFILES[2]} posStyle={{ bottom:"19%",left:"6%" }}  factor={0.018} floatDur={5.8} initDelay={0.8}  mouseX={mouseX} mouseY={mouseY} />
          <FloatingCard data={MOCK_PROFILES[3]} posStyle={{ bottom:"16%",right:"5%" }} factor={0.03}  floatDur={6.1} initDelay={1.05} mouseX={mouseX} mouseY={mouseY} />
        </div>

        {/* ── Hero text ── */}
        <motion.div style={{ y:heroY, opacity:heroOp, position:"relative", zIndex:10, textAlign:"center", padding:"0 24px", maxWidth:980 }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.65 }}
            style={{
              display:"inline-flex", alignItems:"center", gap:9,
              background:"rgba(245,158,11,0.09)", border:"1px solid rgba(245,158,11,0.24)",
              borderRadius:100, padding:"7px 20px", marginBottom:32,
              marginTop:32,
            }}
          >
            <motion.span
              animate={{ opacity:[1,0.3,1] }}
              transition={{ duration:2.2, repeat:Infinity }}
              style={{ fontSize:"0.42rem", color:GOLD }}
            >◆</motion.span>
            <span style={{ fontSize:"0.78rem", fontWeight:600, color:GOLD, fontFamily:BF, letterSpacing:"0.1em" }}>
              Launching at universities near you
            </span>
          </motion.div>

          {/* Tagline — very wide tracking */}
          <motion.p
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:0.1 }}
            style={{
              fontFamily:BF, fontWeight:500, margin:"0 0 20px",
              fontSize:"clamp(0.72rem,1.4vw,0.88rem)",
              color:"rgba(255,255,255,0.38)",
              letterSpacing:"0.26em", textTransform:"uppercase",
              background:"none", backdropFilter:"none",
            }}
          >
            Your Campus. Your People. Your Home.
          </motion.p>

          {/* Radial glow BEHIND the headline */}
          <div style={{
            position:"absolute", top:"30%", left:"50%",
            transform:"translate(-50%,-50%)",
            width:700, height:400,
            background:"radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.38) 0%, rgba(245,158,11,0.14) 40%, transparent 70%)",
            filter:"blur(55px)",
            pointerEvents:"none", zIndex:0,
          }} />

          {/* MASSIVE headline — clipped reveal */}
          {["Find Your","People."].map((line,i)=>(
            <div key={line} style={{ overflow:"hidden", position:"relative", zIndex:1, background:"transparent" }}>
              <motion.h1
                initial={{ y:"108%" }}
                animate={{ y:0 }}
                transition={{ duration:0.95, delay:0.18+i*0.14, ease:[0.16,1,0.3,1] }}
                style={{
                  fontFamily:HF, fontWeight:900, margin:0, lineHeight:0.92,
                  letterSpacing:"-0.04em",
                  fontSize:"clamp(100px, 15vw, 175px)",
                  color: i===1 ? GOLD : WHITE,
                  textShadow: i===1
                    ? "0 0 60px rgba(245,158,11,0.6), 0 0 120px rgba(245,158,11,0.3)"
                    : "0 0 60px rgba(120,160,255,0.4), 0 0 120px rgba(37,99,235,0.2)",
                }}
              >{line}</motion.h1>
            </div>
          ))}

          {/* Subtitle */}
          <motion.p
            initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.7, delay:0.52 }}
            style={{
              fontFamily:BF, margin:"30px auto 46px",
              fontSize:"clamp(0.98rem,2vw,1.18rem)",
              color:"rgba(255,255,255,0.55)",
              maxWidth:520, lineHeight:1.75,
            }}
          >
            The roommate matching app built for college students. Verified profiles, lifestyle compatibility, and real campus community.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.65, delay:0.66 }}
            style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}
          >
            <motion.button
              whileHover={{ scale:1.05, y:-3 }} whileTap={{ scale:0.97 }}
              onClick={handleStart}
              style={{
                background:GOLD, color:DARK, border:"none",
                padding:"16px 38px", borderRadius:10,
                fontWeight:800, fontSize:"1rem", cursor:"pointer",
                fontFamily:HF, letterSpacing:"0.01em",
                boxShadow:"0 8px 36px rgba(245,158,11,0.48), 0 2px 8px rgba(245,158,11,0.3)",
              }}
            >Get Started Free →</motion.button>
            <motion.a
              whileHover={{ scale:1.04, y:-2 }} href="#how-it-works"
              style={{
                color:"rgba(255,255,255,0.82)",
                border:"1.5px solid rgba(255,255,255,0.22)",
                padding:"15px 34px", borderRadius:10,
                fontWeight:600, fontSize:"1rem",
                textDecoration:"none", fontFamily:BF,
                backdropFilter:"blur(10px)",
                background:"rgba(255,255,255,0.04)",
              }}
            >See How It Works</motion.a>
          </motion.div>

          {/* Dramatic scroll indicator */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5, duration:0.9 }}
            style={{ marginTop:64, display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}
          >
            <span style={{ fontFamily:BF, fontSize:"0.6rem", fontWeight:600, color:"rgba(255,255,255,0.3)", letterSpacing:"0.35em", textTransform:"uppercase" }}>scroll</span>
            {/* Animated pulsing line */}
            <div style={{ position:"relative", width:1, height:60, overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, background:"rgba(255,255,255,0.1)" }} />
              <motion.div
                animate={{ y:["-100%","100%"] }}
                transition={{ duration:1.5, repeat:Infinity, ease:"easeInOut" }}
                style={{
                  position:"absolute", top:0, left:0, right:0, height:"50%",
                  background:`linear-gradient(180deg, transparent, ${GOLD}, rgba(245,158,11,0.4), transparent)`,
                  boxShadow:`0 0 8px ${GOLD}, 0 0 20px rgba(245,158,11,0.7)`,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CAMPUS BANNER
      ════════════════════════════════════════════════════════════ */}
      <SectionDivider dark />

      <div style={{ background:"#080F1E", padding:"32px 24px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
          <motion.div
            animate={{ opacity:[0.4,0.8,0.4] }}
            transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
            style={{ fontSize:"0.5rem", color:GOLD }}
          >◆</motion.div>
          <span style={{ fontFamily:BF, fontSize:"0.8rem", fontWeight:600, color:"rgba(255,255,255,0.35)", letterSpacing:"0.22em", textTransform:"uppercase", textAlign:"center" }}>
            Coming to a campus near you
          </span>
          <motion.div
            animate={{ opacity:[0.4,0.8,0.4] }}
            transition={{ duration:3, repeat:Infinity, ease:"easeInOut", delay:1.5 }}
            style={{ fontSize:"0.5rem", color:GOLD }}
          >◆</motion.div>
          <Link to="/schools" style={{ fontFamily:BF, fontSize:"0.8rem", fontWeight:700, color:GOLD, letterSpacing:"0.1em", textTransform:"uppercase", textDecoration:"none", border:"1px solid rgba(245,158,11,0.3)", borderRadius:100, padding:"5px 16px", transition:"all 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(245,158,11,0.1)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}
          >Partner with us →</Link>
        </div>
      </div>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════════════════ */}
      <ParallaxSection strength={20} style={{ background:WHITE, padding:"116px 24px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:68 }}>
            <FadeUp>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)",
                borderRadius:100, padding:"6px 18px", marginBottom:24,
              }}>
                <span style={{ fontSize:"0.64rem", fontWeight:700, color:GOLD_D, fontFamily:BF, letterSpacing:"0.22em", textTransform:"uppercase" }}>
                  Built for College Life
                </span>
              </div>
            </FadeUp>
            <WordReveal
              text="Built for how students actually live"
              containerStyle={{ justifyContent:"center" }}
              wordStyle={{ fontFamily:HF, fontWeight:800, fontSize:"clamp(2rem,4vw,3.1rem)", color:NAVY, letterSpacing:"-0.025em", lineHeight:1.15 }}
              delay={0.1}
            />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:24 }}>
            {FEATURES.map((f,i)=>(<FeatureCard key={f.title} f={f} delay={i*0.09} />))}
          </div>
        </div>
      </ParallaxSection>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════ */}
      <ParallaxSection id="how-it-works" strength={18} style={{ background:SURF, padding:"116px 24px" }}>
        <div style={{ maxWidth:980, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:76 }}>
            <FadeUp>
              <div style={{
                display:"inline-flex", alignItems:"center", gap:8,
                background:"rgba(15,45,94,0.06)", border:"1px solid rgba(15,45,94,0.1)",
                borderRadius:100, padding:"6px 18px", marginBottom:24,
              }}>
                <span style={{ fontSize:"0.64rem", fontWeight:700, color:NAVY, fontFamily:BF, letterSpacing:"0.22em", textTransform:"uppercase" }}>
                  How It Works
                </span>
              </div>
            </FadeUp>
            <WordReveal
              text="Three steps to your perfect roommate"
              containerStyle={{ justifyContent:"center" }}
              wordStyle={{ fontFamily:HF, fontWeight:800, fontSize:"clamp(2rem,4vw,3rem)", color:NAVY, letterSpacing:"-0.025em", lineHeight:1.15 }}
              delay={0.1}
            />
          </div>

          <div style={{ position:"relative" }}>
            {/* Connector line */}
            <div className="step-connector">
              <motion.div
                initial={{ scaleX:0 }}
                whileInView={{ scaleX:1 }}
                viewport={{ once:true, margin:"-80px" }}
                transition={{ duration:1.5, delay:0.35, ease:[0.16,1,0.3,1] }}
                style={{
                  position:"absolute", top:52, left:"19%", right:"19%", height:1.5,
                  background:`linear-gradient(90deg,${GOLD},${BLUE})`,
                  transformOrigin:"left", opacity:0.45,
                }}
              />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:36 }}>
              {STEPS.map((s,i)=>(
                <FadeUp key={s.n} delay={i*0.15}>
                  <motion.div
                    whileHover={{ y:-6 }}
                    transition={{ type:"spring", stiffness:280, damping:20 }}
                    style={{ background:WHITE, border:`1px solid ${BORD}`, borderRadius:20, padding:"36px 28px", boxShadow:"0 4px 24px rgba(0,0,0,0.05)" }}
                  >
                    <div style={{ width:54, height:54, borderRadius:"50%", background:`linear-gradient(135deg,${NAVY},${BLUE})`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24, position:"relative", boxShadow:"0 6px 22px rgba(15,45,94,0.28)" }}>
                      <span style={{ fontFamily:HF, fontWeight:900, fontSize:"1rem", color:WHITE }}>{s.n}</span>
                      <div style={{ position:"absolute", top:-3, right:-3, width:12, height:12, borderRadius:"50%", background:GOLD, boxShadow:"0 2px 8px rgba(245,158,11,0.6)" }} />
                    </div>
                    <div style={{ fontSize:"1.8rem", marginBottom:12 }}>{s.icon}</div>
                    <h3 style={{ fontFamily:HF, fontWeight:700, fontSize:"1.15rem", color:NAVY, margin:"0 0 12px" }}>{s.title}</h3>
                    <p style={{ color:MUTED, fontSize:"0.92rem", lineHeight:1.72, margin:0, fontFamily:BF }}>{s.desc}</p>
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>

          <FadeUp delay={0.3} style={{ textAlign:"center", marginTop:58 }}>
            <motion.button
              whileHover={{ scale:1.05, y:-3 }} whileTap={{ scale:0.97 }}
              onClick={handleStart}
              style={{ background:NAVY, color:WHITE, border:"none", padding:"16px 42px", borderRadius:10, fontWeight:700, fontSize:"1rem", cursor:"pointer", fontFamily:HF, boxShadow:"0 8px 28px rgba(15,45,94,0.28)" }}
            >Find Your Room8 →</motion.button>
          </FadeUp>
        </div>
      </ParallaxSection>

      <SectionDivider dark />

      {/* ════════════════════════════════════════════════════════════
          HONEST LAUNCH MESSAGING
      ════════════════════════════════════════════════════════════ */}
      <ParallaxSection
        strength={18}
        style={{ background:`linear-gradient(135deg,${NAVY} 0%,#1e3a6e 100%)`, padding:"96px 24px", position:"relative", overflow:"hidden" }}
      >
        <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,0.1) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:960, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <WordReveal
              text="Where we're headed"
              containerStyle={{ justifyContent:"center" }}
              wordStyle={{ fontFamily:HF, fontWeight:800, fontSize:"clamp(2rem,4vw,2.9rem)", color:WHITE, letterSpacing:"-0.025em", lineHeight:1.15 }}
            />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:20 }}>
            {[
              { label:"Launching Spring 2026", sub:"Early access now open", icon:"🚀" },
              { label:"Beta Access Available", sub:"Join the waitlist today", icon:"🔑" },
              { label:"Built for Students",    sub:"Free, always",           icon:"🎓" },
              { label:"Seeking Partners",      sub:"Universities welcome",   icon:"🏫" },
            ].map((s,i)=>(
              <FadeUp key={s.label} delay={i*0.1}>
                <motion.div
                  whileHover={{ y:-5, boxShadow:"0 24px 60px rgba(0,0,0,0.3)" }}
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:20, padding:"36px 24px", textAlign:"center", backdropFilter:"blur(16px)", boxShadow:"0 8px 32px rgba(0,0,0,0.15)" }}
                >
                  <div style={{ fontSize:"2.2rem", marginBottom:14 }}>{s.icon}</div>
                  <div style={{ fontFamily:HF, fontWeight:800, fontSize:"1.05rem", color:WHITE, lineHeight:1.25, marginBottom:6 }}>{s.label}</div>
                  <div style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.8rem", fontFamily:BF }}>{s.sub}</div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </ParallaxSection>

      <SectionDivider />

      {/* ════════════════════════════════════════════════════════════
          PARTNER WITH US — for universities
      ════════════════════════════════════════════════════════════ */}
      <ParallaxSection strength={18} style={{ background:SURF, padding:"116px 24px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }} className="partner-grid">
            {/* Left: copy */}
            <div>
              <FadeUp>
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:100, padding:"6px 18px", marginBottom:24 }}>
                  <span style={{ fontSize:"0.64rem", fontWeight:700, color:GOLD_D, fontFamily:BF, letterSpacing:"0.22em", textTransform:"uppercase" }}>For Universities</span>
                </div>
              </FadeUp>
              <WordReveal
                text="Partner with Room8"
                containerStyle={{}}
                wordStyle={{ fontFamily:HF, fontWeight:800, fontSize:"clamp(2rem,4vw,3rem)", color:NAVY, letterSpacing:"-0.025em", lineHeight:1.1, display:"block" }}
                delay={0.1}
              />
              <FadeUp delay={0.3}>
                <p style={{ color:MUTED, fontSize:"1rem", lineHeight:1.78, margin:"20px 0 36px", fontFamily:BF }}>
                  We're actively partnering with universities and housing coordinators to bring verified, student-safe roommate matching to campuses across the country. Be among the first institutions to offer this to your students.
                </p>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <motion.a
                    whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}
                    href="mailto:partner@room8app.com"
                    style={{ background:NAVY, color:WHITE, padding:"14px 32px", borderRadius:10, fontWeight:700, fontSize:"0.95rem", textDecoration:"none", fontFamily:HF, boxShadow:"0 6px 24px rgba(15,45,94,0.28)", display:"inline-block" }}
                  >Contact Us →</motion.a>
                  <motion.a
                    whileHover={{ scale:1.03 }}
                    href="/purpose"
                    style={{ color:NAVY, border:`1.5px solid ${BORD}`, padding:"13px 28px", borderRadius:10, fontWeight:600, fontSize:"0.95rem", textDecoration:"none", fontFamily:BF, display:"inline-block" }}
                  >Learn More</motion.a>
                </div>
              </FadeUp>
            </div>

            {/* Right: benefit cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { icon:"✅", title:"School-Verified Profiles", desc:"Only students from your institution can join your campus pool." },
                { icon:"🛡️", title:"Safety First",             desc:"Built-in reporting, blocking, and moderation tools." },
                { icon:"📊", title:"Housing Insights",         desc:"Aggregate data on student housing preferences at your school." },
                { icon:"💬", title:"Dedicated Support",        desc:"White-glove onboarding and ongoing support for your housing office." },
              ].map((b,i)=>(
                <FadeUp key={b.title} delay={0.15+i*0.08}>
                  <motion.div
                    whileHover={{ x:4 }}
                    transition={{ type:"spring", stiffness:300 }}
                    style={{ display:"flex", gap:16, alignItems:"flex-start", background:WHITE, border:`1px solid ${BORD}`, borderRadius:14, padding:"18px 20px", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}
                  >
                    <span style={{ fontSize:"1.4rem", flexShrink:0 }}>{b.icon}</span>
                    <div>
                      <div style={{ fontFamily:HF, fontWeight:700, fontSize:"0.95rem", color:NAVY, marginBottom:4 }}>{b.title}</div>
                      <div style={{ color:MUTED, fontSize:"0.83rem", lineHeight:1.6, fontFamily:BF }}>{b.desc}</div>
                    </div>
                  </motion.div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </ParallaxSection>

      <SectionDivider dark />

      {/* ════════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════════ */}
      <section style={{
        background:`linear-gradient(168deg,${DARK} 0%,${NAVY} 100%)`,
        padding:"128px 24px", textAlign:"center",
        position:"relative", overflow:"hidden",
      }}>
        {[
          { w:500, top:"-20%", left:"-10%",  op:0.09 },
          { w:700, top:"30%",  right:"-12%", op:0.08 },
          { w:350, bottom:"-15%", left:"35%",op:0.12 },
        ].map((o,i)=>(
          <div key={i} style={{ position:"absolute", width:o.w, height:o.w, borderRadius:"50%", background:`radial-gradient(circle,rgba(245,158,11,${o.op}) 0%,transparent 70%)`, top:o.top, left:o.left, right:o.right, bottom:o.bottom, pointerEvents:"none" }} />
        ))}

        <motion.div
          initial={{ opacity:0, y:52 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:"-60px" }}
          transition={{ duration:0.9, ease:[0.16,1,0.3,1] }}
          style={{ maxWidth:660, margin:"0 auto", position:"relative", zIndex:1 }}
        >
          <motion.div
            initial={{ scaleX:0 }} whileInView={{ scaleX:1 }}
            viewport={{ once:true }} transition={{ duration:0.85, delay:0.2 }}
            style={{ width:64, height:3, background:`linear-gradient(90deg,${GOLD},${GOLD_D})`, borderRadius:2, margin:"0 auto 36px", transformOrigin:"center" }}
          />
          <WordReveal
            text="The smarter way to find your roommate"
            containerStyle={{ justifyContent:"center" }}
            wordStyle={{ fontFamily:HF, fontWeight:900, fontSize:"clamp(2.2rem,5vw,4rem)", lineHeight:1.08, letterSpacing:"-0.03em", color:WHITE }}
            delay={0.15}
          />
          <motion.p
            initial={{ opacity:0 }} whileInView={{ opacity:1 }}
            viewport={{ once:true }} transition={{ delay:0.6, duration:0.7 }}
            style={{ color:"rgba(255,255,255,0.5)", lineHeight:1.78, marginBottom:46, fontSize:"1.05rem", fontFamily:BF, marginTop:24 }}
          >
            Stop leaving your living situation to chance. Be among the first students to use Room8 at your university — free early access, now open.
          </motion.p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <motion.button
              whileHover={{ scale:1.06, y:-4 }} whileTap={{ scale:0.97 }}
              onClick={handleStart}
              style={{ background:GOLD, color:DARK, border:"none", padding:"17px 42px", borderRadius:10, fontWeight:800, fontSize:"1.05rem", cursor:"pointer", fontFamily:HF, boxShadow:"0 8px 40px rgba(245,158,11,0.52)", letterSpacing:"0.01em" }}
            >Get Early Access →</motion.button>
            {!user && (
              <motion.div whileHover={{ scale:1.03 }}>
                <Link to="/login" style={{ color:"rgba(255,255,255,0.72)", border:"1.5px solid rgba(255,255,255,0.18)", padding:"16px 36px", borderRadius:10, fontWeight:600, fontSize:"1rem", textDecoration:"none", display:"block", fontFamily:BF, backdropFilter:"blur(10px)", background:"rgba(255,255,255,0.04)" }}>Log In</Link>
              </motion.div>
            )}
          </div>
          <motion.p
            initial={{ opacity:0 }} whileInView={{ opacity:1 }}
            viewport={{ once:true }} transition={{ delay:0.8 }}
            style={{ color:"rgba(255,255,255,0.22)", fontSize:"0.78rem", marginTop:30, fontFamily:BF, letterSpacing:"0.06em" }}
          >
            Free for students · Early access beta · School verified
          </motion.p>
        </motion.div>
      </section>

      {/* ── Global + responsive styles ── */}
      <style>{`
        /* Custom cursor */
        .r8-cursor-page,
        .r8-cursor-page * {
          cursor: none !important;
        }
        @media (hover: none), (pointer: coarse) {
          .r8-cursor-page,
          .r8-cursor-page * { cursor: auto !important; }
        }

        /* Hide floating cards on small screens */
        .hero-cards { pointer-events: none; }
        @media (max-width: 960px) {
          .hero-cards > *:nth-child(3),
          .hero-cards > *:nth-child(4) { display: none !important; }
        }
        @media (max-width: 640px) {
          .hero-cards { display: none !important; }
          .step-connector { display: none !important; }
        }
        @media (max-width: 600px) {
          section { padding-top: 72px !important; padding-bottom: 72px !important; }
        }
      `}</style>
    </div>
  );
}
