/**
 * @file chaosMediaConfig.js
 * @description Centralized, config-driven asset definitions for local audio and video files.
 */

export const chaosAudioAssets = [
  {
    id: "laugh_evil",
    src: "/audio/Funny-Laughing.mp3",
    triggerType: "login",
    volume: 0.5,
    cooldown: 4000,
    probability: 1.0,
    enabled: true
  },
  {
    id: "ruko_jara",
    src: "/audio/Ruko-Jara.mp3",
    triggerType: "waiting_reply",
    volume: 0.6,
    cooldown: 3000,
    probability: 1.0,
    enabled: true
  },
  {
    id: "abhi_maja_aayega",
    src: "/audio/Abhi-Maja-Aayega-Na-Bhidu.mp3",
    triggerType: "like_success",
    volume: 0.5,
    cooldown: 4000,
    probability: 1.0,
    enabled: true
  },
  {
    id: "hhh_laugh",
    src: "/audio/Hhh.mp3",
    triggerType: "open_chat",
    volume: 0.7,
    cooldown: 2000,
    probability: 1.0,
    enabled: true
  },
  {
    id: "kihnea_chatea_ho",
    src: "/audio/kihnea_kiya_chatea_ho.mp3",
    triggerType: "waiting_reply",
    volume: 0.6,
    cooldown: 3000,
    probability: 1.0,
    enabled: true
  },
  {
    id: "like_click_sound",
    src: "/audio/Hhh.mp3",
    triggerType: "like_click",
    volume: 0.5,
    cooldown: 500,
    probability: 1.0,
    enabled: true
  }
];

export const chaosVideoAssets = [
  {
    id: "chat_came_2",
    src: "/videos/chat_came2.mp4",
    triggerType: "waiting_reply",
    duration: 10,
    cooldown: 5000,
    enabled: true
  },
  {
    id: "chat_come_1",
    src: "/videos/Chat_come1.mp4",
    triggerType: "waiting_reply",
    duration: 12,
    cooldown: 5000,
    enabled: true
  },
  {
    id: "reply_late_1",
    src: "/videos/reaply_late1.mp4",
    triggerType: "waiting_reply",
    duration: 8,
    cooldown: 5000,
    enabled: true
  },
  {
    id: "reply_late_12",
    src: "/videos/reaply_late12mp4", // exact filename without dot in extension
    triggerType: "waiting_reply",
    duration: 15,
    cooldown: 5000,
    enabled: true
  }
];
