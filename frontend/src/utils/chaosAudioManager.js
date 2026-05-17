/**
 * @file chaosAudioManager.js
 * @description Config-driven local audio asset management and player engine for Unhinged UX Crimes.
 */

export const chaosAudioAssets = [
  {
    id: "laugh_evil",
    src: "/audio/Funny-Laughing.mp3",
    volume: 0.5,
    cooldown: 4000,
    triggerType: "login",
    duration: 5,
    probability: 1.0,
    enabled: true
  },
  {
    id: "ruko_jara",
    src: "/audio/Ruko-Jara.mp3",
    volume: 0.6,
    cooldown: 5000,
    triggerType: "waiting_reply",
    duration: 6,
    probability: 1.0,
    enabled: true
  },
  {
    id: "abhi_maja_aayega",
    src: "/audio/Abhi-Maja-Aayega-Na-Bhidu.mp3",
    volume: 0.5,
    cooldown: 6000,
    triggerType: "like_success",
    duration: 8,
    probability: 1.0,
    enabled: true
  },
  {
    id: "hhh_laugh",
    src: "/audio/Hhh.mp3",
    volume: 0.7,
    cooldown: 3000,
    triggerType: "open_chat",
    duration: 2,
    probability: 0.8,
    enabled: true
  },
  {
    id: "ignored_giggle",
    src: "/audio/Funny-Laughing.mp3",
    volume: 0.4,
    cooldown: 5000,
    triggerType: "ignored",
    duration: 4,
    probability: 1.0,
    enabled: true
  },
  {
    id: "rage_click_laugh",
    src: "/audio/Hhh.mp3",
    volume: 0.8,
    cooldown: 1000,
    triggerType: "rage_click",
    duration: 1.5,
    probability: 0.9,
    enabled: true
  },
  {
    id: "ghosted_spook",
    src: "/audio/Ruko-Jara.mp3",
    volume: 0.5,
    cooldown: 8000,
    triggerType: "ghosted",
    duration: 5,
    probability: 1.0,
    enabled: true
  },
  {
    id: "no_match_trombone",
    src: "/audio/Funny-Laughing.mp3",
    volume: 0.6,
    cooldown: 5000,
    triggerType: "no_match",
    duration: 4,
    probability: 1.0,
    enabled: true
  },
  {
    id: "typing_long_ruko",
    src: "/audio/Ruko-Jara.mp3",
    volume: 0.6,
    cooldown: 7000,
    triggerType: "typing_too_long",
    duration: 6,
    probability: 1.0,
    enabled: true
  }
];

// Tracks last playback timestamps to respect configured cooldowns
const cooldownTracker = {};
// Store reference of active playing Audio instances
const activeAudios = new Set();

/**
 * @description Plays a random matching audio asset based on trigger type.
 * @param {string} triggerType
 * @returns {HTMLAudioElement|null} The audio instance or null
 */
export const playChaosAudio = (triggerType) => {
  try {
    const eligible = chaosAudioAssets.filter(
      (asset) => asset.enabled && asset.triggerType === triggerType
    );

    if (eligible.length === 0) return null;

    // Pick a random matching asset
    const asset = eligible[Math.floor(Math.random() * eligible.length)];

    // Check probability condition
    if (Math.random() > asset.probability) return null;

    // Check cooldown condition
    const now = Date.now();
    const lastPlayed = cooldownTracker[asset.id] || 0;
    if (now - lastPlayed < asset.cooldown) {
      console.log(`[Audio Cooldown] Suppressed audio trigger "${asset.id}" due to cooldown constraint.`);
      return null;
    }

    // Play Audio
    const audio = new Audio(asset.src);
    audio.volume = asset.volume;
    
    // Add to track active nodes
    activeAudios.add(audio);
    cooldownTracker[asset.id] = now;

    audio.play().catch((err) => {
      console.warn("Autoplay blocked or play failed", err);
    });

    audio.addEventListener("ended", () => {
      activeAudios.delete(audio);
    });

    // Auto duration cutoff
    if (asset.duration) {
      setTimeout(() => {
        try {
          audio.pause();
          activeAudios.delete(audio);
        } catch (_) {}
      }, asset.duration * 1000);
    }

    return audio;
  } catch (err) {
    console.error("Failed to play chaos audio", err);
    return null;
  }
};

/**
 * @description Stops all active playing audio nodes immediately.
 */
export const stopAllChaosAudio = () => {
  activeAudios.forEach((audio) => {
    try {
      audio.pause();
    } catch (_) {}
  });
  activeAudios.clear();
};

/**
 * @description Retrieves a random matching config asset.
 */
export const getRandomChaosAsset = (triggerType) => {
  const eligible = chaosAudioAssets.filter((asset) => asset.triggerType === triggerType);
  if (!eligible.length) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
};
