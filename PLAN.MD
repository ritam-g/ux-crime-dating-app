# 💔 Love.exe Not Responding — Full-Stack Verification & Execution Plan (DAO Architecture)

This document serves as the **Single Source of Truth** for the application architecture, system health, and development progress. Every phase has been validated by scanning the actual production files in both the frontend and backend.

---

## 🧠 SYSTEM ARCHITECTURE OVERVIEW

The application utilizes a decoupled, modern MERN stack featuring a **Data Access Object (DAO)** layer to isolate database transactions from controller logic, and a secure **Socket.io** integration for real-time capabilities.

```
React Frontend Layer (App, Chat, Matches, AuthContext)
                 │
                 ▼  (Axios with HTTP-Only Cookies)
Express Backend Controller Layer (authController, chatController, matchController, userController)
                 │
                 ▼
Data Access Object (DAO) Layer (user.dao.js, match.dao.js, message.dao.js)
                 │
                 ▼
Mongoose Model Layer (User, Match, Message, Conversation)
                 │
                 ▼
MongoDB Database Instance
```

---

## 🚨 SYSTEM HEALTH SUMMARY & VERIFICATION

| Subsystem / Feature | Real-world Status | Actual Implementation Details |
| :--- | :---: | :--- |
| **Login / Register** | ✅ Working | Custom endpoints utilizing Bcryptjs for hashing and secure JWT cookie payload generation. |
| **JWT Cookie Auth** | ✅ Working | Employs HTTP-only secure cookie delivery mapped through specialized `authMiddleware.js`. |
| **Match System / Swiping**| ✅ Working | `matchController.js` fetches randomized profiles excluding already interacting users. |
| **One-Sided Likes Chat** | ✅ Working | A single "like" action instantly generates a deterministic sorted Conversation ID enabling immediate chat capability. |
| **Socket Rooms** | ✅ Working | Restricts room access dynamically. Joins rooms securely verified using standard DB participant checks. |
| **Live Messages** | ✅ Working | Delivered instantly via secure `receive_message` socket broadcast channels. |
| **Chat History** | ✅ Working | History loads seamlessly through `GET /api/chat/:conversationId` utilizing indexes. |
| **Sidebar Rendering** | ✅ Working | Swapped the receiver mapping check to dynamic mongoose-compliant `_id \|\| id` checks to show partner instead of own name. |
| **AI Fallback Replies** | ✅ Working | Inactivity triggers Mistral-Medium automatically after `20,000ms` of user inactivity. |
| **AI Context Memory** | ✅ Working | Modified context assembly to supply the **entire previous chat history** to Mistral for full memory. |
| **Typing Indicator** | ✅ Working | A highly animated, bouncing dot real-time indicator broadcasts `{ userId, isTyping }` states automatically. |
| **Reconnection Logic** | ✅ Working | Reconnection hooks built into socket client configurations. |
| **Message Deduplication**| ✅ Working | In-memory React `seenMessageIds` Set guarantees zero duplicated items render inside the history view. |

---

## ⚠️ CRITICAL BUGS & RESOLVED ANOMALIES

### 1. The Env Key Casing Mismatch (RESOLVED ✅)
* **Problem:** Backend `ai.config.js` was parsing `process.env.MISTRAL_API_KEY` while the active environment file defined it as `mistralApiKey=...`. This evaluated to `undefined`, silently failing AI generation inside try-catch blocks.
* **Resolution:** Modified `ai.config.js` to look for both casing configurations: `process.env.MISTRAL_API_KEY || process.env.mistralApiKey`.

### 2. Left Sidebar Displaying the Current User instead of Peer (RESOLVED ✅)
* **Problem:** Mismatch checks compared strict database `_id` values to string parameters, resulting in users seeing themselves on the left sidebar profile row.
* **Resolution:** Swapped comparison logic to utilize standard `user._id || user.id` evaluations, ensuring conversational partners render correctly.

### 3. Mutual Match Hard-Block on Chat Initiation (RESOLVED ✅)
* **Problem:** App previously restricted chat access until both users swiped "like" on each other.
* **Resolution:** Migrated routing permissions to a "One-Sided Like" chat initiation model. A like immediately upserts a `Conversation` model, granting instant room entry.

### 4. AI Prompt Identity Leakage (RESOLVED ✅)
* **Problem:** Fallback responses occasionally contained labels like `"Jane:"` or `"You:"` prefixing sentences, or sounded assistant-like.
* **Resolution:** Replaced personality prompt templates with strict adaptive response layouts, outputting exclusively clean raw message text and stripping prefix markers via regex post-generation.

---

## 🗂️ STEP-BY-STEP PHASE DOCKING ANALYSIS

---

### 🚀 PHASE 1 — PROJECT SETUP
* **Current Status:** ✅ Fully Working
* **Actual Working Flow:** Environment initialized, dependencies installed (`express`, `mongoose`, `cors`, `bcryptjs`, `jsonwebtoken`, `socket.io`, `@langchain/mistralai`). Health check route active at `GET /api/health`.
* **Broken Points:** None.
* **Missing Logic:** None.
* **Backend Dependencies:** Node.js, Express, Cors, Dotenv.
* **Frontend Dependencies:** Axios, React 18, Vite.
* **Socket Dependencies:** Socket.io package.
* **Recommended Fix:** Keep monitored.

---

### 🗄️ PHASE 2 — DATABASE LAYER
* **Current Status:** ✅ Fully Working
* **Actual Working Flow:** Mongoose connects via `db/connectDB.js`. Centralized config loaded under `backend/src/config/config.js` using URI configurations in `.env`.
* **Broken Points:** None.
* **Missing Logic:** None.
* **Backend Dependencies:** Mongoose, MongoDB.
* **Frontend Dependencies:** None.
* **Socket Dependencies:** None.
* **Recommended Fix:** Ensure MongoDB index coverage for high-volume collections.

---

### 👤 PHASE 3 — AUTH SYSTEM & JWT COOKIES
* **Current Status:** ✅ Fully Working
* **Actual Working Flow:** Hashed credentials utilizing Bcrypt mapped via `user.dao.js`. Auth controller generates JWT payload and places it inside HTTP-Only secure cookies (`token`). Authenticated routes verified by `authMiddleware.js`.
* **Broken Points:** None.
* **Missing Logic:** None.
* **Backend Dependencies:** `bcryptjs`, `jsonwebtoken`, `cookie-parser`.
* **Frontend Dependencies:** Axios setting `withCredentials: true`.
* **Socket Dependencies:** None.
* **Recommended Fix:** Ensure Cookie secure settings are enabled in production mode.

---

### 👤 PHASE 4 — USER PROFILE MANAGEMENT
* **Current Status:** ✅ Fully Working
* **Actual Working Flow:** Profile creation, rendering, and modification endpoints mapping to MongoDB fields (`name`, `age`, `gender`, `bio`, `interests`) using `userController.js`.
* **Broken Points:** None.
* **Missing Logic:** None.
* **Backend Dependencies:** User Mongoose Model, `user.dao.js`.
* **Frontend Dependencies:** React Profile Page.
* **Socket Dependencies:** None.
* **Recommended Fix:** Add interest validation constraints on update.

---

### 💘 PHASE 5 — MATCHING SYSTEM
* **Current Status:** ✅ Fully Working
* **Actual Working Flow:** Matches list maps conversations directly to represent "available chat lines". When a user clicks "like", an Express endpoint upserts a deterministic conversation object (`initiator_target` sorted ID), immediately spawning a chat option.
* **Broken Points:** None.
* **Missing Logic:** None.
* **Backend Dependencies:** `Match` & `Conversation` Schemas, `match.dao.js`.
* **Frontend Dependencies:** `/match` and `/matches` Page views.
* **Socket Dependencies:** None.
* **Recommended Fix:** Monitor collection sizes and add a TTL index or pruning script for inactive "dislikes" to avoid document accumulation.

---

### 💬 PHASE 6 — REALTIME SOCKET CHAT
* **Current Status:** ✅ Fully Working
* **Actual Working Flow:** Express and HTTP-upgrade Handshakes verify clients using the verified HTTP-Only secure cookie parsing middleware. Socket client establishes transport, joins rooms designated by sorted conversation IDs, and emits `"send_message"`.
* **Broken Points:** None.
* **Missing Logic:** None.
* **Backend Dependencies:** Socket.io Server, Cookie parsers.
* **Frontend Dependencies:** `socket.io-client`.
* **Socket Dependencies:** `join_room`, `send_message`, `receive_message`.
* **Recommended Fix:** Implement automated client-side keep-alive pings if scaling to multiple nodes.

---

### 🤖 PHASE 7 — AI CHAT FALLBACK SYSTEM
* **Current Status:** ✅ Fully Working
* **Actual Working Flow:** When a user completes sending a message over API or Socket, the backend triggers an active `aiReplyDelayMs` timer (set to `20000ms`). If no human reply occurs within that slot, the orchestrator:
  1. Emits a socket `"typing"` start indicator state `{ userId: partnerId, isTyping: true }`.
  2. Queries the DB for the **complete chat history**.
  3. Feeds context to LangChain's Mistral model using the strict adaptive personified prompt.
  4. Saves the generated casual reply inside MongoDB and fires `"receive_message"` to the room.
  5. Automatically turns off the `"typing"` animation state inside both backend logs and frontend UI.
* **Broken Points:** None.
* **Missing Logic:** Timers are stored in-memory. A server restart during an inactive timer will drop the scheduled AI response event.
* **Backend Dependencies:** `@langchain/mistralai`, `langchain`, `aiReplyScheduler.js`.
* **Frontend Dependencies:** Animated bouncing dot Typing Indicator component and scroll effects.
* **Socket Dependencies:** `"typing"` event channel.
* **Recommended Fix:** To ensure 100% persistence in multi-instance clustering, transition the fallback scheduler timers from in-memory maps to a persistent Redis keyspace notification or BullMQ queue system.

---

## 🏆 TECHNICAL RULES FOR DEVELOPMENT CONTINUITY

1. **Strict DAO Compliance:** All future backend additions must go through the Data Access Object layer (`src/dao`). Controllers must never invoke Mongoose models directly.
2. **Deterministic Room IDs:** Conversation rooms must continue to use sorted participant IDs `[idA, idB].sort().join("_")` to avoid duplicate sockets.
3. **Internal AI Flagging:** The database stores `isAIMessage: true` for audit logs, but the frontend React UI must **never** expose this flag to the user to keep the illusion of talking to a human perfect.
