"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { InfoIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { saveProblem } from "@/lib/actions/admin-cp";
import { useI18n } from "@/hooks/use-i18n";
import { useTestCases } from "@/hooks/use-test-cases";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/shared/markdown";
import { CP_DIFFICULTIES } from "@/lib/validations/cp";
import type { FieldErrors } from "@/types";
import type { CpDifficulty, ProblemFormProps } from "@/types/cp";

export function ProblemForm({ competitionId, problem }: ProblemFormProps) {
  const { t, href, fieldErrors } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [statement, setStatement] = useState(problem?.statement ?? "");
  const [published, setPublished] = useState(problem?.is_published ?? false);
  const [difficulty, setDifficulty] = useState<CpDifficulty>(problem?.difficulty ?? "easy");
  const difficultyItems = CP_DIFFICULTIES.map((value) => ({ value, label: t(`cp.difficulty.${value}`) }));
  const tests = useTestCases(
    (problem?.testCases ?? []).map((c) => ({ input: c.input, expectedOutput: c.expected_output, isSample: c.is_sample })),
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveProblem({
        id: problem?.id,
        competitionId,
        level: Number(data.get("level")),
        difficulty,
        title: String(data.get("title") ?? ""),
        statement,
        inputFormat: String(data.get("inputFormat") ?? ""),
        outputFormat: String(data.get("outputFormat") ?? ""),
        constraints: String(data.get("constraints") ?? ""),
        timeLimitMs: Number(data.get("timeLimitMs")),
        memoryLimitKb: Number(data.get("memoryLimitKb")),
        points: Number(data.get("points")),
        isPublished: published,
        testCases: tests.cases.map(({ input, expectedOutput, isSample }) => ({ input, expectedOutput, isSample })),
      });
      if (result.ok) {
        setErrors({});
        toast.success(t(result.message ?? "admin.cp.problemSaved"));
        if (!problem) router.replace(href(`/admin/cp/problems/${result.data.id}`));
      } else {
        setErrors(result.fieldErrors ?? {});
        toast.error(t(result.message, result.params));
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.cp.form.details")}</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-[8rem_10rem_1fr_8rem]">
              <Field data-invalid={!!errors.level}>
                <FieldLabel htmlFor="level">{t("admin.cp.form.level")}</FieldLabel>
                <Input id="level" name="level" type="number" min={1} defaultValue={problem?.level ?? 1} required />
                <FieldError errors={fieldErrors(errors.level)} />
              </Field>
              <Field data-invalid={!!errors.difficulty}>
                <FieldLabel htmlFor="difficulty">{t("admin.cp.form.difficulty")}</FieldLabel>
                <Select items={difficultyItems} value={difficulty} onValueChange={(v) => v && setDifficulty(v as CpDifficulty)}>
                  <SelectTrigger id="difficulty" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={fieldErrors(errors.difficulty)} />
              </Field>
              <Field data-invalid={!!errors.title}>
                <FieldLabel htmlFor="title">{t("admin.cp.form.titleLabel")}</FieldLabel>
                <Input id="title" name="title" defaultValue={problem?.title} maxLength={120} required />
                <FieldError errors={fieldErrors(errors.title)} />
              </Field>
              <Field data-invalid={!!errors.points}>
                <FieldLabel htmlFor="points">{t("admin.cp.form.points")}</FieldLabel>
                <Input id="points" name="points" type="number" min={1} defaultValue={problem?.points ?? 100} required />
                <FieldError errors={fieldErrors(errors.points)} />
              </Field>
            </div>
            <Field data-invalid={!!errors.statement}>
              <FieldLabel htmlFor="statement">{t("admin.cp.form.statement")}</FieldLabel>
              <Tabs defaultValue="write" className="gap-2">
                <TabsList>
                  <TabsTrigger value="write">{t("admin.cp.form.write")}</TabsTrigger>
                  <TabsTrigger value="preview">{t("admin.cp.form.preview")}</TabsTrigger>
                </TabsList>
                <TabsContent value="write">
                  <Textarea id="statement" value={statement} onChange={(e) => setStatement(e.target.value)} rows={10} className="min-h-60 font-mono text-sm" />
                </TabsContent>
                <TabsContent value="preview" className="min-h-40 rounded-lg border p-4">
                  <Markdown>{statement}</Markdown>
                </TabsContent>
              </Tabs>
              <FieldDescription>{t("admin.cp.form.statementHint")}</FieldDescription>
              <FieldError errors={fieldErrors(errors.statement)} />
            </Field>
            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="inputFormat">{t("admin.cp.form.inputFormat")}</FieldLabel>
                <Textarea id="inputFormat" name="inputFormat" defaultValue={problem?.input_format} rows={3} />
              </Field>
              <Field>
                <FieldLabel htmlFor="outputFormat">{t("admin.cp.form.outputFormat")}</FieldLabel>
                <Textarea id="outputFormat" name="outputFormat" defaultValue={problem?.output_format} rows={3} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="constraints">{t("admin.cp.form.constraints")}</FieldLabel>
              <Textarea id="constraints" name="constraints" defaultValue={problem?.constraints} rows={2} />
              <FieldDescription>{t("admin.cp.form.constraintsHint")}</FieldDescription>
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field data-invalid={!!errors.timeLimitMs}>
                <FieldLabel htmlFor="timeLimitMs">{t("admin.cp.form.timeLimit")}</FieldLabel>
                <Input id="timeLimitMs" name="timeLimitMs" type="number" min={100} max={15000} step={100} defaultValue={problem?.time_limit_ms ?? 1000} required />
                <FieldError errors={fieldErrors(errors.timeLimitMs)} />
              </Field>
              <Field data-invalid={!!errors.memoryLimitKb}>
                <FieldLabel htmlFor="memoryLimitKb">{t("admin.cp.form.memoryLimit")}</FieldLabel>
                <Input id="memoryLimitKb" name="memoryLimitKb" type="number" min={16384} max={512000} step={1024} defaultValue={problem?.memory_limit_kb ?? 262144} required />
                <FieldError errors={fieldErrors(errors.memoryLimitKb)} />
              </Field>
            </div>
            <Field orientation="horizontal">
              <Switch id="isPublished" checked={published} onCheckedChange={setPublished} />
              <FieldContent>
                <FieldLabel htmlFor="isPublished">{t("admin.cp.form.publish")}</FieldLabel>
                <FieldDescription>{t("admin.cp.form.publishHint")}</FieldDescription>
              </FieldContent>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.cp.form.testCases")}</CardTitle>
          <CardDescription>{t("admin.cp.form.testCasesLead")}</CardDescription>
          <CardAction>
            <Button type="button" variant="outline" size="sm" onClick={tests.add}>
              <PlusIcon />
              {t("admin.cp.form.addTest")}
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          {problem && (
            <Alert>
              <InfoIcon />
              <AlertDescription>{t("admin.cp.form.replaceWarning")}</AlertDescription>
            </Alert>
          )}
          <FieldError errors={fieldErrors(errors.testCases)} />
          <div className="divide-y rounded-lg border">
            {tests.cases.map((c, i) => (
              <FieldGroup key={c.key} className="gap-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{t("cp.test", { n: i + 1 })}</p>
                  <div className="flex items-center gap-3">
                    <Field orientation="horizontal" className="w-auto">
                      <Switch id={`sample-${c.key}`} checked={c.isSample} onCheckedChange={(v) => tests.update(c.key, { isSample: v })} />
                      <FieldLabel htmlFor={`sample-${c.key}`}>{t("admin.cp.form.isSample")}</FieldLabel>
                    </Field>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("admin.cp.form.removeTest", { n: i + 1 })}
                      disabled={tests.cases.length === 1}
                      onClick={() => tests.remove(c.key)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor={`in-${c.key}`}>{t("admin.cp.form.input")}</FieldLabel>
                    <Textarea id={`in-${c.key}`} value={c.input} onChange={(e) => tests.update(c.key, { input: e.target.value })} rows={4} className="min-h-24 font-mono text-xs" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`out-${c.key}`}>{t("admin.cp.form.expectedOutput")}</FieldLabel>
                    <Textarea id={`out-${c.key}`} value={c.expectedOutput} onChange={(e) => tests.update(c.key, { expectedOutput: e.target.value })} rows={4} className="min-h-24 font-mono text-xs" required />
                  </Field>
                </div>
              </FieldGroup>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Spinner />}
        {t("admin.cp.form.save")}
      </Button>
    </form>
  );
}
