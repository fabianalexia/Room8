# 🏠 Room8

A full-stack roommate finder app inspired by Tinder — swipe through profiles, match with potential roommates, and message your matches. Built with Flask and React.

> 🚧 Work in Progress — core features are functional, full backend integration in progress.

---

## ✨ Features

### ✅ Done
- **User Authentication** — Register and login with protected routes
- **Swipe Deck** — Tinder-style swipe UI to browse roommate profiles
- **Match System** — Match with other users
- **Messaging** — Chat page with match list and conversations
- **Photo Cards** — Profile cards with name, age, and distance
- **Protected Routes** — Pages only accessible when logged in
- **Flask REST API** — Backend with routes and database models
- **SQLite Database** — Persistent data storage with seed data

### 🚧 In Progress
- Connecting swipe deck to real user profiles from backend
- Real-time messaging fully connected to backend
- Full profile creation and editing

---

## 🖥️ Tech Used

**Frontend**
- React
- React Router DOM
- Tailwind CSS
- react-tinder-card (swipe UI)

**Backend**
- Python / Flask
- SQLAlchemy
- SQLite
- Flask-JWT (authentication)

---

## ▶️ How to Run

### Backend
```bash
cd room8-backend
pip3 install -r requirements.txt
python3 app.py
```

### Frontend
```bash
cd room8-frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`

---

## 🗂️ Project Structure

```
room8/
├── room8-backend/
│   ├── app.py
│   ├── config.py
│   ├── seed.py
│   ├── requirements.txt
│   ├── room8_models/
│   └── routes/
├── room8-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SwipeDeck.jsx
│   │   │   ├── MatchList.jsx
│   │   │   ├── PhotoCard.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── MessagesPage.jsx
│   │   │   └── Purpose.jsx
│   │   └── context/
│   │       └── CartContext.jsx
└── README.md
```

---

## 🚀 About This Project

Room8 was built to solve the problem of finding compatible roommates. Instead of scrolling through listings, users can swipe through profiles and connect with people they match with — making the process faster and more personal.

---

## 📌 Future Improvements

- Connect swipe deck to live backend profiles
- Real-time messaging with WebSockets
- User profile creation and photo uploads
- Filter by location, budget, and lifestyle
- Deploy to Render (backend) and Vercel (frontend)
