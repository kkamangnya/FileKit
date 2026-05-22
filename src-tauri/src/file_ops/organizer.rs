use std::fs;
use std::path::Path;

use tauri::AppHandle;

use crate::file_ops::paths::validate_input_paths;
use crate::services::filesystem::{ensure_dir, path_to_string, unique_child_path};
use crate::services::progress::{check_cancelled, emit_progress};
use crate::state::AppState;
use crate::types::{CommandResult, OperationSummary, OrganizeOptions};

pub fn organize_files(
    paths: Vec<String>,
    options: OrganizeOptions,
    job_id: Option<String>,
    app: &AppHandle,
    state: &AppState,
) -> CommandResult<OperationSummary> {
    let input_paths = validate_input_paths(&paths)?;
    let output_dir = Path::new(&options.output_dir);
    ensure_dir(output_dir)?;

    let mut logs = Vec::new();
    let mut outputs = Vec::new();

    if options.mode != "extension" {
        return Ok(OperationSummary::pending(
            job_id,
            "Organizer mode is scaffolded and ready for implementation",
            vec![format!(
                "TODO: implement '{}' organizer mode with preset {:?}",
                options.mode, options.preset
            )],
        ));
    }

    emit_progress(app, job_id.as_deref(), 0, "running", "Organizing files");

    let total = input_paths.len().max(1);
    for (index, input_path) in input_paths.iter().enumerate() {
        check_cancelled(state, job_id.as_deref())?;

        if !input_path.is_file() {
            logs.push(format!("Skipped non-file path: {}", input_path.display()));
            continue;
        }

        let extension = input_path
            .extension()
            .and_then(|ext| ext.to_str())
            .filter(|ext| !ext.trim().is_empty())
            .unwrap_or("no-extension")
            .to_ascii_lowercase();

        let group_dir = output_dir.join(extension);
        ensure_dir(&group_dir)?;

        let stem = input_path
            .file_stem()
            .and_then(|name| name.to_str())
            .unwrap_or("file");
        let ext = input_path
            .extension()
            .and_then(|value| value.to_str())
            .unwrap_or("");
        let target = unique_child_path(&group_dir, stem, ext, options.overwrite);

        if options.preserve_original {
            fs::copy(input_path, &target).map_err(|error| {
                format!(
                    "Failed to copy '{}' to '{}': {error}",
                    input_path.display(),
                    target.display()
                )
            })?;
            logs.push(format!("Copied {} -> {}", input_path.display(), target.display()));
        } else {
            fs::rename(input_path, &target).map_err(|error| {
                format!(
                    "Failed to move '{}' to '{}': {error}",
                    input_path.display(),
                    target.display()
                )
            })?;
            logs.push(format!("Moved {} -> {}", input_path.display(), target.display()));
        }

        outputs.push(path_to_string(&target));
        let progress = (((index + 1) * 100) / total) as u8;
        emit_progress(
            app,
            job_id.as_deref(),
            progress,
            "running",
            format!("Organized {}", input_path.display()),
        );
    }

    emit_progress(app, job_id.as_deref(), 100, "success", "Organizer complete");

    Ok(OperationSummary::success(
        job_id,
        "Files organized by extension",
        outputs,
        logs,
    ))
}
