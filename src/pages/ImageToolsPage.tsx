import { useState } from "react";

import { WorkspaceGrid } from "@/components/layout/WorkspaceGrid";
import { ImageOptionsPanel } from "@/features/images/ImageOptionsPanel";
import { useI18n } from "@/lib/i18n";
import { convertImages, isTauriRuntime } from "@/lib/tauri";
import { toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";
import type { ImageConvertOptions } from "@/types";

const defaultOptions: ImageConvertOptions = {
  targetFormat: "webp",
  quality: 85,
  stripExif: true,
  overwrite: false,
  resize: {
    preserveAspectRatio: true,
  },
};

export function ImageToolsPage() {
  const { selectedFiles, outputDirectory, createJob, updateJob, addLog } = useFileKit();
  const { t } = useI18n();
  const [options, setOptions] = useState<ImageConvertOptions>(defaultOptions);

  const runConvert = async () => {
    if (selectedFiles.length === 0) {
      addLog("warning", t("image.selectBeforeConvert"));
      return;
    }

    if (!isTauriRuntime()) {
      addLog("warning", t("image.desktopOnlyConvert"));
      return;
    }

    if (options.overwrite && !window.confirm(t("image.confirmOverwrite"))) {
      return;
    }

    const jobId = createJob(t("image.jobConvert"));
    try {
      const result = await convertImages(
        selectedFiles.map((file) => file.path),
        { ...options, outputDir: outputDirectory },
        jobId,
      );
      updateJob(jobId, {
        status: result.status,
        progress: result.status === "success" ? 100 : 0,
        message: result.message,
        outputPaths: result.outputPaths,
      });
      addLog(result.status === "success" ? "success" : "warning", result.message);
      result.logs.forEach((log) => addLog("info", log));
    } catch (error) {
      updateJob(jobId, { status: "failed", message: toErrorMessage(error) });
      addLog("error", toErrorMessage(error));
    }
  };

  return (
    <WorkspaceGrid
      options={
        <ImageOptionsPanel
          options={options}
          onChange={setOptions}
          onConvert={runConvert}
          disabled={selectedFiles.length === 0}
        />
      }
    />
  );
}
