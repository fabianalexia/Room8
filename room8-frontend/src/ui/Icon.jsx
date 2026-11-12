// src/ui/Icon.jsx: Room8 line icon set. 24px grid, 1.8 stroke, round caps.
// Use instead of emojis everywhere.
import React from "react";

const P = {
  flame: <path d="M12 3c1 4 5.5 5.5 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.8 1.6-4.4 2.7-5.5.3 2.1 1.5 3.2 2.6 3.2-1-3.2 0-6.4.2-8.2z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.5A4.3 4.3 0 0 1 12 6.8a4.3 4.3 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20z" />,
  chat: <><path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-4.5 3.5v-3.5h0a2 2 0 0 1-1-1.7z" /></>,
  user: <><circle cx="12" cy="8.5" r="3.7" /><path d="M4.8 20c1.4-3.6 4.1-5.4 7.2-5.4s5.8 1.8 7.2 5.4" /></>,
  users: <><circle cx="9" cy="9" r="3.2" /><path d="M3.5 19c1.1-3 3.1-4.5 5.5-4.5s4.4 1.5 5.5 4.5" /><path d="M15.5 6.2a3.2 3.2 0 0 1 0 6" /><path d="M17.5 14.8c1.4.6 2.4 2 3 4.2" /></>,
  compass: <><circle cx="12" cy="12" r="8.5" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
  x: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8h.01" /></>,
  sliders: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
  more: <><circle cx="5.5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="18.5" cy="12" r="1.3" /></>,
  back: <path d="M14.5 5.5L8 12l6.5 6.5" />,
  chevron: <path d="M9.5 5.5L16 12l-6.5 6.5" />,
  chevronDown: <path d="M5.5 9.5L12 16l6.5-6.5" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  send: <path d="M4.5 12L20 4.5 15.5 20l-3.2-6.3z" />,
  moon: <path d="M19.5 14.5A7.8 7.8 0 0 1 9.5 4.5a7.8 7.8 0 1 0 10 10z" />,
  sun: <><circle cx="12" cy="12" r="3.8" /><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4" /></>,
  sparkle: <path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9-1.9 5.1-1.9-5.1-5.1-1.9 5.1-1.9z" />,
  book: <><path d="M5 5.5A2 2 0 0 1 7 3.5h12v14H7a2 2 0 0 0-2 2z" /><path d="M5 19.5a2 2 0 0 0 2 2h12" /></>,
  bolt: <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" />,
  volume: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></>,
  quiet: <><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M16 9.5l5 5M21 9.5l-5 5" /></>,
  party: <><path d="M4 20l4.5-12 7.5 7.5z" /><path d="M14 4.5c0 1.5 1 2 2 2M19.5 9c-1.5 0-2 1-2 2M17 3.5l.01.01M20.5 6l.01.01" /></>,
  leaf: <><path d="M5 19c0-8 5-13 14-13 0 9-5 14-13 14" /><path d="M5 19c3-4 6-6.5 9-8" /></>,
  paw: <><circle cx="7" cy="10" r="1.8" /><circle cx="11" cy="6.5" r="1.8" /><circle cx="15.5" cy="7" r="1.8" /><circle cx="18" cy="11" r="1.8" /><path d="M12 13c-2.8 0-5 2.6-5 4.7 0 1.4 1 2.3 2.5 2.3h5c1.5 0 2.5-.9 2.5-2.3 0-2.1-2.2-4.7-5-4.7z" /></>,
  broom: <><path d="M14 4l-3.5 8" /><path d="M7.5 12h6l2 8.5h-10z" /><path d="M10 15.5l-.5 5M13 15.5l.5 5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  pin: <><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>,
  school: <><path d="M2.5 9L12 4.5 21.5 9 12 13.5z" /><path d="M6.5 11v5c1.5 1.5 3.4 2.3 5.5 2.3s4-.8 5.5-2.3v-5M21.5 9v5" /></>,
  home: <><path d="M4 11L12 4.5 20 11" /><path d="M6 9.5V19.5h12V9.5" /></>,
  shield: <><path d="M12 3.5l7 2.8v5.4c0 4.4-2.9 7.6-7 8.8-4.1-1.2-7-4.4-7-8.8V6.3z" /><path d="M9 12l2.2 2.2L15.5 10" /></>,
  verified: <><path d="M12 2.8l2.4 1.7 2.9-.2 1 2.8 2.4 1.7-.9 2.8.9 2.8-2.4 1.7-1 2.8-2.9-.2L12 21.2l-2.4-1.7-2.9.2-1-2.8-2.4-1.7.9-2.8-.9-2.8 2.4-1.7 1-2.8 2.9.2z" /><path d="M8.6 12.2l2.3 2.3 4.6-4.8" /></>,
  camera: <><path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5L16 6.5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><circle cx="12" cy="13" r="3.5" /></>,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.7" /><path d="M20.5 16l-5-5-8.5 8.5" /></>,
  edit: <><path d="M4.5 19.5l1-4L15.5 5.5a2.1 2.1 0 0 1 3 3L8.5 18.5z" /><path d="M13.5 7.5l3 3" /></>,
  trash: <><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" /></>,
  flag: <><path d="M5.5 21V4.5" /><path d="M5.5 4.5h11l-2 4 2 4h-11" /></>,
  block: <><circle cx="12" cy="12" r="8.5" /><path d="M6 6l12 12" /></>,
  bell: <><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5l1.6 1.2-1.8 3.2-1.9-.7a7 7 0 0 1-2.3 1.3l-.3 2h-3.6l-.3-2a7 7 0 0 1-2.3-1.3l-1.9.7-1.8-3.2 1.6-1.2a7 7 0 0 1 0-2.9L3 9.3l1.8-3.2 1.9.7a7 7 0 0 1 2.3-1.3l.3-2h3.6l.3 2a7 7 0 0 1 2.3 1.3l1.9-.7L21 9.3l-1.6 1.2a7 7 0 0 1 0 3z" /></>,
  logout: <><path d="M14.5 4.5h-8a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8" /><path d="M11 12h9.5M17 8.5l3.5 3.5-3.5 3.5" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="M4 7l8 6 8-6" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  eye: <><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></>,
  eyeOff: <><path d="M4 4l16 16" /><path d="M10.2 5.7A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.6 7.2C3.9 9 2.5 12 2.5 12s3.5 6.5 9.5 6.5a9.6 9.6 0 0 0 4.3-1" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.5 3.5 5.3 3.5 8.5s-1.1 6-3.5 8.5c-2.4-2.5-3.5-5.3-3.5-8.5s1.1-6 3.5-8.5z" /></>,
  refresh: <><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.5v4h-4" /></>,
  star: <path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>,
  menu: <path d="M4.5 7.5h15M4.5 12h15M4.5 16.5h15" />,
  google: null,
  linkedin: null,
  music: <><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></>,
  coffee: <><path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" /><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2.5M11.5 3.5v2.5" /></>,
  door: <><path d="M6 20.5V4.5h12v16" /><path d="M3.5 20.5h17M14.5 12.5h.01" /></>,
  calendar: <><rect x="4" y="5.5" width="16" height="15" rx="2.5" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l8.5-8.5M16 7l2.5 2.5M14 9l2 2" /></>,
  smoke: <><path d="M3.5 15.5h13v3h-13zM19 15.5v3M21.5 15.5v3" /><path d="M17 12.5c0-2 2-2 2-4" /></>,
};

export default function Icon({ name, size = 22, stroke = 1.8, color = "currentColor", fill = "none", style, title }) {
  if (name === "google") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={!title} role={title ? "img" : undefined} aria-label={title} style={style}>
        <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
        <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9z" />
        <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9z" />
      </svg>
    );
  }
  if (name === "linkedin") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={!title} role={title ? "img" : undefined} aria-label={title} style={style}>
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
        <path fill="#fff" d="M7.2 9.6h2.3V17H7.2zM8.3 6a1.3 1.3 0 1 1 0 2.7 1.3 1.3 0 0 1 0-2.7zM11 9.6h2.2v1c.3-.6 1.1-1.2 2.3-1.2 2.4 0 2.9 1.6 2.9 3.7V17h-2.3v-3.4c0-.8 0-1.9-1.2-1.9s-1.4.9-1.4 1.8V17H11z" />
      </svg>
    );
  }
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={!title} role={title ? "img" : undefined} aria-label={title}
      style={{ flexShrink: 0, ...style }}
    >
      {P[name] || P.sparkle}
    </svg>
  );
}

// Lifestyle trait → icon + label, shared by cards, profiles and onboarding
export const TRAITS = {
  sleep_schedule: {
    early_bird: { icon: "sun", label: "Early bird" },
    night_owl: { icon: "moon", label: "Night owl" },
    flexible: { icon: "clock", label: "Flexible sleeper" },
  },
  cleanliness: {
    very_clean: { icon: "sparkle", label: "Spotless" },
    clean: { icon: "sparkle", label: "Neat" },
    relaxed: { icon: "broom", label: "Relaxed about mess" },
    messy: { icon: "broom", label: "Not fussy" },
  },
  study_habits: {
    library: { icon: "book", label: "Library studier" },
    in_room: { icon: "book", label: "Studies in room" },
    anywhere: { icon: "book", label: "Studies anywhere" },
    rarely: { icon: "party", label: "Rarely studies" },
  },
  guests: {
    never: { icon: "door", label: "No guests" },
    occasionally: { icon: "door", label: "Guests sometimes" },
    often: { icon: "users", label: "Guests often" },
  },
  noise: {
    silent: { icon: "quiet", label: "Needs silence" },
    quiet: { icon: "quiet", label: "Likes it quiet" },
    moderate: { icon: "volume", label: "Music is fine" },
    lively: { icon: "volume", label: "Bring the noise" },
  },
  social: {
    very_social: { icon: "party", label: "Very social" },
    social: { icon: "users", label: "Social" },
    private: { icon: "coffee", label: "Private" },
    very_private: { icon: "door", label: "Keeps to self" },
  },
  partying: {
    never: { icon: "coffee", label: "Party-free" },
    sometimes: { icon: "party", label: "Parties sometimes" },
    often: { icon: "party", label: "Loves a party" },
  },
  smoking: {
    no: { icon: "leaf", label: "Smoke-free" },
    outside_only: { icon: "smoke", label: "Smokes outside" },
    yes: { icon: "smoke", label: "Smoker" },
  },
};

export function traitsFor(prefs = {}, limit = 6) {
  const out = [];
  for (const key of ["sleep_schedule", "cleanliness", "study_habits", "noise", "social", "guests", "partying", "smoking"]) {
    const v = prefs?.[key];
    const t = v && TRAITS[key]?.[v];
    if (t) out.push({ key, ...t });
  }
  return out.slice(0, limit);
}
