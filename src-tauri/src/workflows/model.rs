use tauri::AppHandle;

use crate::services::progress::emit_progress;
use crate::types::{CommandResult, OperationSummary, WorkflowDefinition};

pub fn run_workflow(
    workflow: WorkflowDefinition,
    job_id: Option<String>,
    app: &AppHandle,
) -> CommandResult<OperationSummary> {
    emit_progress(app, job_id.as_deref(), 0, "running", "Validating workflow");

    if workflow.steps.is_empty() {
        return Err("Workflow requires at least one step".to_string());
    }

    let active_steps = workflow.steps.iter().filter(|step| step.enabled).count();
    emit_progress(
        app,
        job_id.as_deref(),
        100,
        "pending",
        "Workflow model validated",
    );

    Ok(OperationSummary::pending(
        job_id,
        format!(
            "Workflow '{}' validated with {active_steps} active step(s)",
            workflow.name
        ),
        vec![
            "TODO: connect workflow steps to compression, image conversion, and organizer services"
                .to_string(),
        ],
    ))
}
