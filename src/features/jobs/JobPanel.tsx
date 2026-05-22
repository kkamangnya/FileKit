import { Ban, CheckCircle2, CircleAlert, Clock3, Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { translatedLogLevel, useI18n } from "@/lib/i18n";
import { cancelJob } from "@/lib/tauri";
import { toErrorMessage } from "@/lib/utils";
import { isTerminalStatus, useFileKit } from "@/stores/fileKitStore";
import type { JobEntry, JobStatus, LogLevel } from "@/types";

function statusTone(status: JobStatus) {
  if (status === "success") return "green";
  if (status === "failed" || status === "cancelled") return "red";
  if (status === "pending") return "amber";
  return "blue";
}

function StatusIcon({ status }: { status: JobStatus }) {
  if (status === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "failed") return <CircleAlert className="h-4 w-4 text-red-600" />;
  if (status === "pending") return <Clock3 className="h-4 w-4 text-amber-600" />;
  return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
}

function logTone(level: LogLevel) {
  if (level === "success") return "text-emerald-600";
  if (level === "warning") return "text-amber-600";
  if (level === "error") return "text-red-600";
  return "text-muted-foreground";
}

function statusKey(status: JobStatus) {
  return `status.${status}` as const;
}

export function JobPanel() {
  const { jobs, logs, updateJob, addLog, clearLogs } = useFileKit();
  const { language, t } = useI18n();

  const requestCancel = async (job: JobEntry) => {
    try {
      await cancelJob(job.id);
      updateJob(job.id, { status: "cancelled", message: t("jobs.cancelMessage") });
      addLog("warning", t("jobs.cancelRequested", { title: job.title }));
    } catch (error) {
      addLog("error", toErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t("jobs.title")}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge tone={jobs.some((job) => job.status === "running") ? "blue" : "neutral"}>
            {t("common.jobCount", { count: jobs.length })}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            title={t("jobs.clearLogs")}
            onClick={clearLogs}
            disabled={logs.length === 0}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              {t("jobs.empty")}
            </div>
          ) : (
            jobs.slice(0, 4).map((job) => (
              <div key={job.id} className="rounded-md border border-border bg-secondary p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <StatusIcon status={job.status} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{job.title}</div>
                      <div className="truncate text-xs text-muted-foreground">{job.message}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={statusTone(job.status)}>{t(statusKey(job.status))}</Badge>
                    {!isTerminalStatus(job.status) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t("jobs.cancel")}
                        onClick={() => requestCancel(job)}
                      >
                        <Ban className="h-4 w-4" aria-hidden />
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={job.progress} className="mt-3" />
                {job.outputPaths.length > 0 && (
                  <div className="mt-2 truncate text-xs text-muted-foreground">
                    {t("jobs.output", { path: job.outputPaths[0] })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 max-h-64 overflow-y-auto rounded-md border border-border bg-background p-3 scrollbar-thin">
          {logs.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">{t("jobs.noLogs")}</div>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 60).map((log) => (
                <div key={log.id} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2 text-xs">
                  <span className={logTone(log.level)}>
                    {translatedLogLevel(language, log.level)}
                  </span>
                  <span className="break-words text-muted-foreground">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
