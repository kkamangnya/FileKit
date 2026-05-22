import { ArrowRightLeft, FileCog } from "lucide-react";

import { WorkspaceGrid } from "@/components/layout/WorkspaceGrid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Form";
import { OutputDirectoryField } from "@/features/files/OutputDirectoryField";
import { useI18n, type I18nKey } from "@/lib/i18n";
import { useFileKit } from "@/stores/fileKitStore";

const adapterCards: Array<[I18nKey, I18nKey]> = [
  ["convert.images", "convert.imagesBody"],
  ["convert.office", "convert.officeBody"],
  ["convert.archives", "convert.archivesBody"],
];

export function ConvertPage() {
  const { addLog } = useFileKit();
  const { t } = useI18n();

  return (
    <WorkspaceGrid
      options={
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>{t("convert.title")}</CardTitle>
            <Badge tone="amber">{t("common.adapterPattern")}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <OutputDirectoryField />
            <Select defaultValue="office">
              <option value="office">{t("convert.officeAdapter")}</option>
              <option value="image">{t("convert.imageAdapter")}</option>
              <option value="text">{t("convert.textAdapter")}</option>
            </Select>
            <Button
              className="w-full"
              variant="primary"
              onClick={() =>
                addLog(
                  "warning",
                  t("convert.todo"),
                )
              }
            >
              <ArrowRightLeft className="h-4 w-4" aria-hidden />
              {t("convert.prepare")}
            </Button>
          </CardContent>
        </Card>
      }
      extra={
        <Card>
          <CardHeader>
            <CardTitle>{t("convert.adapters")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {adapterCards.map(([titleKey, bodyKey]) => (
                <div key={titleKey} className="rounded-md border border-border bg-secondary p-4">
                  <FileCog className="mb-3 h-5 w-5 text-primary" aria-hidden />
                  <div className="text-sm font-semibold">{t(titleKey)}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{t(bodyKey)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      }
    />
  );
}
