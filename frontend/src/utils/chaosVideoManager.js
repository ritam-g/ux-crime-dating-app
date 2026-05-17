/**
 * @file chaosVideoManager.js
 * @description Config-driven local video asset management and trigger handlers.
 */

export const chaosVideoAssets = [
  {
    id: "ignored_bunny",
    title: "🐇 Big Buck Bunny Interruption",
    src: "/videos/mov_bbb.mp4",
    volume: 0.4,
    cooldown: 10000,
    triggerType: "ignored",
    duration: 12,
    probability: 1.0,
    enabled: true
  },
  {
    id: "cringe_embarrassed",
    title: "💀 Severe Awkward Silence",
    src: "/videos/istock.mp4",
    volume: 0.5,
    cooldown: 8000,
    triggerType: "ignored",
    duration: 10,
    probability: 1.0,
    enabled: true
  },
  {
    id: "ghosted_bunny",
    title: "👻 Ghosted In Retro Style",
    src: "/videos/mov_bbb.mp4",
    volume: 0.3,
    cooldown: 12000,
    triggerType: "ghosted",
    duration: 8,
    probability: 1.0,
    enabled: true
  },
  {
    id: "typing_long_bunny",
    title: "⌨️ Speed Typing Simulator",
    src: "/videos/mov_bbb.mp4",
    volume: 0.2,
    cooldown: 15000,
    triggerType: "typing_too_long",
    duration: 10,
    probability: 1.0,
    enabled: true
  }
];

const cooldownTracker = {};

/**
 * @description Retrieves a random enabled video asset based on trigger type and probability.
 * @param {string} triggerType 
 * @returns {object|null} Selected asset or null
 */
export const getChaosVideoAsset = (triggerType) => {
  const eligible = chaosVideoAssets.filter(
    (asset) => asset.enabled && asset.triggerType === triggerType
  );

  if (eligible.length === 0) return null;

  const asset = eligible[Math.floor(Math.random() * eligible.length)];

  // Probability check
  if (Math.random() > asset.probability) return null;

  // Cooldown check
  const now = Date.now();
  const lastPlayed = cooldownTracker[asset.id] || 0;
  if (now - lastPlayed < asset.cooldown) {
    console.log(`[Video Cooldown] Suppressed video trigger "${asset.id}" due to cooldown.`);
    return null;
  }

  // Update cooldown timestamp
  cooldownTracker[asset.id] = now;
  return asset;
};
