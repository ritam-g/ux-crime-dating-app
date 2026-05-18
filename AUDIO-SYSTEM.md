# 🔊 Chaos Audio System Architecture

This document outlines the architecture, rules, and implementation details of the controlled audio chaos system in the application. The system is designed to provide meme-like, cursed UX without degrading into unplayable audio spam.

## 🎯 Core Rules & Philosophy

1. **EVENT-BASED ONLY**: Audio is triggered ONLY by explicit user interactions or controlled chaos events (e.g., fake warnings).
2. **NO PASSIVE AUDIO**: Audio NEVER triggers on component mount, unmount, React hydration, or passive socket synchronization.
3. **SPAM PROTECTION**: Cooldowns and active-instance tracking prevent overlapping, duplicate, or machine-gun style sound effects.
4. **BROWSER AUTOPLAY SAFETY**: Audio errors caused by browser autoplay policies are caught gracefully, without throwing continuous console errors or engaging in infinite retries.

---

## 🏗️ Architecture

The application handles audio through two centralized controllers to manage pure sound effects and complex chaos media assets:

### 1. `ChaosEngine.js` (`playSound`)
This is the primary sound effect runner for basic UI feedback (clicks, errors, matches, and meme soundbites).
* **Location**: `src/chaos/ChaosEngine.js`
* **Features**:
  * **Cooldowns**: Enforces a minimum `300ms` debounce window per sound type to prevent spam.
  * **Concurrency Protection**: Tracks active playing nodes via a `Set`. If the same sound is triggered while already playing, it will pause the previous instance to avoid chaotic overlapping overlaps.
  * **Autoplay Handling**: Safely wraps `.play()` in a Promise and silently catches rejections.

### 2. `chaosAudioManager.js` (`playChaosAudio`)
This handles slightly more complex configured assets (with random probability chances and independent volume control based on `chaosMediaConfig.js`).
* **Location**: `src/utils/chaosAudioManager.js`
* **Features**:
  * Preloads enabled audio on init to eliminate latency.
  * Checks specific cooldowns configured in the asset definition.
  * Checks probabilities (e.g. 50% chance to play).

---

## 🎧 Where Do Audio Triggers Originate?

Audio triggers are scattered throughout the application but are strictly bound to explicit event handlers:

* **Button Clicks**:
  * Like/Dislike actions on User Cards (`Match.jsx`, `UserCard.jsx`).
  * Sending a message (`Chat.jsx`).
  * Completing form submissions or toggling tabs (`Login.jsx`, `Register.jsx`, `Profile.jsx`).
* **Successful Actions**:
  * Fetching matches successfully, completing a profile update.
* **Chaos Events (Controlled)**:
  * "Fake Warning" popups and captcha triggers in `ChaosOverlay.jsx` (these fire on a deliberate timer but are throttled).
  * Meme overlays when the user takes too long to respond.
* **Failures**:
  * Form validation errors, API request failures.

---

## 🚫 What is BANNED?

* `useEffect` audio triggers (e.g., playing a sound blindly when `Matches.jsx` loads).
* Audio inside `onRender` or mapping loops.
* Audio played just because a passive WebSocket event came in without explicit user context (e.g. receiving a message in the background).

---

## ⚙️ How Autoplay Prevention Works

Modern browsers (Chrome, Safari, Firefox) aggressively block audio that plays before the user interacts with the document.

The central systems handle this safely:
```javascript
const promise = audio.play();
if (promise !== undefined) {
  promise.catch(() => {
    // Silently ignore. Do not log spam. Do not auto-retry.
  }).finally(() => {
    activeSounds.delete(audio);
  });
}
```
If a sound fires before interaction, it simply fails silently, keeping the console clean and preventing memory leaks.

---

## 🗺️ Component Audio Map

| Component | Trigger | Sound Played |
| :--- | :--- | :--- |
| `Match.jsx` | Like Action | `"like_click"`, `"like_success"` |
| `Match.jsx` | Dislike Action | `"sad"`, `"error"` |
| `Chat.jsx` | Send Message | `"pop"` |
| `Chat.jsx` | Toxic Suggestion Click | `"ding"` |
| `ChaosOverlay.jsx` | Warning Popup Spawns | `"error"` |
| `ChaosOverlay.jsx` | Achievement Spawns | `"ding"` |
| `ChaosOverlay.jsx` | Close Warning Popup | `"pop"` |
| `ChaosOverlay.jsx` | Submit Captcha | `"ding"` |
| `Login.jsx` / `Register.jsx` | Form Field Changes / Errors | `"sad"`, `"pop"`, `"vine"`, `"error"` |
| `Profile.jsx` | Profile Edits / API Fails | `"sad"`, `"pop"`, `"ding"`, `"error"` |
