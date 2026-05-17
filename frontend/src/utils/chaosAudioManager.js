/**
 * @file chaosAudioManager.js
 * @description Highly optimized audio controller utilizing preloaded audio cache, cooldown protections, and volume constraints.
 */
import { chaosAudioAssets } from "./chaosMediaConfig.js";

const audioCache = {};
const activeAudios = new Set();
const cooldownTracker = {};

// Preload all enabled audio files for latency-free playback
if (typeof window !== "undefined") {
  chaosAudioAssets.forEach((asset) => {
    if (asset.enabled) {
      try {
        const audio = new Audio(asset.src);
        audio.preload = "auto";
        audioCache[asset.id] = audio;
      } catch (err) {
        console.warn(`Failed to preload audio asset: ${asset.id}`, err);
      }
    }
  });
}

/**
 * @description Plays an optimized chaos audio clip for a trigger type if cooldown permits.
 * @param {string} triggerType
 * @returns {HTMLAudioElement|null} The audio node or null
 */
export const playChaosAudio = (triggerType) => {
  try {
    const eligible = chaosAudioAssets.filter(
      (asset) => asset.enabled && asset.triggerType === triggerType
    );

    if (eligible.length === 0) return null;

    const asset = eligible[Math.floor(Math.random() * eligible.length)];

    // Check probability condition
    if (Math.random() > asset.probability) return null;

    // Check cooldown condition
    const now = Date.now();
    const lastPlayed = cooldownTracker[asset.id] || 0;
    if (now - lastPlayed < asset.cooldown) {
      return null;
    }

    // Retrieve from preloaded cache or create new
    let audio = audioCache[asset.id];
    if (!audio) {
      audio = new Audio(asset.src);
      audioCache[asset.id] = audio;
    }

    // Prevent overlapping overlap spam: if this specific node is already playing, reset or skip
    if (activeAudios.has(audio)) {
      audio.pause();
      audio.currentTime = 0;
    }

    audio.volume = asset.volume;
    
    // Track active playbacks
    activeAudios.add(audio);
    cooldownTracker[asset.id] = now;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn(`[Audio Play Blocked]: Autoplay was prevented for ${asset.id}`, err);
      });
    }

    const onEnded = () => {
      activeAudios.delete(audio);
      audio.removeEventListener("ended", onEnded);
    };
    audio.addEventListener("ended", onEnded);

    return audio;
  } catch (err) {
    console.error("Error inside playChaosAudio", err);
    return null;
  }
};

/**
 * @description Instantly halts all active audio playback nodes.
 */
export const stopAllChaosAudio = () => {
  activeAudios.forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (_) {}
  });
  activeAudios.clear();
};
