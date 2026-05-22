import { ImageDown } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label, Select } from "@/components/ui/Form";
import { OutputDirectoryField } from "@/features/files/OutputDirectoryField";
import { useI18n } from "@/lib/i18n";
import type { ImageConvertOptions } from "@/types";

interface ImageOptionsPanelProps {
  options: ImageConvertOptions;
  onChange: (options: ImageConvertOptions) => void;
  onConvert: () => void;
  disabled: boolean;
}

export function ImageOptionsPanel({
  options,
  onChange,
  onConvert,
  disabled,
}: ImageOptionsPanelProps) {
  const resize = options.resize;
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t("image.options")}</CardTitle>
        <Badge tone="green">PNG JPG WEBP</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <OutputDirectoryField />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t("image.targetFormat")}</Label>
            <Select
              value={options.targetFormat}
              onChange={(event) =>
                onChange({
                  ...options,
                  targetFormat: event.target.value as ImageConvertOptions["targetFormat"],
                })
              }
            >
              <option value="webp">WEBP</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("image.quality")}</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={options.quality || 85}
              onChange={(event) => onChange({ ...options, quality: Number(event.target.value) })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>{t("image.width")}</Label>
            <Input
              type="number"
              min={1}
              value={resize?.width || ""}
              placeholder={t("image.keepOriginal")}
              onChange={(event) =>
                onChange({
                  ...options,
                  resize: {
                    preserveAspectRatio: resize?.preserveAspectRatio ?? true,
                    height: resize?.height,
                    width: event.target.value ? Number(event.target.value) : undefined,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{t("image.height")}</Label>
            <Input
              type="number"
              min={1}
              value={resize?.height || ""}
              placeholder={t("image.keepOriginal")}
              onChange={(event) =>
                onChange({
                  ...options,
                  resize: {
                    preserveAspectRatio: resize?.preserveAspectRatio ?? true,
                    width: resize?.width,
                    height: event.target.value ? Number(event.target.value) : undefined,
                  },
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <label className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={resize?.preserveAspectRatio ?? true}
              onChange={(event) =>
                onChange({
                  ...options,
                  resize: {
                    width: resize?.width,
                    height: resize?.height,
                    preserveAspectRatio: event.target.checked,
                  },
                })
              }
            />
            {t("image.keepRatio")}
          </label>
          <label className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={options.stripExif}
              onChange={(event) => onChange({ ...options, stripExif: event.target.checked })}
            />
            {t("image.stripExif")}
          </label>
          <label className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={options.overwrite}
              onChange={(event) => onChange({ ...options, overwrite: event.target.checked })}
            />
            {t("common.overwrite")}
          </label>
        </div>

        <Button className="w-full" variant="primary" onClick={onConvert} disabled={disabled}>
          <ImageDown className="h-4 w-4" aria-hidden />
          {t("image.convert")}
        </Button>
      </CardContent>
    </Card>
  );
}
