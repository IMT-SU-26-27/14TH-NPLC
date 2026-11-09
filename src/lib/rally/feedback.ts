// Sound and vibration, because a scan takes seconds and the LO is watching the team, not the screen.
// Sound is the fallback where vibration is missing (iPhone) or switched off in the phone's settings.

let audio: AudioContext | null = null;

// Browsers keep audio silent until the person touches the page, so this runs on the first touch.
export function unlockFeedbackAudio() {
  if (typeof AudioContext === "undefined") return;
  audio ??= new AudioContext();
  void audio.resume();
}

function beep(frequency: number, startsIn = 0, seconds = 0.12) {
  if (!audio || audio.state !== "running") return;
  const start = audio.currentTime + startsIn;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.2, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
  gain.connect(audio.destination);
  const oscillator = audio.createOscillator();
  oscillator.frequency.value = frequency;
  oscillator.connect(gain);
  oscillator.start(start);
  oscillator.stop(start + seconds);
}

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined") navigator.vibrate?.(pattern);
}

export function feedbackRead() {
  vibrate(80);
  beep(880);
}

// Two rising tones, so it can't be mistaken for the scan.
export function feedbackSaved() {
  vibrate([120, 60, 120]);
  beep(880);
  beep(1320, 0.14);
}

export function feedbackUndone() {
  vibrate(80);
}

export function feedbackError() {
  vibrate([300]);
}
