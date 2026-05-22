import { Braces, Minimize2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Form";
import { useI18n } from "@/lib/i18n";
import { formatJson } from "@/lib/tauri";
import { toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";

const sample = '{ "name": "FileKit", "features": ["zip", "image", "json"] }';

export function JsonTool() {
  const [input, setInput] = useState(sample);
  const [output, setOutput] = useState("");
  const { addLog } = useFileKit();
  const { t } = useI18n();

  const run = async (mode: "pretty" | "minify") => {
    try {
      const result = await formatJson(input, mode);
      setOutput(result);
      addLog("success", t("developer.jsonComplete", { mode }));
    } catch (error) {
      addLog("error", toErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("developer.json")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea value={input} onChange={(event) => setInput(event.target.value)} />
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => run("pretty")}>
            <Braces className="h-4 w-4" aria-hidden />
            {t("developer.pretty")}
          </Button>
          <Button variant="secondary" onClick={() => run("minify")}>
            <Minimize2 className="h-4 w-4" aria-hidden />
            {t("developer.minify")}
          </Button>
        </div>
        <Textarea
          value={output}
          onChange={(event) => setOutput(event.target.value)}
          placeholder={t("developer.formattedOutput")}
        />
      </CardContent>
    </Card>
  );
}
