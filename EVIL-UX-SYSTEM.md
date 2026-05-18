# 😈 EVIL UX SYSTEM DOCUMENTATION

This document tracks all cursed, intentional chaotic features built into LOVE.EXE — Not Responding.
All systems are designed to frustrate, entertain, and remain **production-safe**.

---

## 🎬 Chat Entry Meme Overlay
**Location**: `src/components/chaos/ChatEntryVideoOverlay.jsx`

### Trigger Conditions
* Triggered **ONLY** when the user explicitly clicks the "Chat" button in the Navbar.
* Does **NOT** trigger on page reloads, React hydration, passive WebSocket events, or if the user is already on the chat page and the component re-renders.

### Timing Behavior
* **Enter**: Fades in and translates up smoothly over `300ms`.
* **Duration**: Stays visible and auto-plays for exactly `4.5 seconds`.
* **Exit**: Begins fading out after `4.5s`, then fully unmounts `300ms` later.

### Audio / Video Rules
* Uses the local asset: `/videos/when_user_click_chat_buton.mp4`.
* Volume is explicitly clamped to `30%` (`0.3`).
* Catches `.play()` Promises to prevent uncaught exceptions from browser autoplay blocks.

### Cleanup Behavior
* Wrapped in an isolated `useEffect` cleanup hook to guarantee timeout timers are cleared if the user unmounts the Navbar or navigates away.
* Unmounting completely removes the `video` tag from the DOM.

---

## 🍪 Cookie Consent Mafia
**Location**: `src/components/chaos/CookieConsentMafia.jsx`

### Trigger Conditions
* Shown **once per browser session** (gated by `sessionStorage.getItem("loveexe_cookie_accepted")`).
* Renders globally from `App.jsx` on top of everything else (z-index: 2147483641).
* Never re-renders on subsequent page loads within the same tab session.

### Chaos Escalation Flow
| Reject Count | What Happens |
|---|---|
| 0 | Shows main popup with default text |
| 1 | Spawns 2 mini-popups at random screen positions |
| 2 | Spawns 2 more minis; Accept button visually drifts by ~30px |
| 3+ | Main popup begins **following the cursor** (RAF-based, smooth lag); popup shakes dramatically on click |
| 4+ | Force-close escape hatch becomes visible as `"✕ ok fine"` text |

### Performance Contract
* Mini-popups are **hard-capped at 8** — no unbounded spawning.
* Cursor follow uses `requestAnimationFrame` with a `CURSOR_LAG = 0.06` lerp factor — **zero React setState calls** on mouse move.
* All `setTimeout` handles are stored in `timeoutsRef` and cleared on unmount.
* RAF is cancelled on unmount or when cursor-follow mode is disabled.

### Escape Hatch (Always Available)
* A small `·` button sits in the top-right corner from the start.
* After 4+ rejects it expands to `"✕ ok fine"` and is clearly visible.
* Clicking it accepts and dismisses — user is **never trapped**.

### Cleanup Behavior
* `useEffect` return clears all tracked timeouts.
* Separate `useEffect` for cursor-follow cleans up the `mousemove` listener and `cancelAnimationFrame` on dependency change or unmount.

---

## 💔 Rage Cursor System

### Manager
**Location**: `src/utils/rageCursorManager.js`

A singleton utility that manages cursor rage state via a single CSS variable (`--rage-size`) on `:root`.

| Constant | Value | Purpose |
|---|---|---|
| `BASE_SIZE` | `18px` | Default cursor diameter |
| `MAX_RAGE` | `120px` | Absurd-but-usable cap |
| `STEP` | `6px` | Size added per rage event |
| `INACTIVITY_MS` | `30000ms` | Auto-reset timeout |

**Public API:**
- `addRage()` — Increments size by `STEP` (up to `MAX_RAGE`), resets inactivity timer.
- `resetRage()` — Instantly returns to `BASE_SIZE`.
- `getRageProgress()` — Returns `0–1` float for badge threshold logic.
- `initRageCursor()` — Idempotent init; writes the CSS variable on first call.
- `destroyRageCursor()` — Clears timers; call on app unmount if needed.

### Component
**Location**: `src/components/chaos/RageCursor.jsx`

Renders a custom neon-pink 💔 cursor whose size grows via the CSS variable.

### Performance Contract
* Mouse tracking via `requestAnimationFrame` — **zero `setState` on mousemove**.
* Size transitions handled entirely by CSS `transition` on `width`/`height`.
* React state only updates for the rage **badge** (5 discrete levels), triggered by `rage:increment` custom window event — not on every frame.
* Native cursor hidden via `document.documentElement.style.cursor = "none"` and restored on unmount.

### Rage Trigger Points
| Interaction | File | Method |
|---|---|---|
| Like / Dislike | `UserCard.jsx` | `fireRage()` on both buttons |
| Send chat message | `Chat.jsx` | `fireRage()` in `handleSend` |
| Register submit button hover | `Register.jsx` | `fireRage()` in `onMouseEnter` |
| Registration error | `Register.jsx` | `fireRage()` in catch block |
| Cookie consent reject | `CookieConsentMafia.jsx` | `addRage()` direct call |
| Captcha submit | `NeverEndingCaptcha.jsx` | `addRage()` on each round |

### Cleanup Behavior
* `mousemove` listener and RAF loop cancelled in `useEffect` cleanup.
* Inactivity timer auto-resets rage after `30s` of no interactions.

---

## 🔁 Never-Ending Captcha
**Location**: `src/components/chaos/NeverEndingCaptcha.jsx`

### Trigger Conditions
* Fires in the **Register flow** — intercepts form submit before the real API call.
* Can be imported and used anywhere a verification gate is needed (e.g., suspicious login, random chaos triggers).

### Captcha Themes (7 rounds available, picked randomly)
1. "Select all emotionally unavailable people"
2. "Find the red flags 🚩"
3. "Who will ghost you?"
4. "Pick the toxic reply"
5. "Which one says 'k' after an argument?"
6. "Select the situationship survivor"
7. "Identify the walking red flag"

### Round Flow
```
[Round 1] → user selects options → submits
           → fake success animation (1.8s)
           → [Round 2] appears...
           ...repeat for 3–5 rounds (random)...
           → [Final] genuine "Verified 🎉" screen
           → onSuccess() fires after 1.2s
```

### Performance Contract
* Total rounds are determined **once** at mount via `useRef(randInt(3, 5))` — never changes mid-session.
* All `setTimeout` handles stored in `timers` ref and cleared on unmount.
* `addRage()` fires on every captcha submission for rage cursor synergy.

### Escape Hatch (Always Available)
* A `"skip (coward mode)"` button is visible throughout the answering phase.
* Calls `onDismiss()` — user is **never trapped**.
* In Register.jsx, `onDismiss` sets `showCaptcha(false)` which closes the captcha without submitting.

### Cleanup Behavior
* All timers cleared in a single `useEffect` return.
* No global listeners, no intervals — purely timeout-based.

---

## 🔊 Audio System
*(Documented separately in `AUDIO-SYSTEM.md`)*

### Quick Reference
- `playSound(name, volume?)` — debounced, cooldown-protected, Promise-safe.
- Cooldown: `300ms` per sound key.
- No passive triggers on socket events or mounts.

---

## ⚡ Global Chaos Performance Rules

| Rule | Implementation |
|---|---|
| No setState on mousemove | All cursor tracking uses `useRef` + `requestAnimationFrame` |
| No unbounded popup spawning | Cookie minis capped at 8; ChaosOverlay intervals are gated by `Math.random()` |
| No event listener leaks | Every `addEventListener` paired with `removeEventListener` in cleanup |
| No interval stacking | All intervals stored in variables, cleared on unmount |
| No memory leaks from timers | All `setTimeout` IDs tracked in refs; cleared in `useEffect` returns |
| Always escapable | Every chaos system has a guaranteed escape path |

---

## 🗂️ File Map

```
frontend/src/
├── components/chaos/
│   ├── CookieConsentMafia.jsx     ← Cookie consent escalation system
│   ├── RageCursor.jsx             ← Custom cursor with rage growth
│   └── NeverEndingCaptcha.jsx     ← Multi-round meme captcha
├── utils/
│   ├── rageCursorManager.js       ← Rage cursor singleton (CSS var approach)
│   ├── chaosAudioManager.js       ← Audio debounce + concurrency control
│   ├── chaosTriggers.js           ← Video/media trigger helpers
│   └── chaosVideoManager.js       ← Video asset manager
├── chaos/
│   ├── ChaosEngine.js             ← Sound, random helpers, content pools
│   ├── ChaosOverlay.jsx           ← Virus popups, notifications, premium ad
│   ├── CursorTrail.jsx            ← Legacy emoji trail (replaced by RageCursor)
│   └── MemeVideoOverlay.jsx       ← Meme video overlay system
```

---

*Last updated: 2026-05-18 — LOVE.EXE v2.0 "Emotionally Unstable" release*
*Built for the 🍊 Unhinged UI/UX Crimes Competition*
