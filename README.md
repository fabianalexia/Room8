# Room8 🏠
### Find your perfect roommate — swipe-style matching for the modern renter.

**Live Demo:** [findroom8.netlify.app](https://findroom8.netlify.app) &nbsp;|&nbsp; **Contact:** [partner@room8app.com](mailto:partner@room8app.com)

> Demo accounts: `emma@demo.com` / `maya@demo.com` — password: `password`

---

## What is Room8?

Room8 is a full-stack SaaS platform that makes finding a roommate as easy as swiping. Users create profiles, browse compatible matches, and connect — all in one place. Built entirely from scratch by a solo developer, Room8 is actively being pitched as a B2B licensing product to university housing departments at **$5,000–$15,000/yr per campus.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Flask (Python) REST API |
| Database | PostgreSQL (migrated from SQLite) |
| Auth | JWT + Email Verification |
| Media | Cloudinary (photo uploads) |
| Real-time | WebSockets |
| Deployment | Netlify (frontend) · Render (backend) |

---

## Features

- 🔐 **User Authentication** — JWT-based login, registration, and email verification flow
- 📸 **Photo Uploads** — Cloudinary integration for profile photo management
- 💬 **Real-time Matching** — WebSocket-powered live interactions
- 🔍 **Browse & Filter** — Swipe-style roommate discovery with preference matching
- 🛡️ **CORS Configured** — Secure cross-origin setup across Netlify + Render environments
- 📱 **Responsive Design** — Mobile-first UI built for real users

---

## Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│   React + Vite SPA  │  HTTP   │   Flask REST API      │
│   (Netlify CDN)     │◄───────►│   (Render)            │
│                     │WebSocket│                       │
│  - Auth pages       │         │  - /auth routes       │
│  - Profile views    │         │  - /matches routes    │
│  - Match feed       │         │  - /users routes      │
└─────────────────────┘         └──────────┬───────────┘
                                           │
                                 ┌─────────▼──────────┐
                                 │    PostgreSQL DB    │
                                 │    (Render)         │
                                 └────────────────────┘
                                           │
                                 ┌─────────▼──────────┐
                                 │    Cloudinary       │
                                 │  (Photo Storage)    │
                                 └────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL

### Frontend Setup
```bash
git clone https://github.com/fabianalexia/Room8.git
cd Room8/frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd Room8/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `/backend`:
```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_url
FRONTEND_URL=http://localhost:5173
```

```bash
flask db upgrade
flask run
```

---

## Business Model

Room8 is designed for **B2B university licensing**:

- Universities license the platform for their student housing portals
- Pricing: **$5,000 – $15,000/year** per campus
- First pitch target: **The Evergreen State College**
- Value proposition: safer, structured roommate matching vs. Facebook groups and random assignment

---

## Roadmap

- [ ] Mobile app (React Native)
- [ ] In-app messaging
- [ ] University SSO / .edu email verification
- [ ] Admin dashboard for housing departments
- [ ] Listing/sublease board integration

---

## Author

**Alexia Fabian** — Full-Stack Engineer & Founder

[GitHub](https://github.com/fabianalexia) · [LinkedIn](https://linkedin.com/in/alexiafabian) · [Portfolio](https://fabianwebstudio.org)

---

*Built solo. Shipped to production. Actively growing.*
