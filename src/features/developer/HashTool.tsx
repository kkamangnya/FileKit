import { Fingerprint } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Form";
import { useI18n } from "@/lib/i18n";
import { calculateHash } from "@/lib/tauri";
import { toErrorMessage } from "@/lib/utils";
import { useFileKit } from "@/stores/fileKitStore";
import type { HashResult } from "@/types";

export function HashTool() {
  const { selectedFiles, createJob, updateJob, addLog } = useFileKit();
  const { t } = useI18n();
  const [algorithm, setAlgorithm] = useState<"sha256" | "md5">("sha256");
  const [results, setResults] = useState<HashResult[]>([]);

  const run = async () => {
    if (selectedFiles.length === 0) {
      addLog("warning", t("developer.selectBeforeHash"));
      return;
    }

    const algorithmLabel = algorithm.toUpperCase();
    const jobId = createJob(t("developer.hashJob", { algorithm: algorithmLabel }));
    try {
      const hashes = await calculateHash(
        selectedFiles.map((file) => file.path),
        algorithm,
        jobId,
      );
      setResults(hashes);
      updateJob(jobId, {
        status: "success",
        progress: 100,
        message: t("developer.hashJobComplete", { count: hashes.length }),
      });
      addLog("success", t("developer.hashComplete", { algorithm: algorithmLabel }));
    } catch (error) {
      updateJob(jobId, { status: "failed", message: toErrorMessage(error) });
      addLog("error", toErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{t("developer.hash")}</CardTitle>
        <Badge tone="green">SHA256 MD5</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Select
            value={algorithm}
            onChange={(event) => setAlgorithm(event.target.value as "sha256" | "md5")}
          >
            <option value="sha256">SHA256</option>
            <option value="md5">MD5</option>
          </Select>
          <Button variant="primary" onClick={run}>
            <Fingerprint className="h-4 w-4" aria-hidden />
            {t("developer.generate")}
          </Button>
        </div>
        <div className="max-h-72 overflow-y-auto rounded-md border border-border bg-background p-3 scrollbar-thin">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t("developer.hashEmpty")}
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div key={`${result.path}-${result.hash}`} className="space-y-1 text-xs">
                  <div className="truncate font-medium">{result.path}</div>
                  <div className="break-all rounded-md bg-secondary p-2 font-mono text-muted-foreground">
                    {result.hash}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
