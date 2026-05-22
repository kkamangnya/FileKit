import { Archive, LockKeyhole, PackageOpen } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Form";
import { OutputDirectoryField } from "@/features/files/OutputDirectoryField";
import { useI18n } from "@/lib/i18n";
import type { CompressionOptions } from "@/types";

interface CompressionOptionsPanelProps {
  options: CompressionOptions;
  onChange: (options: CompressionOptions) => void;
  onCompress: () => void;
  onExtract: () => void;
  disabled: boolean;
}

export function CompressionOptionsPanel({
  options,
  onChange,
  onCompress,
  onExtract,
  disabled,
}: CompressionOptionsPanelProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t("compress.options")}</CardTitle>
        <Badge tone={options.format === "zip" ? "green" : "amber"}>
          {options.format === "zip" ? t("common.mvpReady") : t("common.scaffold")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <OutputDirectoryField />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t("compress.format")}</Label>
            <Select
              value={options.format}
              onChange={(event) =>
                onChange({ ...options, format: event.target.value as CompressionOptions["format"] })
              }
            >
              <option value="zip">ZIP</option>
              <option value="7z">7Z</option>
              <option value="tar">TAR</option>
              <option value="gz">GZ</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("compress.archiveName")}</Label>
            <Input
              value={options.outputName || ""}
              placeholder="filekit-output"
              onChange={(event) => onChange({ ...options, outputName: event.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={options.preservePaths}
              onChange={(event) => onChange({ ...options, preservePaths: event.target.checked })}
            />
            {t("compress.preservePaths")}
          </label>
          <label className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={options.overwrite}
              onChange={(event) => onChange({ ...options, overwrite: event.target.checked })}
            />
            {t("compress.allowOverwrite")}
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t("compress.password")}</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                type="password"
                value={options.password || ""}
                placeholder={t("compress.passwordPlaceholder")}
                onChange={(event) => onChange({ ...options, password: event.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("compress.splitSize")}</Label>
            <Input
              type="number"
              min={1}
              value={options.splitSizeMb || ""}
              placeholder={t("compress.future")}
              onChange={(event) =>
                onChange({
                  ...options,
                  splitSizeMb: event.target.value ? Number(event.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="primary" onClick={onCompress} disabled={disabled}>
            <Archive className="h-4 w-4" aria-hidden />
            {t("compress.compress")}
          </Button>
          <Button variant="secondary" onClick={onExtract} disabled={disabled}>
            <PackageOpen className="h-4 w-4" aria-hidden />
            {t("compress.extract")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
