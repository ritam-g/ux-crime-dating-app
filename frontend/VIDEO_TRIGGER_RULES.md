# 🎥 Chaotic Chat Meme Video System - Trigger Rules & Design Manual

This document details the configuration, specifications, and architecture of the frontend waiting-interruption meme video overlay for the Evil UX competition.

---

## ⚙️ Trigger Lifecycle & Conditions

The wait-time meme overlay behaves according to strict frontend criteria to keep the experience chaotic but functional:

1. **Activation Trigger**:
   - The user clicks "Submit Rizz Credentials" (sends a chat message) in the real-time window.
   - An active **2.0-second inactivity countdown timer** starts.

2. **Suppression (No Video Played)**:
   - If the peer responds within 2.0 seconds, the timer is cleared and no video displays.
   - If the user changes active chats (switches conversations) during the 2.0s delay, the timer is killed.
   - If the socket gets disconnected or the user leaves the page, the timer is cleared.
   - Old history loads do not trigger timers.

3. **Meme Playback**:
   - When the 2.0-second timer completes, a random meme video is selected using `getRandomVideoAsset()`.
   - The draggable, glassmorphic `<MemeVideoOverlay />` spawns floating over the layout.
   - A brief, annoying loader simulation displays: `🚨 BUFFERING COGNITIVE RIZZ RESPONSE...`
   - The chosen clip streams with audio.

4. **Auto-Hiding Rules**:
   - The overlay immediately vanishes if an incoming socket message arrives.
   - The overlay auto-closes when the video ends natively.
   - The user can dismiss the player by clicking `❌ GET OUT`.

---

## 📂 Asset Registry & Replacement

All assets reside inside the centralized configuration file:
👉 **`frontend/src/chaos/memeVideoManager.js`**

### Structure of an Asset
```javascript
{
  id: "unique_id",
  title: "Display Title of wait-card",
  src: "https://url-or-local-path.mp4",
  triggerType: "ignored",
  volume: 0.5, // 0.0 - 1.0
  cooldown: 5000,
  duration: 10 // seconds
}
```

### Injecting Custom MP4 Assets
To add your own high-fidelity custom videos for the competition:
1. Save your MP4 clips into `frontend/public/memes/` (e.g. `subway_surfers.mp4`, `sad_violin.mp4`).
2. Update the asset source configuration in `memeVideoManager.js`:
   ```javascript
   src: "/memes/subway_surfers.mp4"
   ```

---

## 🎨 Design Rules for Draggability & Overlays

- **Z-Index Layering**: Bound strictly at `zIndex: 9999` to ensure standard chat overlays or bubbles render underneath it.
- **Grabbing State**: Cursor matches `grab` and `grabbing` to guide dragging intuition.
- **Boundary Collisions**: Bound safely within viewport dimensions (`window.innerWidth` & `window.innerHeight`) during active drags to prevent the card from slipping off the screen.
