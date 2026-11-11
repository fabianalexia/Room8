// src/seo.js: per-route title, description, canonical and share tags (audit D5.1, D5.5)
import { useEffect } from "react";
import { SITE_URL } from "./siteContent";

const DEFAULT = {
  title: "Room8 - Find Your People",
  description: "Room8 is the roommate matching app built for college students. Verify with your .edu email and match on sleep schedules, study habits, cleanliness and noise.",
};

export const ROUTE_META = {
  "/": DEFAULT,
  "/schools": {
    title: "Room8 for Universities - Verified Roommate Matching for Your Campus",
    description: "Give your students roommate matching where classmates verify with their school .edu email, with built-in reporting and blocking. Free for students.",
  },
  "/purpose": {
    title: "Why Room8 Exists - Roommate Matching for College Students",
    description: "Why we built Room8: so students stop going random on roommates and find someone who fits how they actually live.",
  },
  "/changelog": {
    title: "Room8 Changelog - What We've Shipped",
    description: "Dated list of Room8 features and updates: messaging, verification, school launches and more.",
  },
  "/vs/room8-vs-meetyourclass": {
    title: "Room8 vs MeetYourClass - Roommate Finder Comparison",
    description: "An honest look at Room8 and MeetYourClass: how each verifies students, how matching works, and who each one fits.",
  },
  "/vs/room8-vs-zeemee": {
    title: "Room8 vs ZeeMee - Roommate Finder Comparison",
    description: "An honest look at Room8 and ZeeMee: how each verifies students, how roommate matching works, and who each one fits.",
  },
  "/privacy": {
    title: "Privacy Policy - Room8",
    description: "How Room8 handles your data. We do not sell your data or share it with advertisers.",
  },
  "/terms": {
    title: "Terms of Service - Room8",
    description: "The terms for using Room8, the roommate matching app for college students.",
  },
  "/login": { title: "Log In - Room8", description: DEFAULT.description },
  "/register": {
    title: "Sign Up Free - Room8",
    description: "Create your free Room8 profile with your school .edu email and start matching with roommates from your campus.",
  },
};

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useRouteMeta(pathname) {
  useEffect(() => {
    const path = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
    const meta = ROUTE_META[path] || DEFAULT;
    const url = SITE_URL + (path === "/" ? "/" : path);
    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setCanonical(url);
  }, [pathname]);
}
