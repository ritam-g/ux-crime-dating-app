# Love.exe Not Responding - Backend, Frontend, and Socket Flow

This document explains how the current app works end to end, from the frontend UI to the backend API, database, and Socket.io layer.

## 1. High-Level Architecture

- Frontend: React + Vite
- API client: Axios with `withCredentials: true`
- Realtime client: `socket.io-client`
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT stored in an HTTP-only cookie named `token`

The app uses REST for setup and data loading, and Socket.io for live chat delivery.

## 2. Auth Flow

### Register

1. User fills out the register form.
2. Frontend sends `POST /api/auth/register`.
3. Backend hashes the password with `bcryptjs`.
4. Backend creates the user in MongoDB.
5. Backend signs a JWT.
6. Backend stores the JWT in an HTTP-only cookie.
7. Backend returns:
   - `message`
   - `user`

### Login

1. User fills out the login form.
2. Frontend sends `POST /api/auth/login`.
3. Backend checks the email with the DAO.
4. Backend compares the password hash.
5. Backend signs a JWT.
6. Backend stores the JWT in the same cookie.
7. Backend returns:
   - `message`
   - `user`

### Logout

1. User clicks logout.
2. Frontend sends `POST /api/auth/logout`.
3. Backend clears the auth cookie.
4. Frontend session becomes logged out.

### Auth Diagram

```text
Register/Login Form
  -> Axios request
  -> Express route
  -> Auth controller
  -> DAO
  -> MongoDB
  -> JWT cookie set
  -> Frontend session updates
```

## 3. Matching Flow

### How matching works

1. Frontend opens the Match page.
2. Frontend calls `GET /api/match/users`.
3. Backend returns random users the current user has not already swiped on.
4. The UI shows one user card at a time.
5. User clicks Like or Dislike.
6. Frontend sends:
   - `POST /api/match/like/:id`
   - `POST /api/match/dislike/:id`
7. Backend saves the action through the DAO.
8. If the action is a like, backend checks for a reverse like.
9. If both users liked each other, backend marks both records as matched.
10. Frontend shows a match success message.
11. Frontend can open chat using the returned match id.

### Match Diagram

```text
User clicks Like
  -> Frontend API call
  -> Match controller
  -> Match DAO
  -> MongoDB
  -> Reverse like check
  -> Match created if mutual
  -> Frontend updates UI
```

## 4. Chat Flow

Chat uses two layers:

- REST API for chat history and fallback message saving
- Socket.io for live message delivery

### REST History

1. Frontend opens the Chat page.
2. Frontend loads matches using `GET /api/match/my-matches`.
3. When a match is selected, frontend calls `GET /api/chat/:matchId`.
4. Backend verifies the user belongs to that match.
5. Backend returns sorted chat history.

### Send Message

1. User types a message.
2. Frontend first tries Socket.io if connected.
3. If socket is not available, frontend uses `POST /api/chat/send`.
4. Backend validates the match.
5. Backend saves the message in MongoDB.
6. Socket layer emits the saved message to the room.
7. Chat UI updates instantly.

### Chat Diagram

```text
Chat page opens
  -> Load matches
  -> Select match
  -> Load history from API
  -> Join socket room
  -> Send message
  -> Save to DB
  -> Emit to room
  -> Other client receives message
```

## 5. Socket.io Flow

### Socket events

- `connection`
- `join_room`
- `send_message`
- `receive_message`
- `disconnect`

### Socket sequence

1. Client connects to `http://localhost:5000`.
2. Client emits `join_room` with `matchId`.
3. Server joins the socket to that room.
4. Client emits `send_message` with:
   - `matchId`
   - `senderId`
   - `content`
5. Server validates the match and saves the message.
6. Server emits `receive_message` to the room.
7. Both users see the new message without refresh.

## 6. Socket vs API

### API is used for:

- Register
- Login
- Logout
- Profile fetch/update
- Loading match candidates
- Saving likes/dislikes
- Loading chat history
- Chat fallback save

### Socket is used for:

- Live message delivery
- Room-based chat updates
- Real-time UI refresh

### Why both are needed

Socket gives instant chat.  
REST API gives persistence, refresh recovery, and fallback when the socket is not connected.

## 7. Frontend Pages

### Login

- Sends login request
- Uses cookie-based session
- Redirects into the app after success

### Register

- Creates the account
- Stores the auth cookie automatically

### Match

- Shows one user card at a time
- Like and Dislike call the real backend
- Shows match success if the backend returns a mutual match

### Chat

- Loads previous messages from REST
- Joins socket room
- Sends live messages
- Shows fallback state when there are no matches yet

### Profile

- Reads and updates the current user profile

## 8. Postman Testing Flow

### Auth

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. Confirm the cookie is stored in Postman
4. `POST /api/auth/logout`

### Profile

1. `GET /api/user/profile`
2. `PUT /api/user/profile`

### Match

1. `GET /api/match/users`
2. `POST /api/match/like/:id`
3. `POST /api/match/dislike/:id`
4. `GET /api/match/my-matches`

### Chat API

1. `GET /api/chat/:matchId`
2. `POST /api/chat/send`

## 9. Practical Testing Order

1. Register a user.
2. Register a second user in another browser session or incognito window.
3. Like each other until a mutual match is created.
4. Open Match and verify the match banner appears.
5. Open Chat and verify history loads.
6. Send a message and confirm it appears live.

## 10. Simple End-to-End Flow

```text
User registers
  -> cookie session created
  -> profile setup
  -> match cards load
  -> like/dislike users
  -> mutual like creates match
  -> chat history loads
  -> socket room joins
  -> realtime messages flow
```

## 11. Notes

- The auth cookie is HTTP-only, so the frontend does not manually read the token.
- Axios must use `withCredentials: true`.
- The backend must keep `cookie-parser` and CORS credentials enabled.
- The chat screen should only show the composer when a real match is selected.

