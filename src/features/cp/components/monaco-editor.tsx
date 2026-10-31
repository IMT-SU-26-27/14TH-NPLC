"use client";

import Editor, { type EditorProps } from "@monaco-editor/react";
import { useEffectsActive } from "@/hooks/use-effects-active";

// Next keeps visited routes in <Activity>: leaving a page runs the editor's cleanup, which disposes it, but its ref survives.
// Coming back would then call setModel on the disposed editor and crash the page, so mount a fresh editor instead.
export function MonacoEditor(props: EditorProps) {
  const active = useEffectsActive();

  if (!active) return <div style={{ height: props.height }}>{props.loading}</div>;
  return <Editor {...props} />;
}
