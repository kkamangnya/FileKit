import { Play, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import { runWorkflow } from "@/lib/tauri";
import { createId, toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";
import type { WorkflowDefinition, WorkflowStep } from "@/types";

export function WorkflowBuilder() {
  const {
    selectedFiles,
    outputDirectory,
    workflowSteps,
    setWorkflowSteps,
    createJob,
    updateJob,
    addLog,
  } = useFileKit();
  const { t } = useI18n();

  const workflow = useMemo<WorkflowDefinition>(
    () => ({
      name: "MVP Pipeline",
      inputPaths: selectedFiles.map((file) => file.path),
      outputDir: outputDirectory,
      steps: workflowSteps,
    }),
    [outputDirectory, selectedFiles, workflowSteps],
  );

  const toggleStep = (step: WorkflowStep) => {
    setWorkflowSteps(
      workflowSteps.map((item) =>
        item.id === step.id ? { ...item, enabled: !item.enabled } : item,
      ),
    );
  };

  const removeStep = (step: WorkflowStep) => {
    setWorkflowSteps(workflowSteps.filter((item) => item.id !== step.id));
  };

  const addStep = () => {
    setWorkflowSteps([
      ...workflowSteps,
      {
        id: createId("workflow-step"),
        kind: "organizer.extension",
        label: "Organize by extension",
        enabled: true,
        config: { mode: "extension" },
      },
    ]);
  };

  const run = async () => {
    const jobId = createJob(t("workflow.job"));
    try {
      const result = await runWorkflow(workflow, jobId);
      updateJob(jobId, {
        status: result.status,
        progress: 100,
        message: result.message,
        outputPaths: result.outputPaths,
      });
      result.logs.forEach((log) => addLog("warning", log));
    } catch (error) {
      updateJob(jobId, { status: "failed", message: toErrorMessage(error) });
      addLog("error", toErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t("workflow.model")}</CardTitle>
        <Badge tone="amber">{t("workflow.mvpModel")}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {workflowSteps.map((step, index) => (
            <div
              key={step.id}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-secondary px-3 py-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-background text-xs font-semibold">
                {index + 1}
              </div>
              <button
                type="button"
                className="min-w-0 text-left"
                onClick={() => toggleStep(step)}
              >
                <div className="truncate text-sm font-medium">{displayStepLabel(step)}</div>
                <div className="truncate text-xs text-muted-foreground">{step.kind}</div>
              </button>
              <div className="flex items-center gap-2">
                <Badge tone={step.enabled ? "green" : "neutral"}>
                  {step.enabled ? t("common.on") : t("common.off")}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  title={t("workflow.removeStep")}
                  onClick={() => removeStep(step)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={addStep}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("workflow.addStep")}
          </Button>
          <Button variant="primary" onClick={run}>
            <Play className="h-4 w-4" aria-hidden />
            {t("workflow.validate")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  function displayStepLabel(step: WorkflowStep) {
    if (step.id === "step-image-webp") return t("workflow.defaultImage");
    if (step.id === "step-zip") return t("workflow.defaultZip");
    if (step.kind === "organizer.extension") return t("workflow.organizeExtension");
    return step.label;
  }
}
