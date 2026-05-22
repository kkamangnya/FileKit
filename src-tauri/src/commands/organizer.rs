use tauri::{AppHandle, State};

use crate::file_ops::organizer;
use crate::state::AppState;
use crate::types::{CommandResult, OperationSummary, OrganizeOptions};

#[tauri::command(async)]
pub fn organize_files(
    paths: Vec<String>,
    options: OrganizeOptions,
    job_id: Option<String>,
    app: AppHandle,
    state: State<'_, AppState>,
) -> CommandResult<OperationSummary> {
    let job_key = job_id.clone();
    let result = organizer::organize_files(paths, options, job_id, &app, state.inner());
    if let Some(job_id) = job_key {
        let _ = state.clear(&job_id);
    }
    result
}
