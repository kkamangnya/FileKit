use std::fs::File;
use std::io::Read;
use std::path::Path;

use sha2::{Digest, Sha256};
use tauri::AppHandle;

use crate::file_ops::paths::validate_input_paths;
use crate::services::progress::{check_cancelled, emit_progress};
use crate::state::AppState;
use crate::types::{CommandResult, HashResult};

pub fn calculate_hashes(
    paths: Vec<String>,
    algorithm: String,
    job_id: Option<String>,
    app: &AppHandle,
    state: &AppState,
) -> CommandResult<Vec<HashResult>> {
    let input_paths = validate_input_paths(&paths)?;
    let normalized_algorithm = algorithm.to_ascii_lowercase();
    let total = input_paths.len().max(1);
    let mut results = Vec::new();

    emit_progress(app, job_id.as_deref(), 0, "running", "Calculating hashes");

    for (index, path) in input_paths.iter().enumerate() {
        check_cancelled(state, job_id.as_deref())?;
        if !path.is_file() {
            continue;
        }

        let hash = match normalized_algorithm.as_str() {
            "sha256" => sha256_file(path)?,
            "md5" => md5_file(path)?,
            other => return Err(format!("Unsupported hash algorithm: {other}")),
        };

        results.push(HashResult {
            path: path.to_string_lossy().to_string(),
            algorithm: normalized_algorithm.clone(),
            hash,
        });

        let progress = (((index + 1) * 100) / total) as u8;
        emit_progress(
            app,
            job_id.as_deref(),
            progress,
            "running",
            format!("Hashed {}", path.display()),
        );
    }

    emit_progress(app, job_id.as_deref(), 100, "success", "Hash calculation complete");
    Ok(results)
}

fn sha256_file(path: &Path) -> CommandResult<String> {
    let mut file =
        File::open(path).map_err(|error| format!("Failed to open '{}': {error}", path.display()))?;
    let mut hasher = Sha256::new();
    let mut buffer = [0_u8; 64 * 1024];

    loop {
        let bytes_read = file
            .read(&mut buffer)
            .map_err(|error| format!("Failed to read '{}': {error}", path.display()))?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }

    Ok(format!("{:x}", hasher.finalize()))
}

fn md5_file(path: &Path) -> CommandResult<String> {
    let mut file =
        File::open(path).map_err(|error| format!("Failed to open '{}': {error}", path.display()))?;
    let mut context = md5::Context::new();
    let mut buffer = [0_u8; 64 * 1024];

    loop {
        let bytes_read = file
            .read(&mut buffer)
            .map_err(|error| format!("Failed to read '{}': {error}", path.display()))?;
        if bytes_read == 0 {
            break;
        }
        context.consume(&buffer[..bytes_read]);
    }

    Ok(format!("{:x}", context.compute()))
}
