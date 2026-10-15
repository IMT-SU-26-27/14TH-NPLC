import type { Monaco } from "@monaco-editor/react";

export const MONACO_THEME = "nplc";

// Monaco only accepts hex colours; resolve a globals.css token (oklch) to hex through a canvas.
function tokenHex(name: string, alpha = 1): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx || !value) return "#000000";
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  const hex = [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  return `#${hex}${alpha < 1 ? Math.round(alpha * 255).toString(16).padStart(2, "0") : ""}`;
}

// Editor theme built from the app's theme tokens, so the editor matches cards, text and the primary colour.
export function defineMonacoTheme(monaco: Monaco) {
  const dark = document.documentElement.classList.contains("dark");
  const fg = tokenHex("--foreground").slice(1);
  const muted = tokenHex("--muted-foreground").slice(1);
  const primary = tokenHex("--primary").slice(1);
  const destructive = tokenHex("--destructive").slice(1);
  const success = tokenHex("--success").slice(1);

  monaco.editor.defineTheme(MONACO_THEME, {
    base: dark ? "vs-dark" : "vs",
    inherit: true,
    rules: [
      { token: "", foreground: fg },
      { token: "keyword", foreground: primary },
      { token: "type", foreground: primary },
      { token: "number", foreground: destructive },
      { token: "string", foreground: success },
      { token: "comment", foreground: muted, fontStyle: "italic" },
      { token: "delimiter", foreground: fg },
    ],
    colors: {
      "editor.background": tokenHex("--card"),
      "editor.foreground": tokenHex("--foreground"),
      "editorLineNumber.foreground": tokenHex("--muted-foreground"),
      "editorLineNumber.activeForeground": tokenHex("--foreground"),
      "editorCursor.foreground": tokenHex("--primary"),
      "editor.selectionBackground": tokenHex("--primary", 0.2),
      "editor.lineHighlightBackground": tokenHex("--muted"),
      "editor.lineHighlightBorder": tokenHex("--muted"),
      "editorIndentGuide.background1": tokenHex("--border"),
      "scrollbarSlider.background": tokenHex("--border", 0.8),
      "scrollbarSlider.hoverBackground": tokenHex("--muted-foreground", 0.5),
      "scrollbarSlider.activeBackground": tokenHex("--muted-foreground", 0.7),
    },
  });
}
