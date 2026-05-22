import { useEffect } from "react";

import { onProgress } from "@/lib/tauri";
import { useFileKit } from "@/stores/fileKitStore";

export function useProgressEvents() {
  const { applyProgress } = useFileKit();

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let mounted = true;

    onProgress((payload) => applyProgress(payload)).then((cleanup) => {
      if (mounted) {
        unlisten = cleanup;
      } else {
        cleanup();
      }
    });

    return () => {
      mounted = false;
      unlisten?.();
    };
  }, [applyProgress]);
}
