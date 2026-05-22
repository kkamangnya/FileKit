import { FolderOutput } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Form";
import { useI18n } from "@/lib/i18n";
import { pickDirectory } from "@/lib/tauri";
import { toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";

export function OutputDirectoryField() {
  const { outputDirectory, setOutputDirectory, addLog } = useFileKit();
  const { t } = useI18n();

  const selectDirectory = async () => {
    try {
      const directory = await pickDirectory();
      if (directory) {
        setOutputDirectory(directory);
        addLog("info", t("log.outputDirectorySet", { directory }));
      }
    } catch (error) {
      addLog("warning", toErrorMessage(error));
    }
  };

  return (
    <div className="space-y-2">
      <Label>{t("common.outputDirectory")}</Label>
      <div className="flex gap-2">
        <Input
          value={outputDirectory || ""}
          onChange={(event) => setOutputDirectory(event.target.value || undefined)}
          placeholder={t("common.outputDirectoryPlaceholder")}
        />
        <Button variant="secondary" onClick={selectDirectory}>
          <FolderOutput className="h-4 w-4" aria-hidden />
          {t("common.browse")}
        </Button>
      </div>
    </div>
  );
}
