
// Sound utility functions for chess game sounds
const soundEffects = {
  move: new Audio('/sounds/move.mp3'),
  capture: new Audio('/sounds/capture.mp3'),
  check: new Audio('/sounds/check.mp3'),
  checkmate: new Audio('/sounds/checkmate.mp3'),
  draw: new Audio('/sounds/draw.mp3'),
  illegal: new Audio('/sounds/illegal.mp3'),
  promotion: new Audio('/sounds/promotion.mp3'),
};

// Preload all sounds
Object.values(soundEffects).forEach(audio => {
  audio.load();
  audio.volume = 0.5; // 50% volume by default
});

// Play a sound effect
export const playSound = (sound: keyof typeof soundEffects): void => {
  // Create a clone to allow for overlapping sounds
  const audioClone = soundEffects[sound].cloneNode(true) as HTMLAudioElement;
  audioClone.play().catch(err => console.error("Sound playback error:", err));
};

// Set global sound volume (0.0 to 1.0)
export const setSoundVolume = (volume: number): void => {
  const clampedVolume = Math.min(Math.max(volume, 0), 1);
  Object.values(soundEffects).forEach(audio => {
    audio.volume = clampedVolume;
  });
};

// Mute/unmute all sounds
export const setSoundMuted = (muted: boolean): void => {
  Object.values(soundEffects).forEach(audio => {
    audio.muted = muted;
  });
};
