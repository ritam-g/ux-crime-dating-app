/**
 * @file ChaosEngine.js
 * @description Central chaos coordinator — audio, popups, random events.
 * All functionality is purely presentational. No backend calls here.
 */

// ─── Audio Manager ─────────────────────────────────────────────────────────────
const SOUNDS = {
  error:    "https://www.myinstants.com/media/sounds/erro.mp3",
  ding:     "https://www.soundjay.com/button/sounds/button-21.mp3",
  sad:      "https://www.myinstants.com/media/sounds/sad-trombone.mp3",
  pop:      "https://www.soundjay.com/button/sounds/button-09.mp3",
  vine:     "https://www.myinstants.com/media/sounds/vine-boom.mp3",
  nyan:     "https://www.myinstants.com/media/sounds/nyan-cat.mp3",
};

const audioCache = {};
const playCooldowns = {};
const activeSounds = new Set();

export const playSound = (name, volumeOverride) => {
  try {
    const url = SOUNDS[name];
    if (!url) return;

    // 1. Debounce / Cooldown prevention (e.g. 300ms)
    const now = Date.now();
    if (playCooldowns[name] && now - playCooldowns[name] < 300) {
      return; // Ignore spam
    }

    if (!audioCache[name]) {
      audioCache[name] = new Audio(url);
    }
    const audio = audioCache[name];

    // 2. Prevent overlapping of the exact same sound instance
    if (activeSounds.has(audio)) {
      audio.pause();
    }

    audio.volume = volumeOverride ?? (0.1 + Math.random() * 0.3);
    audio.currentTime = 0;

    activeSounds.add(audio);
    playCooldowns[name] = now;

    // 3. Play and handle browser autoplay securely without endless retries
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Silently ignore autoplay prevention to avoid throwing errors in console repeatedly
      }).finally(() => {
        activeSounds.delete(audio);
      });
    } else {
      activeSounds.delete(audio);
    }
    
    // Cleanup if ends naturally
    audio.onended = () => {
      activeSounds.delete(audio);
    };
  } catch (_) {}
};

// ─── Random Helpers ─────────────────────────────────────────────────────────────
export const rand = (min, max) => Math.random() * (max - min) + min;
export const randInt = (min, max) => Math.floor(rand(min, max + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const maybe = (probability = 0.5) => Math.random() < probability;

// ─── Fake Loading Messages ──────────────────────────────────────────────────────
export const LOADING_MESSAGES = [
  "Analyzing your rizz... 🔍",
  "Running emotional damage check...",
  "Consulting the dating gods 🙏",
  "Scanning for red flags... 🚩🚩🚩",
  "Checking FBI database...",
  "Downloading feelings... 💔",
  "Verifying you are not a bot (we doubt it)",
  "Calculating compatibility with Mercury in retrograde ♓",
  "Loading your rejection letters...",
  "Please wait while we judge your vibe...",
  "Government clearance pending...",
  "Validating your aura score 🌈",
];

// ─── Evil Popup Messages ────────────────────────────────────────────────────────
export const VIRUS_WARNINGS = [
  { title: "⚠️ VIRUS DETECTED", body: "Your love life has been infected with 47 trojans. Click OK to pay $4.99/month for protection." },
  { title: "🚨 FBI OPEN UP", body: "We have detected suspicious dating activity on your device. Please submit your rizz certificate within 24 hours." },
  { title: "📸 WEBCAM ACCESSED", body: "Your crush just accessed your webcam. You looked great! (Results may vary.)" },
  { title: "💔 EMOTIONAL BREACH", body: "Our AI has detected that you have a 94% chance of getting left on read. Upgrade to Premium to avoid this fate." },
  { title: "🛡️ MALWARE ALERT", body: "Kaspersky has detected traces of 'being too nice' on your device. This is considered dangerous in today's dating scene." },
];

export const FAKE_ACHIEVEMENTS = [
  "🏆 Achievement Unlocked: Left on Read (3rd time this week)",
  "🎯 Badge: Master of the Double Text",
  "💀 Achievement: Emotional Support Animal",
  "🎪 Trophy: Certified Red Flag Collector",
  "🤡 Medal: Professional Simp Level 9",
  "🔥 Streak: 7 Days of Being Single!",
  "👑 Achievement: Profile Stalker (Pro)",
];

export const DATING_TIPS = [
  "💡 Pro Tip: Send another message. 7 unanswered ones show dedication.",
  "💡 Science says: Being desperate is attractive to nobody.",
  "💡 Did you know? Your last message sent 3 hours ago is being screenshotted right now.",
  "💡 Relationship Advice: Touch grass. Immediately.",
  "💡 Fun fact: There are 8 billion people on earth and you're here.",
  "💡 Hot take: Maybe it's the bio.",
];

// ─── Cursor Trail ───────────────────────────────────────────────────────────────
export const TRAIL_EMOJIS = ["💀", "💔", "🚩", "👻", "❓", "😭", "🤡", "✨", "🔥", "🥀"];
