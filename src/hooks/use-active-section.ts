"use client";

import { useEffect, useState } from "react";

// Index of the last section whose top has scrolled past the upper third of the viewport.
// Drives the "you are here" step in the registration form's step list.
export function useActiveSection(ids: readonly string[]): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    function update() {
      const line = window.innerHeight / 3;
      let current = 0;
      sections.forEach((section, i) => {
        if (section.getBoundingClientRect().top <= line) current = i;
      });
      setActive(current);
    }

    const observer = new IntersectionObserver(update, { rootMargin: "0px 0px -66% 0px", threshold: [0, 1] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
