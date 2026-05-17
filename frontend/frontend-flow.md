# Love.exe Not Responding - Frontend Flow

This document explains how the frontend talks to the backend and how the auth, match, and chat flows work end to end.

## 1. Frontend Architecture

- Pages: full-screen views like Login, Register, Match, Matches, Chat, Profile
- Components: reusable UI blocks like Navbar, UserCard, MessageBubble
- Services: API and Socket.io helpers
- Context: auth/session state

## 2. Auth Flow

### What happens

1. User opens Login or Register.
2. Frontend sends the request with Axios.
3. Axios always uses `withCredentials: true`.
4. Backend sets the HTTP-only `token` cookie.
5. Frontend does not store the token manually.
6. Next protected requests automatically include the cookie.

### Auth Flow Diagram

```text
User submits form
  -> Axios request
  -> Backend auth route
  -> Cookie set
  -> AuthContext syncs session
  -> App unlocks private screens
```

## 3. Match Flow

### What happens

1. Match page loads `GET /api/match/users`.
2. Backend returns users the current user has not already swiped on.
3. Frontend shows one user card at a time.
4. User clicks Like or Dislike.
5. Frontend calls:
   - `POST /api/match/like/:id`
   - `POST /api/match/dislike/:id`
6. If the backend returns a mutual match, the UI shows a match state.
7. The user can open the Matches or Chat view.

### Match Flow Diagram

```text
User clicks Like
  -> API call
  -> Match controller
  -> Match DAO
  -> MongoDB
  -> Reverse like check
  -> UI updates
```

## 4. Matches Flow

### What happens

1. Matches page loads `GET /api/match/my-matches`.
2. Backend returns all matched conversations.
3. Frontend shows one card per match.
4. User clicks Open Chat.
5. Frontend sends the selected match id into the Chat page.

## 5. Chat Flow

Chat uses both REST and Socket.io.

### REST

1. Chat page loads history using `GET /api/chat/:matchId`.
2. REST is also used as fallback if socket delivery fails.

### Socket

1. Frontend connects the socket after login/session sync.
2. Frontend emits `join_room` with the `matchId`.
3. When the user sends a message, frontend emits:

```text
send_message
  {
    matchId,
    senderId,
    content
  }
```

4. Frontend listens for `receive_message`.
5. New messages appear instantly in the UI.

### Chat Flow Diagram

```text
Open Chat
  -> Load history from API
  -> Join socket room
  -> Send message
  -> Save to DB
  -> Receive realtime message
  -> Update UI
```

## 6. Socket vs API

### API is for

- Register
- Login
- Logout
- Profile fetch/update
- Matching cards
- Matches list
- Chat history
- Chat fallback save

### Socket is for

- Live message delivery
- Room-based realtime updates

### Why both are needed

Socket gives realtime chat.  
REST gives reliable history and fallback if the websocket drops.

## 7. Frontend Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `GET /api/match/users`
- `POST /api/match/like/:id`
- `POST /api/match/dislike/:id`
- `GET /api/match/my-matches`
- `GET /api/chat/:matchId`
- `POST /api/chat/send`

## 8. Debug Flow

### Why socket might fail

- Backend is not running
- Socket server is not attached to the HTTP server
- Browser blocked the websocket upgrade
- The client never joined the room

### Why cookie auth is required

- The backend uses HTTP-only cookies for JWT
- The frontend should never try to read or store the token manually
- Protected requests depend on browser cookie handling

### Why `withCredentials` matters

- It tells Axios to send the auth cookie
- Without it, protected requests may look unauthenticated
- It is required for cookie-based sessions across frontend and backend

## 9. Practical Test Order

1. Register a user.
2. Login and confirm private screens open.
3. Load match cards.
4. Like a user.
5. Check if a mutual match appears.
6. Open Matches.
7. Open Chat.
8. Send a message and confirm realtime delivery.

