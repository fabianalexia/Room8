// src/api.js

// ---------------- Base URL ----------------
// Set VITE_API_URL in your frontend .env (e.g. http://127.0.0.1:5000)
export const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000")
  .replace(/\/+$/, "");

// ---------------- Local storage helpers ----------------
// We only store lightweight display info (name, email, profile_complete).
// The JWT lives in an httpOnly cookie managed by the browser — never localStorage.
const LS_KEY = "user";

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(u) {
  // Persist only non-sensitive display fields
  const { id, first_name, last_name, email, profile_complete, photo } = u;
  localStorage.setItem(LS_KEY, JSON.stringify({ id, first_name, last_name, email, profile_complete, photo }));
}

export function logout() {
  localStorage.removeItem(LS_KEY);
  // Fire-and-forget: ask the server to clear the JWT cookie
  fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
}

// ---------------- Fetch helper ----------------
async function doFetch(url, opts = {}) {
  const res = await fetch(url, {
    credentials: "include",
    ...opts,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch { /* non-JSON body */ }
    throw new Error(msg);
  }

  // 204 / empty-safe
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ---------------- Health (optional) ----------------
export function health() {
  return doFetch(`${API_URL}/api/health`);
}

// ---------------- Auth ----------------
export function register({ first_name, last_name, email, password }) {
  return doFetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ first_name, last_name, email, password }),
  });
}

export function login({ email, password }) {
  return doFetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export function forgotPassword(email) {
  return doFetch(`${API_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token, new_password) {
  return doFetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });
}

export function resendVerification() {
  return doFetch(`${API_URL}/api/auth/resend-verification`, {
    method: "POST",
  });
}

export function refreshToken() {
  return doFetch(`${API_URL}/api/auth/refresh`, { method: "POST" });
}

// ---------------- Candidates / Matches / Swipes ----------------
export function getCandidates(userId, reset = false) {
  const url = reset
    ? `${API_URL}/api/candidates/${userId}?reset=true`
    : `${API_URL}/api/candidates/${userId}`;
  return doFetch(url);
}

export function getMatches(userId) {
  return doFetch(`${API_URL}/api/matches/${userId}`);
}

export function getLikes(userId) {
  return doFetch(`${API_URL}/api/likes/${userId}`);
}

export function likeUser(userId, targetId) {
  return doFetch(`${API_URL}/api/swipe/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_id: targetId }),
  }); // -> { ok: true, matched: boolean }
}

export function skipUser(userId, targetId) {
  return doFetch(`${API_URL}/api/swipe/skip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_id: targetId }),
  }); // -> { ok: true }
}

// ---------------- Chat ----------------
export function getChat(userId, peerId) {
  return doFetch(`${API_URL}/api/chat/${peerId}`);
}

export function sendMessage(peerId, userId, text) {
  return doFetch(`${API_URL}/api/chat/${peerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }); // -> { ok: true }
}

// ---------------- Profile ----------------
export function updateProfile(userId, formData) {
  // formData should be a FormData instance (handles file + text fields)
  return doFetch(`${API_URL}/api/profile/${userId}`, {
    method: "PUT",
    body: formData,
    // Don't set Content-Type — browser sets multipart boundary automatically
  });
}

export function getProfile(userId) {
  return doFetch(`${API_URL}/api/profile/${userId}`);
}

export function getProfileStatus() {
  return doFetch(`${API_URL}/api/profile/status`);
}

export function markProfileComplete() {
  return doFetch(`${API_URL}/api/profile/complete`, {
    method: "POST",
  });
}

// ---------------- Report / Block ----------------
export function reportUser(reporterId, reportedId, reason = "inappropriate", notes = "") {
  return doFetch(`${API_URL}/api/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reported_id: reportedId, reason, notes }),
  });
}

export function blockUser(blockerId, blockedId) {
  return doFetch(`${API_URL}/api/block`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocked_id: blockedId }),
  });
}

export function unmatchUser(userId, peerId) {
  return doFetch(`${API_URL}/api/match/${peerId}`, {
    method: "DELETE",
  });
}

// ---------------- Compatibility ----------------
export function getCompatibility(userId) {
  return doFetch(`${API_URL}/api/compatibility/${userId}`);
}

// ---------------- Community Board ----------------
export function getPosts(userId, offset = 0) {
  return doFetch(`${API_URL}/api/board?offset=${offset}`);
}

export function createPost(userId, content) {
  return doFetch(`${API_URL}/api/board`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export function togglePostLike(userId, postId) {
  return doFetch(`${API_URL}/api/board/${postId}/like`, {
    method: "POST",
  });
}

export function getReplies(postId) {
  return doFetch(`${API_URL}/api/board/${postId}/replies`);
}

export function addReply(userId, postId, content) {
  return doFetch(`${API_URL}/api/board/${postId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

// ---------------- Survey ----------------
export function saveSurvey(userId, answers) {
  return doFetch(`${API_URL}/api/survey`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
}

// ---------------- Roommate Confirmation ----------------
export function getRoommateStatus(peerId) {
  return doFetch(`${API_URL}/api/roommate/status/${peerId}`);
}

export function confirmRoommate(peerId) {
  return doFetch(`${API_URL}/api/roommate/confirm/${peerId}`, { method: "POST" });
}

export function getNotifications() {
  return doFetch(`${API_URL}/api/roommate/notifications`);
}

export function markNotificationRead(notifId) {
  return doFetch(`${API_URL}/api/roommate/notifications/${notifId}/read`, { method: "POST" });
}

// ---------------- Photo gallery ----------------
export function addPhoto(userId, file) {
  const form = new FormData();
  form.append("photo", file);
  return doFetch(`${API_URL}/api/profile/${userId}/photos`, {
    method: "POST",
    body: form,
  });
}

export function removePhoto(userId, url) {
  return doFetch(`${API_URL}/api/profile/${userId}/photos`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
}

// ---------------- Profile photo upload ----------------
export async function uploadProfilePhoto(userId, file) {
  const form = new FormData();
  form.append("file", file); // expects input[type=file].files[0]

  const res = await fetch(`${API_URL}/api/profile/photo`, {
    method: "POST",
    body: form, // NOTE: no Content-Type header; browser sets multipart boundary
    credentials: "include",
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json(); // -> { ok: true, user: { ...updated user... } }
}
