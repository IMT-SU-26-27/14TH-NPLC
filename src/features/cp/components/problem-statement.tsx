import { getT } from "@/lib/i18n/get-dictionary";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Markdown } from "@/components/shared/markdown";
import { DifficultyBadge } from "@/features/cp/components/difficulty-badge";
import type { ProblemStatementProps } from "@/types/cp";

export function ProblemStatement({ problem, lang }: ProblemStatementProps) {
  const t = getT(lang);
  const memory = problem.memory_limit_kb >= 1024 ? `${Math.round(problem.memory_limit_kb / 1024)} MB` : `${problem.memory_limit_kb} KB`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {t("cp.level", { level: problem.level })} · {problem.title}
        </CardTitle>
        <CardAction className="flex items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} label={t(`cp.difficulty.${problem.difficulty}`)} />
          <Badge variant="secondary">{t("cp.points", { points: problem.points })}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-muted-foreground text-xs">{t("cp.limits", { time: `${problem.time_limit_ms} ms`, memory })}</p>
        <Markdown>{problem.statement}</Markdown>
        {[
          { title: t("cp.inputFormat"), body: problem.input_format },
          { title: t("cp.outputFormat"), body: problem.output_format },
          { title: t("cp.constraints"), body: problem.constraints },
        ]
          .filter((section) => section.body)
          .map((section) => (
            <section key={section.title} className="space-y-2">
              <h3 className="font-medium">{section.title}</h3>
              <Markdown>{section.body}</Markdown>
            </section>
          ))}
        {problem.samples.length > 0 && (
          <>
            <Separator />
            <section className="space-y-3">
              <h3 className="font-medium">{t("cp.samples")}</h3>
              {problem.samples.map((sample, i) => (
                <div key={sample.id} className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">
                      {t("cp.sampleInput")} {i + 1}
                    </p>
                    <pre className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">{sample.input || " "}</pre>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">
                      {t("cp.sampleOutput")} {i + 1}
                    </p>
                    <pre className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-xs">{sample.expected_output}</pre>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
