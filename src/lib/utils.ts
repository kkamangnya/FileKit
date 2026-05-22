import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { FileEntry, LogLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function fileNameFromPath(path: string) {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || path;
}

export function extensionFromPath(path: string) {
  const name = fileNameFromPath(path);
  const index = name.lastIndexOf(".");
  return index > -1 ? name.slice(index + 1).toLowerCase() : "";
}

export function createFileEntry(path: string, size?: number): FileEntry {
  return {
    id: createId("file"),
    path,
    name: fileNameFromPath(path),
    extension: extensionFromPath(path),
    size,
  };
}

export function formatBytes(size?: number) {
  if (size === undefined) return "Unknown";
  if (size === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${(size / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function toErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

export function levelLabel(level: LogLevel) {
  return {
    info: "Info",
    success: "Success",
    warning: "Warning",
    error: "Error",
  }[level];
}
