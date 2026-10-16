"use client";

import Editor from "@monaco-editor/react";
import { MONACO_LANGUAGE } from "@/lib/cp/templates";
import { defineMonacoTheme, MONACO_THEME } from "@/lib/cp/monaco-theme";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubmissionCodeViewerProps } from "@/types/cp";

const LINE_HEIGHT = 20;

// Read-only view of submitted code with the same highlighting participants saw while writing it.
export function SubmissionCodeViewer({ code, language, label }: SubmissionCodeViewerProps) {
  const lines = code.split("\n").length;
  const height = Math.min(Math.max(lines, 8), 40) * LINE_HEIGHT + 24;

  return (
    <Editor
      height={height}
      language={MONACO_LANGUAGE[language]}
      theme={MONACO_THEME}
      beforeMount={defineMonacoTheme}
      value={code}
      loading={<Skeleton className="m-4 h-48" />}
      options={{
        ariaLabel: label,
        readOnly: true,
        domReadOnly: true,
        minimap: { enabled: false },
        fontSize: 13,
        lineHeight: LINE_HEIGHT,
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 12 },
        renderLineHighlight: "none",
        bracketPairColorization: { enabled: false },
        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8, alwaysConsumeMouseWheel: false },
      }}
    />
  );
}
