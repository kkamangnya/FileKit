import { File, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n";
import { formatBytes } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";

export function SelectedFileList() {
  const { selectedFiles, removeFile } = useFileKit();
  const { t } = useI18n();

  return (
    <Card className="min-h-72">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t("files.title")}</CardTitle>
        <Badge tone="blue">{t("common.itemCount", { count: selectedFiles.length })}</Badge>
      </CardHeader>
      <CardContent className="max-h-80 overflow-y-auto scrollbar-thin">
        {selectedFiles.length === 0 ? (
          <div className="flex h-44 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
            {t("common.noFiles")}
          </div>
        ) : (
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-secondary px-3 py-2"
              >
                <File className="h-4 w-4 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{file.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{file.path}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{file.extension || "file"}</Badge>
                  <span className="hidden text-xs text-muted-foreground xl:inline">
                    {formatBytes(file.size)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    title={t("files.remove")}
                    onClick={() => removeFile(file.id)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
