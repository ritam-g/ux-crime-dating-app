/**
 * @file chaosTriggers.js
 * @description Central coordinator for audio & video triggering and media state control.
 */

import { playChaosAudio as playAudio, stopAllChaosAudio, getRandomChaosAsset as getAudioAsset } from "./chaosAudioManager.js";
import { getChaosVideoAsset } from "./chaosVideoManager.js";

/**
 * @description Plays a chaos audio clip for the given trigger type.
 * @param {string} triggerType 
 */
export const playChaosAudio = (triggerType) => {
  return playAudio(triggerType);
};

/**
 * @description Selects and registers a chaos video clip for the given trigger type.
 * @param {string} triggerType 
 * @returns {object|null} The video asset or null
 */
export const playChaosVideo = (triggerType) => {
  return getChaosVideoAsset(triggerType);
};

/**
 * @description Stops all currently playing chaos audio.
 */
export const stopChaosMedia = () => {
  stopAllChaosAudio();
};

/**
 * @description Retrieves a random audio asset structure.
 * @param {string} triggerType 
 */
export const getRandomChaosAsset = (triggerType) => {
  return getAudioAsset(triggerType);
};
