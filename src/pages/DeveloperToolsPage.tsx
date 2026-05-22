import { WorkspaceGrid } from "@/components/layout/WorkspaceGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { HashTool } from "@/features/developer/HashTool";
import { JsonTool } from "@/features/developer/JsonTool";
import { TextUtilityTool } from "@/features/developer/TextUtilityTool";
import { useI18n } from "@/lib/i18n";

export function DeveloperToolsPage() {
  const { t } = useI18n();

  return (
    <WorkspaceGrid
      options={<HashTool />}
      extra={
        <div className="grid gap-5 2xl:grid-cols-2">
          <JsonTool />
          <TextUtilityTool />
          <Card>
            <CardHeader>
              <CardTitle>{t("developer.csv")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                {t("developer.csvTodo")}
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
