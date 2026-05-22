import { Moon, Sun, UploadCloud } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { DashboardPage } from "@/pages/DashboardPage";
import { CompressPage } from "@/pages/CompressPage";
import { ConvertPage } from "@/pages/ConvertPage";
import { DeveloperToolsPage } from "@/pages/DeveloperToolsPage";
import { ImageToolsPage } from "@/pages/ImageToolsPage";
import { OrganizerPage } from "@/pages/OrganizerPage";
import { PdfToolsPage } from "@/pages/PdfToolsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { WorkflowsPage } from "@/pages/WorkflowsPage";
import { useProgressEvents } from "@/hooks/useProgressEvents";
import { useI18n, type I18nKey } from "@/lib/i18n";
import { pickFiles } from "@/lib/tauri";
import { toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";

const pageTitles: Record<string, I18nKey> = {
  dashboard: "nav.dashboard",
  compress: "nav.compress",
  convert: "nav.convert",
  pdf: "nav.pdf",
  image: "nav.image",
  organizer: "nav.organizer",
  developer: "nav.developer",
  workflows: "nav.workflows",
  settings: "nav.settings",
};

export function AppShell() {
  const { activePage, addFiles, addLog, theme, setTheme } = useFileKit();
  const { t } = useI18n();
  useProgressEvents();

  const Page = {
    dashboard: DashboardPage,
    compress: CompressPage,
    convert: ConvertPage,
    pdf: PdfToolsPage,
    image: ImageToolsPage,
    organizer: OrganizerPage,
    developer: DeveloperToolsPage,
    workflows: WorkflowsPage,
    settings: SettingsPage,
  }[activePage];

  const selectFiles = async () => {
    try {
      const paths = await pickFiles();
      addFiles(paths);
      if (paths.length > 0) addLog("info", t("log.addedFiles", { count: paths.length }));
    } catch (error) {
      addLog("warning", toErrorMessage(error));
    }
  };

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <div>
            <h1 className="text-lg font-semibold">{t(pageTitles[activePage])}</h1>
            <p className="text-xs text-muted-foreground">{t("app.headerSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={selectFiles}>
              <UploadCloud className="h-4 w-4" aria-hidden />
              {t("common.addFiles")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title={t("common.toggleTheme")}
              onClick={() => setTheme(nextTheme)}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden />
              ) : (
                <Moon className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Page />
        </main>
      </div>
    </div>
  );
}
