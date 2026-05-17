/**
 * @file chaosTriggers.js
 * @description Centralized trigger coordinator for all audio & video events.
 */
import { playChaosAudio as playAudio, stopAllChaosAudio } from "./chaosAudioManager.js";
import { getChaosVideoAsset } from "./chaosVideoManager.js";
import { chaosAudioAssets } from "./chaosMediaConfig.js";

/**
 * @description Plays an optimized chaos audio sound for the target trigger type.
 * @param {string} triggerType
 */
export const playChaosAudio = (triggerType) => {
  return playAudio(triggerType);
};

/**
 * @description Retrieves a random enabled video asset for the target trigger type.
 * @param {string} triggerType
 * @returns {object|null} The video asset structure
 */
export const playChaosVideo = (triggerType) => {
  return getChaosVideoAsset(triggerType);
};

/**
 * @description Instantly halts all active playing audios and overlays.
 */
export const stopChaosMedia = () => {
  stopAllChaosAudio();
};

/**
 * @description Returns a random matching audio asset config structure.
 * @param {string} triggerType
 */
export const getRandomChaosAsset = (triggerType) => {
  const eligible = chaosAudioAssets.filter((asset) => asset.triggerType === triggerType);
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
};
