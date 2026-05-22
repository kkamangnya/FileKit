import { Languages, Moon, ShieldCheck, Sun, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useI18n, type I18nKey } from "@/lib/i18n";
import { useFileKit } from "@/stores/fileKitStore";
import type { LanguageMode, ThemeMode } from "@/types";

const themes: Array<{ id: ThemeMode; labelKey: I18nKey }> = [
  { id: "system", labelKey: "theme.system" },
  { id: "light", labelKey: "theme.light" },
  { id: "dark", labelKey: "theme.dark" },
];

const languages: Array<{ id: LanguageMode; labelKey: I18nKey }> = [
  { id: "en", labelKey: "settings.english" },
  { id: "ko", labelKey: "settings.korean" },
];

const safetyKeys: I18nKey[] = [
  "settings.safetyOriginals",
  "settings.safetyConfirm",
  "settings.safetyPermissions",
];

export function SettingsPage() {
  const { theme, setTheme, language, setLanguage, clearFiles, addLog } = useFileKit();
  const { t } = useI18n();

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.appearance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {themes.map((item) => (
                <Button
                  key={item.id}
                  variant={theme === item.id ? "primary" : "secondary"}
                  onClick={() => setTheme(item.id)}
                >
                  {item.id === "dark" ? (
                    <Moon className="h-4 w-4" aria-hidden />
                  ) : (
                    <Sun className="h-4 w-4" aria-hidden />
                  )}
                  {t(item.labelKey)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.language")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {languages.map((item) => (
                <Button
                  key={item.id}
                  variant={language === item.id ? "primary" : "secondary"}
                  onClick={() => setLanguage(item.id)}
                >
                  <Languages className="h-4 w-4" aria-hidden />
                  {t(item.labelKey)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>{t("settings.safety")}</CardTitle>
            <Badge tone="green">{t("common.enabled")}</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {safetyKeys.map((key) => (
                <div key={key} className="rounded-md border border-border bg-secondary p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-emerald-600" aria-hidden />
                  <div className="text-sm text-muted-foreground">{t(key)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.session")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => {
              clearFiles();
              addLog("info", t("settings.cleared"));
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {t("settings.clearSelected")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
