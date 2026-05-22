import { useState } from "react";

import { WorkspaceGrid } from "@/components/layout/WorkspaceGrid";
import { CompressionOptionsPanel } from "@/features/compression/CompressionOptionsPanel";
import { useI18n } from "@/lib/i18n";
import { compressFiles, extractArchive } from "@/lib/tauri";
import { toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";
import type { CompressionOptions, ExtractOptions, OperationSummary } from "@/types";

const defaultOptions: CompressionOptions = {
  format: "zip",
  preservePaths: true,
  overwrite: false,
};

function applySummary(
  result: OperationSummary,
  jobId: string,
  updateJob: ReturnType<typeof useFileKit>["updateJob"],
  addLog: ReturnType<typeof useFileKit>["addLog"],
) {
  updateJob(jobId, {
    status: result.status,
    progress: result.status === "success" ? 100 : 0,
    message: result.message,
    outputPaths: result.outputPaths,
  });
  addLog(result.status === "success" ? "success" : "warning", result.message);
  result.logs.forEach((log) => addLog(result.status === "success" ? "info" : "warning", log));
}

export function CompressPage() {
  const { selectedFiles, outputDirectory, createJob, updateJob, addLog } = useFileKit();
  const { t } = useI18n();
  const [options, setOptions] = useState<CompressionOptions>(defaultOptions);
  const disabled = selectedFiles.length === 0;

  const runCompress = async () => {
    if (disabled) {
      addLog("warning", t("compress.selectBeforeCompress"));
      return;
    }

    if (options.overwrite && !window.confirm(t("compress.confirmOverwriteOutput"))) {
      return;
    }

    const jobId = createJob(t("compress.jobCompress"));
    try {
      const result = await compressFiles(
        selectedFiles.map((file) => file.path),
        { ...options, outputDir: outputDirectory },
        jobId,
      );
      applySummary(result, jobId, updateJob, addLog);
    } catch (error) {
      updateJob(jobId, { status: "failed", message: toErrorMessage(error) });
      addLog("error", toErrorMessage(error));
    }
  };

  const runExtract = async () => {
    if (disabled) {
      addLog("warning", t("compress.selectBeforeExtract"));
      return;
    }

    if (options.overwrite && !window.confirm(t("compress.confirmOverwriteExtract"))) {
      return;
    }

    const jobId = createJob(t("compress.jobExtract"));
    const extractOptions: ExtractOptions = {
      outputDir: outputDirectory,
      password: options.password,
      overwrite: options.overwrite,
    };

    try {
      const result = await extractArchive(selectedFiles[0].path, extractOptions, jobId);
      applySummary(result, jobId, updateJob, addLog);
    } catch (error) {
      updateJob(jobId, { status: "failed", message: toErrorMessage(error) });
      addLog("error", toErrorMessage(error));
    }
  };

  return (
    <WorkspaceGrid
      options={
        <CompressionOptionsPanel
          options={options}
          onChange={setOptions}
          onCompress={runCompress}
          onExtract={runExtract}
          disabled={disabled}
        />
      }
    />
  );
}
