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
    src: "https://media.istockphoto.com/id/2205736500/video/man-in-glasses-cringes-with-embarrassment-at-awkward-moment.mp4?s=mp4-640x640-is&k=20&c=LgDcpEmv5jhQKFFCDv04NmHaNzWldsJ7H-6CX8gglic=",
    triggerType: "ignored",
    volume: 0.3,
    cooldown: 8000,
    duration: 15,
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
