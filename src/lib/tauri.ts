import { invoke, isTauri as isTauriRuntimeApi } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";

import type {
  CompressionOptions,
  ExtractOptions,
  HashResult,
  ImageConvertOptions,
  OperationSummary,
  OrganizeOptions,
  PdfMergeOptions,
  PdfSplitOptions,
  ProgressPayload,
  WorkflowDefinition,
} from "@/types";

const PROGRESS_EVENT = "filekit://progress";

export function isTauriRuntime() {
  return isTauriRuntimeApi() || Boolean(window.__TAURI_INTERNALS__);
}

export async function pickFiles() {
  if (isTauriRuntime()) {
    const result = await open({ multiple: true, directory: false });
    if (!result) return [];
    return Array.isArray(result) ? result : [result];
  }

  return pickBrowserFiles();
}

export async function pickDirectory() {
  try {
    const result = await open({ multiple: false, directory: true });
    return Array.isArray(result) ? result[0] : result;
  } catch (error) {
    if (isTauriRuntime()) {
      throw error;
    }

    return pickBrowserDirectory();
  }
}

async function pickBrowserDirectory() {
  if (!window.showDirectoryPicker) {
    return undefined;
  }

  const directory = await window.showDirectoryPicker();
  return directory.name;
}

function pickBrowserFiles() {
  return new Promise<string[]>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.style.display = "none";

    input.addEventListener(
      "change",
      () => {
        const files = Array.from(input.files || []);
        input.remove();
        resolve(files.map((file) => file.webkitRelativePath || file.name));
      },
      { once: true },
    );

    document.body.appendChild(input);
    input.click();
  });
}

export async function onProgress(handler: (payload: ProgressPayload) => void) {
  if (!isTauriRuntime()) {
    return () => undefined;
  }

  const unlisten: UnlistenFn = await listen<ProgressPayload>(PROGRESS_EVENT, (event) => {
    handler(event.payload);
  });
  return unlisten;
}

export function compressFiles(paths: string[], options: CompressionOptions, jobId: string) {
  return invoke<OperationSummary>("compress_files", { paths, options, jobId });
}

export function extractArchive(archivePath: string, options: ExtractOptions, jobId: string) {
  return invoke<OperationSummary>("extract_archive", { archivePath, options, jobId });
}

export function convertImages(paths: string[], options: ImageConvertOptions, jobId: string) {
  return invoke<OperationSummary>("convert_images", { paths, options, jobId });
}

export function mergePdfs(paths: string[], options: PdfMergeOptions, jobId: string) {
  return invoke<OperationSummary>("merge_pdfs", { paths, options, jobId });
}

export function splitPdf(path: string, options: PdfSplitOptions, jobId: string) {
  return invoke<OperationSummary>("split_pdf", { path, options, jobId });
}

export function organizeFiles(paths: string[], options: OrganizeOptions, jobId: string) {
  return invoke<OperationSummary>("organize_files", { paths, options, jobId });
}

export function calculateHash(paths: string[], algorithm: "sha256" | "md5", jobId: string) {
  return invoke<HashResult[]>("calculate_hash", { paths, algorithm, jobId });
}

export function formatJson(input: string, mode: "pretty" | "minify") {
  return invoke<string>("format_json", { input, mode });
}

export function encodeBase64(input: string) {
  return invoke<string>("encode_base64", { input });
}

export function decodeBase64(input: string) {
  return invoke<string>("decode_base64", { input });
}

export function convertYamlJson(input: string, direction: "yaml-to-json" | "json-to-yaml") {
  return invoke<string>("convert_yaml_json", { input, direction });
}

export function runWorkflow(workflow: WorkflowDefinition, jobId: string) {
  return invoke<OperationSummary>("run_workflow", { workflow, jobId });
}

export function cancelJob(jobId: string) {
  return invoke<OperationSummary>("cancel_job", { jobId });
}
