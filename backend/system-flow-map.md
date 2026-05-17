# System Flow Map

This document maps the current MERN + Socket.io backend exactly as it exists in this repo. It focuses on real execution flow, data movement, match creation, socket room behavior, and the points where frontend state can fall out of sync with backend truth.

Source files used:

- `backend/server.js`
- `backend/src/app.js`
- `backend/src/config/config.js`
- `backend/src/db/connectDB.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/matchController.js`
- `backend/src/controllers/chatController.js`
- `backend/src/controllers/userController.js`
- `backend/src/dao/user.dao.js`
- `backend/src/dao/match.dao.js`
- `backend/src/dao/message.dao.js`
- `backend/src/middleware/authMiddleware.js`
- `backend/src/models/User.js`
- `backend/src/models/Match.js`
- `backend/src/models/Message.js`
- `backend/src/routes/authRoutes.js`
- `backend/src/routes/matchRoutes.js`
- `backend/src/routes/chatRoutes.js`
- `backend/src/routes/userRoutes.js`
- `backend/src/socket/socketServer.js`
- `backend/src/utils/authCookies.js`
- `frontend/src/services/api.js`
- `frontend/src/services/socket.js`
- `frontend/src/pages/Match.jsx`
- `frontend/src/pages/Matches.jsx`
- `frontend/src/pages/Chat.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/App.jsx`

## 1. System Overview

### High Level Architecture

The app has two separate communication channels:

- REST API for authentication, profile, matching, match lists, chat history, and fallback message sending.
- Socket.io for live chat room joining and realtime message delivery.

Backend startup path:

```text
backend/server.js
  -> connectDB()
  -> createServer(app)
  -> initializeSocket(httpServer)
  -> httpServer.listen(config.port)
```

Express app path:

```text
HTTP request
  -> Express app from backend/src/app.js
  -> CORS + cookieParser + express.json
  -> mounted route group
  -> authMiddleware when route is private
  -> controller
  -> DAO
  -> Mongoose model
  -> MongoDB
  -> JSON response
  -> frontend state update
```

Socket path:

```text
Frontend socket client
  -> http://localhost:5000 Socket.io server
  -> connection event
  -> join_room or send_message event
  -> optional DB validation
  -> Message save
  -> emit receive_message to matchId room
  -> frontend receive_message handler
```

### REST vs Socket Separation

REST is used for durable state and authenticated actions:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `GET /api/match/users`
- `POST /api/match/like/:targetUserId`
- `POST /api/match/dislike/:targetUserId`
- `GET /api/match/my-matches`
- `GET /api/chat/:matchId`
- `POST /api/chat/send`

Socket.io is used for realtime chat:

- `connection`
- `join_room`
- `joined_room`
- `join_error`
- `send_message`
- `receive_message`
- `message_error`
- `disconnect`

The match system connects to chat through the `Match` document `_id`. That `_id` becomes:

- the match identifier returned by `/api/match/like/:targetUserId` when mutual like happens,
- the match identifier returned by `/api/match/my-matches`,
- the `matchId` used by `GET /api/chat/:matchId`,
- the `matchId` used by `POST /api/chat/send`,
- the Socket.io room name used by `join_room`,
- the `matchId` stored on every `Message`.

THIS IS A BREAK POINT: the socket room is named with `matchId`, not with either user's `userId`. If the frontend joins a room using a user id, target id, or reverse match id that does not match the message's `matchId`, realtime delivery will not appear in that room.

## 2. Auth Flow

### Register Flow

Frontend call:

```text
frontend/src/services/api.js
  registerUser(payload)
  -> POST http://localhost:5000/api/auth/register
  -> withCredentials: true
```

Backend route:

```text
backend/src/app.js
  app.use("/api/auth", authRoutes)

backend/src/routes/authRoutes.js
  router.post("/register", registerUser)
```

Controller flow:

```text
registerUser(req, res)
  -> read name, email, password, age, gender, bio, interests from req.body
  -> if name/email/password missing: 400
  -> findUserByEmail(email)
  -> if existing user: 409
  -> bcrypt.hash(password, 10)
  -> createUser(...)
  -> createAuthToken(user)
  -> setAuthCookie(res, token)
  -> 201 { message, user: safeUser }
```

DAO/model flow:

```text
findUserByEmail(email)
  -> User.findOne({ email })

createUser(userData)
  -> User.create(userData)
```

JWT creation:

```js
jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, {
  expiresIn: config.jwtExpiresIn,
});
```

Cookie storage:

```text
cookie name: token
httpOnly: true
secure: true only in production
sameSite: lax
maxAge: 7 days
path: /
```

Response user excludes password through `buildSafeUser()`.

### Login Flow

Frontend call:

```text
loginUser(payload)
  -> POST /api/auth/login
```

Backend route:

```text
router.post("/login", loginUser)
```

Controller flow:

```text
loginUser(req, res)
  -> read email and password
  -> if missing: 400
  -> findUserByEmail(email, true)
  -> if no user: 401
  -> bcrypt.compare(password, user.password)
  -> if invalid: 401
  -> createAuthToken(user)
  -> setAuthCookie(res, token)
  -> 200 { message, user: safeUser }
```

Important detail: `findUserByEmail(email, true)` uses `.select("+password")` because the `User` schema defines `password` with `select: false`.

### Logout Flow

Route:

```text
POST /api/auth/logout
```

Controller:

```text
logoutUser(req, res)
  -> clearAuthCookie(res)
  -> 200 { message: "Logout successful" }
```

THIS IS A BREAK POINT: `POST /api/auth/logout` is documented as private in comments, but the route does not use `authMiddleware`. Any client can call logout; practically this only clears its own cookie, but the route is not protected.

### Middleware Validation

Protected routes use `authMiddleware`:

- `GET /api/user/profile`
- `PUT /api/user/profile`
- `GET /api/match/users`
- `POST /api/match/like/:targetUserId`
- `POST /api/match/dislike/:targetUserId`
- `GET /api/match/my-matches`
- `GET /api/chat/:matchId`
- `POST /api/chat/send`

Middleware flow:

```text
authMiddleware(req, res, next)
  -> token = req.cookies?.token
  -> if missing: 401
  -> jwt.verify(token, config.jwtSecret)
  -> req.user = { id: decoded.id, email: decoded.email }
  -> next()
```

Controllers depend on:

```js
req.user.id
req.user.email
```

THIS IS A BREAK POINT: Socket.io does not use this middleware. REST requests are cookie/JWT protected, but socket `join_room` has no auth and socket `send_message` trusts `senderId` from the client payload before checking that this `senderId` belongs to the match.

### Session Sync On Frontend

On app load:

```text
AuthContext.syncSession()
  -> getProfile()
  -> GET /api/user/profile
  -> if success setUser(response.user)
  -> if failure setUser(null)
```

When `user` exists:

```text
AuthContext useEffect
  -> connectSocket()
```

When `user` becomes null:

```text
AuthContext useEffect
  -> disconnectSocket()
```

## 3. Match System Full Flow

### Match Data Model

`Match` documents store swipe actions and matched state:

```text
initiator: ObjectId ref User, required
targetUser: ObjectId ref User, required
action: "like" or "dislike", required
isMatched: Boolean, default false
matchedAt: Date or null
timestamps: createdAt, updatedAt
unique index: { initiator: 1, targetUser: 1 }
```

Important design choice:

```text
User A liking User B creates/updates one Match record:
  initiator = A
  targetUser = B
  action = "like"

User B liking User A creates/updates a second Match record:
  initiator = B
  targetUser = A
  action = "like"

When mutual like is detected, both records are marked:
  isMatched = true
  matchedAt = same timestamp
```

There is not one canonical pair document. There are two directional records after both users have liked each other.

THIS IS A BREAK POINT: because both directional `Match` records can become `isMatched: true`, `/api/match/my-matches` can return two records for the same pair if both records include the current user. The frontend may show duplicate conversations unless filtered.

### Load Users For Matching

Frontend:

```text
Match.jsx loadUsers()
  -> getMatchUsers()
  -> GET /api/match/users
```

Route:

```text
router.get("/users", authMiddleware, getUsersForMatching)
```

Controller:

```text
getUsersForMatching(req, res)
  -> getPotentialUsers(req.user.id)
  -> 200 { message, users }
```

DAO:

```text
getPotentialUsers(userId)
  -> findInteractedUserIds(userId)
  -> excludedUserIds.push(userId)
  -> filter = { _id: { $nin: excludedUserIds } }
  -> availableCount = User.countDocuments(filter)
  -> if zero: []
  -> User.aggregate([
       { $match: filter },
       { $sample: { size: Math.min(20, availableCount) } },
       { $project: { password: 0 } }
     ])
```

Condition:

```text
Only users the current user has not already interacted with are returned.
Only outgoing interactions from current user are considered.
```

THIS IS A BREAK POINT: users who liked the current user are still shown if the current user has not swiped on them yet. That is intentional for mutual matching, but it means the candidate list may include someone who already has a reverse like waiting.

### Like Flow

Frontend action:

```text
Match.jsx handleLike(targetUserId)
  -> handleAction(targetUserId, "like")
  -> likeUser(targetUserId)
  -> POST /api/match/like/:targetUserId
```

Route:

```text
router.post("/like/:targetUserId", authMiddleware, likeUser)
```

Controller:

```text
likeUser(req, res)
  -> targetUserId = req.params.targetUserId
  -> if missing: 400
  -> if targetUserId === req.user.id: 400
  -> savedAction = saveMatchAction({
       initiatorId: req.user.id,
       targetUserId,
       action: "like"
     })
  -> reverseLike = findReverseLike(targetUserId, req.user.id)
  -> if no reverseLike:
       200 { isMatched: false, match: savedAction }
  -> if reverseLike exists:
       markBothRecordsAsMatched(req.user.id, targetUserId)
       200 { isMatched: true, match: currentRecord, reverseMatch: reverseRecord }
```

DAO save:

```text
saveMatchAction({ initiatorId, targetUserId, action })
  -> Match.findOneAndUpdate(
       { initiator: initiatorId, targetUser: targetUserId },
       { $set: { action, isMatched: false, matchedAt: null } },
       { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
     )
```

DAO reverse check:

```text
findReverseLike(initiatorId, targetUserId)
  -> Match.findOne({
       initiator: initiatorId,
       targetUser: targetUserId,
       action: "like"
     })
```

DAO match update:

```text
markBothRecordsAsMatched(initiatorId, targetUserId)
  -> matchedAt = new Date()
  -> currentRecord = Match.findOneAndUpdate(
       { initiator: initiatorId, targetUser: targetUserId },
       { $set: { isMatched: true, matchedAt } },
       { new: true }
     )
  -> reverseRecord = Match.findOneAndUpdate(
       { initiator: targetUserId, targetUser: initiatorId },
       { $set: { isMatched: true, matchedAt } },
       { new: true }
     )
  -> return { currentRecord, reverseRecord }
```

Frontend reaction:

```text
if response.isMatched:
  matchId = response.match?._id
  setMatchNotice("It's a match. Open chat when you are ready.")
  setPendingMatch({ matchId, peerName })

if response.isMatched is false:
  clear match notice and pending match
```

When the user clicks "Open chat":

```text
Match.jsx
  -> onOpenChat(pendingMatch)

App.jsx
  -> setActiveMatch(match)
  -> setScreen("chat")

Chat.jsx
  -> selectedMatchId starts from activeMatch?.matchId
  -> loadHistory(selectedMatchId)
  -> connectSocket()
  -> joinRoom(selectedMatchId)
```

### Dislike Flow

Frontend:

```text
Match.jsx handleDislike(targetUserId)
  -> dislikeUser(targetUserId)
  -> POST /api/match/dislike/:targetUserId
```

Route:

```text
router.post("/dislike/:targetUserId", authMiddleware, dislikeUser)
```

Controller:

```text
dislikeUser(req, res)
  -> targetUserId = req.params.targetUserId
  -> if missing: 400
  -> if targetUserId === req.user.id: 400
  -> savedAction = saveMatchAction({
       initiatorId: req.user.id,
       targetUserId,
       action: "dislike"
     })
  -> 200 { isMatched: false, match: savedAction }
```

Dislikes never create a match in current code.

### Conditions: When Match Is Created

A match is created only when all of these are true:

- The request is authenticated and `authMiddleware` attached `req.user.id`.
- `targetUserId` exists in the URL.
- `targetUserId !== req.user.id`.
- The current user's outgoing action is saved with `action: "like"`.
- A reverse record exists where `initiator = targetUserId`, `targetUser = req.user.id`, and `action = "like"`.
- `markBothRecordsAsMatched()` successfully updates both directional records.

Successful response:

```json
{
  "isMatched": true,
  "match": "current directional Match record",
  "reverseMatch": "reverse directional Match record"
}
```

The frontend uses:

```text
response.match._id
```

as the `matchId` for chat.

### Conditions: When Match Is Not Created

A match is not created when:

- `targetUserId` is missing: response `400`.
- `targetUserId` equals `req.user.id`: response `400`.
- Current user saves a `dislike`: response `isMatched: false`.
- Current user saves a `like`, but no reverse `like` exists: response `isMatched: false`.
- Reverse record exists but its `action` is `dislike`: response `isMatched: false`.
- DB update throws: response `500`.

THIS IS A BREAK POINT: `saveMatchAction()` always resets `isMatched: false` and `matchedAt: null` when a user updates their action. If a matched user later re-likes or changes action through the same pair, it can reset that directional record before mutual logic re-applies matching.

THIS IS A BREAK POINT: `markBothRecordsAsMatched()` performs two separate updates without a transaction. If the first update succeeds and the second fails, the DB can contain one matched directional record and one unmatched directional record.

THIS IS A BREAK POINT: simultaneous likes can race. If both users like at nearly the same time, each request may save its own record and check for the reverse record around the same window. Depending on timing, both may return `isMatched: false`, or both may attempt to mark records.

### ObjectId/String Handling

Mongoose can cast valid ObjectId strings in query filters like:

```text
{ initiator: req.user.id, targetUser: targetUserId }
```

So string IDs usually work if they are valid Mongo ObjectId strings.

Current code compares self-like using raw string comparison:

```js
if (targetUserId === req.user.id)
```

This works because:

- `targetUserId` comes from URL params as a string.
- `req.user.id` comes from JWT payload. During token creation, `user._id` is signed; after JSON serialization it is normally a string.

THIS IS A BREAK POINT: if an invalid ObjectId-like value is passed as `targetUserId` or `matchId`, Mongoose may throw a cast error. Controllers catch this as `500`, not a clean `400`.

## 4. Socket.io Full Flow

### Socket Init

Server creation:

```text
backend/server.js
  -> const httpServer = createServer(app)
  -> initializeSocket(httpServer)
```

Socket server:

```text
initializeSocket(server)
  -> ioInstance = new Server(server, {
       cors: {
         origin: "*",
         methods: ["GET", "POST", "PUT", "DELETE"]
       }
     })
  -> ioInstance.on("connection", socket => { ... })
  -> return ioInstance
```

Frontend socket:

```text
frontend/src/services/socket.js
  -> io("http://localhost:5000", {
       autoConnect: false,
       transports: ["websocket", "polling"],
       reconnection: true,
       reconnectionAttempts: 5
     })
```

Connection happens when:

- `AuthContext` sees a logged-in user and calls `connectSocket()`.
- `Chat.jsx` selects a match and calls `connectSocket()`.
- `Chat.jsx` sends a message and calls `connectSocket()`.

THIS IS A BREAK POINT: Socket.io CORS uses `origin: "*"`, while Express CORS uses `{ origin: true, credentials: true }`. Because sockets currently do not authenticate with cookies, this may work in local dev, but it is inconsistent with the REST auth model and risky in production.

### Event: connection

Trigger:

```text
client calls socket.connect()
```

Backend:

```text
ioInstance.on("connection", (socket) => {
  socket.on("join_room", ...)
  socket.on("send_message", ...)
  socket.on("disconnect", ...)
})
```

Data received:

```text
No application payload.
Socket.io provides socket.id and connection state.
```

Condition:

```text
No auth check.
No user binding.
No cookie/JWT validation.
```

THIS IS A BREAK POINT: the backend does not know which app user owns a socket connection.

### Event: join_room

Frontend:

```text
joinRoom(matchId)
  -> socket.emit("join_room", { matchId })
```

Called in `Chat.jsx` when `selectedMatchId` changes:

```text
loadHistory(selectedMatchId)
connectSocket()
joinRoom(selectedMatchId)
```

Backend:

```text
socket.on("join_room", async (payload = {}) => {
  const { matchId } = payload;

  if (!matchId) {
    socket.emit("join_error", { message: "matchId is required" });
    return;
  }

  socket.join(matchId);
  socket.emit("joined_room", { matchId });
});
```

Data received:

```json
{
  "matchId": "Mongo Match _id used as room name"
}
```

Condition that must pass:

```text
matchId must be truthy.
```

What backend does:

```text
socket.join(matchId)
socket.emit("joined_room", { matchId })
```

What frontend must do:

```text
Use the same Match._id that messages will use as Message.matchId.
Call join_room before expecting receive_message for that match.
Optionally listen for joined_room/join_error for diagnostics.
```

THIS IS A BREAK POINT: `join_room` does not check whether `matchId` exists, whether it is matched, or whether the connected user belongs to it. Any connected socket can join any room id if it knows the value.

THIS IS A BREAK POINT: `Chat.jsx` calls `connectSocket()` and immediately calls `joinRoom(selectedMatchId)`. Socket.io usually queues emits before connect, but if connection setup fails, the UI has no `join_error` or `joined_room` handling and may still look ready.

### Event: send_message

Frontend socket path:

```text
Chat.jsx handleSend(event)
  -> payload = { matchId: selectedMatchId, senderId: user.id, content: trimmedContent }
  -> connectSocket()
  -> if socket.connected:
       emitMessage(payload)
       clear input
       return
```

Backend:

```text
socket.on("send_message", async (payload = {}) => {
  const { matchId, senderId, content } = payload;

  if (!matchId || !senderId || !content) {
    socket.emit("message_error", {
      message: "matchId, senderId, and content are required"
    });
    return;
  }

  const match = await findMatchedRecordForUser(matchId, senderId);
  if (!match) {
    socket.emit("message_error", {
      message: "You are not allowed to send messages in this match"
    });
    return;
  }

  const savedMessage = await createMessage({
    matchId,
    sender: senderId,
    content,
    isAIMessage: false
  });

  ioInstance.to(matchId).emit("receive_message", savedMessage);
});
```

Data received:

```json
{
  "matchId": "Match._id",
  "senderId": "User._id",
  "content": "message text"
}
```

Conditions that must pass:

- `matchId` exists.
- `senderId` exists.
- `content` exists.
- `findMatchedRecordForUser(matchId, senderId)` returns a matched record.

DAO validation:

```text
findMatchedRecordForUser(matchId, userId)
  -> Match.findOne({
       _id: matchId,
       isMatched: true,
       $or: [{ initiator: userId }, { targetUser: userId }]
     })
```

DB save:

```text
createMessage(...)
  -> Message.create({
       matchId,
       sender: senderId,
       content,
       isAIMessage: false
     })
```

Broadcast:

```text
ioInstance.to(matchId).emit("receive_message", savedMessage)
```

THIS IS A BREAK POINT: `senderId` comes from the client. The socket does not authenticate the user from a JWT/cookie. A malicious client can claim another user's `senderId`; the backend only verifies that the claimed `senderId` belongs to the match.

THIS IS A BREAK POINT: `send_message` does not require the sender socket to have joined the room. It saves and emits to the room regardless. If the sender is not joined, the sender may not receive its own `receive_message`; if the receiver is not joined, the receiver will not receive realtime delivery.

### Event: receive_message

Backend emit sources:

- Socket `send_message` emits after saving.
- REST `POST /api/chat/send` also emits after saving if `getIO()` returns an instance.

Socket source:

```text
ioInstance.to(matchId).emit("receive_message", savedMessage)
```

REST source:

```text
const io = getIO()
if (io) {
  io.to(matchId).emit("receive_message", savedMessage)
}
```

Frontend listener:

```text
onReceiveMessage(handleMessage)
```

Frontend filter:

```text
incomingMatchId = incomingMessage.matchId?._id || incomingMessage.matchId

if String(incomingMatchId) !== String(selectedMatchId):
  ignore

if incomingId already in seenMessageIds:
  ignore

else append to messages
```

What frontend must do:

- Register `receive_message` handler while chat is open.
- Keep `selectedMatchId` aligned with the joined room.
- Deduplicate messages because REST fallback and socket broadcast can both deliver the same message.

THIS IS A BREAK POINT: if `selectedMatchId` changes while an old handler is still active, messages for the previous match can be ignored or appended incorrectly depending on effect cleanup timing. Current code cleans up the handler on dependency change, which helps.

### Event: disconnect

Trigger:

```text
socket.disconnect()
browser close/reload
network disconnect
server disconnect
```

Backend:

```text
socket.on("disconnect", () => {
  // No extra cleanup is needed yet because rooms close automatically.
});
```

Condition:

```text
No condition.
```

What happens:

```text
Socket.io removes socket membership from rooms automatically.
No DB writes.
No user status update.
No typing/presence cleanup.
```

## 5. Match To Socket Connection Logic

### When matchId Is Created

The app creates directional `Match` records when users like/dislike each other.

For mutual like:

```text
User A likes User B:
  Match A->B exists with action like
  if B->A like does not exist:
    isMatched false

User B likes User A:
  Match B->A saved with action like
  findReverseLike(A, B) finds A->B
  markBothRecordsAsMatched(B, A)
  response.match = B->A current record
  response.reverseMatch = A->B reverse record
```

The `matchId` used by the frontend is:

```text
response.match._id
```

That means the user who triggers the mutual match gets the current directional record as the initial chat id.

### When Frontend Receives matchId

Immediate match flow:

```text
POST /api/match/like/:targetUserId
  -> response.isMatched true
  -> response.match._id
  -> Match.jsx pendingMatch.matchId
  -> user clicks "Open chat"
  -> App.jsx activeMatch = pendingMatch
  -> Chat.jsx selectedMatchId = activeMatch.matchId
```

Match list flow:

```text
GET /api/match/my-matches
  -> response.matches[]
  -> Matches.jsx Open Chat passes full match
  -> App.jsx activeMatch.matchId = match._id
  -> Chat.jsx selectedMatchId = activeMatch.matchId
```

Chat default flow:

```text
Chat.jsx loadMatches()
  -> getMyMatches()
  -> if no selectedMatchId and first match exists:
       selectedMatchId = items[0]._id
```

### When Socket Joins Room

`Chat.jsx` runs this effect:

```text
if selectedMatchId:
  loadHistory(selectedMatchId)
  connectSocket()
  joinRoom(selectedMatchId)
```

So socket room joining happens only after:

- the user is on the Chat screen,
- `selectedMatchId` is non-empty,
- `joinRoom(selectedMatchId)` is called.

It does not happen immediately when the match is created unless the user opens chat.

### Conditions Before Joining Room

Frontend conditions:

- User must be logged in enough for the Chat screen to render.
- `selectedMatchId` must exist.
- `connectSocket()` must be called or socket must already be connected.

Backend conditions:

- `matchId` must be present in the payload.

Missing backend conditions:

- No verification that the room match exists.
- No verification that `isMatched` is true.
- No verification that socket user belongs to the match.
- No JWT/cookie binding between socket and user.

THIS IS A BREAK POINT: REST chat history may correctly reject a user with `403`, but socket `join_room` will still allow that same socket into the room because it only checks `matchId` presence.

### What Happens If join_room Is Not Called

If `join_room` is not called:

- The socket is connected but not subscribed to the match room.
- Backend can still save messages from `send_message` if validation passes.
- Backend emits `receive_message` to `ioInstance.to(matchId)`.
- Only sockets already inside that room receive it.
- The sender may not see its own message via socket.
- The receiver will not get realtime updates unless their socket joined the same room.
- Chat history can still show messages later through `GET /api/chat/:matchId`.

### What Happens If matchId Mismatch Occurs

If frontend joins room `X` but messages are emitted to room `Y`:

```text
join_room({ matchId: X })
send_message({ matchId: Y, senderId, content })
backend emits receive_message to Y
frontend sitting in room X does not receive it
```

If frontend receives a message with a different `matchId`:

```text
Chat.jsx handleMessage()
  -> compares incomingMatchId to selectedMatchId
  -> ignores message if different
```

THIS IS A BREAK POINT: because two directional match records can exist for one pair, User A may open chat using A->B `_id` while User B may open chat using B->A `_id`. Those are different rooms and different chat histories. This can split one conversation into two separate `Message.matchId` timelines.

## 6. Chat Flow End To End

### Lifecycle

1. Match exists.

```text
Match documents contain:
  isMatched: true
  initiator/targetUser includes current user
```

2. User opens chat.

```text
From Match.jsx:
  response.match._id -> pendingMatch.matchId -> App activeMatch

From Matches.jsx:
  selected match._id -> App activeMatch.matchId

From Chat.jsx:
  first item from getMyMatches() if no activeMatch exists
```

3. Frontend loads matches.

```text
Chat.jsx loadMatches()
  -> GET /api/match/my-matches
  -> backend authMiddleware
  -> getMyMatchesController
  -> getMyMatches(req.user.id)
  -> Match.find({ isMatched: true, $or: user in pair })
  -> populate initiator and targetUser
  -> sort by matchedAt desc, createdAt desc
  -> setMatches(items)
```

4. Frontend loads chat history.

```text
Chat.jsx loadHistory(selectedMatchId)
  -> GET /api/chat/:matchId
  -> authMiddleware
  -> getChatHistory
  -> findMatchedRecordForUser(matchId, req.user.id)
  -> if no match: 403
  -> getMessagesByMatchId(matchId)
  -> Message.find({ matchId }).sort({ createdAt: 1 })
  -> setMessages(history)
```

5. Socket joins room.

```text
connectSocket()
joinRoom(selectedMatchId)
  -> socket.emit("join_room", { matchId: selectedMatchId })
  -> backend socket.join(matchId)
```

6. User sends message through socket if connected.

```text
Chat.jsx handleSend()
  -> payload = { matchId, senderId: user.id, content }
  -> if socket.connected:
       emit send_message
       clear input
       return
```

Backend socket save:

```text
send_message
  -> validate fields
  -> findMatchedRecordForUser(matchId, senderId)
  -> createMessage({ matchId, sender: senderId, content, isAIMessage: false })
  -> io.to(matchId).emit("receive_message", savedMessage)
```

7. User sends message through REST fallback if socket is not connected.

```text
Chat.jsx handleSend()
  -> if socket.connected is false:
       POST /api/chat/send { matchId, content }
```

Backend REST save:

```text
sendMessage(req, res)
  -> validate matchId and content
  -> findMatchedRecordForUser(matchId, req.user.id)
  -> createMessage({ matchId, sender: req.user.id, content, isAIMessage: false })
  -> getIO()
  -> if io exists: io.to(matchId).emit("receive_message", savedMessage)
  -> 201 { message, chatMessage: savedMessage }
```

8. Receiver gets message.

```text
Receiver must:
  -> be connected to socket server
  -> have called join_room with same matchId
  -> have receive_message listener active
```

Frontend receive:

```text
receive_message savedMessage
  -> check matchId equals selectedMatchId
  -> check seenMessageIds
  -> append to messages
```

## 7. Conditions Checklist

### Auth Conditions

Condition:

```text
Cookie named token must exist.
```

Checked in:

```text
backend/src/middleware/authMiddleware.js
```

If false:

```text
REST protected routes return 401 "Authentication token is required".
```

Condition:

```text
JWT must verify with config.jwtSecret.
```

Checked in:

```text
authMiddleware
```

If false:

```text
REST protected routes return 401 "Invalid or expired token".
```

### Like Conditions

Condition:

```text
targetUserId exists.
```

Checked in:

```text
matchController.likeUser
```

If false:

```text
400 "Target user id is required".
```

Condition:

```text
targetUserId !== req.user.id.
```

Checked in:

```text
matchController.likeUser
```

If false:

```text
400 "You cannot like yourself".
```

Condition:

```text
Current action must be saved as action: "like".
```

Checked in:

```text
match.dao.saveMatchAction
```

If false:

```text
Controller catches error and returns 500.
```

### Reverse Like Condition

Condition:

```text
Reverse record exists:
initiator = targetUserId
targetUser = req.user.id
action = "like"
```

Checked in:

```text
match.dao.findReverseLike
```

If false:

```text
likeUser returns 200 { isMatched: false, match: savedAction }.
No chat should become active from that response.
```

### Match Creation Condition

Condition:

```text
Both directional records can be updated to:
isMatched = true
matchedAt = same Date
```

Checked in:

```text
match.dao.markBothRecordsAsMatched
```

If false:

```text
Controller returns 500 or DB becomes inconsistent if one update succeeds and the other fails.
```

### My Matches Condition

Condition:

```text
Match record has:
isMatched = true
and current user is initiator or targetUser
```

Checked in:

```text
match.dao.getMyMatches
```

If false:

```text
Record does not appear in /api/match/my-matches.
Frontend cannot pick it from Matches or Chat match list.
```

### Chat History Permission Condition

Condition:

```text
Match exists with:
_id = matchId
isMatched = true
current user is initiator or targetUser
```

Checked in:

```text
chatController.getChatHistory
match.dao.findMatchedRecordForUser
```

If false:

```text
403 "You are not allowed to view this chat".
```

### Socket Join Permission Condition

Actual condition:

```text
matchId must exist.
```

Checked in:

```text
socketServer.js join_room
```

If false:

```text
socket emits join_error { message: "matchId is required" }.
```

Missing condition:

```text
No check that connected user owns the match.
```

If missing condition is abused:

```text
Unauthorized socket can join a room by matchId.
```

THIS IS A BREAK POINT.

### Socket Message Send Validation Condition

Condition:

```text
matchId, senderId, and content must exist.
```

Checked in:

```text
socketServer.js send_message
```

If false:

```text
socket emits message_error.
```

Condition:

```text
findMatchedRecordForUser(matchId, senderId) returns a match.
```

Checked in:

```text
socketServer.js send_message
```

If false:

```text
socket emits message_error "You are not allowed to send messages in this match".
```

THIS IS A BREAK POINT: this validates the claimed `senderId`, not the authenticated socket identity.

### REST Message Send Validation Condition

Condition:

```text
matchId and content must exist.
```

Checked in:

```text
chatController.sendMessage
```

If false:

```text
400 "matchId and content are required".
```

Condition:

```text
findMatchedRecordForUser(matchId, req.user.id) returns a match.
```

Checked in:

```text
chatController.sendMessage
```

If false:

```text
403 "You are not allowed to send messages in this chat".
```

## 8. Data Flow Diagram

### Register Flow

```text
User submits register form
  -> frontend api.registerUser()
  -> POST /api/auth/register
  -> authController.registerUser
  -> user.dao.findUserByEmail
  -> bcrypt.hash
  -> user.dao.createUser
  -> User.create
  -> JWT created
  -> HTTP-only token cookie set
  -> safe user returned
  -> AuthContext setUser
  -> socket connect starts after user exists
```

### Login Flow

```text
User submits login form
  -> frontend api.loginUser()
  -> POST /api/auth/login
  -> authController.loginUser
  -> user.dao.findUserByEmail(email, true)
  -> bcrypt.compare
  -> JWT created
  -> HTTP-only token cookie set
  -> safe user returned
  -> AuthContext setUser
  -> socket connect starts after user exists
```

### Like Flow Without Match

```text
User clicks Like
  -> Match.jsx handleLike
  -> POST /api/match/like/:targetUserId
  -> authMiddleware attaches req.user
  -> matchController.likeUser
  -> match.dao.saveMatchAction(current -> target, "like")
  -> Match.findOneAndUpdate upsert
  -> match.dao.findReverseLike(target -> current)
  -> no reverse like found
  -> response { isMatched: false, match }
  -> frontend removes card
  -> no chat activation
```

### Match Flow With Mutual Like

```text
User clicks Like
  -> POST /api/match/like/:targetUserId
  -> authMiddleware
  -> save current like
  -> find reverse like
  -> reverse like exists
  -> mark current record isMatched true
  -> mark reverse record isMatched true
  -> response { isMatched: true, match: currentRecord, reverseMatch }
  -> Match.jsx stores pendingMatch.matchId = response.match._id
  -> user clicks Open chat
  -> App.jsx activeMatch = pendingMatch
  -> Chat.jsx selectedMatchId = activeMatch.matchId
  -> GET /api/chat/:matchId
  -> socket join_room { matchId }
```

### Chat History Flow

```text
User opens chat
  -> Chat.jsx selectedMatchId exists
  -> GET /api/chat/:matchId
  -> authMiddleware attaches req.user
  -> chatController.getChatHistory
  -> match.dao.findMatchedRecordForUser(matchId, req.user.id)
  -> if allowed: message.dao.getMessagesByMatchId(matchId)
  -> Message.find({ matchId }).sort(createdAt asc)
  -> response messages
  -> Chat.jsx setMessages and seenMessageIds
```

### Socket Chat Flow

```text
User opens chat
  -> connectSocket()
  -> joinRoom(selectedMatchId)
  -> socket emits join_room { matchId }
  -> backend socket.join(matchId)

User sends message
  -> Chat.jsx emit send_message { matchId, senderId, content }
  -> socketServer validates fields
  -> match.dao.findMatchedRecordForUser(matchId, senderId)
  -> message.dao.createMessage
  -> Message.create
  -> io.to(matchId).emit("receive_message", savedMessage)
  -> all clients in room receive message
  -> Chat.jsx filters by selectedMatchId
  -> Chat.jsx dedupes by message id
  -> Chat.jsx appends message
```

### REST Fallback Chat Flow

```text
User sends message while socket.connected is false
  -> POST /api/chat/send { matchId, content }
  -> authMiddleware
  -> chatController.sendMessage
  -> findMatchedRecordForUser(matchId, req.user.id)
  -> createMessage
  -> getIO()
  -> io.to(matchId).emit("receive_message", savedMessage)
  -> response { chatMessage }
  -> frontend appends chatMessage
```

## 9. Common Failure Points

### Match Can Fail Silently Or Confusingly

THIS IS A BREAK POINT: duplicate directional records can split chat.

Current mutual match design marks both A->B and B->A as `isMatched: true`. If each user opens a different directional match `_id`, messages are stored under different `Message.matchId` values and emitted to different rooms. The UI can look like each side has a separate chat.

THIS IS A BREAK POINT: `getMyMatches()` can return both directional records.

Because the query is:

```text
{ isMatched: true, $or: [{ initiator: userId }, { targetUser: userId }] }
```

both A->B and B->A match this query for each user after mutual like.

THIS IS A BREAK POINT: match updates are not transactional.

`markBothRecordsAsMatched()` updates current and reverse records separately. A partial failure can create inconsistent state.

THIS IS A BREAK POINT: race conditions can occur on simultaneous likes.

There is no transaction, lock, or canonical pair key. Concurrent requests can produce confusing responses.

THIS IS A BREAK POINT: invalid Mongo ids become `500`.

There is no explicit ObjectId validation before Mongoose queries.

### Socket Can Not Join Or Can Join Too Much

THIS IS A BREAK POINT: `join_room` does not authorize.

Only `matchId` presence is checked. Anyone who can connect to socket and knows a match id can join that room.

THIS IS A BREAK POINT: frontend does not listen to `joined_room` or `join_error`.

The server emits those events, but `Chat.jsx` only listens to `receive_message`. The UI cannot confirm room membership.

THIS IS A BREAK POINT: socket user identity is not established.

The connection is not bound to `req.user`, a JWT, or cookie validation.

THIS IS A BREAK POINT: immediate join after connect can be hard to debug.

`connectSocket()` calls `socket.connect()` and `joinRoom()` emits immediately after. Socket.io may queue it, but if connection fails the app does not surface a room join failure.

### Frontend Can Show Wrong State

THIS IS A BREAK POINT: `socket.connected` is not React state.

`Chat.jsx` renders "Live" or "Fallback" based on `socket.connected`, but socket connection changes alone do not cause React re-render unless other state changes.

THIS IS A BREAK POINT: socket send path clears input before backend confirms save.

When `socket.connected` is true, `Chat.jsx` emits and clears input immediately. If backend rejects with `message_error`, the current UI does not listen for it.

THIS IS A BREAK POINT: REST fallback can duplicate unless dedupe works.

REST `sendMessage` emits `receive_message` to the room and also returns `chatMessage`. Current frontend uses `seenMessageIds` to dedupe, but timing matters.

THIS IS A BREAK POINT: `activeMatch` can point to a match id not present in the loaded match list.

`selectedMatch` is found from `matches.find(match._id === selectedMatchId)`. If `activeMatch.matchId` is valid but `loadMatches()` has not returned it yet, the chat can still load history but header may show "Pick a match".

### Async Issues

THIS IS A BREAK POINT: `loadMatches()` and `loadHistory()` do not catch errors in `Chat.jsx`.

If either request fails, the component may leave stale status/messages or throw into React error handling depending on environment.

THIS IS A BREAK POINT: Chat history loading and socket receiving can race.

Flow:

```text
loadHistory starts
socket receives message
setMessages appends message
loadHistory returns older snapshot
setMessages(history) overwrites appended message
```

The current code resets `seenMessageIds` and `messages` when history returns. In normal usage this may be fine, but realtime during history loading can be overwritten.

THIS IS A BREAK POINT: two send paths use different user identity sources.

REST send uses `req.user.id` from JWT. Socket send uses `senderId` from client payload.

## 10. Final Clean Architecture

This is the ideal flow the system should follow to avoid split rooms, unauthorized joins, and state drift.

### Perfect Match Flow

Use one canonical match conversation id per pair.

Ideal model behavior:

```text
User A likes User B
  -> save A->B action
  -> no match until B->A like exists

User B likes User A
  -> save B->A action
  -> detect reverse like
  -> create or choose one canonical conversation Match id
  -> return same canonical matchId to both users
```

State rules:

- Only one `matchId` should represent one pair's chat.
- `/api/match/my-matches` should return one conversation per pair.
- `Message.matchId` should always use the canonical match id.
- Socket room name should always be the canonical match id.

### Perfect Socket Flow

Socket should authenticate at connection time.

Ideal connection:

```text
Client connects with credentials/token
  -> server verifies JWT
  -> server stores socket.user = { id, email }
```

Ideal join:

```text
join_room({ matchId })
  -> if no socket.user: join_error
  -> findMatchedRecordForUser(matchId, socket.user.id)
  -> if not allowed: join_error
  -> socket.join(matchId)
  -> joined_room
```

Ideal send:

```text
send_message({ matchId, content })
  -> senderId comes from socket.user.id, not client payload
  -> validate content
  -> validate match ownership
  -> save message
  -> emit receive_message to room
  -> optionally ack sender
```

State rules:

- Frontend should wait for `joined_room` before showing fully live room state.
- Frontend should listen to `message_error`.
- Frontend should not trust `socket.connected` alone for room readiness.

### Perfect Chat Flow

Ideal lifecycle:

```text
match exists
  -> frontend receives canonical matchId
  -> frontend opens Chat
  -> GET /api/chat/:matchId validates ownership
  -> socket connects with authenticated identity
  -> join_room validates ownership
  -> frontend receives joined_room
  -> frontend enables live sending
  -> send_message uses authenticated socket user
  -> backend saves Message under canonical matchId
  -> backend emits receive_message to canonical room
  -> all joined clients update from same message id
```

Correct sync rules:

- REST is source of truth for history and permission.
- Socket is transport for realtime delivery only.
- Match id must be stable and canonical.
- Room id must equal `Message.matchId`.
- Sender identity must come from auth, not from client payload.
- Frontend should handle `joined_room`, `join_error`, and `message_error`.
- Frontend should dedupe by message `_id`.
- Frontend should refresh history or reconcile after reconnect.

### Clean End-To-End Ideal Diagram

```text
User likes someone
  -> POST /api/match/like/:targetUserId
  -> authMiddleware
  -> save like
  -> reverse like condition checked
  -> canonical match created/found
  -> response { isMatched: true, matchId }
  -> frontend stores activeMatch.matchId
  -> Chat opens
  -> GET /api/chat/:matchId validates owner
  -> socket connects with JWT identity
  -> join_room validates owner
  -> joined_room confirms room active
  -> send_message validates owner from socket.user
  -> Message saved
  -> receive_message emitted to canonical room
  -> both users update same chat timeline
```

