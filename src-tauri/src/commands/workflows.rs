use tauri::{AppHandle, State};

use crate::state::AppState;
use crate::types::{CommandResult, OperationSummary, WorkflowDefinition};
use crate::workflows::model;

#[tauri::command(async)]
pub fn run_workflow(
    workflow: WorkflowDefinition,
    job_id: Option<String>,
    app: AppHandle,
) -> CommandResult<OperationSummary> {
    model::run_workflow(workflow, job_id, &app)
}

#[tauri::command]
pub fn cancel_job(job_id: String, state: State<'_, AppState>) -> CommandResult<OperationSummary> {
    state.cancel(&job_id)?;
    Ok(OperationSummary::pending(
        Some(job_id),
        "Cancellation requested",
        vec!["The running command will stop at the next cancellation checkpoint".to_string()],
    ))
}
