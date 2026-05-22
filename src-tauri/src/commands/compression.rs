use tauri::{AppHandle, State};

use crate::compression::zip;
use crate::state::AppState;
use crate::types::{CommandResult, CompressionOptions, ExtractOptions, OperationSummary};

#[tauri::command(async)]
pub fn compress_files(
    paths: Vec<String>,
    options: CompressionOptions,
    job_id: Option<String>,
    app: AppHandle,
    state: State<'_, AppState>,
) -> CommandResult<OperationSummary> {
    let job_key = job_id.clone();
    let result = zip::compress_to_zip(paths, options, job_id, &app, state.inner());
    if let Some(job_id) = job_key {
        let _ = state.clear(&job_id);
    }
    result
}

#[tauri::command(async)]
pub fn extract_archive(
    archive_path: String,
    options: ExtractOptions,
    job_id: Option<String>,
    app: AppHandle,
    state: State<'_, AppState>,
) -> CommandResult<OperationSummary> {
    let job_key = job_id.clone();
    let result = zip::extract_zip(archive_path, options, job_id, &app, state.inner());
    if let Some(job_id) = job_key {
        let _ = state.clear(&job_id);
    }
    result
}
