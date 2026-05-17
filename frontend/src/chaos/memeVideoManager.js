/**
 * @file memeVideoManager.js
 * @description Dynamic asset configuration and helper functions for the Chaotic Chat Meme Video system.
 */

export const videoAssets = [
  {
    id: "ignored_clown",
    title: "💀 Bro Got Ignored (Clown Symphony)",
    src: "https://www.w3schools.com/html/mov_bbb.mp4", // Replaceable with local mp4
    triggerType: "ignored",
    volume: 0.5,
    cooldown: 5000,
    duration: 10,
  },
  {
    id: "subway_surfers",
    title: "🧠 Subway Surfers Gameplay (To Keep Your Empath Brain Focused)",
    src: "https://assets.mixkit.co/videos/preview/mixkit-gaming-controller-and-hands-in-close-up-39722-large.mp4",
    triggerType: "ignored",
    volume: 0.3,
    cooldown: 8000,
    duration: 15,
  },
  {
    id: "awkward_silence",
    title: "🌧️ Awkward Silence & Severe Emotional Damage",
    src: "https://assets.mixkit.co/videos/preview/mixkit-raindrops-on-a-window-sill-1854-large.mp4",
    triggerType: "ignored",
    volume: 0.6,
    cooldown: 6000,
    duration: 12,
  }
];

/**
 * @description Selects a random video asset based on the trigger type.
 * @param {string} triggerType 
 * @returns {object} selected asset
 */
export const getRandomVideoAsset = (triggerType = "ignored") => {
  const filtered = videoAssets.filter((asset) => asset.triggerType === triggerType);
  if (!filtered.length) return null;
  return filtered[Math.floor(Math.random() * filtered.length)];
};
