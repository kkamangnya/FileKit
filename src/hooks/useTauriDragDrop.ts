import { useEffect } from "react";

import { isTauriRuntime } from "@/lib/tauri";

export function useTauriDragDrop(onPaths: (paths: string[]) => void) {
  useEffect(() => {
    if (!isTauriRuntime()) return;

    let unlisten: (() => void) | undefined;
    let cancelled = false;

    import("@tauri-apps/api/webview")
      .then(({ getCurrentWebview }) =>
        getCurrentWebview().onDragDropEvent((event) => {
          const payload = event.payload as { type: string; paths?: string[] };
          if (payload.type === "drop" && payload.paths?.length) {
            onPaths(payload.paths);
          }
        }),
      )
      .then((cleanup) => {
        if (cancelled) {
          cleanup();
        } else {
          unlisten = cleanup;
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [onPaths]);
}
