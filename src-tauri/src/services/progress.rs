use tauri::{AppHandle, Emitter};

use crate::state::AppState;
use crate::types::{CommandResult, ProgressPayload};

pub const PROGRESS_EVENT: &str = "filekit://progress";

pub fn emit_progress(
    app: &AppHandle,
    job_id: Option<&str>,
    progress: u8,
    status: &str,
    message: impl Into<String>,
) {
    if let Some(job_id) = job_id {
        let payload = ProgressPayload {
            job_id: job_id.to_string(),
            progress: progress.min(100),
            status: status.to_string(),
            message: message.into(),
        };
        let _ = app.emit(PROGRESS_EVENT, payload);
    }
}

pub fn check_cancelled(state: &AppState, job_id: Option<&str>) -> CommandResult<()> {
    if let Some(job_id) = job_id {
        if state.is_cancelled(job_id)? {
            return Err("Job cancelled by user".to_string());
        }
    }
    Ok(())
}
