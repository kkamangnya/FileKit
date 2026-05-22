import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import type {
  FileEntry,
  JobEntry,
  JobStatus,
  LogEntry,
  LogLevel,
  PageId,
  ProgressPayload,
  ThemeMode,
  LanguageMode,
  WorkflowStep,
} from "@/types";
import { createFileEntry, createId } from "@/lib/utils";

interface FileKitState {
  activePage: PageId;
  selectedFiles: FileEntry[];
  outputDirectory?: string;
  jobs: JobEntry[];
  logs: LogEntry[];
  theme: ThemeMode;
  language: LanguageMode;
  workflowSteps: WorkflowStep[];
}

type Action =
  | { type: "set-page"; page: PageId }
  | { type: "add-files"; paths: string[] }
  | { type: "remove-file"; id: string }
  | { type: "clear-files" }
  | { type: "set-output-directory"; path?: string }
  | { type: "add-log"; level: LogLevel; message: string }
  | { type: "clear-logs" }
  | { type: "create-job"; job: JobEntry }
  | { type: "update-job"; id: string; patch: Partial<JobEntry> }
  | { type: "progress"; payload: ProgressPayload }
  | { type: "set-theme"; theme: ThemeMode }
  | { type: "set-language"; language: LanguageMode }
  | { type: "set-workflow-steps"; steps: WorkflowStep[] };

interface FileKitStore extends FileKitState {
  setActivePage: (page: PageId) => void;
  addFiles: (paths: string[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setOutputDirectory: (path?: string) => void;
  addLog: (level: LogLevel, message: string) => void;
  clearLogs: () => void;
  createJob: (title: string) => string;
  updateJob: (id: string, patch: Partial<JobEntry>) => void;
  applyProgress: (payload: ProgressPayload) => void;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: LanguageMode) => void;
  setWorkflowSteps: (steps: WorkflowStep[]) => void;
}

const defaultWorkflowSteps: WorkflowStep[] = [
  {
    id: "step-image-webp",
    kind: "image.convert",
    label: "PNG/JPG to WEBP",
    enabled: true,
    config: { targetFormat: "webp", quality: 82 },
  },
  {
    id: "step-zip",
    kind: "compression.zip",
    label: "Compress output folder",
    enabled: true,
    config: { format: "zip", preservePaths: true },
  },
];

const initialState: FileKitState = {
  activePage: "dashboard",
  selectedFiles: [],
  jobs: [],
  logs: [],
  theme: getInitialTheme(),
  language: getInitialLanguage(),
  workflowSteps: defaultWorkflowSteps,
};

const FileKitContext = createContext<FileKitStore | null>(null);

function reducer(state: FileKitState, action: Action): FileKitState {
  switch (action.type) {
    case "set-page":
      return { ...state, activePage: action.page };
    case "add-files": {
      const existing = new Set(state.selectedFiles.map((file) => file.path));
      const next = action.paths
        .filter((path) => path.trim().length > 0 && !existing.has(path))
        .map((path) => createFileEntry(path));
      return { ...state, selectedFiles: [...state.selectedFiles, ...next] };
    }
    case "remove-file":
      return {
        ...state,
        selectedFiles: state.selectedFiles.filter((file) => file.id !== action.id),
      };
    case "clear-files":
      return { ...state, selectedFiles: [] };
    case "set-output-directory":
      return { ...state, outputDirectory: action.path };
    case "add-log":
      return {
        ...state,
        logs: [
          {
            id: createId("log"),
            level: action.level,
            message: action.message,
            createdAt: new Date().toISOString(),
          },
          ...state.logs,
        ].slice(0, 160),
      };
    case "clear-logs":
      return { ...state, logs: [] };
    case "create-job":
      return {
        ...state,
        jobs: [action.job, ...state.jobs].slice(0, 40),
      };
    case "update-job":
      return {
        ...state,
        jobs: state.jobs.map((job) => (job.id === action.id ? { ...job, ...action.patch } : job)),
      };
    case "progress":
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.payload.jobId
            ? {
                ...job,
                progress: action.payload.progress,
                status: action.payload.status,
                message: action.payload.message,
              }
            : job,
        ),
      };
    case "set-theme":
      return { ...state, theme: action.theme };
    case "set-language":
      return { ...state, language: action.language };
    case "set-workflow-steps":
      return { ...state, workflowSteps: action.steps };
    default:
      return state;
  }
}

export function FileKitProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = state.theme === "dark" || (state.theme === "system" && systemDark);
    root.classList.toggle("dark", shouldUseDark);
    window.localStorage.setItem("filekit.theme", state.theme);
  }, [state.theme]);

  useEffect(() => {
    document.documentElement.lang = state.language === "ko" ? "ko" : "en";
    window.localStorage.setItem("filekit.language", state.language);
  }, [state.language]);

  const setActivePage = useCallback((page: PageId) => dispatch({ type: "set-page", page }), []);
  const addFiles = useCallback((paths: string[]) => dispatch({ type: "add-files", paths }), []);
  const removeFile = useCallback((id: string) => dispatch({ type: "remove-file", id }), []);
  const clearFiles = useCallback(() => dispatch({ type: "clear-files" }), []);
  const setOutputDirectory = useCallback(
    (path?: string) => dispatch({ type: "set-output-directory", path }),
    [],
  );
  const addLog = useCallback(
    (level: LogLevel, message: string) => dispatch({ type: "add-log", level, message }),
    [],
  );
  const clearLogs = useCallback(() => dispatch({ type: "clear-logs" }), []);
  const createJob = useCallback((title: string) => {
    const id = createId("job");
    dispatch({
      type: "create-job",
      job: {
        id,
        title,
        status: "running",
        progress: 0,
        message: "Starting",
        createdAt: new Date().toISOString(),
        outputPaths: [],
      },
    });
    return id;
  }, []);
  const updateJob = useCallback(
    (id: string, patch: Partial<JobEntry>) => dispatch({ type: "update-job", id, patch }),
    [],
  );
  const applyProgress = useCallback(
    (payload: ProgressPayload) => dispatch({ type: "progress", payload }),
    [],
  );
  const setTheme = useCallback((theme: ThemeMode) => dispatch({ type: "set-theme", theme }), []);
  const setLanguage = useCallback(
    (language: LanguageMode) => dispatch({ type: "set-language", language }),
    [],
  );
  const setWorkflowSteps = useCallback(
    (steps: WorkflowStep[]) => dispatch({ type: "set-workflow-steps", steps }),
    [],
  );

  const value = useMemo<FileKitStore>(
    () => ({
      ...state,
      setActivePage,
      addFiles,
      removeFile,
      clearFiles,
      setOutputDirectory,
      addLog,
      clearLogs,
      createJob,
      updateJob,
      applyProgress,
      setTheme,
      setLanguage,
      setWorkflowSteps,
    }),
    [
      state,
      setActivePage,
      addFiles,
      removeFile,
      clearFiles,
      setOutputDirectory,
      addLog,
      clearLogs,
      createJob,
      updateJob,
      applyProgress,
      setTheme,
      setLanguage,
      setWorkflowSteps,
    ],
  );

  return <FileKitContext.Provider value={value}>{children}</FileKitContext.Provider>;
}

export function useFileKit() {
  const context = useContext(FileKitContext);
  if (!context) {
    throw new Error("useFileKit must be used inside FileKitProvider");
  }
  return context;
}

export function isTerminalStatus(status: JobStatus) {
  return status === "success" || status === "failed" || status === "cancelled";
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const saved = window.localStorage.getItem("filekit.theme");
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

function getInitialLanguage(): LanguageMode {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem("filekit.language");
  if (saved === "en" || saved === "ko") return saved;
  return window.navigator.language.toLowerCase().startsWith("ko") ? "ko" : "en";
}
