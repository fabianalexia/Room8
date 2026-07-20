---
name: Room8 project overview
description: Room8 (swiperoom8.com) — roommate-matching app for college students. Key architecture, hosting, and pitch-readiness context.
type: project
---

Room8 is a Tinder-style roommate matching app targeting college students.

**Why:** Pitch meeting to Whitman investor. Site must be demo-ready at swiperoom8.com.

**Stack:**
- Frontend: React 18 + Vite, deployed on Netlify (swiperoom8.com)
- Backend: Python Flask + SQLAlchemy, deployed on Render (room8-4dq7.onrender.com)
- DB: SQLite (dev) / PostgreSQL (prod on Render)
- Photos: Cloudinary CDN
- Auth: JWT in localStorage as `room8_jwt`

**Key files:**
- Swipe deck: `room8-frontend/src/components/SwipeDeck.jsx` (all inline styles, no external CSS)
- Demo profiles: hardcoded `DEMO_PROFILES` array in SwipeDeck.jsx (shown when no API candidates)
- Auth: `room8-backend/routes/auth_routes.py`
- User model: `room8-backend/room8_models/user.py`
- Seed data: `room8-backend/seed.py`

**How to apply:** When making UI changes, all styles are inline in JSX. No Tailwind, no CSS modules.
