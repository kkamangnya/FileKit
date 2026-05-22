use tauri::{AppHandle, State};

use crate::converters::image;
use crate::state::AppState;
use crate::types::{CommandResult, ImageConvertOptions, OperationSummary};

#[tauri::command(async)]
pub fn convert_images(
    paths: Vec<String>,
    options: ImageConvertOptions,
    job_id: Option<String>,
    app: AppHandle,
    state: State<'_, AppState>,
) -> CommandResult<OperationSummary> {
    let job_key = job_id.clone();
    let result = image::convert_images(paths, options, job_id, &app, state.inner());
    if let Some(job_id) = job_key {
        let _ = state.clear(&job_id);
    }
    result
}
