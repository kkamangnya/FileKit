import {
  Archive,
  Braces,
  FileImage,
  FileText,
  FolderTree,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileDropzone } from "@/features/files/FileDropzone";
import { JobPanel } from "@/features/jobs/JobPanel";
import { SelectedFileList } from "@/features/files/SelectedFileList";
import { useI18n, type I18nKey } from "@/lib/i18n";
import { useFileKit } from "@/stores/fileKitStore";
import type { PageId } from "@/types";

const modules: Array<{
  page: PageId;
  titleKey: I18nKey;
  bodyKey: I18nKey;
  icon: typeof Archive;
}> = [
  { page: "compress", titleKey: "nav.compress", bodyKey: "module.compress.body", icon: Archive },
  { page: "image", titleKey: "nav.image", bodyKey: "module.image.body", icon: FileImage },
  { page: "pdf", titleKey: "nav.pdf", bodyKey: "module.pdf.body", icon: FileText },
  { page: "organizer", titleKey: "nav.organizer", bodyKey: "module.organizer.body", icon: FolderTree },
  { page: "developer", titleKey: "nav.developer", bodyKey: "module.developer.body", icon: Braces },
  { page: "workflows", titleKey: "nav.workflows", bodyKey: "module.workflows.body", icon: Workflow },
];

export function DashboardPage() {
  const { setActivePage, selectedFiles, jobs } = useFileKit();
  const { t } = useI18n();
  const completed = jobs.filter((job) => job.status === "success").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-5">
            <div className="text-2xl font-semibold">{selectedFiles.length}</div>
            <div className="text-sm text-muted-foreground">{t("common.selectedFiles")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <div className="text-2xl font-semibold">{jobs.length}</div>
            <div className="text-sm text-muted-foreground">{t("common.sessionJobs")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-5">
            <div className="text-2xl font-semibold">{completed}</div>
            <div className="text-sm text-muted-foreground">{t("common.completedJobs")}</div>
          </CardContent>
        </Card>
      </div>

      <FileDropzone />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <SelectedFileList />
          <Card>
            <CardHeader>
              <CardTitle>{t("common.modules")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                {modules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <button
                      key={module.page}
                      type="button"
                      className="rounded-md border border-border bg-secondary p-4 text-left transition-colors hover:bg-accent"
                      onClick={() => setActivePage(module.page)}
                    >
                      <Icon className="mb-3 h-5 w-5 text-primary" aria-hidden />
                      <div className="text-sm font-semibold">{t(module.titleKey)}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{t(module.bodyKey)}</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>{t("common.mvpShortcuts")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="primary" onClick={() => setActivePage("compress")}>
                <Archive className="h-4 w-4" aria-hidden />
                ZIP {t("compress.compress")}
              </Button>
              <Button variant="secondary" onClick={() => setActivePage("image")}>
                <FileImage className="h-4 w-4" aria-hidden />
                {t("image.convert")}
              </Button>
              <Button variant="secondary" onClick={() => setActivePage("developer")}>
                <Braces className="h-4 w-4" aria-hidden />
                {t("developer.json")}
              </Button>
            </CardContent>
          </Card>
          <JobPanel />
        </div>
      </div>
    </div>
  );
}
