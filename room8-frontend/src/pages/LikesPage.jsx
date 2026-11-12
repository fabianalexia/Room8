// src/pages/LikesPage.jsx: people who liked you, plus your matches
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import { getCurrentUser, getLikes, getMatches, likeUser, skipUser, getToken, API_URL } from "../api";
import { sendNotification } from "../notifications";
import { PhotoVerifiedCheck } from "../components/VerifiedBadge";
import ProfileSheet, { NoPhoto } from "../components/ProfileSheet";
import MatchMoment from "../components/MatchMoment";
import Icon, { traitsFor } from "../ui/Icon";
import { Avatar, EmptyState, TopBar } from "../ui/kit";

const first = (n) => (n || "").split(" ")[0] || n || "";

export default function LikesPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [fans, setFans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState({});
  const [matched, setMatched] = useState({});
  const [matchModal, setMatchModal] = useState(null);
  const [matchesList, setMatchesList] = useState([]);
  const [profile, setProfile] = useState(null);
  const socketRef = useRef(null);

  const fetchData = useCallback(() => {
    return Promise.all([getLikes(user.id), getMatches(user.id)])
      .then(([likes, matchData]) => {
        const matchedIds = new Set((matchData || []).map((m) => m.id));
        setFans(() => {
          const locallyMatched = new Set(Object.keys(matched).map(Number));
          return (Array.isArray(likes) ? likes : []).filter((f) => !matchedIds.has(f.id) && !locallyMatched.has(f.id));
        });
        setMatchesList(Array.isArray(matchData) ? matchData : []);
      })
      .catch(console.error);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchData().finally(() => setLoading(false));
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;
    const sock = io(API_URL, { query: { token }, transports: ["websocket"], reconnectionAttempts: 5 });
    socketRef.current = sock;
    sock.on("new_match", () => fetchData());
    return () => { sock.disconnect(); socketRef.current = null; };
  }, [fetchData]); // eslint-disable-line

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => { fetchData(); }, 10_000);
    return () => clearInterval(id);
  }, [fetchData]); // eslint-disable-line

  const handleLikeBack = async (fan) => {
    if (liking[fan.id]) return;
    setLiking((p) => ({ ...p, [fan.id]: true }));
    try {
      const res = await likeUser(user.id, fan.id);
      if (res?.matched) {
        setMatched((p) => ({ ...p, [fan.id]: true }));
        setMatchModal({ fan });
        sendNotification("New match on Room8", `You and ${first(fan.name) || "someone"} liked each other.`);
      }
    } catch (e) { console.error(e); }
    finally { setLiking((p) => ({ ...p, [fan.id]: false })); }
  };

  const handlePass = async (fan) => {
    setFans((p) => p.filter((f) => f.id !== fan.id));
    try { await skipUser(user.id, fan.id); } catch (e) { console.error(e); }
  };

  const closeMatch = (goChat) => {
    const fan = matchModal?.fan;
    if (fan) setFans((p) => p.filter((f) => f.id !== fan.id));
    setMatchModal(null);
    if (goChat) navigate("/messages", { state: { openUserId: fan?.id } });
    else fetchData();
  };

  return (
    <div className="r8-app-page" style={{ position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="r8-aura r8-aura--a" style={{ width: 380, height: 380, top: -200, right: -160 }} />
      <TopBar title="Likes" sub={loading ? " " : fans.length ? `${fans.length} ${fans.length === 1 ? "person wants" : "people want"} to live with you` : "Your likes show up here"} />

      <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "4px 16px 0" }}>
        {/* Matches row */}
        {!loading && matchesList.length > 0 && (
          <section style={{ marginBottom: 26 }}>
            <p className="r8-eyebrow" style={{ marginBottom: 12 }}>Matches</p>
            <div className="r8-noscroll" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
              {matchesList.map((m) => (
                <motion.button key={m.id} whileTap={{ scale: 0.94 }} onClick={() => navigate("/messages", { state: { openUserId: m.id } })}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 72, flexShrink: 0 }}>
                  <Avatar src={m.photo} name={m.name} size={68} ring />
                  <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{first(m.name)}</span>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            {[0, 1, 2, 3].map((i) => <div key={i} className="r8-skel" style={{ aspectRatio: "3 / 4", borderRadius: 24 }} />)}
          </div>
        ) : fans.length === 0 ? (
          <div className="r8-card" style={{ marginTop: 8 }}>
            <EmptyState icon="heart" title="No likes yet" body="Keep swiping. When someone likes you back, they land here first."
              action={<button className="r8-btn r8-btn--primary" onClick={() => navigate("/app")}><Icon name="flame" size={20} />Start swiping</button>} />
          </div>
        ) : (
          <>
            <p className="r8-eyebrow" style={{ marginBottom: 12 }}>Liked you</p>
            <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px, calc(50% - 6px)), 1fr))", gap: 12 }}>
              <AnimatePresence>
                {fans.map((fan, i) => (
                  <FanCard key={fan.id} fan={fan} index={i} liking={!!liking[fan.id]} isMatched={!!matched[fan.id]}
                    onOpen={() => setProfile(fan)} onLikeBack={() => handleLikeBack(fan)} />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>

      {profile && (
        <ProfileSheet
          person={{ ...profile, firstName: first(profile.name) }}
          onClose={() => setProfile(null)}
          onPass={() => { const f = profile; setProfile(null); handlePass(f); }}
          onLike={() => { const f = profile; setProfile(null); handleLikeBack(f); }}
        />
      )}

      <AnimatePresence>
        {matchModal && (
          <MatchMoment me={user} them={{ ...matchModal.fan, firstName: first(matchModal.fan.name) }} onChat={() => closeMatch(true)} onClose={() => closeMatch(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function FanCard({ fan, index, liking, isMatched, onOpen, onLikeBack }) {
  const traits = traitsFor(fan.dorm_prefs || {}, 1);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 28, delay: Math.min(index, 8) * 0.04 }}
      style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)", background: "var(--elev)", boxShadow: "var(--shadow-1)" }}
    >
      <button onClick={onOpen} aria-label={`Open ${first(fan.name)}'s profile`} style={{ position: "absolute", inset: 0 }}>
        {fan.photo ? <img src={fan.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <NoPhoto name={fan.name} size={72} />}
        <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(14,15,18,.88))" }} />
      </button>
      <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, color: "#fff", pointerEvents: "none" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{first(fan.name)}{fan.age ? `, ${fan.age}` : ""}</span>
            <PhotoVerifiedCheck verified={fan.is_photo_verified} size={17} />
          </div>
          {traits[0] ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, opacity: .85, marginTop: 2 }}><Icon name={traits[0].icon} size={13} />{traits[0].label}</span>
          ) : fan.major ? <span style={{ fontSize: 12.5, opacity: .85 }}>{fan.major}</span> : null}
        </div>
        {isMatched ? (
          <span className="r8-sticker r8-sticker--pill" style={{ fontSize: 12 }}><Icon name="check" size={13} stroke={2.6} />matched</span>
        ) : (
          <motion.button whileTap={{ scale: 0.85 }} onClick={onLikeBack} disabled={liking} aria-label={`Like ${first(fan.name)} back`}
            style={{ pointerEvents: "auto", width: 46, height: 46, borderRadius: "50%", background: "var(--iri)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(217,139,255,.45), inset 0 1px 0 rgba(255,255,255,.5)", opacity: liking ? .5 : 1, flexShrink: 0 }}>
            <Icon name="heart" size={22} fill="#0E0F12" color="#0E0F12" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
