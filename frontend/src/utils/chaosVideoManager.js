/**
 * @file chaosVideoManager.js
 * @description Highly optimized video config selector with cooldown protection and preloading helpers.
 */
import { chaosVideoAssets } from "./chaosMediaConfig.js";

const cooldownTracker = {};
const videoCache = {};

// Optional: Preload video references on client load
if (typeof window !== "undefined") {
  chaosVideoAssets.forEach((asset) => {
    if (asset.enabled) {
      try {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "video";
        link.href = asset.src;
        document.head.appendChild(link);
        videoCache[asset.id] = asset.src;
      } catch (_) {}
    }
  });
}

/**
 * @description Retrieves a random enabled video asset for a trigger type if cooldown permits.
 * @param {string} triggerType
 * @returns {object|null} The video asset structure or null
 */
export const getChaosVideoAsset = (triggerType) => {
  try {
    const eligible = chaosVideoAssets.filter(
      (asset) => asset.enabled && asset.triggerType === triggerType
    );

    if (eligible.length === 0) return null;

    const asset = eligible[Math.floor(Math.random() * eligible.length)];

    // Check cooldown condition
    const now = Date.now();
    const lastPlayed = cooldownTracker[asset.id] || 0;
    if (now - lastPlayed < asset.cooldown) {
      return null;
    }

    cooldownTracker[asset.id] = now;
    return asset;
  } catch (err) {
    console.error("Error in getChaosVideoAsset", err);
    return null;
  }
};
