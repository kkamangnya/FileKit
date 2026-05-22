import { WorkspaceGrid } from "@/components/layout/WorkspaceGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { OutputDirectoryField } from "@/features/files/OutputDirectoryField";
import { WorkflowBuilder } from "@/features/workflows/WorkflowBuilder";
import { useI18n } from "@/lib/i18n";

export function WorkflowsPage() {
  const { t } = useI18n();

  return (
    <WorkspaceGrid
      options={
        <Card>
          <CardHeader>
            <CardTitle>{t("workflow.output")}</CardTitle>
          </CardHeader>
          <CardContent>
            <OutputDirectoryField />
          </CardContent>
        </Card>
      }
      extra={<WorkflowBuilder />}
    />
  );
}
