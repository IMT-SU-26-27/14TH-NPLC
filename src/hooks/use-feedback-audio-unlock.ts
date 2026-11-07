"use client";

import { useEffect } from "react";
import { unlockFeedbackAudio } from "@/lib/rally/feedback";

// Unlocks the feedback sound on the first touch of the page.
export function useFeedbackAudioUnlock() {
  useEffect(() => {
    const unlock = () => unlockFeedbackAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
}
