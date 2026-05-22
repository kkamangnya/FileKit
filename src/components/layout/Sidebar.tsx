import {
  Archive,
  Braces,
  FileCog,
  FileImage,
  FileText,
  FolderTree,
  Home,
  Image,
  Layers3,
  Settings,
  Workflow,
} from "lucide-react";

import { useI18n, type I18nKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";
import type { PageId } from "@/types";

const navigation: Array<{
  id: PageId;
  labelKey: I18nKey;
  icon: typeof Home;
}> = [
  { id: "dashboard", labelKey: "nav.dashboard", icon: Home },
  { id: "compress", labelKey: "nav.compress", icon: Archive },
  { id: "convert", labelKey: "nav.convert", icon: FileCog },
  { id: "pdf", labelKey: "nav.pdf", icon: FileText },
  { id: "image", labelKey: "nav.image", icon: Image },
  { id: "organizer", labelKey: "nav.organizer", icon: FolderTree },
  { id: "developer", labelKey: "nav.developer", icon: Braces },
  { id: "workflows", labelKey: "nav.workflows", icon: Workflow },
  { id: "settings", labelKey: "nav.settings", icon: Settings },
];

export function Sidebar() {
  const { activePage, setActivePage, selectedFiles, jobs } = useFileKit();
  const { t } = useI18n();
  const runningJobs = jobs.filter((job) => job.status === "running").length;

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers3 className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <div className="text-base font-semibold">FileKit</div>
          <div className="text-xs text-muted-foreground">{t("app.subtitle")}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePage(item.id)}
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="truncate">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-secondary px-3 py-2">
            <div className="font-semibold">{selectedFiles.length}</div>
            <div className="text-muted-foreground">{t("common.selected")}</div>
          </div>
          <div className="rounded-md bg-secondary px-3 py-2">
            <div className="font-semibold">{runningJobs}</div>
            <div className="text-muted-foreground">{t("common.running")}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
