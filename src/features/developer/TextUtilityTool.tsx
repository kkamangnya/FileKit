import { ArrowLeftRight, Binary } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select, Textarea } from "@/components/ui/Form";
import { useI18n, type I18nKey } from "@/lib/i18n";
import { convertYamlJson, decodeBase64, encodeBase64 } from "@/lib/tauri";
import { toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";

type Mode = "base64-encode" | "base64-decode" | "yaml-to-json" | "json-to-yaml";

const modeLabels: Record<Mode, I18nKey> = {
  "base64-encode": "developer.base64Encode",
  "base64-decode": "developer.base64Decode",
  "yaml-to-json": "developer.yamlToJson",
  "json-to-yaml": "developer.jsonToYaml",
};

export function TextUtilityTool() {
  const [mode, setMode] = useState<Mode>("base64-encode");
  const [input, setInput] = useState("FileKit");
  const [output, setOutput] = useState("");
  const { addLog } = useFileKit();
  const { t } = useI18n();

  const run = async () => {
    try {
      const result =
        mode === "base64-encode"
          ? await encodeBase64(input)
          : mode === "base64-decode"
            ? await decodeBase64(input)
            : await convertYamlJson(input, mode);
      setOutput(result);
      addLog("success", t("developer.modeComplete", { mode: t(modeLabels[mode]) }));
    } catch (error) {
      addLog("error", toErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("developer.textUtilities")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Select value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
            <option value="base64-encode">{t("developer.base64Encode")}</option>
            <option value="base64-decode">{t("developer.base64Decode")}</option>
            <option value="yaml-to-json">{t("developer.yamlToJson")}</option>
            <option value="json-to-yaml">{t("developer.jsonToYaml")}</option>
          </Select>
          <Button variant="primary" onClick={run}>
            {mode.startsWith("base64") ? (
              <Binary className="h-4 w-4" aria-hidden />
            ) : (
              <ArrowLeftRight className="h-4 w-4" aria-hidden />
            )}
            {t("common.run")}
          </Button>
        </div>
        <Textarea value={input} onChange={(event) => setInput(event.target.value)} />
        <Textarea
          value={output}
          onChange={(event) => setOutput(event.target.value)}
          placeholder={t("developer.outputPlaceholder")}
        />
      </CardContent>
    </Card>
  );
}
