# 😈 EVIL UX SYSTEM DOCUMENTATION

This document tracks all the cursed, intentional chaotic features built into the application to ensure they are properly managed, don't overlap chaotically, and don't introduce actual bugs or memory leaks.

## 🎬 Chat Entry Meme Overlay
**Location**: `src/components/chaos/ChatEntryVideoOverlay.jsx`

### Trigger Conditions
* Triggered **ONLY** when the user explicitly clicks the "Chat" button in the Navbar.
* It does **NOT** trigger on page reloads, React hydration, passive WebSocket events, or if the user is already on the chat page and the component rerenders.

### Timing Behavior
* **Enter**: Fades in and translates up smoothly over `300ms`.
* **Duration**: Stays visible and auto-plays for exactly `4.5 seconds`.
* **Exit**: Begins fading out after `4.5s`, then fully unmounts `300ms` later.

### Audio / Video Rules
* Uses the local asset: `/videos/when_user_click_chat_buton.mp4`.
* Volume is explicitly clamped to `30%` (`0.3`) to prevent blowing out speakers.
* It strictly catches `.play()` Promises to prevent uncaught exceptions if the browser aggressively blocks autoplay.

### Cleanup Behavior
* Wrapped completely in an isolated `useEffect` cleanup hook to guarantee timeout timers are cleared if the user unmounts the Navbar or navigates away.
* Unmounting completely removes the `video` tag from the DOM to prevent hidden memory leaks or ghostly audio playing in the background.
