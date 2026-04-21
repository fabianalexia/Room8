// src/pages/LikesPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getLikes, likeUser } from "../api";

const NAVY   = "#0F2D5E";
const GOLD   = "#F59E0B";
const DARK   = "#050D1F";
const DARKER = "#030914";
const WHITE  = "#FFFFFF";
const MUTED  = "rgba(255,255,255,0.45)";
const BORDER = "rgba(255,255,255,0.09)";
const HF = "'Outfit', sans-serif";
const BF = "'Inter', sans-serif";

export default function LikesPage() {
  const navigate = useNavigate();
  const user     = getCurrentUser();

  const [fans,    setFans]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [liking,  setLiking]  = useState({});
  const [matched, setMatched] = useState({});

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getLikes(user.id)
      .then((data) => setFans(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const handleLikeBack = async (fan) => {
    if (liking[fan.id]) return;
    setLiking((prev) => ({ ...prev, [fan.id]: true }));
    try {
      const res = await likeUser(user.id, fan.id);
      if (res?.matched) {
        setMatched((prev) => ({ ...prev, [fan.id]: true }));
        setTimeout(() => setFans((prev) => prev.filter((f) => f.id !== fan.id)), 2000);
      }
    } catch (e) { console.error(e); }
    finally { setLiking((prev) => ({ ...prev, [fan.id]: false })); }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: `linear-gradient(180deg, ${DARKER} 0%, #071020 100%)`,
      overflowY: "auto",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 100px" }}>

        {/* Header */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: "20px 24px",
          marginBottom: 20,
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.3rem",
            }}>♥</div>
            <div>
              <h2 style={{
                margin: 0, fontFamily: HF, fontWeight: 800,
                fontSize: "1.4rem", color: GOLD,
                letterSpacing: "-0.025em",
              }}>
                Liked You
              </h2>
              <p style={{ color: MUTED, fontSize: "0.83rem", margin: 0, fontFamily: BF }}>
                {fans.length > 0
                  ? `${fans.length} student${fans.length !== 1 ? "s" : ""} want${fans.length === 1 ? "s" : ""} to be your Room8`
                  : "Keep swiping — likes will appear here"}
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <Spinner />
          </div>
        )}

        {/* Empty */}
        {!loading && fans.length === 0 && (
          <div style={{
            textAlign: "center",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${BORDER}`,
            borderRadius: 16, padding: "60px 28px",
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: "2.2rem",
            }}>♥</div>
            <p style={{ color: WHITE, fontFamily: HF, fontWeight: 700, fontSize: "1.1rem", marginBottom: 10 }}>
              No likes yet
            </p>
            <p style={{ color: MUTED, fontSize: "0.88rem", marginBottom: 28, fontFamily: BF, maxWidth: 260, margin: "0 auto 28px" }}>
              Keep swiping — when someone likes you, they'll show up here.
            </p>
            <button onClick={() => navigate("/app")} style={{
              background: GOLD, color: DARK, border: "none",
              padding: "13px 30px", borderRadius: 10, fontWeight: 800,
              cursor: "pointer", fontSize: "0.92rem", fontFamily: HF,
              boxShadow: "0 6px 24px rgba(245,158,11,0.35)",
            }}>
              Start Swiping →
            </button>
          </div>
        )}

        {/* Grid of fans */}
        {!loading && fans.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, calc(50% - 8px)), 1fr))",
            gap: 14,
          }}>
            {fans.map((fan) => (
              <FanCard
                key={fan.id}
                fan={fan}
                liking={!!liking[fan.id]}
                isMatched={!!matched[fan.id]}
                onLikeBack={() => handleLikeBack(fan)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FanCard({ fan, liking, isMatched, onLikeBack }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${hov ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.09)"}`,
        borderRadius: 16, overflow: "hidden",
        display: "flex", flexDirection: "column",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? "0 12px 40px rgba(0,0,0,0.3)" : "none",
        transition: "all 0.2s",
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative", paddingBottom: "115%", flexShrink: 0 }}>
        {fan.photo ? (
          <img
            src={fan.photo} alt={fan.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${NAVY}, #1e4a8a)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "3rem", opacity: 0.6,
          }}>
            👤
          </div>
        )}
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(3,9,20,0.92) 0%, rgba(3,9,20,0.4) 45%, transparent 70%)",
        }} />
        {/* Name on photo */}
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
          <div style={{ color: WHITE, fontWeight: 800, fontSize: "1.05rem", fontFamily: HF }}>
            {fan.name?.split(" ")[0]}{fan.age ? `, ${fan.age}` : ""}
          </div>
          {fan.school && (
            <div style={{
              color: "rgba(245,158,11,0.85)", fontSize: "0.68rem",
              fontWeight: 600, marginTop: 3, fontFamily: BF,
            }}>
              {fan.school.split("(")[0].trim().slice(0, 24)}
            </div>
          )}
        </div>
      </div>

      {/* Bottom info + action */}
      <div style={{ padding: "12px 12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        {(fan.class_year || fan.major) && (
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.74rem", margin: 0, fontWeight: 600, fontFamily: BF }}>
            {[fan.class_year, fan.major].filter(Boolean).join(" · ")}
          </p>
        )}
        {fan.bio && (
          <p style={{
            color: MUTED, fontSize: "0.78rem", margin: 0, lineHeight: 1.4, fontFamily: BF,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {fan.bio}
          </p>
        )}

        {isMatched ? (
          <div style={{
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.3)",
            color: "#86efac",
            padding: "10px", borderRadius: 10,
            fontWeight: 700, fontSize: "0.82rem",
            textAlign: "center", marginTop: "auto",
            fontFamily: HF,
          }}>
            🎉 Matched!
          </div>
        ) : (
          <button
            onClick={onLikeBack}
            disabled={liking}
            style={{
              background: liking ? "rgba(245,158,11,0.4)" : GOLD,
              color: liking ? "rgba(5,13,31,0.5)" : DARK,
              border: "none",
              padding: "11px", borderRadius: 10, fontWeight: 800,
              fontSize: "0.85rem", cursor: liking ? "default" : "pointer",
              marginTop: "auto", fontFamily: HF,
              boxShadow: liking ? "none" : "0 4px 16px rgba(245,158,11,0.35)",
              transition: "all 0.15s",
            }}
          >
            {liking ? "…" : "♥ Like Back"}
          </button>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 36, height: 36,
      border: "2.5px solid rgba(255,255,255,0.1)",
      borderTop: `2.5px solid ${GOLD}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
  );
}
