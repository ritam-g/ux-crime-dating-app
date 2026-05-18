Got it — adding a **Socket + AI chat fallback** actually makes your project way more impressive for judging. It turns your app from “fun UX chaos” into a **real-time + intelligent system with cursed UX on top** 😈

Here’s your **updated and clean README.md (ready to paste)**:

---

# 💔 Love.exe Not Responding

A deliberately **unhinged dating app UI/UX experience** built for the *Unhinged UI/UX Crimes* competition.

Users can complete a full dating flow — but the experience is intentionally frustrating, confusing, chaotic, and emotionally questionable 😈

Even worse… if your match doesn’t reply, an **AI steps in to simulate conversation** 💀

---

# 🎯 Project Goal

Build a fully functional dating app with:

👉 Authentication system
👉 User profile system
👉 Matching system
👉 Real-time chat using Socket.io
👉 AI fallback chat if user is offline / not responding

BUT with **intentional UX crimes**:

* confusing UI
* fake delays
* misleading buttons
* chaotic interactions
* emotional manipulation (light fun way 😄)

---

# ⚙️ Tech Stack

## Frontend

* React / Vite
* Tailwind CSS (optional)
* Axios
* Socket.io-client

## Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Socket.io (real-time chat)
* AI API (OpenAI / mock AI fallback)

---

# 🧠 Core Flow (MAIN USER JOURNEY)

```
Register → Login → Profile Setup → Match Users → Match → Chat (Socket) → AI Chat Fallback
```

---

# 🏗️ Project Structure

```
love-exe-not-responding/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── matchController.js
│   │   └── chatController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Match.js
│   │   └── Message.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── matchRoutes.js
│   │   └── chatRoutes.js
│   │
│   ├── socket/
│   │   └── socketServer.js
│   │
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Match.jsx
│   │   │   ├── Chat.jsx
│   │   │   └── Result.jsx
│   │   │
│   │   ├── components/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│
└── README.md
```

---

# 🔐 Backend Plan

## 1. Authentication (FIRST PRIORITY)

### Routes:

* `POST /api/auth/register`
* `POST /api/auth/login`

### Features:

* bcrypt password hashing
* JWT authentication
* protected routes middleware

---

## 2. User System

### Routes:

* `GET /api/user/profile`
* `PUT /api/user/update`

### Data:

* name
* age
* gender
* interests
* bio
* location

---

## 3. Matching System

### Routes:

* `GET /api/match/users`
* `POST /api/match/like/:id`
* `POST /api/match/dislike/:id`

### Logic:

* random user suggestions
* mutual like → match created

---

## 4. 💬 Chat System (REAL-TIME + AI FALLBACK)

### Socket.io Features:

* real-time messaging
* live chat between matched users
* typing indicator (optional chaos 😈)

---

### AI Fallback Logic:

If user is:

* offline OR
* not responding OR
* inactive for X seconds

👉 AI automatically responds like the other person

### Example:

* User: “Hey”
* AI: “Sorry I was busy thinking about you 😌”

OR even worse:

* AI gives delayed emotional responses 💀

---

## 5. Chat Routes / System

* `POST /api/chat/send`
* `GET /api/chat/history`
* socket events:

  * `send_message`
  * `receive_message`
  * `user_typing`

---

# 🎨 Frontend Plan

## Pages:

### 1. Login Page

* email/password
* fake validation delay (later UX crime layer)

---

### 2. Profile Setup Page

* user details form
* interests selection
* save profile

---

### 3. Matching Page

* swipe / like / dislike users
* random profile behavior

---

### 4. Match Page

* show match popup
* fake disappearance of match (later)

---

### 5. Chat Page (MAIN FEATURE)

* real-time socket chat
* AI fallback messages when user is inactive
* message delays (UX crime layer)

---

# 😈 UX CRIME LAYER (ADD AFTER MVP)

Once everything works:

### Add chaos like:

* fake “typing…” forever
* delayed message delivery
* disappearing chat messages
* moving buttons
* misleading labels
* fake match notifications
* random UI reloads
* AI replies too emotionally correct 💀

---

# 🚀 Development Plan

## Phase 1 (MVP FIRST)

✔ Auth system
✔ User profiles
✔ Matching system
✔ Basic chat system (socket)
✔ Working full flow

---

## Phase 2 (REAL-TIME MAGIC)

✔ Socket.io integration
✔ Chat UI working
✔ Match-based chat rooms

---

## Phase 3 (AI CHAT FEATURE 😈)

✔ AI fallback when user inactive
✔ Smart or funny responses
✔ Chat continuity

---

## Phase 4 (UX CRIMES)

✔ Add frustration mechanics
✔ Fake delays
✔ Confusing UI behavior
✔ Chaos layer everywhere

---

## Phase 5 (Deployment)

✔ Frontend deploy (Vercel)
✔ Backend deploy (Render/Railway)
✔ Demo video

---

# 🏆 Submission Checklist

* [ ] GitHub repo
* [ ] Working deployed app
* [ ] Demo video
* [ ] Full user flow
* [ ] Socket chat working
* [ ] AI fallback working
* [ ] UX chaos implemented

---

# 💀 Final Note

This app is:
👉 a real working dating platform
👉 with real-time chat
👉 plus AI emotional replacement
👉 wrapped in chaotic UX design 😈


