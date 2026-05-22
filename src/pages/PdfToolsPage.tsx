import { useState } from "react";
import { Combine, Scissors } from "lucide-react";

import { WorkspaceGrid } from "@/components/layout/WorkspaceGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Form";
import { OutputDirectoryField } from "@/features/files/OutputDirectoryField";
import { useI18n } from "@/lib/i18n";
import { mergePdfs, splitPdf } from "@/lib/tauri";
import { toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";
import type { PdfMergeOptions, PdfSplitOptions } from "@/types";

export function PdfToolsPage() {
  const { selectedFiles, outputDirectory, createJob, updateJob, addLog } = useFileKit();
  const { t } = useI18n();
  const [outputName, setOutputName] = useState("merged.pdf");
  const [splitMode, setSplitMode] = useState<PdfSplitOptions["splitMode"]>("pages");
  const [pageRanges, setPageRanges] = useState("1-3");
  const [overwrite, setOverwrite] = useState(false);

  const applyPending = (jobId: string, message: string, logs: string[]) => {
    updateJob(jobId, { status: "pending", progress: 100, message });
    addLog("warning", message);
    logs.forEach((log) => addLog("warning", log));
  };

  const runMerge = async () => {
    const jobId = createJob(t("pdf.jobMerge"));
    const options: PdfMergeOptions = { outputDir: outputDirectory, outputName, overwrite };
    try {
      const result = await mergePdfs(
        selectedFiles.map((file) => file.path),
        options,
        jobId,
      );
      applyPending(jobId, result.message, result.logs);
    } catch (error) {
      updateJob(jobId, { status: "failed", message: toErrorMessage(error) });
      addLog("error", toErrorMessage(error));
    }
  };

  const runSplit = async () => {
    if (selectedFiles.length === 0) {
      addLog("warning", t("pdf.selectBeforeSplit"));
      return;
    }

    const jobId = createJob(t("pdf.jobSplit"));
    const options: PdfSplitOptions = {
      outputDir: outputDirectory,
      splitMode,
      pageRanges: pageRanges
        .split(",")
        .map((range) => range.trim())
        .filter(Boolean),
      overwrite,
    };
    try {
      const result = await splitPdf(selectedFiles[0].path, options, jobId);
      applyPending(jobId, result.message, result.logs);
    } catch (error) {
      updateJob(jobId, { status: "failed", message: toErrorMessage(error) });
      addLog("error", toErrorMessage(error));
    }
  };

  return (
    <WorkspaceGrid
      options={
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>{t("pdf.tools")}</CardTitle>
            <Badge tone="amber">{t("common.adapterReady")}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <OutputDirectoryField />
            <div className="space-y-2">
              <Label>{t("pdf.mergeName")}</Label>
              <Input value={outputName} onChange={(event) => setOutputName(event.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("pdf.splitMode")}</Label>
                <Select
                  value={splitMode}
                  onChange={(event) => setSplitMode(event.target.value as PdfSplitOptions["splitMode"])}
                >
                  <option value="pages">{t("pdf.everyPage")}</option>
                  <option value="ranges">{t("pdf.ranges")}</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("pdf.pageRanges")}</Label>
                <Input value={pageRanges} onChange={(event) => setPageRanges(event.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={(event) => setOverwrite(event.target.checked)}
              />
              {t("pdf.allowOverwrite")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" onClick={runMerge}>
                <Combine className="h-4 w-4" aria-hidden />
                {t("pdf.merge")}
              </Button>
              <Button variant="secondary" onClick={runSplit}>
                <Scissors className="h-4 w-4" aria-hidden />
                {t("pdf.split")}
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
