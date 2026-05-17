# Backend Truth Map: Deep Debug & Flow Document

## 1. Backend Truth Overview

**What actually happens (based on actual code):**
*   **Request Lifecycle:** HTTP requests hit the `server.js` entry point, which wraps `app.js`. `app.js` handles routing (`/api/match`, `/api/chat`, etc.) and middleware (CORS, Cookie Parser, JSON body parser).
*   **Controller execution:** Logic routes to specific controllers (e.g., `matchController.js`). Controllers delegate DB operations to DAOs (`match.dao.js`), ensuring separation of concerns.
*   **Realtime Layer:** Socket.io is initialized in `server.js` on top of the Node HTTP server. It listens independently for events (`join_room`, `send_message`). There is **no native integration** between the HTTP controllers and the Socket emit cycle—they operate independently.

---

## 2. Environment & Config Flow (CRITICAL SECTION)

**How `.env` is loaded:**
*   Environment variables are handled centrally in `src/config/config.js`.
*   It searches for `.env` in two candidate paths: `../../.env` and `../.env` relative to the `config.js` location. This maps to the `backend/` root directory.
*   `dotenv.config()` is called **only if** the file exists.

**What breaks if env is undefined:**
*   `MONGO_URI`: Falls back to an empty string `""`. If your `.env` doesn't load, `connectDB()` will fail silently or crash the server depending on Mongoose's error handling. **THIS IS A CRITICAL BUG RISK.**
*   `JWT_SECRET`: Falls back to `"dev_jwt_secret"`. If `.env` is ignored in production, all JWTs are signed with a hardcoded secret, creating a massive security vulnerability.
*   `PORT`: Falls back to `5000`.

**Risk Points:**
*   If `backend/.env` is renamed, missing, or loaded from a different working directory, the app uses defaults without crashing immediately, leading to silent failures (e.g., failed DB connections).

---

## 3. Auth Flow (REAL IMPLEMENTATION)

*   **JWT Creation:** Done in `authController.js` via `createAuthToken()`. Signs `{ id: user._id, email: user.email }` with `jwtExpiresIn: "7d"`.
*   **Cookie Setting:** Uses a custom util `setAuthCookie(res, token)`. The token is stored in an HTTP-only cookie named `"token"`.
*   **Edge Cases:** 
    *   If the cookie expires, the frontend will continue to send requests but receive 401s (assuming your auth middleware handles this).
    *   **Silent failure:** If the browser blocks third-party cookies (because of CORS/domain mismatch between frontend and backend), the cookie will never be set, and all subsequent private API calls will fail.

---

## 4. 🔥 MATCH CONTROLLER DEEP DIVE (MOST IMPORTANT)

**`likeUser` Flow (Step-by-Step):**
1. Extracts `targetUserId` from URL params. Validates it isn't the same as `req.user.id`.
2. Saves the like action via `saveMatchAction({ initiatorId, targetUserId, action: "like" })`.
3. Queries DB for a reverse like via `findReverseLike(targetUserId, req.user.id)`.
4. If reverse like DOES NOT exist: returns `{ isMatched: false }`.
5. If reverse like DOES exist: calls `markBothRecordsAsMatched(req.user.id, targetUserId)` to update the DB.

**Race Conditions & Missing Checks:**
*   **RACE CONDITION BUG:** If User A and User B swipe right on each other at the *exact same millisecond*, both will run `saveMatchAction`, and both might run `findReverseLike` before the other's transaction commits. Both could return `isMatched: false`, or both could attempt to trigger `markBothRecordsAsMatched`, causing duplicate match records. There are no database transactions used here.
*   **Missing Error Boundary:** If `markBothRecordsAsMatched` fails halfway (e.g. updates User A's match but fails on User B), the database enters an inconsistent state.

**`dislikeUser` Flow:**
*   Saves a "dislike" action. Always returns `{ isMatched: false }`. Simple and straightforward.

**Why match may NOT be created even if users liked each other:**
*   If `req.user.id` or `targetUserId` are passed as string vs ObjectId inconsistently across the frontend, `findReverseLike` will fail to match them in MongoDB.
*   If the initial `saveMatchAction` fails silently or is cached.

---

## 5. SOCKET.IO FLOW (REAL BEHAVIOR)

**Server Initialization:**
*   Started in `server.js` via `initializeSocket(httpServer)`. Allows cross-origin `*` (which might conflict with strict cookie CORS policies later).

**`join_room` Logic:**
*   Expects payload `{ matchId }`.
*   **SECURITY BUG:** It just calls `socket.join(matchId)`. There is **zero authentication** to verify if the socket actually belongs to a user in that match. Anyone who knows or guesses a `matchId` can join the room and listen to messages.

**`send_message` Handling:**
1. Validates `matchId`, `senderId`, `content`.
2. Checks authorization: `await findMatchedRecordForUser(matchId, senderId)`. If false, emits `message_error`.
3. Saves to DB: `createMessage({ matchId, sender, content })`.
4. Emits to room: `ioInstance.to(matchId).emit("receive_message", savedMessage)`.

**Why message may not reach client:**
*   **Room Mismatch:** If the frontend fails to call `emit("join_room", { matchId })` when opening the chat UI, they will not be in the Socket.io room. The server will emit the message into the void.
*   **Race Condition:** If the sender emits `send_message` before the receiver's socket has successfully finished `join_room`, the receiver misses the live message.

---

## 6. FRONTEND ↔ BACKEND REAL DATA FLOW

*   The backend relies heavily on `matchId` for Socket rooms. If the frontend uses `userId` instead of `matchId` to join rooms, the rooms will be mismatched.
*   The frontend assumes `likeUser` will instantly return `isMatched: true`. If there is network latency, the UI state might desync from the DB.

---

## 7. COMMON BUG POINTS (BASED ON MY CODE)

1. **`MONGO_URI` Silent Failure:** `config.js` defaults to `""`. If `.env` path logic fails on the deployed server, DB connection fails silently or crashes the app unexpectedly.
2. **Socket Room Infiltration (Bug):** `join_room` lacks authorization. Anyone can join any `matchId` room.
3. **Match Race Condition:** Concurrent likes from two users will cause unpredictable match creation due to a lack of DB transactions in `likeUser`.
4. **CORS / Cookie Mismatch:** `app.use(cors({ origin: true, credentials: true }))` is used for Express, but `ioInstance` uses `cors: { origin: "*" }`. This inconsistency can cause WebSocket connection issues in production.

---

## 8. DEBUG CHECKLIST (VERY IMPORTANT)

**To verify env is loaded correctly:**
*   Add `console.log("MONGO_URI Loaded:", !!config.mongoURI);` in `server.js` before `connectDB()`.

**To verify match creation:**
*   Log the exact IDs being compared in `findReverseLike`: `console.log("Checking reverse like for", targetUserId, req.user.id);`
*   Verify whether `req.user.id` is a String or `ObjectId`.

**To verify socket room join:**
*   In `socket.on("join_room")`, log: `console.log("Socket", socket.id, "joined room:", matchId);`
*   On the frontend, add a listener for `joined_room` to ensure the server actually acknowledged the room assignment.

**To verify message delivery:**
*   Before `ioInstance.to(matchId).emit`, log: `console.log("Emitting message to room", matchId);`
*   Ensure the frontend is listening to `receive_message` **before** it fires `join_room`.
