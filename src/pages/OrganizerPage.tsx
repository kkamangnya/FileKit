import { FolderTree } from "lucide-react";
import { useState } from "react";

import { WorkspaceGrid } from "@/components/layout/WorkspaceGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label, Select } from "@/components/ui/Form";
import { OutputDirectoryField } from "@/features/files/OutputDirectoryField";
import { useI18n } from "@/lib/i18n";
import { organizeFiles } from "@/lib/tauri";
import { toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";
import type { OrganizeOptions } from "@/types";

export function OrganizerPage() {
  const { selectedFiles, outputDirectory, createJob, updateJob, addLog } = useFileKit();
  const { t } = useI18n();
  const [mode, setMode] = useState<OrganizeOptions["mode"]>("extension");
  const [preset, setPreset] = useState("downloads");
  const [preserveOriginal, setPreserveOriginal] = useState(true);
  const [overwrite, setOverwrite] = useState(false);

  const run = async () => {
    if (selectedFiles.length === 0) {
      addLog("warning", t("organizer.selectBefore"));
      return;
    }
    if (!outputDirectory) {
      addLog("warning", t("organizer.chooseOutput"));
      return;
    }
    if (!preserveOriginal && !window.confirm(t("organizer.confirmMove"))) {
      return;
    }
    if (overwrite && !window.confirm(t("organizer.confirmOverwrite"))) {
      return;
    }

    const jobId = createJob(t("organizer.job"));
    const options: OrganizeOptions = {
      mode,
      outputDir: outputDirectory,
      preserveOriginal,
      overwrite,
      preset,
    };

    try {
      const result = await organizeFiles(
        selectedFiles.map((file) => file.path),
        options,
        jobId,
      );
      updateJob(jobId, {
        status: result.status,
        progress: 100,
        message: result.message,
        outputPaths: result.outputPaths,
      });
      addLog(result.status === "success" ? "success" : "warning", result.message);
      result.logs.forEach((log) => addLog(result.status === "success" ? "info" : "warning", log));
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
            <CardTitle>{t("organizer.options")}</CardTitle>
            <Badge tone={mode === "extension" ? "green" : "amber"}>
              {mode === "extension" ? t("common.mvpReady") : t("common.scaffold")}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <OutputDirectoryField />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t("organizer.mode")}</Label>
                <Select
                  value={mode}
                  onChange={(event) => setMode(event.target.value as OrganizeOptions["mode"])}
                >
                  <option value="extension">{t("organizer.byExtension")}</option>
                  <option value="date">{t("organizer.byDate")}</option>
                  <option value="size">{t("organizer.bySize")}</option>
                  <option value="duplicates">{t("organizer.duplicates")}</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("organizer.preset")}</Label>
                <Select value={preset} onChange={(event) => setPreset(event.target.value)}>
                  <option value="downloads">{t("organizer.downloads")}</option>
                  <option value="desktop">{t("organizer.desktop")}</option>
                  <option value="custom">{t("organizer.custom")}</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={preserveOriginal}
                  onChange={(event) => setPreserveOriginal(event.target.checked)}
                />
                {t("organizer.copyFiles")}
              </label>
              <label className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={overwrite}
                  onChange={(event) => setOverwrite(event.target.checked)}
                />
                {t("common.overwrite")}
              </label>
            </div>
            <Button className="w-full" variant="primary" onClick={run}>
              <FolderTree className="h-4 w-4" aria-hidden />
              {t("organizer.organize")}
            </Button>
          </CardContent>
        </Card>
      }
    />
  );
}
