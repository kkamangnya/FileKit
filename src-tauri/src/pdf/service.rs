use crate::types::{
    CommandResult, OperationSummary, PdfMergeOptions, PdfSplitOptions,
};

pub fn merge_pdfs(
    paths: Vec<String>,
    options: PdfMergeOptions,
    job_id: Option<String>,
) -> CommandResult<OperationSummary> {
    Ok(OperationSummary::pending(
        job_id,
        "PDF merge is scaffolded and ready for a PDF engine",
        vec![
            format!("Received {} PDF path(s)", paths.len()),
            format!(
                "Requested output: dir={:?}, name={:?}, overwrite={}",
                options.output_dir, options.output_name, options.overwrite
            ),
            "TODO: implement PDF merge with a lopdf/printpdf adapter".to_string(),
        ],
    ))
}

pub fn split_pdf(
    path: String,
    options: PdfSplitOptions,
    job_id: Option<String>,
) -> CommandResult<OperationSummary> {
    Ok(OperationSummary::pending(
        job_id,
        "PDF split is scaffolded and ready for a PDF engine",
        vec![
            format!("Received PDF path: {path}"),
            format!(
                "Requested split: dir={:?}, mode={}, ranges={:?}, overwrite={}",
                options.output_dir, options.split_mode, options.page_ranges, options.overwrite
            ),
            "TODO: implement PDF split with page range support".to_string(),
        ],
    ))
}
