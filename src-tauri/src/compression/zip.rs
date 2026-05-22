use std::fs::File;
use std::io;
use std::path::{Path, PathBuf};

use tauri::AppHandle;
use walkdir::WalkDir;
use zip::write::FileOptions;

use crate::file_ops::paths::validate_input_paths;
use crate::services::filesystem::{
    ensure_dir, file_name, file_stem, output_dir_or_current, path_to_string, unique_child_path,
    unique_existing_path,
};
use crate::services::progress::{check_cancelled, emit_progress};
use crate::state::AppState;
use crate::types::{CommandResult, CompressionOptions, ExtractOptions, OperationSummary};

pub fn compress_to_zip(
    paths: Vec<String>,
    options: CompressionOptions,
    job_id: Option<String>,
    app: &AppHandle,
    state: &AppState,
) -> CommandResult<OperationSummary> {
    if options.format != "zip" {
        return Err(format!(
            "{} compression is scaffolded but not implemented yet",
            options.format
        ));
    }

    if options
        .password
        .as_ref()
        .is_some_and(|password| !password.is_empty())
    {
        return Err("Password-protected ZIP is scaffolded but not implemented yet".to_string());
    }

    if options.split_size_mb.is_some() {
        return Err("Split archive output is scaffolded but not implemented yet".to_string());
    }

    let input_paths = validate_input_paths(&paths)?;
    let files = collect_files(&input_paths, options.preserve_paths)?;
    if files.is_empty() {
        return Err("No files were found to compress".to_string());
    }

    let output_dir = output_dir_or_current(options.output_dir.as_deref())?;
    ensure_dir(&output_dir)?;
    let fallback_name = input_paths
        .first()
        .map(|path| file_stem(path, "filekit-archive"))
        .unwrap_or_else(|| "filekit-archive".to_string());
    let output_name = options.output_name.as_deref().unwrap_or(&fallback_name);
    let output_path = unique_child_path(&output_dir, output_name, "zip", options.overwrite);

    emit_progress(app, job_id.as_deref(), 0, "running", "Creating ZIP archive");

    let file = File::create(&output_path)
        .map_err(|error| format!("Failed to create archive '{}': {error}", output_path.display()))?;
    let mut writer = zip::ZipWriter::new(file);
    let zip_options =
        FileOptions::default().compression_method(zip::CompressionMethod::Deflated);
    let mut logs = Vec::new();
    let total = files.len().max(1);

    for (index, entry) in files.iter().enumerate() {
        check_cancelled(state, job_id.as_deref())?;
        writer
            .start_file(entry.archive_name.clone(), zip_options)
            .map_err(|error| format!("Failed to add '{}' to ZIP: {error}", entry.archive_name))?;
        let mut source = File::open(&entry.source)
            .map_err(|error| format!("Failed to read '{}': {error}", entry.source.display()))?;
        io::copy(&mut source, &mut writer).map_err(|error| {
            format!(
                "Failed to write '{}' into '{}': {error}",
                entry.source.display(),
                output_path.display()
            )
        })?;

        logs.push(format!(
            "Added {} as {}",
            entry.source.display(),
            entry.archive_name
        ));
        let progress = (((index + 1) * 100) / total) as u8;
        emit_progress(
            app,
            job_id.as_deref(),
            progress,
            "running",
            format!("Compressed {}", entry.source.display()),
        );
    }

    writer
        .finish()
        .map_err(|error| format!("Failed to finish ZIP archive: {error}"))?;

    emit_progress(app, job_id.as_deref(), 100, "success", "ZIP archive created");

    Ok(OperationSummary::success(
        job_id,
        format!("Created {}", output_path.display()),
        vec![path_to_string(&output_path)],
        logs,
    ))
}

pub fn extract_zip(
    archive_path: String,
    options: ExtractOptions,
    job_id: Option<String>,
    app: &AppHandle,
    state: &AppState,
) -> CommandResult<OperationSummary> {
    if options
        .password
        .as_ref()
        .is_some_and(|password| !password.is_empty())
    {
        return Err("Encrypted archive extraction is scaffolded but not implemented yet".to_string());
    }

    let archive_path = PathBuf::from(archive_path);
    if !archive_path.exists() {
        return Err(format!("Archive does not exist: {}", archive_path.display()));
    }

    let output_dir = match options.output_dir.as_deref() {
        Some(dir) if !dir.trim().is_empty() => PathBuf::from(dir),
        _ => archive_path
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .join(file_stem(&archive_path, "extracted")),
    };
    ensure_dir(&output_dir)?;

    let file = File::open(&archive_path)
        .map_err(|error| format!("Failed to open archive '{}': {error}", archive_path.display()))?;
    let mut archive =
        zip::ZipArchive::new(file).map_err(|error| format!("Invalid ZIP archive: {error}"))?;
    let total = archive.len().max(1);
    let mut outputs = Vec::new();
    let mut logs = Vec::new();

    emit_progress(app, job_id.as_deref(), 0, "running", "Extracting ZIP archive");

    for index in 0..archive.len() {
        check_cancelled(state, job_id.as_deref())?;
        let mut zipped_file = archive
            .by_index(index)
            .map_err(|error| format!("Failed to read ZIP entry: {error}"))?;

        let Some(enclosed_name) = zipped_file.enclosed_name() else {
            logs.push(format!("Skipped unsafe ZIP entry: {}", zipped_file.name()));
            continue;
        };

        let target_path = output_dir.join(enclosed_name);
        if zipped_file.name().ends_with('/') {
            ensure_dir(&target_path)?;
        } else {
            if let Some(parent) = target_path.parent() {
                ensure_dir(parent)?;
            }

            let target_path = unique_existing_path(&target_path, options.overwrite);
            let mut output_file = File::create(&target_path).map_err(|error| {
                format!("Failed to create extracted file '{}': {error}", target_path.display())
            })?;
            io::copy(&mut zipped_file, &mut output_file).map_err(|error| {
                format!("Failed to extract '{}': {error}", target_path.display())
            })?;
            outputs.push(path_to_string(&target_path));
            logs.push(format!("Extracted {}", target_path.display()));
        }

        let progress = (((index + 1) * 100) / total) as u8;
        emit_progress(
            app,
            job_id.as_deref(),
            progress,
            "running",
            format!("Extracted {}", zipped_file.name()),
        );
    }

    emit_progress(app, job_id.as_deref(), 100, "success", "ZIP extraction complete");

    Ok(OperationSummary::success(
        job_id,
        format!("Extracted archive to {}", output_dir.display()),
        outputs,
        logs,
    ))
}

struct ArchiveEntry {
    source: PathBuf,
    archive_name: String,
}

fn collect_files(paths: &[PathBuf], preserve_paths: bool) -> CommandResult<Vec<ArchiveEntry>> {
    let mut files = Vec::new();

    for input in paths {
        if input.is_file() {
            files.push(ArchiveEntry {
                source: input.to_path_buf(),
                archive_name: file_name(input, "file"),
            });
            continue;
        }

        if input.is_dir() {
            let base_name = file_name(input, "folder");
            for entry in WalkDir::new(input) {
                let entry = entry
                    .map_err(|error| format!("Failed to walk '{}': {error}", input.display()))?;
                let path = entry.path();
                if !path.is_file() {
                    continue;
                }

                let archive_path = if preserve_paths {
                    let relative = path.strip_prefix(input).map_err(|error| {
                        format!("Failed to calculate relative path for '{}': {error}", path.display())
                    })?;
                    Path::new(&base_name).join(relative)
                } else {
                    PathBuf::from(file_name(path, "file"))
                };

                files.push(ArchiveEntry {
                    source: path.to_path_buf(),
                    archive_name: normalize_archive_path(&archive_path),
                });
            }
        }
    }

    Ok(files)
}

fn normalize_archive_path(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}
