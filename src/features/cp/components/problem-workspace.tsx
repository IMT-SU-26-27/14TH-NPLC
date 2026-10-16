"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { runSamples, submitSolution } from "@/lib/actions/cp";
import { openVerdictGuide } from "@/lib/cp/verdict-guide";
import { useCodeEditor } from "@/hooks/use-code-editor";
import { useCooldown } from "@/hooks/use-cooldown";
import { useI18n } from "@/hooks/use-i18n";
import { CodeEditorPanel } from "@/features/cp/components/code-editor-panel";
import { ResultsPanel } from "@/features/cp/components/results-panel";
import type { ProblemWorkspaceProps, SubmissionOutcome } from "@/types/cp";

// Left column: the statement (server-rendered) above the editor. Right column: results and history.
export function ProblemWorkspace({ problemId, statement, recent, cooldownSeconds }: ProblemWorkspaceProps) {
  const { t } = useI18n();
  const editor = useCodeEditor(problemId);
  const cooldown = useCooldown();
  const [result, setResult] = useState<SubmissionOutcome | null>(null);
  const [running, startRun] = useTransition();
  const [submitting, startSubmit] = useTransition();

  // Every verdict is explained in a toast; the panel keeps the details.
  function report(outcome: SubmissionOutcome) {
    setResult(outcome);
    const title = t(`cp.verdict.${outcome.verdict}.title`);
    const description = `${t("cp.passed", { passed: outcome.passed, total: outcome.total })}. ${t(`cp.verdict.${outcome.verdict}.description`)}`;
    if (outcome.verdict === "accepted") toast.success(title, { description });
    else
      toast.error(title, {
        description,
        duration: 10000,
        action: { label: t("cp.viewGuide"), onClick: () => openVerdictGuide(outcome.verdict) },
      });
  }

  function run() {
    startRun(async () => {
      const response = await runSamples({ problemId, language: editor.language, sourceCode: editor.code });
      if (response.ok) report(response.data);
      else toast.error(t(response.message, response.params));
    });
  }

  function submit() {
    startSubmit(async () => {
      const response = await submitSolution({ problemId, language: editor.language, sourceCode: editor.code });
      if (response.ok) {
        report(response.data);
        cooldown.start(cooldownSeconds);
      } else {
        toast.error(t(response.message, response.params));
        if (response.message === "cp.errors.cooldown" && response.params?.seconds) cooldown.start(Number(response.params.seconds));
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="min-w-0 space-y-6">
        {statement}
        <CodeEditorPanel
          language={editor.language}
          onLanguageChange={editor.setLanguage}
          code={editor.code}
          onCodeChange={editor.setCode}
          onReset={editor.reset}
          onRun={run}
          onSubmit={submit}
          running={running}
          submitting={submitting}
          cooldownLeft={cooldown.left}
        />
      </div>
      <div className="lg:sticky lg:top-20 lg:self-start">
        <ResultsPanel result={result} recent={recent} pending={running || submitting} />
      </div>
    </div>
  );
}
