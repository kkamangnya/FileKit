export type PageId =
  | "dashboard"
  | "compress"
  | "convert"
  | "pdf"
  | "image"
  | "organizer"
  | "developer"
  | "workflows"
  | "settings";

export type ThemeMode = "light" | "dark" | "system";

export type LanguageMode = "en" | "ko";

export type JobStatus = "queued" | "running" | "success" | "failed" | "cancelled" | "pending";

export type LogLevel = "info" | "success" | "warning" | "error";

export interface FileEntry {
  id: string;
  path: string;
  name: string;
  extension: string;
  size?: number;
}

export interface JobEntry {
  id: string;
  title: string;
  status: JobStatus;
  progress: number;
  message: string;
  createdAt: string;
  outputPaths: string[];
}

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  createdAt: string;
}

export interface OperationSummary {
  jobId?: string;
  status: JobStatus;
  message: string;
  outputPaths: string[];
  logs: string[];
}

export interface ProgressPayload {
  jobId: string;
  progress: number;
  status: JobStatus;
  message: string;
}

export interface CompressionOptions {
  format: "zip" | "7z" | "tar" | "gz";
  outputDir?: string;
  outputName?: string;
  password?: string;
  splitSizeMb?: number;
  preservePaths: boolean;
  overwrite: boolean;
}

export interface ExtractOptions {
  outputDir?: string;
  password?: string;
  overwrite: boolean;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  preserveAspectRatio: boolean;
}

export interface ImageConvertOptions {
  targetFormat: "png" | "jpg" | "webp";
  outputDir?: string;
  resize?: ResizeOptions;
  quality?: number;
  stripExif: boolean;
  overwrite: boolean;
}

export interface PdfMergeOptions {
  outputDir?: string;
  outputName?: string;
  overwrite: boolean;
}

export interface PdfSplitOptions {
  outputDir?: string;
  splitMode: "pages" | "ranges";
  pageRanges?: string[];
  overwrite: boolean;
}

export interface OrganizeOptions {
  mode: "extension" | "date" | "size" | "duplicates";
  outputDir: string;
  preserveOriginal: boolean;
  overwrite: boolean;
  preset?: string;
}

export interface HashResult {
  path: string;
  algorithm: string;
  hash: string;
}

export interface WorkflowStep {
  id: string;
  kind: string;
  label: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface WorkflowDefinition {
  name: string;
  inputPaths: string[];
  outputDir?: string;
  steps: WorkflowStep[];
}
