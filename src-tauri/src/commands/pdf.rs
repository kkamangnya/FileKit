use crate::pdf::service;
use crate::types::{CommandResult, OperationSummary, PdfMergeOptions, PdfSplitOptions};

#[tauri::command(async)]
pub fn merge_pdfs(
    paths: Vec<String>,
    options: PdfMergeOptions,
    job_id: Option<String>,
) -> CommandResult<OperationSummary> {
    service::merge_pdfs(paths, options, job_id)
}

#[tauri::command(async)]
pub fn split_pdf(
    path: String,
    options: PdfSplitOptions,
    job_id: Option<String>,
) -> CommandResult<OperationSummary> {
    service::split_pdf(path, options, job_id)
}
