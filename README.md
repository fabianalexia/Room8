# Room8 — Find Your Perfect College Roommate

Room8 is a college roommate matching app built for students. Swipe through profiles from your school, match based on lifestyle compatibility, and message your matches — all in one mobile-first app.

**Stack:** Flask 3 + React 18 + Vite · SQLite (dev) / PostgreSQL (prod) · Deployed on Render + Vercel

---

## Features

- **Swipe deck** — Tinder-style cards filtered by school, with compatibility tags
- **Compatibility scoring** — dorm preference overlap scored 0–100 across 8 lifestyle dimensions
- **Community Board** — school-wide post feed with likes and replies
- **Messaging** — real-time-style chat with matched users
- **Profile + photo gallery** — multiple photo upload, dorm preferences survey, bio
- **Report / block** — report a user; they're hidden from your deck immediately
- **School email hint** — nudges `.edu` signups for campus-specific matching
- **Mobile-first** — safe-area insets, iOS zoom fix, responsive layouts

---

## Local Development

### Backend

```bash
cd room8-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in SECRET_KEY at minimum
python3 app.py
```

Backend runs at `http://127.0.0.1:5000`.

### Frontend

```bash
cd room8-frontend
npm install
cp .env.example .env        # set VITE_API_URL=http://127.0.0.1:5000
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Environment Variables

### Backend (`room8-backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | Yes | — | Flask session secret |
| `DATABASE_URL` | No | `sqlite:///room8.db` | SQLAlchemy DB URL |
| `CORS_ORIGINS` | No | `http://127.0.0.1:5173,http://localhost:5173` | Comma-separated allowed origins |
| `FLASK_ENV` | No | `production` | `development` enables debug mode |
| `UPLOAD_FOLDER` | No | `uploads` | Directory for uploaded photos |

### Frontend (`room8-frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Full URL of the backend API |

---

## Deployment

### Backend → Render (Web Service)

1. Create a new **Web Service** on [render.com](https://render.com), connect your repo, set root to `room8-backend`.
2. **Build command:** `pip install -r requirements.txt`
3. **Start command:** `python app.py`
4. Add environment variables in the Render dashboard:
   - `SECRET_KEY` — generate with `python3 -c "import secrets; print(secrets.token_hex(32))"`
   - `DATABASE_URL` — paste your Render PostgreSQL URL (auto-converted from `postgres://` to `postgresql://`)
   - `CORS_ORIGINS` — your Vercel frontend URL (e.g. `https://room8.vercel.app`)
   - `FLASK_ENV` — `production`
5. Add a **Render PostgreSQL** database and link it; copy the internal URL into `DATABASE_URL`.

### Frontend → Vercel

1. Import your repo on [vercel.com](https://vercel.com), set root to `room8-frontend`.
2. Framework preset: **Vite**
3. Add environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g. `https://room8-api.onrender.com`)
4. Deploy. Vercel auto-deploys on every push to `main`.

---

## Project Structure

```
room8/
├── room8-backend/
│   ├── app.py                  # Flask factory, CORS, migrations
│   ├── requirements.txt
│   ├── .env.example
│   ├── uploads/                # user photo storage
│   ├── room8_models/
│   │   ├── user.py             # User model with photos, dorm_prefs
│   │   ├── match.py            # Swipe + Match models
│   │   ├── message.py
│   │   ├── board.py            # Post, PostLike, PostReply
│   │   └── report.py           # Report model
│   └── routes/
│       ├── auth_routes.py
│       ├── candidates_routes.py # swipe candidates, likes, compatibility
│       ├── profile_routes.py
│       ├── photo_routes.py
│       ├── match_routes.py
│       ├── message_routes.py
│       ├── board_routes.py
│       └── report_routes.py
└── room8-frontend/
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── css/
        │   └── mobile.css
        ├── assets/
        │   └── images/         # logo.png, hero-bg.jpg, mission.webp
        ├── components/
        │   ├── SwipeDeck.jsx   # swipe cards + report modal
        │   └── BottomNav.jsx
        └── pages/
            ├── Home.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── ProfilePage.jsx
            ├── LikesPage.jsx
            ├── DiscoverPage.jsx
            ├── MessagesPage.jsx
            └── onboarding/
                ├── OnboardingSchoolPage.jsx
                └── OnboardingLifestylePage.jsx
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/candidates?user_id=X` | Swipe candidates (school-filtered) |
| GET | `/api/candidates/likes/<id>` | Users who liked me |
| GET | `/api/candidates/compatibility/<id>` | Mutual matches sorted by score |
| POST | `/api/match/swipe` | Record swipe (like/pass) |
| GET | `/api/match/matches/<id>` | My matches |
| GET | `/api/messages/<match_id>` | Messages in a match |
| POST | `/api/messages/<match_id>` | Send message |
| GET | `/api/profile/<id>` | Get profile |
| PUT | `/api/profile/<id>` | Update profile fields |
| POST | `/api/profile/photo/<id>` | Upload primary photo |
| POST | `/api/profile/<id>/photos` | Add gallery photo |
| DELETE | `/api/profile/<id>/photos` | Remove gallery photo |
| GET | `/api/board` | Community board posts |
| POST | `/api/board` | Create post |
| POST | `/api/board/<id>/like` | Toggle post like |
| GET | `/api/board/<id>/replies` | Get replies |
| POST | `/api/board/<id>/replies` | Add reply |
| POST | `/api/report` | Report + block a user |

---

## Security Notes

- Passwords hashed with Werkzeug `generate_password_hash` (pbkdf2:sha256)
- No JWTs — session state kept in `localStorage` (suitable for MVP; add token auth before scaling)
- Uploaded files saved with `uuid`-prefixed names; only image MIME types accepted
- Reported users are immediately hidden via a `skip` swipe record
- CORS restricted to explicit origin list via `CORS_ORIGINS` env var

---

## Pitching to Schools

Room8 is free for students and requires no institutional integration. Schools can be onboarded by:

1. Sharing the link with their housing or orientation office
2. Students sign up with their `.edu` email — school name is parsed automatically
3. The swipe deck filters by school, so students only see potential roommates from their campus

Key stats shown on the landing page: **500+ Students Matched · 50+ Schools · Always Free**
