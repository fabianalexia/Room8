// src/ui/Logo.jsx: the Room8 mark (roof + crossing 8 with two roommates) and wordmark.
// The over/under gap and the people take their colors from the surface they sit on,
// so pass `surface` when the mark is not on the page background.
import React, { useId } from "react";

const EIGHT = "M32 37.6 L36.45 35.33 A9.8 9.8 0 1 0 27.55 35.33 L32 37.6 L37.63 40.47 A12.4 12.4 0 1 1 26.37 40.47 Z";
const OVER = "M26.65 34.88 L37.35 40.32";
const GAP = "M28.79 35.97 L35.21 39.23";

export function Mark({ size = 32, surface = "var(--bg)", people = "var(--text)", title = "Room8", style }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="-3 0 70 70" fill="none" role="img" aria-label={title} style={{ flexShrink: 0, ...style }}>
      <defs>
        <linearGradient id={`e${id}`} x1="32" y1="14" x2="32" y2="67" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#45D9FF" />
          <stop offset="0.38" stopColor="#8C9EFF" />
          <stop offset="0.68" stopColor="#D98BFF" />
          <stop offset="1" stopColor="#FF5FA0" />
        </linearGradient>
        <linearGradient id={`r${id}`} x1="15" y1="4" x2="49" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#45D9FF" />
          <stop offset="1" stopColor="#8C9EFF" />
        </linearGradient>
      </defs>
      <path d="M15 13.8 L32 2.9 L49 13.8" stroke={`url(#r${id})`} strokeWidth="6.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={EIGHT} stroke={`url(#e${id})`} strokeWidth="6.2" strokeLinejoin="round" />
      <path d={GAP} style={{ stroke: surface }} strokeWidth="9" />
      <path d={OVER} stroke={`url(#e${id})`} strokeWidth="6.2" />
      <g style={{ fill: people }}>
        <circle cx="32" cy="24.99" r="1.94" />
        <path d="M28.52 30.29 C29 27.94 30.26 27.14 32 27.14 C33.74 27.14 35 27.94 35.48 30.29 Z" />
        <circle cx="32" cy="49.28" r="2.7" />
        <path d="M27.16 56.63 C27.84 53.38 29.58 52.26 32 52.26 C34.42 52.26 36.16 53.38 36.84 56.63 Z" />
      </g>
    </svg>
  );
}

// "room" in the roof's cyan to periwinkle, then the mark itself is the 8
export function Wordmark({ size = 24, color, style, surface, people }) {
  const fs = size * 1.1;
  const S = fs * 1.22;
  return (
    <span aria-label="Room8" role="img" style={{ display: "inline-flex", alignItems: "flex-end", lineHeight: 1, ...style }}>
      <span aria-hidden="true" style={{
        fontFamily: "var(--display)", fontWeight: 800, fontSize: fs, lineHeight: 1, letterSpacing: "-0.05em",
        ...(color ? { color } : { background: "linear-gradient(90deg, #2EC9F2, #7F8FFF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }),
        paddingBottom: fs * 0.02,
      }}>room</span>
      <Mark size={S} surface={surface} people={people} title="" style={{ marginLeft: -S * 0.19, marginBottom: fs * 0.13 - S * (4 / 70) }} />
    </span>
  );
}

export default function Logo({ size = 28, surface, people, gap, style, wordmark = true, mark = false }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: gap ?? Math.round(size * 0.28), ...style }} aria-label="Room8">
      {(mark || !wordmark) && <Mark size={Math.round(size * 1.35)} surface={surface} people={people} title={wordmark ? "" : "Room8"} />}
      {wordmark && <Wordmark size={size} />}
    </span>
  );
}
