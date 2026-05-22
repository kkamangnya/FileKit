import { useCallback, useState, type DragEvent } from "react";
import { FolderOpen, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useTauriDragDrop } from "@/hooks/useTauriDragDrop";
import { useI18n } from "@/lib/i18n";
import { pickFiles } from "@/lib/tauri";
import { cn, toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";

export function FileDropzone() {
  const { addFiles, addLog, clearFiles, selectedFiles } = useFileKit();
  const { t } = useI18n();
  const [dragging, setDragging] = useState(false);

  const addPaths = useCallback(
    (paths: string[]) => {
      addFiles(paths);
      if (paths.length > 0) {
        addLog("info", t("log.addedFiles", { count: paths.length }));
      }
    },
    [addFiles, addLog, t],
  );

  useTauriDragDrop(addPaths);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const files = Array.from(event.dataTransfer.files);
    const paths = files.map((file) => (file as File & { path?: string }).path || file.name);
    addPaths(paths);
    if (paths.some((path) => !path.includes(":") && !path.startsWith("\\\\"))) {
      addLog("warning", t("dropzone.browserWarning"));
    }
  };

  const selectFiles = async () => {
    try {
      const paths = await pickFiles();
      addPaths(paths);
    } catch (error) {
      addLog("warning", toErrorMessage(error));
    }
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-8 text-center transition-colors",
        dragging && "border-primary bg-accent",
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary">
        <UploadCloud className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="mt-4 text-base font-semibold">{t("dropzone.title")}</h2>
      <p className="mt-1 max-w-lg text-sm text-muted-foreground">
        {t("dropzone.body")}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={selectFiles}>
          <FolderOpen className="h-4 w-4" aria-hidden />
          {t("common.chooseFiles")}
        </Button>
        {selectedFiles.length > 0 && (
          <Button variant="ghost" onClick={clearFiles}>
            <X className="h-4 w-4" aria-hidden />
            {t("common.clear")}
          </Button>
        )}
      </div>
    </div>
  );
}
