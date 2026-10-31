"use client";

import { PlayIcon, RotateCcwIcon, SendIcon } from "lucide-react";
import { MONACO_LANGUAGE } from "@/lib/cp/templates";
import { defineMonacoTheme, MONACO_THEME } from "@/lib/cp/monaco-theme";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { MonacoEditor } from "@/features/cp/components/monaco-editor";
import type { CodeEditorPanelProps, CpLanguage } from "@/types/cp";

const LANGUAGES: CpLanguage[] = ["python", "cpp", "java"];

export function CodeEditorPanel({
  language,
  onLanguageChange,
  code,
  onCodeChange,
  onReset,
  onRun,
  onSubmit,
  running,
  submitting,
  cooldownLeft,
}: CodeEditorPanelProps) {
  const { t } = useI18n();
  const items = LANGUAGES.map((value) => ({ value, label: t(`cp.languages.${value}`) }));
  const busy = running || submitting;

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b py-3">
        <Select items={items} value={language} onValueChange={(value) => onLanguageChange(value as CpLanguage)} disabled={busy}>
          <SelectTrigger className="w-40" aria-label={t("cp.language")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={busy}>
          <RotateCcwIcon />
          {t("cp.resetCode")}
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <MonacoEditor
          height="26rem"
          language={MONACO_LANGUAGE[language]}
          theme={MONACO_THEME}
          beforeMount={defineMonacoTheme}
          value={code}
          onChange={(value) => onCodeChange(value ?? "")}
          loading={<Skeleton className="m-4 h-96" />}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 12 },
            bracketPairColorization: { enabled: false },
            scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          }}
        />
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t py-3">
        <p className="text-muted-foreground text-xs">{language === "java" ? t("cp.javaHint") : " "}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRun} disabled={busy}>
            {running ? <Spinner /> : <PlayIcon />}
            {running ? t("cp.running") : t("cp.run")}
          </Button>
          <Button onClick={onSubmit} disabled={busy || cooldownLeft > 0}>
            {submitting ? <Spinner /> : <SendIcon />}
            {submitting ? t("cp.submitting") : cooldownLeft > 0 ? t("cp.waitSeconds", { seconds: cooldownLeft }) : t("cp.submit")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
