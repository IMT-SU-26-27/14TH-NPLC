"use client";

import { useLayoutEffect, useState } from "react";

// False on the server and while Activity keeps this route hidden (effects cleaned up, state kept).
// Lets a component drop a child that cannot survive its effects being cleaned up and run again.
export function useEffectsActive() {
  const [active, setActive] = useState(false);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- this state only mirrors the effect's own lifecycle
    setActive(true);
    return () => setActive(false);
  }, []);

  return active;
}
