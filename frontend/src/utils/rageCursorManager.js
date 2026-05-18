/**
 * @file rageCursorManager.js
 * @description Singleton manager for the Rage Cursor system.
 *
 * DESIGN RULES:
 *  - ZERO React state involvement for cursor frame updates.
 *  - Uses a single CSS variable `--rage-size` on :root for all sizing.
 *  - Increments are batched via requestAnimationFrame to prevent jank.
 *  - Resets after INACTIVITY_MS of no rage-worthy interactions.
 *  - Capped at MAX_RAGE to keep the cursor still usable (barely).
 */

const BASE_SIZE   = 18;   // px — default cursor diameter
const MAX_RAGE    = 120;  // px — absurd but still technically functional
const STEP        = 6;    // px added per rage event
const INACTIVITY_MS = 30_000; // ms — reset after 30s of no interactions

let currentSize   = BASE_SIZE;
let inactivityTimer = null;
let rafPending    = false;
let isInitialized = false;

// ─── Internal helpers ────────────────────────────────────────────────────────

const applySizeToDOM = () => {
  document.documentElement.style.setProperty("--rage-size", `${currentSize}px`);
  rafPending = false;
};

const scheduleApply = () => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(applySizeToDOM);
  }
};

const resetInactivityTimer = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(resetRage, INACTIVITY_MS);
};

// ─── Public API ──────────────────────────────────────────────────────────────

/** Increment rage level by one step. Call on any cursed interaction. */
export const addRage = () => {
  if (currentSize < MAX_RAGE) {
    currentSize = Math.min(currentSize + STEP, MAX_RAGE);
    scheduleApply();
  }
  resetInactivityTimer();
};

/** Instantly reset rage back to base size. */
export const resetRage = () => {
  currentSize = BASE_SIZE;
  scheduleApply();
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
};

/** Returns current rage as a 0–1 progress value. */
export const getRageProgress = () =>
  (currentSize - BASE_SIZE) / (MAX_RAGE - BASE_SIZE);

/**
 * Initialise the manager. Safe to call multiple times — idempotent.
 * Writes the initial CSS variable so the cursor is sized correctly on mount.
 */
export const initRageCursor = () => {
  if (isInitialized) return;
  isInitialized = true;
  applySizeToDOM();
};

/** Tear down the manager — clears timers. Call on app unmount if needed. */
export const destroyRageCursor = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  isInitialized = false;
  rafPending = false;
};
