import type { ReactNode } from "react";

import { FileDropzone } from "@/features/files/FileDropzone";
import { JobPanel } from "@/features/jobs/JobPanel";
import { SelectedFileList } from "@/features/files/SelectedFileList";

interface WorkspaceGridProps {
  options: ReactNode;
  extra?: ReactNode;
}

export function WorkspaceGrid({ options, extra }: WorkspaceGridProps) {
  return (
    <div className="space-y-5">
      <FileDropzone />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <SelectedFileList />
          {extra}
        </div>
        <div className="space-y-5">
          {options}
          <JobPanel />
        </div>
      </div>
    </div>
  );
}
